import React from "react";
import { Col } from "reactstrap";
import SpotCard from "../../shared/SpotCard";
import SpotCardSkeleton from "../Skeleton/SpotCardSkeleton";
import { BASE_URL } from "../../utils/config";
import useFetch from "../../hooks/useFetch";

/**
 * Fetches and displays a grid of top-rated tourism spots.
 * * Manages async states (loading skeletons, error handling) and applies specific
 * layout overrides to enforce a dense 3-column grid on mobile devices.
 */
const PopularSpotsList = () => {
    // Retrieve curated "Top Rated" dataset from backend.
    const { data: spots, loading, error } = useFetch(`${BASE_URL}/spots/search/getTopRatedSpots`);

    if (loading) {
        return (
            <>
                {[1, 2, 3, 4].map((n) => (
                    /* 'mobile-spot-col' overrides Bootstrap stacking to force 3 columns on small screens */
                    <Col lg="3" md="6" className="mb-4 mobile-spot-col" key={n}>
                        <SpotCardSkeleton />
                    </Col>
                ))}
            </>
        );
    }

    if (error) {
        return <div className="text-center text-danger w-100 py-4">Failed to load popular spots.</div>;
    }

    if (!loading && (!spots || spots.length === 0)) {
        return <div className="text-center w-100 py-4 text-muted">No popular spots found yet!</div>;
    }

    return (
        <>
            {spots.map(spot => (
                /* Apply mobile grid override; 'popular' prop triggers the visual badge on the card */
                <Col lg="3" md="6" className="mb-4 mobile-spot-col" key={spot._id}>
                    <SpotCard spot={spot} popular={true} />
                </Col>
            ))}
        </>
    );
};

export default PopularSpotsList;