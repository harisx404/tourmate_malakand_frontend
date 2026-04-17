import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./error-boundary.css";

/**
 * Global Exception Handler.
 * Wraps the application tree to intercept runtime JavaScript errors, preventing
 * white-screen crashes by rendering a graceful fallback UI.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    /**
     * Updates local state to trigger the fallback UI during the next render cycle.
     * @param {Error} error - The uncaught exception thrown by a child component.
     */
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    /**
     * Side-effect handler for error logging.
     * Integration point for telemetry services (Sentry, Datadog) to capture stack traces.
     */
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    /**
     * Attempts to recover application state via a hard browser reload.
     * Useful for clearing transient memory states or stuck cache.
     */
    handleReload = () => {
        window.location.reload();
    };

    render() {
        // Render fallback UI if the component tree has crashed.
        if (this.state.hasError) {
            return (
                <section className="error-boundary-section">
                    <Container>
                        <Row>
                            <Col lg="6" className="m-auto text-center">
                                <div className="error-boundary-card">
                                    <div className="error-boundary-icon">
                                        <i className="ri-error-warning-line"></i>
                                    </div>
                                    <h2>Oops! Something went wrong.</h2>
                                    <p>
                                        We encountered an unexpected error.
                                        <br />
                                        Please try refreshing the page.
                                    </p>

                                    {/* * Conditional Stack Trace:
                                      * Reveal debugging details only in development to prevent 
                                      * leaking internal logic or paths in production builds.
                                      */}
                                    {process.env.NODE_ENV === "development" && (
                                        <details className="error-boundary-details">
                                            <summary>Error Details</summary>
                                            {this.state.error && this.state.error.toString()}
                                        </details>
                                    )}

                                    <button className="error-boundary-refresh-btn mt-4" onClick={this.handleReload}>
                                        Refresh Page
                                    </button>

                                    <div className="mt-3">
                                        <a href="/" className="error-boundary-home-link">Go back to Home</a>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            );
        }

        // Pass-through rendering for healthy component trees.
        return this.props.children;
    }
}

export default ErrorBoundary;