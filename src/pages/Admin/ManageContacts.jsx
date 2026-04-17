import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Container, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast
import { confirmAction } from "../../utils/alerts";
import "./manage-contacts.css";

/**
 * Custom dropdown component for sorting functionality.
 */
const MCDropdown = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);
    const options = [
        { label: "Newest First", value: "newest" },
        { label: "Oldest First", value: "oldest" },
        { label: "Sender (A-Z)", value: "az" }
    ];

    // Attach global listener to dismiss dropdown when user clicks elsewhere
    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className={`mc-dropdown ${isOpen ? "mc-drop-open" : ""}`} ref={dropRef}>
            <div className="mc-drop-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{options.find(o => o.value === selected)?.label}</span>
                <i className="ri-arrow-down-s-line"></i>
            </div>
            {isOpen && (
                <div className="mc-drop-menu">
                    {options.map(opt => (
                        <div key={opt.value} className={`mc-drop-item ${selected === opt.value ? "mc-active" : ""}`}
                            onClick={() => { onSelect(opt.value); setIsOpen(false); }}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Primary container for the Inquiry Management Dashboard.
 */
const ManageContacts = () => {
    const { user } = useContext(AuthContext);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [modal, setModal] = useState(false);

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

    const toggleModal = () => setModal(!modal);

    // Sync inquiries from backend on component mount or token change
    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const res = await fetch(`${BASE_URL}/contact`, {
                    credentials: "include"
                });
                const result = await res.json();
                if (res.ok) setInquiries(result.data);
            } catch (err) {
                showToast("Failed to sync inquiries", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, [user.token]);

    // Optimize performance by memoizing filter/sort operations
    const processedData = useMemo(() => {
        let data = inquiries.filter(i =>
            i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (sortOrder === "newest") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortOrder === "oldest") data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        if (sortOrder === "az") data.sort((a, b) => a.name.localeCompare(b.name));
        return data;
    }, [inquiries, searchTerm, sortOrder]);

    /**
     * Deletes an inquiry after user confirmation.
     */
    const handleDelete = async (id) => {
        const isConfirmed = await confirmAction({
            title: "Delete Inquiry?",
            text: "This will permanently remove this message.",
            confirmButtonText: "Yes, Delete It",
            icon: "warning"
        });

        if (!isConfirmed) return;
        try {
            const res = await fetch(`${BASE_URL}/contact/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                setInquiries(prev => prev.filter(item => item._id !== id));
                showToast("Inquiry Deleted", "success");
                if (modal) toggleModal();
            }
        } catch (err) {
            showToast("Action failed", "error");
        }
    };

    /**
     * Generates a mailto link with pre-filled subject and body
     */
    const handleQuickReply = () => {
        const subject = encodeURIComponent(`Re: ${selectedInquiry.subject}`);
        const body = encodeURIComponent(`\n\n--- Original Message ---\n${selectedInquiry.message}`);
        window.location.href = `mailto:${selectedInquiry.email}?subject=${subject}&body=${body}`;
    };

    const copyEmail = (email) => {
        navigator.clipboard.writeText(email);
        showToast("Email copied!", "success");
    };

    return (
        <section className="mc-page-wrapper">
            {/* --- 3. Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <Container>
                <div className="mc-header">
                    <div>
                        <h2 className="mc-title">Manage Inquiries</h2>
                        <p className="mc-subtitle">Review and manage incoming user inquiries</p>
                    </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="mc-filter-row">
                    <div className="mc-search-box">
                        <i className="ri-search-line"></i>
                        <input type="text" placeholder="Search inquiries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <MCDropdown selected={sortOrder} onSelect={setSortOrder} />
                </div>

                {/* Data Display Area */}
                <div className="mc-glass-card">
                    {loading ? (
                        <div className="mc-loading"><div className="mc-spinner"></div><p>Fetching data...</p></div>
                    ) : processedData.length === 0 ? (
                        <div className="mc-empty-state"><i className="ri-mail-star-line"></i><p>Inbox is clean</p></div>
                    ) : (
                        <div className="mc-table-container">
                            <table className="mc-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Sender</th>
                                        <th>Subject</th>
                                        <th className="text-center">Manage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.map((item) => (
                                        <tr key={item._id} className="mc-row">
                                            <td className="mc-date">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="mc-user-info">
                                                    <div className="mc-avatar">{item.name.charAt(0)}</div>
                                                    <div>
                                                        <span className="mc-name">{item.name}</span>
                                                        <span className="mc-email">{item.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="mc-badge">{item.subject}</span></td>
                                            <td className="mc-actions">
                                                <button className="mc-circle-btn mc-btn-view" onClick={() => { setSelectedInquiry(item); toggleModal(); }}>
                                                    <i className="ri-eye-fill"></i>
                                                </button>
                                                <button className="mc-circle-btn mc-btn-delete" onClick={() => handleDelete(item._id)}>
                                                    <i className="ri-delete-bin-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Container>

            {/* Detailed View Modal */}
            <Modal isOpen={modal} toggle={toggleModal} centered className="mc-modal">
                <ModalHeader toggle={toggleModal} className="mc-modal-header">Message Details</ModalHeader>
                <ModalBody className="mc-modal-body">
                    {selectedInquiry && (
                        <div className="mc-detail-container">

                            <div className="mc-detail-group">
                                <label>Sender</label>
                                <div className="mc-modal-user-box">
                                    <h5>{selectedInquiry.name}</h5>
                                    <div className="mc-copy-email" onClick={() => copyEmail(selectedInquiry.email)}>
                                        <span>{selectedInquiry.email}</span>
                                        <i className="ri-file-copy-line"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="mc-detail-group">
                                <label>Subject</label>
                                <div className="mc-modal-sub-pill">
                                    {selectedInquiry.subject}
                                </div>
                            </div>

                            <div className="mc-detail-group">
                                <label>Message</label>
                                <div className="mc-msg-box">{selectedInquiry.message}</div>
                            </div>

                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="mc-modal-footer">
                    <button className="mc-btn-primary" onClick={handleQuickReply}><i className="ri-reply-line"></i> Reply</button>
                    <button className="mc-btn-outline" onClick={toggleModal}>Dismiss</button>
                </ModalFooter>
            </Modal>
        </section>
    );
};

export default ManageContacts;