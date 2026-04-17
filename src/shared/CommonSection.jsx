import React from "react";
import "./common-section.css";
import { Container, Row, Col } from "reactstrap";

//====== UI COMPONENT: COMMON HERO SECTION =======//

/**
 * Reusable hero section for internal page headers.
 * Renders a fixed-height cinematic background with a centered,
 * glassmorphism-styled title overlay.
 *
 * @param {Object} props
 * @param {string} props.title - The text to display in the header overlay.
 */
const CommonSection = ({ title }) => {
    return (
        <section className="common-section-container">
            <Container>
                <Row>
                    <Col lg="12" className="d-flex justify-content-center">
                        <div className="common-section-title-box">
                            <h1>{title}</h1>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default CommonSection;