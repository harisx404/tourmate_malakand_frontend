import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./home.css";
import { Container, Row, Col } from "reactstrap";

// --- Assets ---
import heroContent from "../../assets/data/heroContent";
import worldImg from "../../assets/images/world.png";
import Tourists_Guide_Map from "../../assets/images/Tourists_Guide_Map.png";

// --- Components ---
import Subtitle from "../../shared/Subtitle";
import SearchBar from "../../shared/SearchBar";
import FeatureList from "../../components/Features/FeatureList";
import MasonryImagesGallery from "../../components/Image-gallery/MasonryImagesGallery";
import About from "../../components/About/About";
import PopularSpotsList from "../../components/Popular-Spots/PopularSpotsList";

/**
 * Landing Page Component.
 * Aggregates core application modules including search, features, 
 * popular destinations, and gallery to provide a comprehensive overview.
 */
const Home = () => {
    const location = useLocation();

    /**
     * Handle scroll positioning on route transitions.
     * Supports deep linking via hash fragments (e.g., #popular-spots) for smooth scrolling.
     * Resets view to top if no hash is present to ensure clean navigation state.
     */
    useEffect(() => {
        if (location.hash) {
            const elementId = location.hash.substring(1);
            const element = document.getElementById(elementId);

            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    return (
        <>
            {/* --- Hero Section: Introduction & Visual Hook --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="6">
                            <div className="home-hero-content">
                                <div className="home-hero-subtitle d-flex align-items-center">
                                    <Subtitle subtitle={"Welcome to Malakand"} />
                                    <img src={worldImg} alt="" />
                                </div>
                                <h1>Discover the real beauty of <span className="home-text-highlight">Malakand Division</span></h1>
                                <p>
                                    TourMate Malakand is a free tourism guide created for travelers, nature lovers,
                                    and explorers who want to discover the real beauty of Malakand Division.
                                    From snow-covered mountains to peaceful valleys, rivers, forests, waterfalls,
                                    and historical landmarks, and sacred places. All in one place.
                                </p>
                            </div>
                        </Col>

                        {/* Visual Media Grid.
                           Uses sm="4" xs="4" to enforce a single-row layout (3 columns per row) on all devices,
                           preventing vertical stacking for a more compact UI.
                           Updated: Responsiveness
                        */}
                        <Col lg="2" sm="4" xs="4">
                            <div className="home-hero-img-box">
                                <img
                                    src={heroContent.heroImg01}
                                    alt="TourMate Malakand Hero Image"
                                    // Load this instantly (No lazy loading for hero items)
                                    fetchPriority="high"
                                />
                            </div>
                        </Col>
                        <Col lg="2" sm="4" xs="4"> {/* Updated: Responsiveness */}
                            <div className="home-hero-img-box mt-4">
                                <video
                                    src={heroContent.heroVideo}
                                    poster={heroContent.videoPoster}
                                    controls
                                    playsInline
                                    loop
                                    preload="auto"
                                />
                            </div>
                        </Col>
                        <Col lg="2" sm="4" xs="4"> {/* Updated: Responsiveness */}
                            <div className="home-hero-img-box mt-5">
                                <img
                                    src={heroContent.heroImg02}
                                    alt="TourMate Malakand Hero Image"
                                    // Load this instantly (No lazy loading for hero items)
                                    fetchPriority="high"
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- Global Search Utility --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="12">
                            <SearchBar />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- Key Features: Value Proposition --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="3">
                            <h5 className="home-features-subtitle">Features</h5>
                            <h2 className="home-features-title">Explore Malakand Smartly</h2>
                        </Col>
                        <FeatureList />
                    </Row>
                </Container>
            </section>

            {/* --- Popular Spots --- */}
            <section id="popular-spots">
                <Container>
                    <Row>
                        <Col lg="12" className="mb-5">
                            <Subtitle subtitle={"Explore"} />
                            <h2 className="home-popular-title">Popular Spots</h2>
                        </Col>
                        <PopularSpotsList />
                    </Row>
                </Container>
            </section>

            {/* --- Our Impact --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="6">
                            <div className="home-impact-content">
                                <Subtitle subtitle={"Our Impact"} />
                                <h2>Making It Easy for Tourists<br />to Explore Malakand’s<br />Beautiful Spots</h2>
                                <p>
                                    TourMate Malakand is designed to make exploring the natural beauty, cultural heritage, and
                                    historical landmarks of Malakand easy and enjoyable for everyone, while supporting local
                                    communities and businesses.
                                </p>
                            </div>

                            <div className="home-stats-wrapper d-flex align-items-center gap-5">
                                <div className="home-stats-box">
                                    <span>10+</span>
                                    <h6>Districts Covered</h6>
                                </div>
                                <div className="home-stats-box">
                                    <span>100+</span>
                                    <h6>Tourist Spots</h6>
                                </div>
                                <div className="home-stats-box">
                                    <span>25+</span>
                                    <h6>Hidden Spots</h6>
                                </div>
                            </div>
                        </Col>

                        <Col lg="6">
                            <div className="home-impact-img">
                                <img src={Tourists_Guide_Map} alt="" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- Visual Gallery: Masonry Layout --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="12">
                            <Subtitle subtitle={"Gallery"} />
                            <h2 className="home-gallery-title">Malakand Gallery</h2>
                        </Col>
                        <Col lg="12">
                            <MasonryImagesGallery />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- About Us: Team Information --- */}
            <section>
                <Container>
                    <Row>
                        <Col lg="12">
                            <Subtitle subtitle={"About Us"} />
                            <h2 className="home-about-title">Meet the Team Behind <span className="home-text-highlight">TourMate Malakand</span></h2>
                        </Col>
                        <Col lg="12">
                            <About />
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Home;