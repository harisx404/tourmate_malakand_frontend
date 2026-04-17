import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button, Spinner } from "reactstrap"; // Added Spinner
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

import loginImg from "../../assets/images/login.png";
import userIcon from "../../assets/images/user.png";
import CustomToast from "../../shared/CustomToast";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

const Login = () => {
    const [credentials, setCredentials] = useState({
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

        // 1. Check validation BEFORE starting loading state
        if (!credentials.email || !credentials.password) {
            setToastState({
                show: true,
                message: "Please fill in all fields.",
                type: "error"
            });
            return;
        }

        setLoading(true);
        const startTime = Date.now(); // Record start time
        dispatch({ type: "LOGIN_START" });

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to login");
            }

            dispatch({ type: "LOGIN_SUCCESS", payload: result.data });

            setToastState({
                show: true,
                message: result.message || "Login successful!",
                type: "success"
            });
            setTimeout(() => {
                setLoading(false);
                navigate("/");
            }, 500);

        } catch (err) {
            setToastState({
                show: true,
                message: err.message,
                type: "error"
            });
            dispatch({ type: "LOGIN_FAILURE", payload: err.message });
        } finally {
            // 2. Ensure loader stays for at least 500ms so user sees it
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
                            <div className="auth-page-visual">
                                <div className="auth-page-overlay-circle"></div>
                                <div className="auth-page-img-box">
                                    <img src={loginImg} alt="Login" />
                                </div>
                                <div className="auth-page-text">
                                    <h3>Welcome Back!</h3>
                                    <p>Login to continue exploring the hidden gems of Malakand.</p>
                                </div>
                            </div>

                            {/* === Right Side: Form === */}
                            <div className="auth-page-form-wrapper">
                                <div className="auth-page-user-avatar">
                                    <img src={userIcon} alt="" />
                                </div>
                                <h2>Login</h2>

                                <Form onSubmit={handleClick} className="auth-page-form">
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
                                                <span>Logging In...</span>
                                            </div>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>
                                </Form>

                                <p className="auth-page-footer">
                                    Don't have an account? <Link to="/signup">Sign Up</Link>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <CustomToast
                message={toastState.message}
                type={toastState.type}
                show={toastState.show}
                onClose={closeToast}
            />
        </section>
    );
};

export default Login;