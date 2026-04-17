import React from "react";
import FeatureCard from "./FeatureCard";
import { Col } from "reactstrap";

import weatherImg from "../../assets/images/weather.png";
import guideImg from "../../assets/images/guide.png";
import mapImg from "../../assets/images/map.png";

/**
 * Static data for the features section.
 * Defines the core value propositions of the application.
 */
const featuresData = [
    {
        imgUrl: weatherImg,
        title: "Live Weather",
        desc: "Real-time updates to ensure safe and pleasant journeys.",
    },
    {
        imgUrl: guideImg,
        title: "Digital Tour Guide",
        desc: "Curated insights into hidden gems and local culture.",
    },
    {
        imgUrl: mapImg,
        title: "Interactive Map",
        desc: "Seamlessly explore the valleys with our smart map.",
    },
];

const FeatureList = () => {
    return (
        <>
            {featuresData.map((item, index) => (
                <Col lg="3" md="6" sm="12" className="mb-4" key={index}>
                    <FeatureCard item={item} />
                </Col>
            ))}
        </>
    );
};

export default FeatureList;