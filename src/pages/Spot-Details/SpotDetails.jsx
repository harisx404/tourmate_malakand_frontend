import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";

import SpotDetailsSkeleton from "../../components/Skeleton/SpotDetailsSkeleton";
import SpotReviews from "../../components/Spot-Reviews/SpotReviews";
import SpotMap from "../../components/Spot-Map/SpotMap";
import SpotWeather from "../../components/Spot-Weather/SpotWeather";
import CustomToast from "../../shared/CustomToast";

import useFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../utils/config";
import "./spot-details.css";

const SpotDetails = () => {
    const { id } = useParams();

    // UI States
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [showWeather, setShowWeather] = useState(false);

    // --- 2. Toast State ---
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const closeToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };

    // Fetch spot details via custom hook.
    const { data: spot, loading, error } = useFetch(`${BASE_URL}/spots/${id}`);

    const [localReviews, setLocalReviews] = useState([]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Sync local reviews with fetched data
    useEffect(() => {
        if (spot && spot.reviews) {
            setLocalReviews(spot.reviews);
        }
    }, [spot]);

    //==== Handle Fetch Errors (Safe Side Effect) ===//
    // This replaces the old direct toast.error() call inside the render body
    useEffect(() => {
        if (error) {
            setToastState({
                show: true,
                message: `Error loading data: ${error}`,
                type: "error"
            });
        }
    }, [error]);

    const {
        photo, title, desc, location, features, proximity,
        city, district, tags, bestSeason, history, images,
        geometry, ratingsAverage
    } = spot || {};

    // Use images from the array if available; otherwise use the single photo without duplication.
    const galleryImages = images && images.length > 0 ? images : (photo ? [photo] : []);

    const openLightbox = (imgSrc) => {
        setSelectedImage(imgSrc);
        setIsLightboxOpen(true);
    };

    const tagIcons = {
        Snowfall: "ri-snowy-line", Lake: "ri-water-flash-line", Mountains: "ri-landscape-line",
        Hiking: "ri-walk-line", Historical: "ri-ancient-gate-line", Nature: "ri-plant-line", Valley: "ri-sun-foggy-line"
    };

    if (loading) return <SpotDetailsSkeleton />;

    // Render Toast even when showing the error message
    if (error) {
        return (
            <>
                <CustomToast
                    show={toastState.show}
                    message={toastState.message}
                    type={toastState.type}
                    onClose={closeToast}
                />
                <div className="text-center py-5 text-danger">Error: {error}</div>
            </>
        );
    }

    // Render Toast even when Spot is not found
    if (!spot) {
        return (
            <>
                <div className="text-center py-5">Spot not found</div>
            </>
        );
    }

    return (
        <>
            {/* Render Custom Toast (Normal State) */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <section className="spot-details-page-container">
                <Container>
                    {/* Header Row (Title Box) */}
                    <Row className="mb-0 section-header-row">
                        <Col lg="12">
                            <div className="spot-details-page-header spot-details-page-glassy-card section-header">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div>
                                        <h1 className="spot-details-page-title">{title}</h1>
                                        <div className="spot-details-page-location d-flex align-items-center gap-2">
                                            <i className="ri-map-pin-fill"></i>
                                            <span>{location}, {city} ({district})</span>
                                        </div>
                                    </div>

                                    {/* DESKTOP BADGE: Hidden on mobile (d-none), Flex on Desktop (d-lg-flex) */}
                                    <div className="spot-details-page-rating-badge d-none d-lg-flex">
                                        <i className="ri-star-fill"></i>
                                        <span>{ratingsAverage === 0 ? "New" : ratingsAverage}</span>
                                        <span className="review-count">({localReviews.length || 0})</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Main Content Row */}
                    <Row className="main-content-row">
                        <Col lg="8">
                            {/* Gallery */}
                            <div className="spot-details-page-gallery spot-details-page-glassy-card mb-4 section-gallery">
                                <div className="spot-details-page-gallery-main" onClick={() => openLightbox(galleryImages[0])}>
                                    <img src={galleryImages[0]} alt="Main Spot" />
                                    <div className="spot-details-page-overlay"><i className="ri-fullscreen-line"></i> View Fullscreen</div>
                                </div>
                                <div className="spot-details-page-gallery-thumbnails">
                                    {galleryImages.slice(1, 4).map((img, index) => (
                                        <div key={index} className="spot-details-page-thumb" onClick={() => openLightbox(img)}>
                                            <img src={img} alt={`thumb-${index}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Overview */}
                            <div className="spot-details-page-glassy-card mb-4 section-overview">
                                <h4 className="spot-details-page-section-title">Overview</h4>
                                <div className="spot-details-page-overview-container"><p className="spot-details-page-description-text">{desc}</p></div>
                                {history && (
                                    <div className="spot-details-page-history-wrapper mt-4">
                                        <button className={`spot-details-page-history-toggle ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(!showHistory)}>
                                            <span><i className="ri-book-open-line"></i> {showHistory ? "Close History" : "Read History & Background"}</span>
                                            <i className={`ri-arrow-down-s-line spot-details-page-arrow ${showHistory ? 'rotate' : ''}`}></i>
                                        </button>
                                        <div className={`spot-details-page-history-content ${showHistory ? 'show' : ''}`}>
                                            <div className="spot-details-page-history-scroll-box"><p className="mt-3 spot-details-page-history-text">{history}</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Map */}
                            <div className="section-map mb-4">
                                <SpotMap
                                    lat={geometry?.coordinates[1]}
                                    lng={geometry?.coordinates[0]}
                                    location={location}
                                />
                            </div>

                            {/* Reviews */}
                            <div className="section-reviews">
                                <SpotReviews
                                    spotId={id}
                                    reviews={localReviews}
                                    setReviews={setLocalReviews}
                                />
                            </div>
                        </Col>

                        {/* Sidebar */}
                        <Col lg="4">
                            <div className="spot-details-page-sidebar-wrapper">
                                {/* Spot Info Box */}
                                <div className="spot-details-page-glassy-card mb-3 section-spot-info">
                                    {/* FLEX HEADER for Spot Info: Shows Badge ONLY on Mobile */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="spot-details-page-section-title mb-0 border-0 p-0">Spot Info</h4>

                                        {/* MOBILE BADGE: Flex on mobile, Hidden on Desktop */}
                                        <div className="spot-details-page-rating-badge d-flex d-lg-none">
                                            <i className="ri-star-fill"></i>
                                            <span>{ratingsAverage === 0 ? "New" : ratingsAverage}</span>
                                            <span className="review-count">({localReviews.length || 0})</span>
                                        </div>
                                    </div>

                                    <div className="spot-details-page-stats-grid">
                                        <div className="spot-details-page-stat-item"><small>City</small><h6>{city}</h6></div>
                                        <div className="spot-details-page-stat-item"><small>District</small><h6>{district}</h6></div>
                                    </div>
                                    <div className="spot-details-page-proximity-box mt-3"><i className="ri-road-map-line"></i><span>{proximity}</span></div>
                                    <hr className="spot-details-page-divider" />
                                    <div className="spot-details-page-sidebar-section"><h6>Highlights</h6><div className="spot-details-page-feature-box"><p>"{features}"</p></div></div>
                                    <hr className="spot-details-page-divider" />
                                    <div className="spot-details-page-sidebar-section">
                                        <h6>Tags</h6>
                                        <div className="spot-details-page-tags-container">{tags?.map((t, i) => <span key={i} className="spot-details-page-tag-pill"><i className={tagIcons[t]}></i> {t}</span>)}</div>
                                    </div>
                                    <hr className="spot-details-page-divider" />
                                    <div className="spot-details-page-sidebar-section mt-3">
                                        <h6>Best Season</h6>
                                        <div className="spot-details-page-tags-container">{bestSeason?.map((s, i) => <span key={i} className="spot-details-page-season-pill"><i className={tagIcons[s]}></i> {s}</span>)}</div>
                                    </div>
                                </div>

                                {/* Weather Box */}
                                <div className="spot-details-page-glassy-card mb-3 section-weather">
                                    <button className={`spot-details-page-weather-btn ${showWeather ? 'active' : ''}`} onClick={() => setShowWeather(!showWeather)}>
                                        <div className="d-flex align-items-center gap-2"><i className="ri-cloud-windy-line"></i><span>Check Live Weather</span></div>
                                        <i className={`ri-arrow-down-s-line spot-details-page-arrow ${showWeather ? 'rotate' : ''}`}></i>
                                    </button>
                                    <div className={`spot-details-page-weather-content ${showWeather ? 'show' : ''}`}><div className="mt-3"><SpotWeather spot={spot} /></div></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {isLightboxOpen && (
                <div className="spot-details-page-lightbox" onClick={() => setIsLightboxOpen(false)}>
                    <button className="spot-details-page-lightbox-close" onClick={() => setIsLightboxOpen(false)}><i className="ri-close-line"></i></button>
                    <div className="spot-details-page-lightbox-content" onClick={(e) => e.stopPropagation()}><img src={selectedImage} alt="Full screen" /></div>
                </div>
            )}
        </>
    );
};

export default SpotDetails;