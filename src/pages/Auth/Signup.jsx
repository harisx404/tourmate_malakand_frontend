import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button, Spinner } from "reactstrap"; // Added Spinner
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

import signupImg from "../../assets/images/signup.png";
import userIcon from "../../assets/images/user.png";
import CustomToast from "../../shared/CustomToast";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

const Signup = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        email: "",
        password: ""
    });

    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // --- Standardized Toast State ---
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const closeToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };

    const handleChange = e => {
        setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }))
    };

    const handleClick = async e => {
        e.preventDefault();

        // Validation Checks (Before Loading)
        if (!credentials.username || !credentials.email || !credentials.password) {
            setToastState({
                show: true,
                message: "All fields are required.",
                type: "error"
            });
            return;
        }

        if (credentials.password.length < 6) {
            setToastState({
                show: true,
                message: "Password must be at least 6 characters.",
                type: "error"
            });
            return;
        }

        setLoading(true);
        const startTime = Date.now(); // Record start time

        try {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to create account");
            }

            dispatch({ type: "REGISTER_SUCCESS" });

            setToastState({
                show: true,
                message: result.message || "Account created! Please login.",
                type: "success"
            });
            setTimeout(() => {
                setLoading(false);
                navigate("/login");
            }, 500);

        } catch (err) {
            setToastState({
                show: true,
                message: err.message,
                type: "error"
            });
        } finally {
            // Ensure loader stays for at least 500ms
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(() => setLoading(false), remainingTime);
            } else {
                setLoading(false);
            }
        }
    };

    return (
        <section className="auth-page-section">
            <Container>
                <Row>
                    <Col lg="8" className="m-auto">
                        <div className="auth-page-container">

                            {/* === Left Side: Visuals === */}
                            <div className="auth-page-visual signup__visual">
                                <div className="auth-page-overlay-circle"></div>
                                <div className="auth-page-img-box">
                                    <img src={signupImg} alt="Sign Up" />
                                </div>
                                <div className="auth-page-text">
                                    <h3>Join Us!</h3>
                                    <p>Create an account to start your journey into paradise.</p>
                                </div>
                            </div>

                            {/* === Right Side: Form === */}
                            <div className="auth-page-form-wrapper">
                                <div className="auth-page-user-avatar">
                                    <img src={userIcon} alt="" />
                                </div>
                                <h2>Create Account</h2>

                                <Form onSubmit={handleClick} className="auth-page-form">
                                    <FormGroup className="auth-page-input-group">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            required
                                            id="username"
                                            onChange={handleChange}
                                            value={credentials.username}
                                        />
                                    </FormGroup>
                                    <FormGroup className="auth-page-input-group">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            id="email"
                                            onChange={handleChange}
                                            value={credentials.email}
                                        />
                                    </FormGroup>
                                    <FormGroup className="auth-page-input-group">
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            required
                                            id="password"
                                            onChange={handleChange}
                                            value={credentials.password}
                                        />
                                    </FormGroup>

                                    {/* === UPDATED BUTTON WITH SPINNER === */}
                                    <Button className="btn auth-page-submit-btn" type="submit" disabled={loading}>
                                        {loading ? (
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <Spinner size="sm" color="light" />
                                                <span>Creating...</span>
                                            </div>
                                        ) : (
                                            "Sign Up"
                                        )}
                                    </Button>
                                </Form>

                                <p className="auth-page-footer">
                                    Already have an account? <Link to="/login">Login</Link>
                                </p>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Container>

            {/* --- Custom Toast Component --- */}
            <CustomToast
                message={toastState.message}
                type={toastState.type}
                show={toastState.show}
                onClose={closeToast}
            />
        </section>
    );
};

export default Signup;