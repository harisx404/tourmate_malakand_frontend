import React from 'react';
import { Card, CardBody } from "reactstrap";
import './spotcard-skeleton.css';

/*
  Spot Card Skeleton Component:
  Represents the skeleton of a spot card.
  Used for loading states in the spot card.
*/
const SpotCardSkeleton = () => {
    return (
        <div className="spot-card-skeleton-wrapper" style={{ height: '100%', marginBottom: '0' }}>
            <Card className="spot-card-skeleton-container border-0">

                {/* Image Section */}
                <div className="spot-card-skeleton-loader spot-card-skeleton-img"></div>

                {/* Content Section */}
                <CardBody className="spot-card-skeleton-body">

                    <div>
                        {/* Location & Rating */}
                        <div className="d-flex align-items-center justify-content-between mb-3 spot-card-skeleton-meta-row">
                            <div className="d-flex align-items-center gap-2" style={{ width: '50%' }}>
                                <div className="spot-card-skeleton-loader spot-card-skeleton-circle"></div>
                                <div className="spot-card-skeleton-loader spot-card-skeleton-text" style={{ width: '70%', marginBottom: 0 }}></div>
                            </div>
                            <div className="d-flex align-items-center gap-1" style={{ width: '25%' }}>
                                <div className="spot-card-skeleton-loader spot-card-skeleton-circle"></div>
                                <div className="spot-card-skeleton-loader spot-card-skeleton-text" style={{ width: '60%', marginBottom: 0 }}></div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="spot-card-skeleton-loader spot-card-skeleton-title"></div>
                    </div>

                    {/* Footer: District & Button */}
                    {/* Added 'spot-card-skeleton-footer' class here for mobile stacking */}
                    <div className="d-flex align-items-center justify-content-between mt-3 spot-card-skeleton-footer">
                        <div className="d-flex flex-column gap-1 w-50 spot-card-skeleton-district">
                            <div className="spot-card-skeleton-loader spot-card-skeleton-text" style={{ width: '40%', height: '8px', marginBottom: '4px' }}></div>
                            <div className="spot-card-skeleton-loader spot-card-skeleton-text" style={{ width: '60%', height: '10px', marginBottom: 0 }}></div>
                        </div>
                        <div className="spot-card-skeleton-loader spot-card-skeleton-btn"></div>
                    </div>

                </CardBody>
            </Card>
        </div>
    );
};

export default SpotCardSkeleton;