import React from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import "./spot-card.css";

//====== UI COMPONENT: SPOT CARD =======//

/**
 * Presentational component for a single tourism spot.
 * Handles responsive layout scaling and conditional rendering for "Popular" status
 * and rating fallbacks (e.g., displaying "New" for unrated spots).
 *
 * @param {Object} props
 * @param {Object} props.spot - The spot data object from the backend.
 * @param {boolean} [props.popular=false] - Flag to toggle the "Popular" visual badge.
 */
const SpotCard = ({ spot, popular = false }) => {
    /*
      Data Guard:
      Silently return null if the 'spot' prop is undefined (e.g., during fetch lag).
      Prevents the entire list from crashing due to one malformed object.
    */
    if (!spot) return null;

    const { _id, title, city, photo, district, reviews, ratingsAverage } = spot;

    return (
        <div className="spot-card-wrapper">
            <Card className="spot-card-container">
                <div className="spot-card-img-box">
                    <img src={photo} alt={title} />
                    {/* Visual indicator for high-traffic or featured spots */}
                    {popular && (
                        <span className="spot-card-popular-tag">
                            <i className="ri-fire-fill"></i> Popular
                        </span>
                    )}
                </div>

                <CardBody className="spot-card-body">
                    <div className="spot-card-header d-flex align-items-center justify-content-between">
                        <span className="spot-card-location d-flex align-items-center gap-1">
                            <i className="ri-map-pin-line"></i> {city}
                        </span>

                        <span className="spot-card-rating d-flex align-items-center gap-1">
                            <i className="ri-star-fill"></i>
                            <span className="rating-value">
                                {/*
                                   - If average is 0 or null, display "New" to encourage first reviews.
                                   - Otherwise, fix decimal precision to 1 (e.g., "4.5" instead of "4.5333").
                                */}
                                {ratingsAverage && ratingsAverage > 0
                                    ? ratingsAverage.toFixed(1)
                                    : "New"
                                }
                            </span>
                            {reviews?.length > 0 && <span className="rating-count">({reviews.length})</span>}
                        </span>
                    </div>

                    <h5 className="spot-card-title">
                        <Link to={`/spots/${_id}`}>{title}</Link>
                    </h5>

                    <div className="spot-card-footer d-flex align-items-center justify-content-between">
                        <div className="spot-card-district-info">
                            <span>District</span>
                            <h6>{district}</h6>
                        </div>

                        <Link to={`/spots/${_id}`}>
                            <span className="btn spot-card-explore-btn">
                                Explore
                            </span>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default SpotCard;