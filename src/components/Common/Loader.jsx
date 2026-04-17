import React from "react";
import "./loader.css";

/**
 * Minimalist Loader Component.
 * A sleek, non-intrusive spinner that aligns with the professional
 * typography and color palette of TourMate Malakand.
 */
const Loader = () => {
    return (
        <div className="tm-minimal-loader-container">
            <div className="tm-spinner-box">
                {/* The rotating ring */}
                <div className="tm-sleek-spinner"></div>

                {/* Clean, uppercase text using the primary font (Montserrat) */}
                <span className="tm-minimal-text">Please Wait...</span>
            </div>
        </div>
    );
};

export default Loader;