import React from 'react';
import { Container, Row, Col } from "reactstrap";
import './spotdetails-skeleton.css';

/*
  Spot Details Skeleton Component:
  Represents the skeleton of a spot details page.
  Used for loading states in the spot details page.
*/
const SpotDetailsSkeleton = () => {
    return (
        <section className="spot-details-skeleton-section">
            <Container>
                {/* Header Section (Order 1) */}
                <Row className="mb-0 section-header-row">
                    <Col lg="12">
                        <div className="spot-details-skeleton-glass-card section-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                {/* Title */}
                                <div className="spot-details-skeleton-loader spot-details-skeleton-title" style={{ marginBottom: '0.8rem' }}></div>
                                {/* Location Row */}
                                <div className="d-flex align-items-center gap-2">
                                    <div className="spot-details-skeleton-loader" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-text" style={{ width: '50%', marginBottom: 0 }}></div>
                                </div>
                            </div>
                            {/* Rating Pill - Hidden on Mobile */}
                            <div className="spot-details-skeleton-loader spot-details-skeleton-pill d-none d-lg-block" style={{ width: '120px' }}></div>
                        </div>
                    </Col>
                </Row>

                <Row className="main-content-row">
                    {/* Left Content Column */}
                    <Col lg="8">
                        {/* Gallery (Order 2) */}
                        <div className="spot-details-skeleton-glass-card section-gallery">
                            <div className="spot-details-skeleton-loader spot-details-skeleton-gallery-main"></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-gallery-thumb"></div>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-gallery-thumb"></div>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-gallery-thumb"></div>
                            </div>
                        </div>

                        {/* Overview (Order 4) */}
                        <div className="spot-details-skeleton-glass-card section-overview">
                            <div className="spot-details-skeleton-loader spot-details-skeleton-title" style={{ width: '30%', height: '1.5rem' }}></div>
                            <div className="mt-3">
                                <div className="spot-details-skeleton-loader spot-details-skeleton-text"></div>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-text"></div>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-text"></div>
                                <div className="spot-details-skeleton-loader spot-details-skeleton-text" style={{ width: '80%' }}></div>
                            </div>
                            <div className="spot-details-skeleton-loader mt-4" style={{ height: '50px', borderRadius: '8px' }}></div>
                        </div>

                        {/* Map (Order 6) */}
                        <div className="spot-details-skeleton-glass-card section-map">
                            <div className="spot-details-skeleton-loader spot-details-skeleton-title" style={{ width: '40%', height: '1.5rem' }}></div>
                            <div className="spot-details-skeleton-loader" style={{ width: '100%', height: '350px', borderRadius: '0.8rem' }}></div>
                        </div>
                    </Col>

                    {/* Right Sidebar Column */}
                    <Col lg="4">
                        {/* Wrapper with display:contents to allow cards to participate in mobile reordering */}
                        <div className="spot-details-skeleton-sidebar-wrapper">

                            {/* Spot Info (Order 3) */}
                            <div className="spot-details-skeleton-glass-card section-spot-info">
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-title" style={{ width: '50%', height: '1.2rem', marginBottom: '0' }}></div>
                                    {/* Mobile Badge - Visible Only on Mobile */}
                                    <div className="spot-details-skeleton-loader d-block d-lg-none" style={{ width: '80px', height: '30px', borderRadius: '50px' }}></div>
                                </div>

                                <hr style={{ opacity: 0.1, margin: '0 0 1rem 0' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.8rem' }}>
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-stat-box"></div>
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-stat-box"></div>
                                </div>

                                <div className="spot-details-skeleton-loader" style={{ height: '40px', borderRadius: '8px', marginBottom: '1rem' }}></div>

                                <hr style={{ opacity: 0.1 }} />

                                <div className="spot-details-skeleton-loader spot-details-skeleton-text-sm mb-2 mt-3"></div>
                                <div className="spot-details-skeleton-loader" style={{ height: '60px', borderRadius: '8px', background: 'rgba(255, 248, 225, 0.5)' }}></div>

                                <hr style={{ opacity: 0.1, margin: '1rem 0' }} />

                                <div className="spot-details-skeleton-loader spot-details-skeleton-text-sm mb-2"></div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-pill" style={{ width: '70px', height: '25px' }}></div>
                                    <div className="spot-details-skeleton-loader spot-details-skeleton-pill" style={{ width: '70px', height: '25px' }}></div>
                                </div>
                            </div>

                            {/* Weather (Order 5) */}
                            <div className="spot-details-skeleton-glass-card section-weather" style={{ height: '60px', padding: '0.8rem 1rem' }}>
                                <div className="spot-details-skeleton-loader" style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default SpotDetailsSkeleton;