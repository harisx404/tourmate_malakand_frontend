import React from "react";
import { Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { Link } from "react-router-dom";
import footerLogo from "../../assets/images/logo2.png";
import "./footer.css";

/*
  Quick Links:
  Represents the different sections of the website.
  Used for navigation and accessibility.
*/
const quick__Links = [
    { path: "/", display: "Home" },
    { path: "/map", display: "Map" },
    { path: "/spots", display: "All Spots" },
    { path: "/emergencyContacts", display: "Emergency Contacts" },
];

const quick__Links2 = [
    { path: "/login", display: "Login" },
    { path: "/signup", display: "Sign Up" },
    { path: "/contact", display: "Contact Us" },
    { path: "/home#popular-spots", display: "Popular Spots" },
];

/**
 * Site Footer Component.
 * Serves as the global termination point for the application.
 * Structurally divided into Brand Identity, Navigation Grids, and Contact Information.
 * Implements a responsive grid that shifts from 4 columns (Desktop) to a 50/50 split (Mobile).
 */
const Footer = () => {
    // Dynamic date generation for automated copyright compliance
    const year = new Date().getFullYear();

    return (
        <footer className="footer-section">
            <Container>
                <Row>
                    {/* --- Brand Identity & Social Engagement --- */}
                    <Col lg="3" md="6" className="mb-4">
                        <div className="footer-logo">
                            <Link to="/">
                                <img src={footerLogo} alt="TourMate" />
                            </Link>
                            <p className="footer-desc">
                                Experience the breathtaking valleys of Malakand with TourMate.
                                Your premium travel partner for safe and memorable journeys.
                            </p>

                            <h6 className="footer-social-title">Follow Us</h6>
                            <div className="footer-social-links d-flex align-items-center gap-3">
                                <Link to="#" className="footer-social-icon"><i className="ri-youtube-line"></i></Link>
                                <Link to="#" className="footer-social-icon"><i className="ri-github-fill"></i></Link>
                                <Link to="#" className="footer-social-icon"><i className="ri-facebook-circle-line"></i></Link>
                                <Link to="#" className="footer-social-icon"><i className="ri-instagram-line"></i></Link>
                            </div>
                        </div>
                    </Col>

                    {/* --- Navigation Grid: Discover --- 
                        Uses xs="6" to enforce a 2-column layout on mobile devices, 
                        optimizing vertical screen real estate.
                    */}
                    <Col lg="3" md="6" xs="6" className="mb-4">
                        <h5 className="footer-link-title">Discover</h5>
                        <ListGroup className="footer-quick-links">
                            {quick__Links.map((item, index) => (
                                <ListGroupItem key={index} className="ps-0 border-0 bg-transparent">
                                    <Link to={item.path}>{item.display}</Link>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </Col>

                    {/* --- Navigation Grid: Quick Links --- 
                        Pairs with the Discover column for the mobile 50/50 split.
                    */}
                    <Col lg="3" md="6" xs="6" className="mb-4">
                        <h5 className="footer-link-title">Quick Links</h5>
                        <ListGroup className="footer-quick-links">
                            {quick__Links2.map((item, index) => (
                                <ListGroupItem key={index} className="ps-0 border-0 bg-transparent">
                                    <Link to={item.path}>{item.display}</Link>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </Col>

                    {/* --- Contact Information --- */}
                    <Col lg="3" md="6" className="mb-4">
                        <h5 className="footer-link-title">Get in Touch</h5>
                        <ListGroup className="footer-quick-links contact-info">
                            <ListGroupItem className="ps-0 border-0 bg-transparent d-flex gap-3">
                                <span className="footer-contact-icon-box"><i className="ri-map-pin-line"></i></span>
                                <div>
                                    <p className="footer-contact-label">Address:</p>
                                    <h6 className="footer-contact-text">Malakand, Pakistan</h6>
                                </div>
                            </ListGroupItem>

                            <ListGroupItem className="ps-0 border-0 bg-transparent d-flex gap-3">
                                <span className="footer-contact-icon-box"><i className="ri-mail-line"></i></span>
                                <div>
                                    <p className="footer-contact-label">Email:</p>
                                    <h6 className="footer-contact-text">tourmate.mkd@gmail.com</h6>
                                </div>
                            </ListGroupItem>

                            <ListGroupItem className="ps-0 border-0 bg-transparent d-flex gap-3">
                                <span className="footer-contact-icon-box"><i className="ri-phone-line"></i></span>
                                <div>
                                    <p className="footer-contact-label">Phone:</p>
                                    <h6 className="footer-contact-text">+92 300 1234567</h6>
                                </div>
                            </ListGroupItem>
                        </ListGroup>
                    </Col>

                    {/* --- Footer Bottom: Legal & Copyright --- */}
                    <Col lg="12">
                        <div className="footer-bottom-bar">
                            <Row className="align-items-center">
                                <Col md="6" className="text-center text-md-start">
                                    <p className="footer-copyright">
                                        &copy; {year} TourMate. All rights reserved.
                                    </p>
                                </Col>
                                <Col md="6" className="text-center text-md-end">
                                    <div className="footer-legal-links justify-content-center justify-content-md-end">
                                        <Link to="/privacy-policy">Privacy Policy</Link>
                                        <Link to="/terms-of-use">Terms of Use</Link>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;