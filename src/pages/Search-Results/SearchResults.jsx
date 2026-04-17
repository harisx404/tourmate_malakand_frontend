import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import { useLocation } from "react-router-dom";
import CommonSection from "../../shared/CommonSection";
import SpotCard from "../../shared/SpotCard";
import SearchBar from "../../shared/SearchBar";
import SpotCardSkeleton from "../../components/Skeleton/SpotCardSkeleton";
import "./search-results.css";

// Import BASE_URL config
import { BASE_URL } from "../../utils/config";

/**
 * Search Results Page.
 * Displays filtered spots matching the user's query with client-side sorting capabilities.
 * Inherits the visual identity and interaction patterns of the main "SpotsList" catalog.
 */
const SearchResults = () => {
    const location = useLocation();

    // Data State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sorting State
    const [sortBy, setSortBy] = useState("recommended");
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Refs
    const dropdownRef = useRef(null);

    // Extract search term from navigation state.
    const query = location.state?.query || "";

    const sortOptions = [
        { label: "Recommended", value: "recommended" },
        { label: "Top Rated", value: "top-rated" },
        { label: "Lowest Rated", value: "low-rated" }
    ];

    /**
     * Effect: Data Fetching.
     * Retrieves search results from the backend API whenever the search query changes.
     * Handles loading states, error propagation, and request cancellation.
     */
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchSearchResults = async () => {
            setLoading(true);
            setError(null);

            if (query === "") {
                setData([]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/spots/search/getSpotBySearch?city=${encodeURIComponent(query)}`, { signal });

                if (!res.ok) throw new Error("Something went wrong");

                const result = await res.json();
                setData(result.data || []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
        window.scrollTo(0, 0);

        return () => controller.abort();
    }, [query]);

    /**
     * Effect: Click Outside Listener.
     * Closes the custom sorting dropdown when a click event occurs outside the dropdown container.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    /**
     * Memoized Sort Logic.
     * Sorts the fetched result set based on the selected 'sortBy' criteria.
     * Creates a shallow copy to prevent direct mutation of the source data state.
     */
    const sortedData = useMemo(() => {
        if (!data) return [];

        let sorted = [...data];

        if (sortBy === "top-rated") {
            sorted.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
        } else if (sortBy === "low-rated") {
            sorted.sort((a, b) => (a.ratingsAverage || 0) - (b.ratingsAverage || 0));
        }
        // 'recommended' preserves the default API sort order.

        return sorted;
    }, [data, sortBy]);

    return (
        <>
            <CommonSection title={"Search Results"} />

            <section className="search-results-page-section">
                <Container>
                    {/* Search Input Area */}
                    <Row className="mb-5 justify-content-center">
                        <Col lg="10">
                            <SearchBar />
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="12">
                            {/* Header Section: Displays count and sorting controls */}
                            <div className="search-results-page-header mb-4">
                                <h5>
                                    {loading ? "Searching..." : (
                                        <>Found <strong>{sortedData.length}</strong> results for "<strong>{query}</strong>"</>
                                    )}
                                </h5>

                                {/* Sorting Dropdown Component */}
                                {!loading && !error && sortedData.length > 0 && (
                                    <div className="search-results-page-sort-box">
                                        <span>Sort By:</span>
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
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Results Grid: Utilizes 'spots-grid-row' for responsive column behavior */}
                    <Row className="spots-grid-row">
                        {loading ? (
                            // Loading Skeletons
                            [1, 2, 3, 4].map(n => (
                                <Col md="6" lg="3" className="mb-4" key={n}>
                                    <SpotCardSkeleton />
                                </Col>
                            ))
                        ) : error ? (
                            // Error Feedback
                            <Col lg="12" className="text-center py-5">
                                <h4>Something went wrong</h4>
                                <p>{error}</p>
                            </Col>
                        ) : sortedData.length === 0 ? (
                            // Empty State
                            <Col lg="12" className="text-center py-5">
                                <div className="search-results-page-empty">
                                    <i className="ri-file-search-line"></i>
                                    <h4>No matches found</h4>
                                    <p>We couldn't find anything matching "{query}". Try searching for a district (e.g., "Swat").</p>
                                </div>
                            </Col>
                        ) : (
                            // Render Result Cards
                            sortedData.map((spot) => (
                                <Col md="6" lg="3" className="mb-4" key={spot._id}>
                                    <SpotCard spot={spot} />
                                </Col>
                            ))
                        )}
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default SearchResults;