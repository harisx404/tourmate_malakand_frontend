import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../../shared/CommonSection";
import { BASE_URL } from "../../utils/config";
import "./emergency-contacts.css";

/**
 * Configuration constant defining the available regions for the district selector.
 * Used to populate the dropdown menu options.
 */
const DISTRICT_MENU = [
    { id: "malakand", name: "Malakand" },
    { id: "swat", name: "Swat" },
    { id: "lower-dir", name: "Lower Dir" },
    { id: "upper-dir", name: "Upper Dir" },
    { id: "buner", name: "Buner" },
    { id: "shangla", name: "Shangla" },
    { id: "lower-chitral", name: "Lower Chitral" },
    { id: "upper-chitral", name: "Upper Chitral" },
    { id: "bajaur", name: "Bajaur" }
];

/**
 * Reusable dropdown component implementing glassmorphism styling.
 * Handles internal open/close state and click-outside detection.
 * * @param {Array} options - List of objects containing id and name for menu items.
 * @param {string} selected - The currently active selected value.
 * @param {Function} onSelect - Callback function triggered on option selection.
 */
const GlassDropdown = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Attach event listener to document to handle closing the menu when clicking outside component boundaries.
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
        <div className="emergency-dropdown-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className={`emergency-dropdown-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="dropdown-label-group">
                    <span className="dropdown-label-tiny">Select Region</span>
                    <span className="dropdown-label-main">{selected}</span>
                </div>
                <div className={`dropdown-arrow-box ${isOpen ? 'rotate' : ''}`}>
                    <i className="ri-arrow-down-s-line"></i>
                </div>
            </button>

            <div className={`emergency-dropdown-menu ${isOpen ? 'show' : ''}`}>
                <div className="dropdown-scroll-container">
                    {options.map((item) => (
                        <div
                            key={item.id}
                            className={`emergency-dropdown-item ${selected === item.name ? 'selected' : ''}`}
                            onClick={() => {
                                onSelect(item.name);
                                setIsOpen(false);
                            }}
                        >
                            <span>{item.name}</span>
                            {selected === item.name && <i className="ri-check-line"></i>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Main View Controller for the Emergency Contacts feature.
 * Manages data fetching, loading states, and responsive layout rendering for contact cards.
 */
const EmergencyContacts = () => {
    const [selectedDistrict, setSelectedDistrict] = useState("Malakand");
    const [districtData, setDistrictData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Synchronize contact data whenever the user selects a new district.
    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/emergency/${encodeURIComponent(selectedDistrict)}`);
                const result = await res.json();

                // Validate response structure before updating state.
                if (res.ok && result.data) {
                    setDistrictData(result.data);
                } else {
                    setDistrictData({ district: selectedDistrict, contacts: [] });
                }
            } catch (err) {
                // Suppress network errors to allow the UI to render a "No Data" state gracefully.
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, [selectedDistrict]);

    /**
     * Maps the backend contact type to a specific Remix Icon class name.
     * Provides a fallback icon if the type is unrecognized.
     */
    const getIcon = (type) => {
        switch (type) {
            case 'emergency': return "ri-alarm-warning-fill";
            case 'police': return "ri-shield-star-fill";
            case 'medical': return "ri-hospital-fill";
            case 'administration': return "ri-government-fill";
            case 'transport': return "ri-plane-fill";
            case 'forest': return "ri-tree-fill";
            case 'highway': return "ri-roadster-fill";
            default: return "ri-phone-fill";
        }
    };

    /**
     * Copies the contact number to the clipboard and triggers a temporary success state.
     * The success state (tick icon) reverts after 2 seconds.
     */
    const handleCopy = (number, index) => {
        navigator.clipboard.writeText(number);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <>
            <CommonSection title="Emergency Contacts" />

            <section className="emergency-section">
                <Container>
                    <div className="emergency-header-wrapper mb-5">
                        <Row className="align-items-center">
                            {/* Standard text layout: Stacks on mobile, 7-col width on desktop */}
                            <Col lg="7" md="7" sm="12" className="mb-4 mb-md-0">
                                <div className="emergency-header-content">
                                    <h2 className="emergency-main-title">
                                        Contacts for <span className="highlight-district">{districtData?.district || selectedDistrict}</span>
                                    </h2>
                                    <div className="emergency-info-badge">
                                        <i className="ri-information-fill"></i>
                                        <p>These numbers are active 24/7. In case of emergency, tap "Call Now" or copy the number.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col lg="5" md="5" sm="12" className="d-flex justify-content-lg-end justify-content-md-end justify-content-start">
                                <GlassDropdown
                                    options={DISTRICT_MENU}
                                    selected={selectedDistrict}
                                    onSelect={setSelectedDistrict}
                                />
                            </Col>
                        </Row>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-secondary" role="status"></div>
                        </div>
                    ) : (
                        <Row>
                            {districtData?.contacts?.length > 0 ? (
                                districtData.contacts.map((contact, index) => (
                                    /* * Responsive Grid Configuration:
                                     * lg="4": 3 columns on desktop.
                                     * md="6": 2 columns on tablets.
                                     * xs="6": Explicitly force 2 columns on mobile (default is usually 1).
                                     */
                                    <Col lg="4" md="6" xs="6" className="mb-4" key={index}>
                                        <div className={`emergency-card emergency-glass-effect ${contact.type}`}>
                                            <div className="emergency-card-icon">
                                                <i className={getIcon(contact.type)}></i>
                                            </div>

                                            <div className="emergency-card-info">
                                                <span className={`emergency-type-tag ${contact.type}`}>{contact.type}</span>
                                                <h5 className="emergency-card-title">{contact.title}</h5>
                                                <p className="emergency-card-loc">
                                                    <i className="ri-map-pin-2-line"></i> {contact.location}
                                                </p>
                                            </div>

                                            <div className="emergency-card-number">
                                                <h3>{contact.number}</h3>
                                            </div>

                                            <div className="emergency-card-actions">
                                                <button
                                                    type="button"
                                                    className={`emergency-btn copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                                                    onClick={() => handleCopy(contact.number, index)}
                                                >
                                                    <i className={copiedIndex === index ? "ri-check-line" : "ri-file-copy-line"}></i>
                                                    {copiedIndex === index ? "Copied" : "Copy"}
                                                </button>

                                                <a href={`tel:${contact.number}`} className="emergency-btn call-btn">
                                                    <i className="ri-phone-fill"></i> Call Now
                                                </a>
                                            </div>
                                        </div>
                                    </Col>
                                ))
                            ) : (
                                <Col lg="12" className="text-center py-5">
                                    <div className="emergency-empty-state">
                                        <i className="ri-folder-info-line"></i>
                                        <h5>No contacts found for {selectedDistrict}.</h5>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )}
                </Container>
            </section>
        </>
    );
};

export default EmergencyContacts;