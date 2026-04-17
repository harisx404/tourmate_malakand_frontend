import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/config";
import "./spot-weather.css";

/**
 * SpotWeather Component
 * ---------------------
 * This component handles real-time weather data fetching based on geographic coordinates.
 * It features dynamic animations based on weather conditions and a glassy UI design.
 */
const SpotWeather = ({ spot }) => {
    // Destructuring coordinates and city from the spot prop
    // Fallback logic ensures we get coordinates from either top-level or geometry object
    const { city, geometry, latitude, longitude } = spot || {};

    const lat = latitude || (geometry && geometry.coordinates ? geometry.coordinates[1] : null);
    const lng = longitude || (geometry && geometry.coordinates ? geometry.coordinates[0] : null);

    // State management for weather data, UI loading, and error handling
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Prevent API calls if coordinates are missing
        if (!lat || !lng) return;

        const fetchWeather = async () => {
            setLoading(true);
            try {
                // Fetching from the backend weather utility
                const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lng=${lng}`);
                const result = await res.json();

                if (res.ok) {
                    setWeatherData(result.data);
                } else {
                    setError("Weather unavailable.");
                }
            } catch (err) {
                setError("Connection failed.");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lng]);

    /**
     * Helper: Assigns specific CSS animation classes based on the icon class
     * provided by the weather API to enhance visual feedback.
     */
    const getAnimationClass = (icon) => {
        if (!icon) return "";
        if (icon.includes("sun-line")) return "sw-anim-spin";
        if (icon.includes("thunder")) return "sw-anim-flash";
        if (icon.includes("rain") || icon.includes("drizzle") || icon.includes("showers")) return "sw-anim-bounce";
        if (icon.includes("snow")) return "sw-anim-float";
        return "sw-anim-float";
    };

    // Loading State UI
    if (loading) return (
        <div className="sw-container sw-loading">
            <div className="sw-spinner"></div>
            <p>Loading Conditions...</p>
        </div>
    );

    // Error State UI
    if (error || !weatherData) return (
        <div className="sw-container sw-error">
            <i className="ri-wifi-off-line"></i>
            <p>{error || "No Data Available"}</p>
        </div>
    );

    const { current, forecast, location } = weatherData;
    const animationClass = getAnimationClass(current.iconClass);

    return (
        <div className="sw-container">
            {/* Header: Displays Location and Badge */}
            <div className="sw-header">
                <div className="sw-location-group">
                    <i className="ri-map-pin-2-fill"></i>
                    <span className="location-name">{city || location}</span>
                </div>
                <span className="sw-condition-badge">{current.condition}</span>
            </div>

            {/* Main Hero Section: Primary Temp and Condition Icon */}
            <div className="sw-hero">
                <i className={`${current.iconClass} sw-hero-icon ${animationClass}`}></i>
                <div className="sw-hero-right">
                    <h1 className="sw-hero-temp">{current.temp}°</h1>
                    <span className="sw-hero-feels">Feels {current.feelsLike}°</span>
                </div>
            </div>

            {/* Stats Grid: Wind, Humidity, and Pressure */}
            <div className="sw-stats-row">
                <div className="sw-stat-box">
                    <i className="ri-windy-line"></i>
                    <div className="sw-stat-details">
                        <span className="sw-stat-val">{current.windSpeed}</span>
                        <span className="sw-stat-unit">km/h</span>
                    </div>
                </div>
                <div className="sw-stat-box">
                    <i className="ri-drop-line"></i>
                    <div className="sw-stat-details">
                        <span className="sw-stat-val">{current.humidity}</span>
                        <span className="sw-stat-unit">%</span>
                    </div>
                </div>
                <div className="sw-stat-box">
                    <i className="ri-dashboard-3-line"></i>
                    <div className="sw-stat-details">
                        <span className="sw-stat-val">{current.pressure}</span>
                        <span className="sw-stat-unit">hPa</span>
                    </div>
                </div>
            </div>

            {/* Forecast Row: Mapping 3-day weather preview */}
            <div className="sw-forecast">
                <h6>3-Day Forecast</h6>
                <div className="sw-forecast-grid">
                    {forecast.map((day, index) => (
                        <div key={index} className="sw-forecast-card">
                            <span className="sw-fc-day">{day.day}</span>
                            <i className={day.icon}></i>
                            <span className="sw-fc-temp">{day.temp}°</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer: Astronomical details (Sunrise/Sunset) */}
            <div className="sw-footer">
                <div className="sw-sun-item">
                    <i className="ri-sun-foggy-fill sw-sun-icon"></i> Rise: {current.sunrise}
                </div>
                <div className="sw-sun-item">
                    <i className="ri-moon-clear-fill sw-moon-icon"></i> Set: {current.sunset}
                </div>
            </div>
        </div>
    );
};

export default SpotWeather;