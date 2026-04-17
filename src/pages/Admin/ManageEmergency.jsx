import React, { useState, useEffect, useContext, useRef } from "react";
import { Container, Form } from "reactstrap";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast
import "./manage-emergency.css";

// --- REUSABLE GLASS DROPDOWN ---
const GlassDropdown = ({ selected, onSelect, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className={`man_em_dropdown ${isOpen ? "man_em_drop_open" : ""}`} ref={dropRef}>
            <div className="man_em_drop_trigger" onClick={() => setIsOpen(!isOpen)}>
                <span className="text-capitalize">{selected}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? 'man_em_rotate' : ''}`}></i>
            </div>
            {isOpen && (
                <div className="man_em_drop_menu">
                    {options.map(opt => (
                        <div
                            key={opt}
                            className={`man_em_drop_item ${selected === opt ? "man_em_active" : ""}`}
                            onClick={() => { onSelect(opt); setIsOpen(false); }}
                        >
                            <span className="text-capitalize">{opt}</span>
                            {selected === opt && <i className="ri-check-line"></i>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ManageEmergency = () => {
    const { user } = useContext(AuthContext);
    const [activeDistrict, setActiveDistrict] = useState("Malakand");
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // Data Options
    const districts = [
        "Malakand", "Swat", "Lower Dir", "Upper Dir",
        "Buner", "Shangla", "Lower Chitral", "Upper Chitral", "Bajaur"
    ];

    const typeOptions = [
        "emergency", "police", "medical", "transport",
        "administration", "forest", "highway", "disaster"
    ];

    // Load contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch(`${BASE_URL}/emergency/${encodeURIComponent(activeDistrict)}`);
                const result = await res.json();

                if (res.ok && result.data && result.data.contacts?.length > 0) {
                    setContacts(result.data.contacts);
                } else {
                    setContacts([{ title: "", number: "", type: "emergency", location: "" }]);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setContacts([{ title: "", number: "", type: "emergency", location: "" }]);
            }
        };
        fetchContacts();
    }, [activeDistrict]);

    // Handlers
    const handleInputChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const addRow = () => {
        setContacts([...contacts, { title: "", number: "", type: "emergency", location: "" }]);
    };

    const removeRow = (index) => {
        const newContacts = [...contacts];
        if (newContacts.length > 0) {
            newContacts.splice(index, 1);
            setContacts(newContacts);
        } else {
            showToast("List is already empty", "error"); // Changed to error style or warning
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanContacts = contacts.filter(c =>
            c.title.trim() !== "" || c.number.trim() !== "" || c.location.trim() !== ""
        );

        const isValid = cleanContacts.every(c => c.title.trim() !== "" && c.number.trim() !== "");
        if (!isValid && cleanContacts.length > 0) {
            showToast("Title and Number are required.", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/emergency`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // FIX: Cookie Auth
                body: JSON.stringify({ district: activeDistrict, contacts: cleanContacts })
            });

            if (!res.ok) throw new Error("Failed to save");

            showToast(`${activeDistrict} Saved Successfully!`, "success");
            setContacts(cleanContacts.length > 0 ? cleanContacts : [{ title: "", number: "", type: "emergency", location: "" }]);
        } catch (err) {
            showToast("Error updating contacts", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="man_em_section">
            {/* --- 3. Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <Container>
                {/* Header */}
                <div className="man_em_header">
                    <div>
                        <h2 className="man_em_page_title">Emergency Contacts</h2>
                        <p className="man_em_page_subtitle">Manage helplines for <strong>{activeDistrict}</strong></p>
                    </div>
                    <div className="man_em_select_wrapper">
                        <GlassDropdown
                            options={districts}
                            selected={activeDistrict}
                            onSelect={setActiveDistrict}
                        />
                    </div>
                </div>

                {/* Form Card */}
                <div className="man_em_glass_card">
                    <Form onSubmit={handleSubmit}>
                        <div className="man_em_list">
                            {contacts.map((item, index) => (
                                <div
                                    key={index}
                                    className="man_em_row"
                                    // Fix Stacking Context: Ensure top rows overlap bottom rows so dropdowns aren't hidden
                                    style={{ zIndex: contacts.length - index }}
                                >
                                    {/* Title */}
                                    <div className="man_em_col_input man_em_col_title">
                                        <label className="man_em_label">Title</label>
                                        <input
                                            type="text"
                                            className="man_em_input"
                                            placeholder="Rescue 1122"
                                            value={item.title}
                                            onChange={e => handleInputChange(index, 'title', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Number */}
                                    <div className="man_em_col_input man_em_col_number">
                                        <label className="man_em_label">Phone</label>
                                        <input
                                            type="text"
                                            className="man_em_input"
                                            placeholder="0300-1234567"
                                            value={item.number}
                                            onChange={e => handleInputChange(index, 'number', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="man_em_col_input man_em_col_loc">
                                        <label className="man_em_label">Location</label>
                                        <input
                                            type="text"
                                            className="man_em_input"
                                            placeholder="e.g. Batkhela"
                                            value={item.location}
                                            onChange={e => handleInputChange(index, 'location', e.target.value)}
                                        />
                                    </div>

                                    {/* Type (Now using GlassDropdown) */}
                                    <div className="man_em_col_input man_em_col_type">
                                        <label className="man_em_label">Type</label>
                                        <GlassDropdown
                                            options={typeOptions}
                                            selected={item.type}
                                            onSelect={(val) => handleInputChange(index, 'type', val)}
                                        />
                                    </div>

                                    {/* Delete */}
                                    <div className="man_em_col_input man_em_col_action">
                                        <button
                                            type="button"
                                            className="man_em_btn_delete"
                                            onClick={() => removeRow(index)}
                                            title="Remove Row"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="man_em_footer">
                            <button type="button" className="man_em_btn_add" onClick={addRow}>
                                <i className="ri-add-line"></i> Add Row
                            </button>
                            <button type="submit" className="man_em_btn_save" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </Form>
                </div>
            </Container>
        </section>
    );
};

export default ManageEmergency;