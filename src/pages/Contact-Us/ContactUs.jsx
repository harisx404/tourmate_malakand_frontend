import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import "./contact-us.css";
import CommonSection from "../../shared/CommonSection";
import { BASE_URL } from "../../utils/config";
import CustomToast from "../../shared/CustomToast"; // <--- Only new import

/**
 * ContactSubjectDropdown
 * (Code preserved exactly as provided)
 */
const ContactSubjectDropdown = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);
    const subjects = [
        "General Inquiry",
        "Spot Suggestion",
        "Report Data Inaccuracy",
        "Copyright Infringement",
        "Partnership & Collaboration"
    ];

    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className={`contact-page-dropdown ${isOpen ? "open" : ""}`} ref={dropRef}>
            <div className="contact-page-drop-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{selected}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? 'rotate' : ''}`}></i>
            </div>
            {isOpen && (
                <div className="contact-page-drop-menu">
                    {subjects.map(subj => (
                        <div
                            key={subj}
                            className={`contact-page-drop-item ${selected === subj ? "active" : ""}`}
                            onClick={() => { onSelect(subj); setIsOpen(false); }}
                        >
                            {subj}
                            {selected === subj && <i className="ri-check-line"></i>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * ContactUs Page Component.
 */
const ContactUs = () => {
    const nameRef = useRef("");
    const emailRef = useRef("");
    const [subject, setSubject] = useState("General Inquiry");
    const messageRef = useRef("");
    const [loading, setLoading] = useState(false);

    // --- NEW: State for Custom Toast ---
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
        type: "success"
    });

    // --- NEW: Helper to close toast ---
    const closeToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };

    /**
     * submitHandler
     * Logic preserved exactly from original, just swapped toast calls.
     */
    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            subject: subject,
            message: messageRef.current.value,
        };

        try {
            const res = await fetch(`${BASE_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                // --- REPLACED: toast.success() -> setToastState() ---
                setToastState({
                    show: true,
                    message: "Thank you! Your inquiry has been received and recorded.",
                    type: "success"
                });

                // Reset logic (Preserved)
                nameRef.current.value = "";
                emailRef.current.value = "";
                messageRef.current.value = "";
                setSubject("General Inquiry");
            } else {
                // --- REPLACED: toast.error() -> setToastState() ---
                setToastState({
                    show: true,
                    message: result.message || "Submission failed. Please try again.",
                    type: "error"
                });
            }
        } catch (err) {
            // --- REPLACED: toast.error() -> setToastState() ---
            setToastState({
                show: true,
                message: "Server unreachable. Please check your network.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CommonSection title={"Contact Us"} />

            <section className="contact-page-section">
                <Container>
                    <Row className="contact-page-row">
                        {/* Sidebar */}
                        <Col lg="4" className="mb-4 mb-lg-0">
                            <div className="contact-page-sticky-sidebar">
                                <div className="contact-page-glassy-card contact-page-info-card mb-4">
                                    <h3>How Can We Help?</h3>
                                    <p>Whether you have inquiries regarding specific spots or wish to contribute a new hidden spot to TourMate Malakand, our dedicated support team is here to assist you.</p>
                                </div>

                                <div className="contact-page-info-group">
                                    <div className="contact-page-glassy-card contact-page-info-item">
                                        <div className="contact-page-icon-box"><i className="ri-map-pin-line"></i></div>
                                        <div>
                                            <h6>Location</h6>
                                            <p>Malakand Division, KP, Pakistan</p>
                                        </div>
                                    </div>

                                    <div className="contact-page-glassy-card contact-page-info-item">
                                        <div className="contact-page-icon-box"><i className="ri-whatsapp-line"></i></div>
                                        <div>
                                            <h6>WhatsApp Support</h6>
                                            <p>+92 300 1234567</p>
                                        </div>
                                    </div>

                                    <div className="contact-page-glassy-card contact-page-info-item">
                                        <div className="contact-page-icon-box"><i className="ri-mail-line"></i></div>
                                        <div>
                                            <h6>Email Inquiries</h6>
                                            <p>support@tourmate.pk</p>
                                        </div>
                                    </div>

                                    <div className="social__links d-flex align-items-center justify-content-center gap-3 mt-4">
                                        <span className="contact-page-social-btn"><i className="ri-instagram-line"></i></span>
                                        <span className="contact-page-social-btn"><i className="ri-facebook-fill"></i></span>
                                        <span className="contact-page-social-btn"><i className="ri-twitter-line"></i></span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Inquiry Form */}
                        <Col lg="8">
                            <div className="contact-page-glassy-card contact-page-form-wrapper">
                                <div className="contact-page-form-header">
                                    <h2>Submit an Inquiry</h2>
                                    <p>Please complete the form below. Our team typically responds to all requests within 24 hours.</p>
                                </div>

                                <Form onSubmit={submitHandler}>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup className="contact-page-input-group">
                                                <input type="text" placeholder="Full Name" required ref={nameRef} />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup className="contact-page-input-group">
                                                <input type="email" placeholder="Email Address" required ref={emailRef} />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <FormGroup className="contact-page-input-group">
                                        <ContactSubjectDropdown
                                            selected={subject}
                                            onSelect={setSubject}
                                        />
                                    </FormGroup>

                                    <FormGroup className="contact-page-input-group">
                                        <textarea
                                            rows="6"
                                            placeholder="Please provide detailed information regarding your inquiry..."
                                            required
                                            ref={messageRef}
                                        ></textarea>
                                    </FormGroup>

                                    <button className="contact-page-submit-btn" type="submit" disabled={loading}>
                                        {loading ? "Sending..." : "Submit Message"}
                                    </button>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- NEW: Custom Toast Component (Placed at end of fragment) --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />
        </>
    );
};

export default ContactUs;