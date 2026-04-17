import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { showBlockingError } from "../../utils/alerts";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./spot-map.css";

//===== CONFIGURATION & UTILITIES =====//
const PAKISTAN_BOUNDS = [[60.00, 23.00], [78.00, 38.00]];

/*
  Generates a GeoJSON Polygon approximating a circle.
  Mapbox doesn't have a native "Circle" geometry for Fill layers, only for Points.
  To highlight an area (radius), we mathematically generate a 64-point polygon.
*/
const createGeoJSONCircle = (center, radiusInMeters, points = 64) => {
    const coords = { latitude: center[1], longitude: center[0] };
    const km = radiusInMeters / 1000;
    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        const retLat = coords.latitude + y;
        const retLng = coords.longitude + x;
        ret.push([retLng, retLat]);
    }
    ret.push(ret[0]);
    return { type: "Feature", geometry: { type: "Polygon", coordinates: [ret] } };
};


//===== MAIN COMPONENT =====//
const SpotMap = ({ lat, lng, location }) => {

    /* REFS vs STATE:
       We use Refs for the Map instance and User Location to avoid triggering 
       React re-renders. Mapbox manages its own internal state; if React re-renders 
       too often, it can desync or reset the canvas.
    */
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({ user: null, spot: null });
    const dropdownRef = useRef(null);

    // Tracks active API requests to cancel them if the user unmounts/re-clicks
    const abortControllerRef = useRef(null);

    // Stores GPS coordinates silently without causing UI updates
    const userLocationRef = useRef(null);

    // --- STATE ---
    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentStyle, setCurrentStyle] = useState("outdoors-v12");
    const [isRouting, setIsRouting] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [styleOpen, setStyleOpen] = useState(false);

    const mapToken = import.meta.env?.VITE_MAPBOX_TOKEN || process.env.REACT_APP_MAPBOX_TOKEN;

    //===== SAFETY CHECK =====//
    /*
      Data Safety:
      Memoize coordinates to prevent the 'createGeoJSONCircle' function from 
      running on every render unless lat/lng actually changes.
    */
    const spotCoords = useMemo(() => {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;
        return [parsedLng, parsedLat];
    }, [lat, lng]);

    // MEMOIZED GEOMETRY
    const spotCircleGeoJSON = useMemo(() => {
        if (!spotCoords) return null;
        return createGeoJSONCircle(spotCoords, 500);
    }, [spotCoords]);

    //===== BACKGROUND GPS TRACKING =====//

    /*
      Performance Optimization: "Warm Start" Strategy.
      Instead of waiting for the GPS to warm up ONLY when the user clicks "Get Directions"
      (which takes 3-5 seconds), we start watching the position immediately in the background.
      
    */
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                // Constantly update ref so it's ready when user clicks
                userLocationRef.current = [pos.coords.longitude, pos.coords.latitude];
            },
            (err) => console.warn("GPS Warmup Warning:", err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // --- CLICK OUTSIDE HANDLER ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setStyleOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    //===== MAPBOX LAYER MANAGEMENT =====//
    /*
      Idempotent Layer Update:
      This function safely adds layers/sources only if they don't exist.
      It is called on map load AND whenever the map style changes 
      (because changing styles removes all custom layers).
      
    */
    const updateMapLayers = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map || !spotCircleGeoJSON) return;

        // 1. Spot Radius Visuals
        if (!map.getSource("tm-spot-area")) {
            map.addSource("tm-spot-area", { type: "geojson", data: spotCircleGeoJSON });
        }
        if (!map.getLayer("tm-spot-fill")) {
            map.addLayer({
                id: "tm-spot-fill", type: "fill", source: "tm-spot-area",
                paint: { "fill-color": "#2a9d8f", "fill-opacity": 0.15 },
            });
        }
        if (!map.getLayer("tm-spot-outline")) {
            map.addLayer({
                id: "tm-spot-outline", type: "line", source: "tm-spot-area",
                paint: { "line-color": "#2a9d8f", "line-width": 2, "line-dasharray": [2, 2] },
            });
        }

        // 2. Restore Route Layers (if they existed before style switch)
        if (map.getSource('tm-route')) {
            if (!map.getLayer('tm-route-casing')) {
                map.addLayer({
                    id: 'tm-route-casing', type: 'line', source: 'tm-route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.8 }
                });
            }
            if (!map.getLayer('tm-route-line')) {
                map.addLayer({
                    id: 'tm-route-line', type: 'line', source: 'tm-route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#2a9d8f', 'line-width': 4 }
                });
            }
        }
    }, [spotCircleGeoJSON]);

    //===== ROUTING LOGIC =====//
    const drawRoute = (geometry) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Cleanup previous route layers to avoid "Layer already exists" errors
        if (map.getLayer('tm-route-casing')) map.removeLayer('tm-route-casing');
        if (map.getLayer('tm-route-line')) map.removeLayer('tm-route-line');
        if (map.getSource('tm-route')) map.removeSource('tm-route');

        map.addSource('tm-route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: geometry }
        });

        // Layer 1: White casing (provides contrast)
        map.addLayer({
            id: 'tm-route-casing', type: 'line', source: 'tm-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.8 }
        });

        // Layer 2: Main colored line
        map.addLayer({
            id: 'tm-route-line', type: 'line', source: 'tm-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#2a9d8f', 'line-width': 5 }
        });
    };

    //===== API LOGIC =====//
    const fetchDirections = async (startLat, startLng) => {
        const map = mapInstanceRef.current;
        if (!map || !spotCoords) return;

        // Abort previous pending requests to prevent race conditions
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setIsRouting(true);

        try {
            // Update User Location Marker
            if (markersRef.current.user) markersRef.current.user.remove();
            const userEl = document.createElement('div');
            userEl.className = 'tm-spot-user-dot';
            markersRef.current.user = new mapboxgl.Marker(userEl)
                .setLngLat([startLng, startLat])
                .addTo(map);

            // Fetch Route from Mapbox Directions API
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${spotCoords[0]},${spotCoords[1]}?steps=false&geometries=geojson&overview=simplified&alternatives=false&access_token=${mapToken}`,
                { signal: abortControllerRef.current.signal }
            );

            const json = await query.json();

            if (!json.routes || json.routes.length === 0) {
                await showBlockingError("No Route Found", "Could not find a driving route to this location.");
                setIsRouting(false);
                return;
            }

            // Extract Duration & Distance
            const data = json.routes[0];
            const seconds = data.duration;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const timeStr = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

            setRouteInfo({
                duration: timeStr,
                distance: (data.distance / 1000).toFixed(1)
            });

            drawRoute(data.geometry);

            // Auto-zoom to fit the route
            const bounds = new mapboxgl.LngLatBounds();
            data.geometry.coordinates.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 80 });

        } catch (err) {
            if (err.name !== 'AbortError') console.error("Route error:", err);
        } finally {
            setIsRouting(false);
        }
    };

    //===== USER INTERACTION =====//
    //===== INSTANT ROUTING HANDLER =====//
    const handleGetDirections = async () => {
        if (!navigator.geolocation) {
            await showBlockingError("Not Supported", "Geolocation is not supported by your browser.");
            return;
        }

        // Logic: Use cached location if available (Instant), otherwise query GPS (Slow)
        if (userLocationRef.current) {
            // Case 1: Instant (Warm Start)
            const [lng, lat] = userLocationRef.current;
            fetchDirections(lat, lng);
        } else {
            // Case 2: Fallback (Cold Start - if user clicks too fast)
            setIsRouting(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    // Update ref for next time
                    userLocationRef.current = [pos.coords.longitude, pos.coords.latitude];
                    fetchDirections(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    setIsRouting(false);
                    showBlockingError("Access Denied", "Location access was denied. Please enable GPS permissions.");
                },
                { enableHighAccuracy: true, timeout: 6000 }
            );
        }
    };

    const removeRoute = () => {
        const map = mapInstanceRef.current;
        if (map && spotCoords) {
            if (map.getLayer('tm-route-casing')) map.removeLayer('tm-route-casing');
            if (map.getLayer('tm-route-line')) map.removeLayer('tm-route-line');
            if (map.getSource('tm-route')) map.removeSource('tm-route');
            map.flyTo({ center: spotCoords, zoom: 14, speed: 1.5 });
        }
        if (markersRef.current.user) markersRef.current.user.remove();
        setRouteInfo(null);
    };

    //===== MAP INITIALIZATION =====//
    useEffect(() => {
        if (!mapToken || !mapContainerRef.current || !spotCoords) return;
        if (mapInstanceRef.current) return;

        mapboxgl.accessToken = mapToken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: `mapbox://styles/mapbox/${currentStyle}`,
            center: spotCoords,
            zoom: 14,
            attributionControl: false,
            maxBounds: PAKISTAN_BOUNDS,
            minZoom: 5,
            antialias: true
        });

        mapInstanceRef.current = map;
        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
        map.addControl(new mapboxgl.FullscreenControl(), "top-right");

        // Custom HTML Marker Setup
        const el = document.createElement("div");
        el.className = "tm-spot-marker-pin";

        // Popup is attached here, styling is handled in CSS class 'tm-custom-snap-popup'
        const popup = new mapboxgl.Popup({ offset: 30, className: 'tm-custom-snap-popup' })
            .setHTML(`<div style="padding:6px 8px; font-weight:600; color:#0b2727; font-family:'Montserrat'; font-size:0.9rem;">${location}</div>`);

        markersRef.current.spot = new mapboxgl.Marker(el)
            .setLngLat(spotCoords)
            .setPopup(popup)
            .addTo(map);

        map.on("load", () => {
            setMapLoaded(true);
            updateMapLayers();
            map.resize();
        });

        // Re-apply layers when style changes (e.g. Street -> Satellite)
        map.on("style.load", updateMapLayers);

        // Cleanup: Remove map instance to prevent memory leaks on unmount
        return () => {
            if (mapInstanceRef.current) mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        };
    }, [mapToken, spotCoords]);

    //===== STYLE SWITCHER =====//
    const handleStyle = (id) => {
        if (mapInstanceRef.current) {
            setCurrentStyle(id);
            mapInstanceRef.current.setStyle(`mapbox://styles/mapbox/${id}`);
            setStyleOpen(false);
        }
    };

    const getStyleName = (id) => ({
        "outdoors-v12": "Outdoors",
        "streets-v12": "Streets",
        "satellite-streets-v12": "Satellite"
    }[id] || "Style");

    if (!spotCoords) {
        return (
            <div className="tm-spot-map-wrapper">
                <div className="tm-spot-map-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="tm-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="tm-spot-map-wrapper">
            <div className="tm-spot-map-header">
                <div className="tm-spot-title-group">
                    <h3 className="tm-spot-map-heading">
                        <i className="ri-map-2-fill"></i> Location Map
                    </h3>
                    {routeInfo && <span className="tm-spot-dist-badge">{routeInfo.distance} km away</span>}
                </div>

                <div className="tm-spot-controls-group">
                    <button className="tm-spot-btn tm-btn-primary" onClick={handleGetDirections} disabled={isRouting}>
                        {isRouting ? <i className="ri-loader-4-line tm-spin"></i> : <i className="ri-direction-fill"></i>}
                        {isRouting ? "Calculating..." : "Get Directions"}
                    </button>

                    <div className="tm-spot-dropdown-container" ref={dropdownRef}>
                        <div className={`tm-spot-dropdown-trigger ${styleOpen ? 'active' : ''}`} onClick={() => setStyleOpen(!styleOpen)}>
                            <span>{getStyleName(currentStyle)}</span><i className="ri-arrow-down-s-line"></i>
                        </div>
                        {styleOpen && (
                            <div className="tm-spot-dropdown-menu right-aligned">
                                {["outdoors-v12", "streets-v12", "satellite-streets-v12"].map(style => (
                                    <div key={style} className={`tm-spot-dropdown-item ${currentStyle === style ? "active" : ""}`} onClick={() => handleStyle(style)}>
                                        {getStyleName(style)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="tm-spot-map-box">
                <div ref={mapContainerRef} className="tm-spot-map-canvas" />

                {routeInfo && (
                    <div className="tm-spot-route-card">
                        <div className="tm-spot-route-stats">
                            <div className="tm-spot-stat-item">
                                <span className="tm-label">Distance</span>
                                <span className="tm-value">{routeInfo.distance} <small>km</small></span>
                            </div>
                            <div className="tm-spot-divider"></div>
                            <div className="tm-spot-stat-item">
                                <span className="tm-label">Time</span>
                                <span className="tm-value">{routeInfo.duration}</span>
                            </div>
                        </div>
                        <button className="tm-spot-btn-cancel" onClick={removeRoute}>
                            <i className="ri-close-line"></i> Exit
                        </button>
                    </div>
                )}

                {mapLoaded && (
                    <button className="tm-spot-reset-btn" onClick={() => mapInstanceRef.current?.flyTo({ center: spotCoords, zoom: 14, speed: 1.5 })}>
                        <i className="ri-focus-3-line"></i>
                    </button>
                )}

                {!mapLoaded && (
                    <div className="tm-spot-loader"><div className="tm-spinner"></div><p>Loading Map...</p></div>
                )}
            </div>
        </div>
    );
};

export default SpotMap;