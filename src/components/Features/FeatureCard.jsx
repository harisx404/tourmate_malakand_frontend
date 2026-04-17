import React from "react";
import "./feature-card.css";

/**
 * Displays a single feature with an icon/image, title, and description.
 * 
 * @component
 * @param {Object} item - The feature data object.
 * @param {string} item.imgUrl - Path to the feature icon/image.
 * @param {string} item.title - key title of the feature.
 * @param {string} item.desc - Short description of the feature.
 * @returns {JSX.Element} A card-like feature item.
 */
const FeatureCard = ({ item }) => {
    const { imgUrl, title, desc } = item;

    return (
        <div className="feature-card-item">
            <div className="feature-card-img-bubble">
                <img src={imgUrl} alt={title} />
            </div>
            <h5 className="feature-card-title">{title}</h5>
            <p className="feature-card-desc">{desc}</p>
        </div>
    );
};

export default FeatureCard;