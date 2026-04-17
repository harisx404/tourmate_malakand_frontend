import React, { useState, useEffect, useContext, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import SpotCard from "../../shared/SpotCard";
import CustomToast from "../../shared/CustomToast"; // Import CustomToast
import { confirmAction } from "../../utils/alerts";
import "./manage-spots.css";

/**
 * Reusable dropdown component featuring glassmorphism styling.
 */
const GlassDropdown = ({ options, selected, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`ad_man_sp_dropdown ${isOpen ? "ad_man_sp_open" : ""}`} ref={dropdownRef}>
            <div className="ad_man_sp_drop_trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{selected ? selected : placeholder}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? "ri-arrow-up-s-line" : ""}`}></i>
            </div>
            <div className="ad_man_sp_drop_menu">
                <div
                    className={`ad_man_sp_drop_item ${selected === "" ? "ad_man_sp_active" : ""}`}
                    onClick={() => { onSelect(""); setIsOpen(false); }}
                >
                    <span style={{ opacity: 0.7 }}>Any {placeholder}</span>
                    {selected === "" && <i className="ri-check-line"></i>}
                </div>

                {options.map((opt, index) => (
                    <div
                        key={index}
                        className={`ad_man_sp_drop_item ${selected === opt ? "ad_man_sp_active" : ""}`}
                        onClick={() => { onSelect(opt); setIsOpen(false); }}
                    >
                        <span>{opt}</span>
                        {selected === opt && <i className="ri-check-line"></i>}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Admin Dashboard View: Manage Spots.
 */
const ManageSpots = () => {
    const { user } = useContext(AuthContext);
    const [spots, setSpots] = useState([]); // Master data source
    const [filteredSpots, setFilteredSpots] = useState([]); // Display data
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedSeason, setSelectedSeason] = useState("");

    // --- 2. Standardized Toast State ---
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
        type: "success"
    });

    const closeToast = () => {
        setToastState(prev => ({ ...prev, show: false }));
    };

    const showToast = (message, type = "success") => {
        setToastState({ show: true, message, type });
    };

    const districtOptions = ["Malakand", "Lower Swat", "Upper Swat", "Lower Dir", "Upper Dir", "Buner", "Shangla", "Lower Chitral", "Upper Chitral", "Bajaur"];
    const seasonOptions = ["All Season", "Summer", "Winter", "Spring", "Autumn"];

    // Hydrate state
    useEffect(() => {
        const fetchSpots = async () => {
            try {
                const res = await fetch(`${BASE_URL}/spots?limit=1000`);
                const result = await res.json();
                if (res.ok) {
                    const sorted = result.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setSpots(sorted);
                    setFilteredSpots(sorted);
                }
            } catch (err) {
                showToast("Failed to fetch spots", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSpots();
    }, []);

    // Centralized filtering pipeline
    useEffect(() => {
        let temp = spots;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            temp = temp.filter(s => s.title.toLowerCase().includes(lowerSearch) || s.city.toLowerCase().includes(lowerSearch));
        }

        if (selectedDistrict) {
            temp = temp.filter(s => s.district === selectedDistrict);
        }

        if (selectedSeason) {
            temp = temp.filter(s => {
                const spotSeasons = s.bestSeason ? s.bestSeason.map(season => season.toLowerCase()) : [];
                // Flexible match: Checks if any of the spot's seasons contain the selected string
                return spotSeasons.some(fs => fs.includes(selectedSeason.toLowerCase()));
            });
        }

        setFilteredSpots(temp);
    }, [searchTerm, selectedDistrict, selectedSeason, spots]);

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedDistrict("");
        setSelectedSeason("");
    };

    /**
     * Deletes a spot using the Optimistic UI pattern.
     */
    const handleDelete = async (id) => {
        const isConfirmed = await confirmAction({
            title: "Delete Spot?",
            text: "This will permanently delete this spot and its data.",
            confirmButtonText: "Yes, Delete Spot",
            icon: "warning"
        });

        if (!isConfirmed) return;

        const previousSpots = [...spots];

        // Optimistic Update
        setSpots(prev => prev.filter(s => s._id !== id));
        showToast("Spot Deleted!", "success");

        try {
            const res = await fetch(`${BASE_URL}/spots/${id}`, {
                method: "DELETE",
                credentials: "include" // Cookie Auth
            });

            if (!res.ok) throw new Error("Failed");

        } catch (err) {
            // Rollback on failure
            setSpots(previousSpots);
            showToast("Error deleting, item restored", "error");
        }
    };

    return (
        <section className="ad_man_sp_section">
            {/* --- 3. Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <Container>
                <div className="ad_man_sp_header">
                    <div>
                        <h2 className="ad_man_sp_title">Manage Spots</h2>
                        <p className="ad_man_sp_subtitle">Total Items: <strong className="ad_man_sp_strong_num">{filteredSpots.length}</strong></p>
                    </div>
                    <Link to="/admin/add-spot" className="text-decoration-none">
                        <button className="ad_man_sp_add_btn">
                            <i className="ri-add-line"></i> Add New Spot
                        </button>
                    </Link>
                </div>

                <div className="ad_man_sp_filter_bar">
                    <div className="ad_man_sp_search_wrap">
                        <i className="ri-search-line ad_man_sp_search_icon"></i>
                        <input
                            type="text"
                            placeholder="Search by name, city..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <GlassDropdown
                        placeholder="District"
                        options={districtOptions}
                        selected={selectedDistrict}
                        onSelect={setSelectedDistrict}
                    />

                    <GlassDropdown
                        placeholder="Season"
                        options={seasonOptions}
                        selected={selectedSeason}
                        onSelect={setSelectedSeason}
                    />

                    {(searchTerm || selectedDistrict || selectedSeason) && (
                        <button className="ad_man_sp_reset_btn" onClick={resetFilters} title="Reset Filters">
                            <i className="ri-refresh-line"></i>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="ad_man_sp_loading"><div className="ad_man_sp_spinner"></div><p>Loading...</p></div>
                ) : (
                    <Row>
                        {filteredSpots.length === 0 ? (
                            <Col lg="12">
                                <div className="ad_man_sp_empty">
                                    <i className="ri-compass-3-line"></i>
                                    <h4>No Spots Found</h4>
                                    <p>Try adjusting your search filters.</p>
                                    <button className="ad_man_sp_reset_text" onClick={resetFilters}>Clear Filters</button>
                                </div>
                            </Col>
                        ) : (
                            filteredSpots.map(spot => (
                                <Col lg="3" md="4" sm="6" className="mb-4" key={spot._id}>
                                    <div className="ad_man_sp_card_wrapper">
                                        <SpotCard spot={spot} />
                                        <div className="ad_man_sp_action_overlay">
                                            <Link to={`/admin/edit-spot/${spot._id}`} title="Edit">
                                                <button className="ad_man_sp_circle_btn ad_man_sp_btn_edit">
                                                    <i className="ri-pencil-fill"></i>
                                                </button>
                                            </Link>
                                            <button
                                                className="ad_man_sp_circle_btn ad_man_sp_btn_delete"
                                                title="Delete"
                                                onClick={() => handleDelete(spot._id)}
                                            >
                                                <i className="ri-delete-bin-fill"></i>
                                            </button>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        )}
                    </Row>
                )}
            </Container>
        </section>
    );
};

export default ManageSpots;