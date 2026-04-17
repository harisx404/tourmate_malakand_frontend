import React, { useEffect, useState } from "react";
import "./custom-toast.css";

//====== UI COMPONENT: CUSTOM TOAST =======//

/*
  Feedback component with "Graceful Exit" architecture.
  Manages its own internal mount state to ensure CSS exit animations
  finish playing before the component actually unmounts from the DOM.
*/
const CustomToast = ({ message, type = "success", show, onClose, duration = 3000 }) => {
    /*
      Internal visibility state allows us to decouple the logical "closed" state
      (controlled by parent) from the visual "removed" state (DOM unmounting).
    */
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let dismissTimer;
        let animationTimer;

        if (show) {
            setIsVisible(true);

            // 1. Logic to actually call the onClose function after duration
            dismissTimer = setTimeout(() => {
                onClose();
            }, duration);
        } else {
            // 2. Delay unmounting for exit animation
            // Holds the component in the DOM for 500ms so the slide-out animation is visible
            animationTimer = setTimeout(() => setIsVisible(false), 500);
        }

        return () => {
            clearTimeout(dismissTimer);
            clearTimeout(animationTimer);
        };
    }, [show, onClose, duration]);

    /*
      Prevents the component from rendering if it's not visible.
      This is a performance optimization to avoid unnecessary DOM operations.
    */
    if (!show && !isVisible) return null;

    const isError = type === "error";
    const iconColor = isError ? "#e63946" : "#2a9d8f";
    const iconBg = isError ? "rgba(230, 57, 70, 0.1)" : "rgba(42, 157, 143, 0.1)";

    return (
        <div className={`custom-toast-container ${show ? "custom-toast-active" : "custom-toast-inactive"}`}>
            <div
                className="custom-toast-border-strip"
                style={{ background: iconColor }}
            ></div>

            <div className="custom-toast-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
                <i className={isError ? "ri-error-warning-fill" : "ri-checkbox-circle-fill"}></i>
            </div>

            <div className="custom-toast-content">
                <h5 style={{ color: isError ? "#e63946" : "var(--primary-color)" }}>
                    {isError ? "Action Required" : "Success"}
                </h5>
                <p>{message}</p>
            </div>

            <button className="custom-toast-close-btn" onClick={onClose}>
                <i className="ri-close-line"></i>
            </button>

            {/* --- Progress Bar Fix --- */}
            <div className="custom-toast-progress-track">
                {/*
                   Dynamic Animation Sync:
                   Injects the JS 'duration' prop directly into the CSS animation.
                   Ensures the visual progress bar perfectly matches the auto-close timer.
                */}
                <div
                    className="custom-toast-progress-fill"
                    style={{
                        background: iconColor,
                        // Synchronize animation with the duration prop
                        animation: show ? `toastProgress ${duration}ms linear forwards` : 'none'
                    }}
                ></div>
            </div>
        </div>
    );
};

export default CustomToast;