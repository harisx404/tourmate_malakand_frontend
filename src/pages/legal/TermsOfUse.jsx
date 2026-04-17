import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../../shared/CommonSection";
import "./legal-pages.css";

/**
 * Terms of Use Page.
 * Renders the static legal agreement between the platform and the user.
 * Structure includes liability disclaimers, account responsibilities, and content policies.
 */
const TermsOfUse = () => {

    /**
     * UX: Reset scroll position to top on mount.
     * Essential for legal pages to ensure users do not land in the middle of the text
     * if navigating from a footer link.
     */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <CommonSection title={"Terms of Use"} />

            <section className="legal-page-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg="10" md="12">
                            <div className="legal-page-glassy-card">

                                {/* Page Header & Metadata */}
                                <div className="legal-header-wrapper">
                                    <h2 className="legal-page-title">Terms of Use</h2>
                                    <div className="legal-last-updated">
                                        <i className="ri-time-line"></i> Last Updated: January 10, 2026
                                    </div>
                                </div>

                                <div className="legal-content-block">
                                    <p>
                                        Please read these Terms of Use ("Terms") carefully before using the <strong>TourMate Malakand</strong> platform.
                                        By accessing or using our Service, you agree to be bound by these Terms.
                                    </p>
                                </div>

                                {/* Article 1: User Acceptance */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-file-list-3-line"></i></div>
                                        1. Acceptance of Terms
                                    </h4>
                                    <p>
                                        These Terms apply to all visitors, users, and others who access the Service. If you disagree
                                        with any part of the terms, you may not access the Service.
                                    </p>
                                </div>

                                {/* Article 2: Liability & Safety */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-alert-line"></i></div>
                                        2. Tourism & Safety Disclaimer
                                    </h4>
                                    <p>
                                        <strong>Use at Your Own Risk:</strong> TourMate Malakand provides information regarding tourism spots
                                        and routes for informational purposes only. Nature is unpredictable.
                                    </p>
                                    <ul>
                                        <li>We are <strong>not liable</strong> for any injury, accident, or damage incurred while visiting spots listed here.</li>
                                        <li>You are responsible for checking weather and road conditions.</li>
                                        <li>Swimming, hiking, and exploring are done entirely at your own risk.</li>
                                    </ul>
                                </div>

                                {/* Article 3: Authentication Security */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-user-settings-line"></i></div>
                                        3. User Accounts
                                    </h4>
                                    <p>
                                        You are responsible for safeguarding your password. You agree to accept responsibility for all
                                        activities that occur under your account.
                                    </p>
                                </div>

                                {/* Article 4: UGC Policies */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-chat-voice-line"></i></div>
                                        4. User-Generated Content
                                    </h4>
                                    <p>
                                        You retain ownership of reviews you post, but you grant us a license to use them.
                                        We reserve the right to remove content that is hate speech, defamatory, or violates copyrights.
                                    </p>
                                </div>

                                {/* Article 5: Jurisdiction */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-scales-3-line"></i></div>
                                        5. Governing Law
                                    </h4>
                                    <p>
                                        These Terms shall be governed and construed in accordance with the laws of <strong>Pakistan</strong>.
                                    </p>
                                </div>

                                {/* Support Information */}
                                <div className="legal-content-block">
                                    <h4 className="legal-section-title">
                                        <div className="legal-icon-box"><i className="ri-customer-service-2-line"></i></div>
                                        6. Contact Us
                                    </h4>
                                    <p>For legal inquiries:</p>
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

export default TermsOfUse;