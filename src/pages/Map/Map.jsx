import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Container, Row, Col } from "reactstrap";
import { BASE_URL } from "../../utils/config";
import CommonSection from "../../shared/CommonSection";
import CustomToast from "../../shared/CustomToast";
import "./map.css";

/**
 * Main Interactive Map Component.
 */
const Map = () => {
    //==== REFS & CONFIGURATION ===//
    /*
      We use Refs instead of State for the Mapbox instance and Markers.
      Reason: Updating state triggers a React re-render. Mapbox is an imperative
      library that manages its own DOM/Canvas. Re-rendering the React component
      for every map movement would cause performance issues and canvas resets.
    */
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const controlsRef = useRef(null);
    const userLocationRef = useRef(null);

    // --- State Management ---
    const [spots, setSpots] = useState([]);
    const [filteredSpots, setFilteredSpots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeDistrict, setActiveDistrict] = useState("All");
    const [activeStyle, setActiveStyle] = useState("outdoors-v12");
    const [selectedSpotId, setSelectedSpotId] = useState(null);

    const [regionOpen, setRegionOpen] = useState(false);
    const [styleOpen, setStyleOpen] = useState(false);

    const [routeInfo, setRouteInfo] = useState(null);

    // --- Toast State ---
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // Helper to close toast cleanly
    const closeToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const mapToken = import.meta.env?.VITE_MAPBOX_TOKEN || process.env.REACT_APP_MAPBOX_TOKEN;

    // --- Close Dropdowns on Outside Click ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target)) {
                setRegionOpen(false);
                setStyleOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    //==== DATA FETCHING ===//
    useEffect(() => {
        // AbortController ensures we don't try to set state if the component unmounts
        // before the API call finishes (preventing memory leaks).
        const controller = new AbortController();
        const fetchSpots = async () => {
            try {
                const res = await fetch(`${BASE_URL}/spots?limit=0`, { signal: controller.signal });
                const result = await res.json();
                if (res.ok) {
                    setSpots(result.data);
                    setFilteredSpots(result.data);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Error loading spots:", err);
                    setToast({ show: true, message: "Failed to load spots.", type: "error" });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSpots();
        return () => controller.abort();
    }, []);

    // Unique Districts
    const districts = useMemo(() => ["All", ...new Set(spots.map(s => s.district || "Other"))], [spots]);

    //==== BACKGROUND SERVICES ===//
    /*
      Passive GPS Tracking.
      Instead of requesting location only when "Go Route" is clicked (cold start),
      we watch the position in the background. This ensures coordinates are
      instantly available when the user initiates routing.
    */
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => { userLocationRef.current = [pos.coords.longitude, pos.coords.latitude]; },
            (err) => console.warn("Background GPS Warning:", err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // --- Map Actions ---
    const handleResetView = () => {
        const map = mapInstanceRef.current;
        if (map) {
            map.flyTo({
                center: [72.36, 34.80],
                zoom: 8,
                pitch: 0,
                bearing: 0,
                speed: 1.8,
                curve: 1
            });
        }
    };

    const handleDistrictChange = (val) => {
        const district = val.target ? val.target.value : val;
        setActiveDistrict(district);
        const map = mapInstanceRef.current;

        if (district === "All") {
            setFilteredSpots(spots);
            map?.flyTo({ center: [72.36, 34.80], zoom: 8 });
        } else {
            const filtered = spots.filter(spot => spot.district === district);
            setFilteredSpots(filtered);
            // Auto-focus logic: If spots exist in this district, zoom to the first one.
            if (filtered.length > 0 && map) {
                const s = filtered[0];
                map.flyTo({
                    center: [s.longitude || s.geometry.coordinates[0], s.latitude || s.geometry.coordinates[1]],
                    zoom: 10,
                    speed: 1.5
                });
            } else {
                setToast({ show: true, message: `No spots found in ${district}`, type: "error" });
            }
        }
    };

    //==== ROUTING LOGIC (SOURCE & LAYERS) ===//
    /*
      Mapbox requires two steps to render data:
      1. Add Source: The raw GeoJSON data (the route line).
      2. Add Layer: The visual styling rules (color, width) applied to that source.
      We use 'useCallback' to ensure these heavy functions aren't recreated on every render.
    */
    const removeRoute = useCallback(() => {
        const map = mapInstanceRef.current;
        if (map) {
            if (map.getLayer('route')) map.removeLayer('route');
            if (map.getLayer('route-casing')) map.removeLayer('route-casing');
            if (map.getSource('route')) map.removeSource('route');
        }
        setRouteInfo(null);
    }, []);

    const drawRouteLayer = useCallback((map, geometry) => {
        if (!map) return;

        // Cleanup existing layers to prevent ID collisions
        if (map.getLayer('route-casing')) map.removeLayer('route-casing');
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');

        map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry } }
        });

        // Layer 1: White background/outline (Casing) for contrast
        map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#ffffff',
                'line-width': 9,
                'line-opacity': 0.9
            }
        });

        // Layer 2: Main colored route line
        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#2a9d8f',
                'line-width': 6
            }
        });
    }, []);

    const fetchRouteData = async (startCoords, endCoords, btnRef, map) => {
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=false&geometries=geojson&overview=simplified&access_token=${mapToken}`
            );
            const json = await query.json();

            if (!json.routes || json.routes.length === 0) {
                setToast({ show: true, message: "No route found.", type: "error" });
                return;
            }

            const data = json.routes[0];
            const geometry = data.geometry.coordinates;

            const seconds = data.duration;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const formattedTime = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

            setRouteInfo({
                duration: formattedTime,
                distance: (data.distance / 1000).toFixed(1),
                geometry: geometry
            });

            drawRouteLayer(map, geometry);

            // Auto-fit map bounds to show the entire route
            const bounds = new mapboxgl.LngLatBounds();
            geometry.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: { top: 50, bottom: 200, left: 50, right: 50 } });

        } catch (err) {
            console.error("Routing Error:", err);
            setToast({ show: true, message: "Error calculating route.", type: "error" });
        } finally {
            if (btnRef) {
                btnRef.innerText = "Go Route";
                btnRef.disabled = false;
                btnRef.style.opacity = "1";
            }
        }
    };

    const getInternalRoute = useCallback((endCoords, btnRef) => {
        if (!navigator.geolocation) {
            setToast({ show: true, message: "Geolocation not supported.", type: "error" });
            if (btnRef) { btnRef.innerText = "Go Route"; btnRef.disabled = false; btnRef.style.opacity = "1"; }
            return;
        }

        const map = mapInstanceRef.current;
        if (!map) return;

        // Use cached background location if available (Instant), else query GPS (Slow)
        if (userLocationRef.current) {
            fetchRouteData(userLocationRef.current, endCoords, btnRef, map);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const startCoords = [position.coords.longitude, position.coords.latitude];
                    userLocationRef.current = startCoords;
                    fetchRouteData(startCoords, endCoords, btnRef, map);
                },
                (error) => {
                    setToast({ show: true, message: "Unable to retrieve location.", type: "error" });
                    if (btnRef) { btnRef.innerText = "Go Route"; btnRef.disabled = false; btnRef.style.opacity = "1"; }
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        }
    }, [mapToken, drawRouteLayer]);

    //==== MARKER & POPUP DOM LOGIC ===//
    /*
      Since Mapbox uses a Canvas, we can't use standard React Components inside the map.
      We must manually create DOM elements (divs, buttons) and attach event listeners 
      using standard JavaScript API (document.createElement, onclick).
    */
    const handleSnapClick = useCallback((spot, coordinates) => {
        setSelectedSpotId(spot._id);

        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({ center: coordinates, zoom: 12, speed: 1.8, curve: 1 });
        }

        const card = document.createElement('div');
        card.className = 'tm-snap-popup-card';

        const header = document.createElement('div');
        header.className = 'tm-snap-popup-header';

        const img = document.createElement('img');
        img.src = spot.photo;
        img.alt = spot.title;
        img.loading = "lazy";
        img.decoding = "async";
        header.appendChild(img);

        const badge = document.createElement('div');
        badge.className = 'tm-snap-badge';
        badge.innerHTML = `<i class="ri-star-fill"></i> ${spot.ratingsAverage || "New"}`;
        header.appendChild(badge);
        card.appendChild(header);

        const body = document.createElement('div');
        body.className = 'tm-snap-popup-body';

        const info = document.createElement('div');
        info.className = 'tm-snap-info';
        const title = document.createElement('h4');
        title.innerText = spot.title;
        info.appendChild(title);

        const loc = document.createElement('div');
        loc.className = 'tm-snap-location';
        loc.innerHTML = `<i class="ri-map-pin-line"></i> ${spot.city}`;
        info.appendChild(loc);
        body.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'tm-snap-actions';

        const routeBtn = document.createElement('button');
        routeBtn.className = 'tm-snap-btn tm-primary';
        routeBtn.innerText = 'Go Route';

        routeBtn.onclick = (e) => {
            e.stopPropagation();
            routeBtn.innerText = "Locating...";
            routeBtn.disabled = true;
            routeBtn.style.opacity = "0.7";

            const popups = document.getElementsByClassName('mapboxgl-popup');
            if (popups.length) popups[0].remove();

            getInternalRoute(coordinates, routeBtn);
        };
        actions.appendChild(routeBtn);

        const detailsLink = document.createElement('a');
        detailsLink.href = `/spots/${spot._id}`;
        detailsLink.className = 'tm-snap-btn tm-secondary';
        detailsLink.innerText = 'View Details';
        actions.appendChild(detailsLink);

        body.appendChild(actions);
        card.appendChild(body);

        const popups = document.getElementsByClassName('mapboxgl-popup');
        if (popups.length) popups[0].remove();

        new mapboxgl.Popup({
            offset: 40,
            className: 'tm-custom-snap-popup',
            closeButton: true,
            maxWidth: '170px'
        })
            .setLngLat(coordinates)
            .setDOMContent(card)
            .addTo(mapInstanceRef.current);

    }, [getInternalRoute]);

    const handleStyleChange = (val) => {
        setActiveStyle(val);
        const map = mapInstanceRef.current;
        if (!map) return;

        // Callback to restore layers after style switch (switching styles wipes custom layers)
        const onStyleLoad = () => {
            map.setTerrain(val === "satellite-3d" ? { 'source': 'mapbox-dem', 'exaggeration': 1.5 } : null);
            map.easeTo({ pitch: val === "satellite-3d" ? 60 : 0 });
            if (routeInfo) drawRouteLayer(map, routeInfo.geometry);
        };

        if (val === "satellite-3d") {
            map.setStyle("mapbox://styles/mapbox/satellite-streets-v12");
            map.once('style.load', () => {
                if (!map.getSource('mapbox-dem')) {
                    map.addSource('mapbox-dem', {
                        'type': 'raster-dem',
                        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        'tileSize': 512,
                        'maxzoom': 14
                    });
                }
                onStyleLoad();
            });
        } else {
            map.setStyle(`mapbox://styles/mapbox/${val}`);
            map.once('style.load', onStyleLoad);
        }
    };

    //==== MAP INITIALIZATION ===//
    useEffect(() => {
        if (loading || !mapToken || !mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        mapboxgl.accessToken = mapToken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: `mapbox://styles/mapbox/outdoors-v12`,
            center: [72.36, 34.80],
            zoom: 8,
            attributionControl: false,
            maxBounds: [[60.00, 23.00], [78.00, 38.00]],
            minZoom: 6,
        });

        mapInstanceRef.current = map;
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
        map.addControl(new mapboxgl.FullscreenControl(), "bottom-left");

        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true
        }), "bottom-right");

    }, [loading, mapToken]);

    //==== MARKER SYNCHRONIZATION ===//

    /*
      Critical Effect: Syncs React State -> Mapbox Markers.
      
      Optimization Strategy:
      1. Check if the current markers match the filteredSpots state.
      2. If they match, we only update CSS classes (z-index/active state) to highlight selection.
         This avoids destroying and recreating DOM nodes unnecessarily (Performance).
      3. If they don't match (filtering changed), we wipe all markers and rebuild them.
    */
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (markersRef.current.length === filteredSpots.length && markersRef.current.every((m, i) => m.id === filteredSpots[i]._id)) {
            markersRef.current.forEach(item => {
                const isSelected = item.id === selectedSpotId;
                if (item.element) {
                    if (isSelected) {
                        item.element.classList.add('tm-active');
                        item.element.style.zIndex = "70";
                    } else {
                        item.element.classList.remove('tm-active');
                        item.element.style.zIndex = "10";
                    }
                }
            });
            return;
        }

        // Full Rebuild: Clean up old markers
        markersRef.current.forEach(item => item.marker.remove());
        markersRef.current = [];

        // Create new markers
        filteredSpots.forEach(spot => {
            const lat = spot.latitude || spot.geometry?.coordinates[1];
            const lng = spot.longitude || spot.geometry?.coordinates[0];
            if (!lat || !lng) return;

            const el = document.createElement('div');
            el.className = `tm-snap-marker-container ${selectedSpotId === spot._id ? 'tm-active' : ''}`;

            el.innerHTML = `
                <div class="tm-snap-bubble" style="background-image: url('${spot.photo}')"></div>
                <div class="tm-snap-label">${spot.title}</div>
            `;

            el.onclick = (e) => {
                e.stopPropagation();
                handleSnapClick(spot, [lng, lat]);
            };

            const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
            markersRef.current.push({ id: spot._id, marker, element: el });
        });
    }, [filteredSpots, selectedSpotId, handleSnapClick]);

    const getStyleName = (id) => {
        const names = { "outdoors-v12": "Outdoors", "streets-v12": "Streets", "satellite-streets-v12": "Satellite", "satellite-3d": "3D Terrain" };
        return names[id] || "Map Style";
    };

    return (
        <>
            <CommonSection title={"Interactive Map"} />

            {/* --- Render Custom Toast --- */}
            <CustomToast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />

            <section className="tm-map-section-wrapper">
                <Container>
                    <Row>
                        <Col lg="12">
                            <div className="tm-map-main-box">

                                <div className="tm-map-internal-controls" ref={controlsRef}>

                                    {/* Region Dropdown */}
                                    <div className="tm-custom-dropdown-container">
                                        <div className={`tm-custom-dropdown-trigger ${regionOpen ? 'active' : ''}`} onClick={() => { setRegionOpen(!regionOpen); setStyleOpen(false); }}>
                                            {activeDistrict === "All" ? "All Regions" : activeDistrict}
                                            <svg className="tm-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        {regionOpen && (
                                            <div className="tm-custom-dropdown-menu">
                                                <div className={`tm-custom-dropdown-item ${activeDistrict === 'All' ? 'selected' : ''}`} onClick={() => { handleDistrictChange("All"); setRegionOpen(false); }}>All Regions</div>
                                                {districts.filter(d => d !== "All").map(d => (
                                                    <div key={d} className={`tm-custom-dropdown-item ${activeDistrict === d ? 'selected' : ''}`} onClick={() => { handleDistrictChange(d); setRegionOpen(false); }}>{d}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Style Dropdown */}
                                    <div className="tm-custom-dropdown-container">
                                        <div className={`tm-custom-dropdown-trigger ${styleOpen ? 'active' : ''}`} onClick={() => { setStyleOpen(!styleOpen); setRegionOpen(false); }}>
                                            {getStyleName(activeStyle)}
                                            <svg className="tm-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        {styleOpen && (
                                            <div className="tm-custom-dropdown-menu">
                                                <div className={`tm-custom-dropdown-item ${activeStyle === "outdoors-v12" ? "selected" : ""}`} onClick={() => { handleStyleChange("outdoors-v12"); setStyleOpen(false); }}>Outdoors</div>
                                                <div className={`tm-custom-dropdown-item ${activeStyle === "streets-v12" ? "selected" : ""}`} onClick={() => { handleStyleChange("streets-v12"); setStyleOpen(false); }}>Streets</div>
                                                <div className={`tm-custom-dropdown-item ${activeStyle === "satellite-streets-v12" ? "selected" : ""}`} onClick={() => { handleStyleChange("satellite-streets-v12"); setStyleOpen(false); }}>Satellite</div>
                                                <div className={`tm-custom-dropdown-item ${activeStyle === "satellite-3d" ? "selected" : ""}`} onClick={() => { handleStyleChange("satellite-3d"); setStyleOpen(false); }}>3D Terrain</div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="tm-control-btn" onClick={handleResetView} title="Reset View"><i className="ri-restart-line"></i></button>
                                </div>

                                {routeInfo && (
                                    <div className="tm-route-navigation-card">
                                        <div className="tm-route-stats">
                                            <div className="tm-route-stat-item">
                                                <span className="tm-label">Distance</span>
                                                <span className="tm-value">{routeInfo.distance} <small>km</small></span>
                                            </div>
                                            <div className="tm-route-divider"></div>
                                            <div className="tm-route-stat-item">
                                                <span className="tm-label">Time</span>
                                                <span className="tm-value">{routeInfo.duration}</span>
                                            </div>
                                            <button className="tm-btn-cancel-route" onClick={removeRoute}>
                                                <i className="ri-close-line"></i> Exit
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {loading && (
                                    <div className="tm-map-loader-overlay">
                                        <div className="spinner-border text-light" role="status"></div>
                                        <p>Loading Map...</p>
                                    </div>
                                )}
                                <div ref={mapContainerRef} className="tm-map-canvas-full" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Map;