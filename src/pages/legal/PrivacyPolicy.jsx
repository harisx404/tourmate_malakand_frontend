import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../../shared/CommonSection";
import "./legal-pages.css";

/**
 * Privacy Policy Page.
 * Outlines data collection methods (Auth, GPS), usage, and security protocols.
 * Mandatory for GDPR/Compliance adherence.
 */
const PrivacyPolicy = () => {

    // UX: Ensure user starts reading from the top of the policy.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <CommonSection title={"Privacy Policy"} />

            <section className="legal-page-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg="10" md="12">
                            <div className="legal-page-glassy-card">

                                {/* Page Header & Metadata */}
                                <div className="legal-header-wrapper">
                                    <h2 className="legal-page-title">Data Protection & Privacy</h2>
                                    <div className="legal-last-updated">
                                        <i className="ri-time-line"></i> Last Updated: January 10, 2026
                                    </div>
                                </div>

                                {/* Introduction */}
                                <div className="legal-content-block">
                                    <p>
                                        <strong>TourMate Malakand</strong> ("we," "our," or "us") is committed to protecting the privacy of our users.
                                        This Privacy Policy explains how the TourMate Development Team collects, uses, and safeguards your information
                                        when you visit our web application.
                                    </p>
                                </div>

                                {/* Article 1: Data Collection Scope */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-database-2-line"></i></div>
                                        1. Information We Collect
                                    </h4>
                                    <p>We believe in data minimization. We only collect information necessary to provide our services:</p>
                                    <ul>
                                        <li><strong>Account Data:</strong> Username and Email Address for authentication. Passwords are securely hashed.</li>
                                        <li><strong>User Content:</strong> Reviews and ratings you voluntarily upload.</li>
                                        <li><strong>Technical Data:</strong> Cookies used solely for session management.</li>
                                    </ul>
                                </div>

                                {/* Article 2: Geolocation Usage */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-map-pin-user-line"></i></div>
                                        2. Location Data (GPS)
                                    </h4>
                                    <p>
                                        To provide "Get Directions" or "Get Routes" features, we request access to your device's geolocation.
                                    </p>
                                    <p>
                                        <strong>Important:</strong> We do <strong>not</strong> store or track your real-time GPS history on our servers.
                                        Location data is processed locally on your device or used briefly to calculate time and distance.
                                    </p>
                                </div>

                                {/* Article 3: Usage Intent */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-shield-check-line"></i></div>
                                        3. How We Use Your Data
                                    </h4>
                                    <p>Your information is used strictly for:</p>
                                    <ul>
                                        <li>Authenticating your identity.</li>
                                        <li>Displaying your public reviews.</li>
                                        <li>Responding to support inquiries.</li>
                                    </ul>
                                </div>

                                {/* Article 4: Security Protocols */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-lock-password-line"></i></div>
                                        4. Data Sharing & Security
                                    </h4>
                                    <p>
                                        We do not sell your personal data. We implement industry-standard encryption and security measures
                                        to protect against unauthorized access.
                                    </p>
                                </div>

                                {/* Support Information */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-mail-send-line"></i></div>
                                        5. Contact Us
                                    </h4>
                                    <p>Questions about this policy?</p>
                                    <ul>
                                        <li><a className="legal-link-contact" href="/contact">Contact Us</a></li>
                                        <li><strong>Email:</strong> <a href="mailto:tourmate.mkd@gmail.com" className="legal-link">tourmate.mkd@gmail.com</a></li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default PrivacyPolicy;