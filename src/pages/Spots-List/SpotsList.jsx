import React, { useState, useEffect, useMemo, useRef } from "react";
import CommonSection from "../../shared/CommonSection";
import { Container, Row, Col } from "reactstrap";

import SpotCard from "../../shared/SpotCard";
import SearchBar from "../../shared/SearchBar";
import SpotCardSkeleton from "../../components/Skeleton/SpotCardSkeleton";
import FilterSidebar from "../../components/Filter-Sidebar/FilterSidebar";

import { BASE_URL } from "../../utils/config";
import useFetch from "../../hooks/useFetch";
import "./spots-list.css";

/**
 * Main catalog component for displaying tourism spots.
 * Orchestrates data fetching, client-side filtering, sorting, and responsive layout.
 * Implements a custom dropdown UI for sorting to match the sidebar design language.
 */
const SpotsList = () => {
    // Pagination state
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(0);

    // Filter criteria state
    const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
    const [selectedSeason, setSelectedSeason] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("recommended");

    // UI visibility state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Reference to the sort dropdown container for click-outside detection
    const dropdownRef = useRef(null);

    const sortOptions = [
        { label: "Recommended", value: "recommended" },
        { label: "Top Rated", value: "top-rated" },
        { label: "Lowest Rated", value: "low-rated" }
    ];

    // Fetch initial dataset
    const { data: spots, loading, error } = useFetch(`${BASE_URL}/spots?limit=0`);

    /**
     * Effect: Click Outside Listener
     * Closes the custom sort dropdown when the user clicks anywhere outside the component.
     * Essential for emulating native select behavior with custom UI.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Reset scroll position on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    /**
     * Memoized Filter & Sort Logic.
     * Processes the raw spot data against all active filter criteria (District, Season, Tags, Rating).
     * Applies sorting based on the 'sortBy' state after filtering is complete.
     */
    const filteredSpots = useMemo(() => {
        // 1. Apply Filtering
        let filtered = spots.filter(spot => {
            // Location Filter
            if (selectedDistrict !== "All Districts" && spot.district !== selectedDistrict) return false;

            // Season Filter (Flexible Partial Match)
            if (selectedSeason.length > 0) {
                const spotSeasons = spot.bestSeason ? spot.bestSeason.map(s => s.toLowerCase()) : [];
                // Check if ALL selected season filters partially match ANY of the spot's saved seasons
                if (!selectedSeason.every(season => 
                    spotSeasons.some(fs => fs.includes(season.toLowerCase()))
                )) return false;
            }

            // Tag Filter (Partial Match)
            if (selectedTags.length > 0) {
                const spotTags = spot.tags ? spot.tags.map(t => t.toLowerCase()) : [];
                if (!selectedTags.every(tag => spotTags.includes(tag.toLowerCase()))) return false;
            }

            // Rating Filter
            const ratingToCheck = spot.ratingsAverage || 0;
            if (minRating > 0 && ratingToCheck < minRating) return false;

            return true;
        });

        // 2. Apply Sorting
        if (sortBy === "top-rated") {
            filtered.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
        } else if (sortBy === "low-rated") {
            filtered.sort((a, b) => (a.ratingsAverage || 0) - (b.ratingsAverage || 0));
        }

        return filtered;
    }, [spots, selectedDistrict, selectedSeason, selectedTags, minRating, sortBy]);

    // Recalculate pagination boundaries when the filtered dataset changes
    useEffect(() => {
        const pages = Math.ceil(filteredSpots.length / 9);
        setPageCount(pages);
        setPage(0);
    }, [filteredSpots]);

    const resetFilters = () => {
        setSelectedDistrict("All Districts");
        setSelectedSeason([]);
        setSelectedTags([]);
        setMinRating(0);
        setSortBy("recommended");
    };

    return (
        <>
            <CommonSection title={"Explore Malakand"} />

            <section className="spots-list-page-section">
                <Container>
                    {/* Search Bar Row */}
                    <Row className="mb-5 justify-content-center">
                        <Col lg="10">
                            <SearchBar />
                        </Col>
                    </Row>

                    <Row>
                        {/* Sidebar Column: Contains Filter controls */}
                        <Col lg="3" className="sidebar-col">
                            <button className="spots-list-page-filter-toggle d-lg-none" onClick={() => setIsFilterOpen(true)}>
                                <i className="ri-equalizer-line"></i> Filter Options
                            </button>

                            <FilterSidebar
                                isOpen={isFilterOpen}
                                setIsOpen={setIsFilterOpen}
                                selectedDistrict={selectedDistrict}
                                setSelectedDistrict={setSelectedDistrict}
                                selectedSeason={selectedSeason}
                                setSelectedSeason={setSelectedSeason}
                                selectedTags={selectedTags}
                                setSelectedTags={setSelectedTags}
                                minRating={minRating}
                                setMinRating={setMinRating}
                                resetFilters={resetFilters}
                            />
                        </Col>

                        {/* Content Column: Results Grid */}
                        <Col lg="9">
                            <div className="spots-list-page-header mb-4">
                                <h5><strong>{filteredSpots.length}</strong> Spots Found</h5>
                                <div className="spots-list-page-sort-box">
                                    <span>Sort By:</span>

                                    {/* Custom Pill Dropdown (Replicates FilterSidebar styling) */}
                                    <div className="sort-dropdown-container" ref={dropdownRef}>
                                        <div
                                            className={`sort-dropdown-btn ${isSortOpen ? 'open' : ''}`}
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                        >
                                            <span>
                                                {sortOptions.find(opt => opt.value === sortBy)?.label}
                                            </span>
                                            <i className={`ri-arrow-down-s-line ${isSortOpen ? 'rotate' : ''}`}></i>
                                        </div>

                                        <div className={`sort-dropdown-content ${isSortOpen ? 'show' : ''}`}>
                                            {sortOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className={`sort-dropdown-item ${sortBy === opt.value ? 'active' : ''}`}
                                                    onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Responsive Grid with Mobile override class 'spots-grid-row' */}
                            <Row className="spots-grid-row">
                                {loading ? (
                                    /* Render Skeletons while fetching */
                                    [1, 2, 3, 4, 5, 6].map(n => (
                                        <Col md="6" lg="4" className="mb-4" key={n}>
                                            <SpotCardSkeleton />
                                        </Col>
                                    ))
                                ) : error ? (
                                    /* Error State */
                                    <Col lg="12" className="text-center py-5">
                                        <h4>Error loading spots</h4>
                                        <p>{error}</p>
                                    </Col>
                                ) : filteredSpots.length === 0 ? (
                                    /* Empty State */
                                    <Col lg="12" className="text-center py-5">
                                        <div className="spots-list-page-empty-state">
                                            <i className="ri-compass-3-line"></i>
                                            <h4>No spots found!</h4>
                                            <p>Try adjusting your filters.</p>
                                            <button className="btn primary__btn mt-2" onClick={resetFilters}>Clear Filters</button>
                                        </div>
                                    </Col>
                                ) : (
                                    /* Render Actual Spots */
                                    filteredSpots.slice(page * 9, (page + 1) * 9).map(spot => (
                                        <Col md="6" lg="4" className="mb-4" key={spot._id}>
                                            <SpotCard spot={spot} />
                                        </Col>
                                    ))
                                )}
                            </Row>

                            {/* Pagination Controls */}
                            {!loading && !error && pageCount > 1 && (
                                <Col lg="12">
                                    <div className="pagination d-flex align-items-center justify-content-center mt-5 gap-2">
                                        {[...Array(pageCount).keys()].map(number => (
                                            <span key={number} onClick={() => setPage(number)} className={`spots-list-page-pagination-number ${page === number ? "active" : ""}`}>
                                                {number + 1}
                                            </span>
                                        ))}
                                    </div>
                                </Col>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}

export default SpotsList;