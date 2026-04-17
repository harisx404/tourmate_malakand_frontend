import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import "../../components/ErrorBoundary/error-boundary.css";

/**
 * Static error page for HTTP 500 (Internal Server Error) scenarios.
 * Used when the backend is unreachable or explicitly returns a maintenance status.
 */
const ServerError = () => {
    return (
        <section className="error-boundary-section">
            <Container>
                <Row>
                    <Col lg="6" className="m-auto text-center">
                        <div className="error-boundary-card">
                            <div className="error-boundary-icon">
                                <i className="ri-server-line" style={{ color: "#e63946" }}></i>
                            </div>

                            {/* User-facing messaging for service interruptions */}
                            <h2>Service Unavailable</h2>

                            <p>
                                We are currently experiencing technical issues or performing scheduled maintenance.
                                <br />
                                Please check back shortly.
                            </p>

                            <div className="d-flex justify-content-center gap-3 mt-4">
                                <button
                                    className="error-boundary-refresh-btn"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Refreshing
                                </button>

                                <Link to="/home" className="error-boundary-home-link">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ServerError;