import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import "./page-notfound.css";

/**
 * 404 Error Page.
 * Displays a centralized, glassmorphism-styled notification card
 * when a user navigates to a non-existent route.
 */
const NotFound = () => {
    return (
        <section className="not-found-page-section">
            <Container>
                <Row>
                    {/* Grid Layout:
                        The parent Col ensures the inline-block content card 
                        remains horizontally centered within the viewport.
                    */}
                    <Col lg="12" className="text-center">
                        <div className="not-found-page-content text-center">

                            <h1 className="not-found-page-error-code">404</h1>

                            <h2 className="not-found-page-heading">Oops! Page Not Found</h2>

                            <p className="not-found-page-desc">
                                It seems the path you are looking for has disappeared into the mountains.
                            </p>

                            <Link to="/home" className="not-found-page-home-btn">
                                <i className="ri-home-4-line"></i> Back to Home
                            </Link>

                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default NotFound;