import React, { useState, useEffect, useRef } from "react";
import "./filter-sidebar.css";


/*
  Districts List:
  Represents the administrative divisions of the region.
  Used for filtering spots by location.
*/
const DISTRICTS = [
    "Malakand", "Lower Swat", "Upper Swat", "Lower Dir",
    "Upper Dir", "Buner", "Shangla", "Lower Chitral", "Upper Chitral", "Bajaur"
];

/*
  Seasons List:
  Represents the different seasons of the year.
  Used for filtering spots by season.
*/
const SEASONS = ["All Seasons", "Winter", "Summer", "Spring", "Autumn"];

/*
  Tags List:
  Represents the different tags associated with spots.
  Used for filtering spots by experience.
*/
const TAGS = [
    "Mountain", "River", "Snowfall", "Waterfall", "Historical",
    "Religious", "Lake", "Hiking", "Camping", "Trekking",
    "Park", "Government Guest House", "Rest House", "Valley",
    "Meadow", "Desert", "Forest", "Museum", "Fort"
];

/**
 * FilterSidebar Component
 * Provides a responsive sidebar for filtering search results.
 * Supports filtering by District (Location), Season, Experience Tags, and Minimum Rating.
 * Includes mobile-responsive drawer functionality and click-outside handling for dropdowns.
 */
const FilterSidebar = ({
    isOpen,
    setIsOpen,
    selectedDistrict,
    setSelectedDistrict,
    selectedSeason,
    setSelectedSeason,
    selectedTags,
    setSelectedTags,
    minRating,
    setMinRating,
    resetFilters
}) => {

    // Controls visibility of the Location/District dropdown menu
    const [isDistrictOpen, setIsDistrictOpen] = useState(false);

    // Reference to the district dropdown DOM node for click event detection
    const districtDropdownRef = useRef(null);

    /**
     * Effect: Click Outside Listener
     * Closes the District dropdown if a user clicks outside the component boundaries.
     * Ensures native-like behavior for custom UI dropdowns.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
                setIsDistrictOpen(false);
            }
        };

        // Attach listener for user interactions
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup listener on unmount to prevent memory leaks
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [districtDropdownRef]);

    /**
     * Toggles the selection state of a specific experience tag.
     * Adds the tag if unselected; removes it if already present.
     */
    const toggleTag = (tag) => {
        const currentTags = Array.isArray(selectedTags) ? selectedTags : [];

        if (currentTags.includes(tag)) {
            setSelectedTags(currentTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...currentTags, tag]);
        }
    };

    /**
     * Toggles the selection state of a specific season filter.
     * Mirrors the logic of tag selection.
     */
    const toggleSeason = (season) => {
        const currentSeasons = Array.isArray(selectedSeason) ? selectedSeason : [];

        if (currentSeasons.includes(season)) {
            setSelectedSeason(currentSeasons.filter(s => s !== season));
        } else {
            setSelectedSeason([...currentSeasons, season]);
        }
    };

    // Helper: Returns true if the season is currently active (for UI styling)
    const isSeasonActive = (season) => {
        return Array.isArray(selectedSeason) && selectedSeason.includes(season);
    };

    // Helper: Returns true if the tag is currently active (for UI styling)
    const isTagActive = (tag) => {
        return Array.isArray(selectedTags) && selectedTags.includes(tag);
    };

    return (
        <>
            <div className={`filter-sidebar glassy-card ${isOpen ? 'active' : ''}`}>
                <div className="filter-sidebar-header">
                    <h5>Filters</h5>
                    <span className="filter-sidebar-reset-btn" onClick={resetFilters}>Reset All</span>
                    <i className="ri-close-line d-lg-none filter-sidebar-close-icon" onClick={() => setIsOpen(false)}></i>
                </div>

                {/* Location Filter Group */}
                <div className="filter-sidebar-group">
                    <h6>Location</h6>

                    {/* Dropdown Container with Click-Outside Ref */}
                    <div className="filter-sidebar-dropdown" ref={districtDropdownRef}>
                        <div className={`filter-sidebar-dropdown-btn ${isDistrictOpen ? 'open' : ''}`} onClick={() => setIsDistrictOpen(!isDistrictOpen)}>
                            <span>{selectedDistrict}</span>
                            <i className={`ri-arrow-down-s-line ${isDistrictOpen ? 'rotate' : ''}`}></i>
                        </div>
                        <div className={`filter-sidebar-dropdown-content ${isDistrictOpen ? 'show' : ''}`}>
                            <div className={`filter-sidebar-dropdown-item ${selectedDistrict === "All Districts" ? 'active' : ''}`} onClick={() => { setSelectedDistrict("All Districts"); setIsDistrictOpen(false); }}>All Districts</div>
                            {DISTRICTS.map((dist, index) => (
                                <div key={index} className={`filter-sidebar-dropdown-item ${selectedDistrict === dist ? 'active' : ''}`} onClick={() => { setSelectedDistrict(dist); setIsDistrictOpen(false); }}>{dist}</div>
                            ))}
                        </div>
                    </div>
                </div>
                <hr className="filter-sidebar-divider" />

                {/* Season Filter Group */}
                <div className="filter-sidebar-group">
                    <h6>Best Season</h6>
                    <div className="filter-sidebar-pills-wrapper">
                        {SEASONS.map((season, index) => (
                            <span
                                key={index}
                                className={`filter-sidebar-pill ${isSeasonActive(season) ? 'active' : ''}`}
                                onClick={() => toggleSeason(season)}
                            >
                                {season}
                            </span>
                        ))}
                    </div>
                </div>
                <hr className="filter-sidebar-divider" />

                {/* Rating Filter Group */}
                <div className="filter-sidebar-group">
                    <h6>Guest Rating</h6>
                    <div className="filter-sidebar-rating-options">
                        <div className={`filter-sidebar-rating-row ${minRating === 0 ? 'active' : ''}`} onClick={() => setMinRating(0)}><span>Any Rating</span><div className="filter-sidebar-radio-circle"></div></div>
                        <div className={`filter-sidebar-rating-row ${minRating === 4.5 ? 'active' : ''}`} onClick={() => setMinRating(4.5)}><div className="filter-sidebar-stars"><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-half-fill filled"></i></div><span>4.5+</span></div>
                        <div className={`filter-sidebar-rating-row ${minRating === 4.0 ? 'active' : ''}`} onClick={() => setMinRating(4.0)}><div className="filter-sidebar-stars"><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-line"></i></div><span>4.0+</span></div>
                        <div className={`filter-sidebar-rating-row ${minRating === 3.0 ? 'active' : ''}`} onClick={() => setMinRating(3.0)}><div className="filter-sidebar-stars"><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-fill filled"></i><i className="ri-star-line"></i><i className="ri-star-line"></i></div><span>3.0+</span></div>
                    </div>
                </div>
                <hr className="filter-sidebar-divider" />

                {/* Tags Filter Group */}
                <div className="filter-sidebar-group">
                    <h6>Experience Tags</h6>
                    <div className="filter-sidebar-tags-wrapper">
                        {TAGS.map((tag, index) => (
                            <span
                                key={index}
                                className={`filter-sidebar-tag-box ${isTagActive(tag) ? 'active' : ''}`}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay Backdrop */}
            {isOpen && <div className="filter-sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
};

export default FilterSidebar;