import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Container } from "reactstrap";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast
import { confirmAction } from "../../utils/alerts";
import "./manage-users.css";

// --- CUSTOM SORT DROPDOWN ---
/** Dropdown for sorting users. */
const UserSortDropdown = ({ currentSort, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);

    const options = [
        { label: "Username (A-Z)", key: 'username', direction: 'ascending' },
        { label: "Username (Z-A)", key: 'username', direction: 'descending' },
        { label: "Email (A-Z)", key: 'email', direction: 'ascending' },
        { label: "Role (Admin First)", key: 'role', direction: 'ascending' }
    ];

    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const currentLabel = options.find(o => o.key === currentSort.key && o.direction === currentSort.direction)?.label || "Sort Users";

    return (
        <div className={`ad_us_dropdown ${isOpen ? "ad_us_drop_open" : ""}`} ref={dropRef}>
            <div className="ad_us_drop_trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{currentLabel}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? 'ad_us_rotate' : ''}`}></i>
            </div>
            {isOpen && (
                <div className="ad_us_drop_menu">
                    {options.map((opt, index) => (
                        <div
                            key={index}
                            className={`ad_us_drop_item ${currentSort.key === opt.key && currentSort.direction === opt.direction ? "ad_us_active" : ""}`}
                            onClick={() => {
                                onSortChange({ key: opt.key, direction: opt.direction });
                                setIsOpen(false);
                            }}
                        >
                            {opt.label}
                            {currentSort.key === opt.key && currentSort.direction === opt.direction && <i className="ri-check-line"></i>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ManageUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // --- Search & Sort State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'ascending' });

    // Fetch all users.
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${BASE_URL}/users`, {
                    credentials: "include" // Cookie Auth
                });
                const result = await res.json();
                if (res.ok) setUsers(result.data);
            } catch (err) {
                showToast("Failed to load users", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [user.token]);

    // Handle user deletion.
    const handleDelete = async (userId) => {
        const isConfirmed = await confirmAction({
            title: "Delete User?",
            text: "This user will lose all access immediately.",
            confirmButtonText: "Yes, Ban User",
            icon: "warning"
        });

        if (!isConfirmed) return;

        const originalUsers = [...users];
        setUsers(prev => prev.filter(u => u._id !== userId));

        try {
            const res = await fetch(`${BASE_URL}/users/${userId}`, {
                method: "DELETE",
                credentials: "include" // Cookie Auth
            });
            const result = await res.json();

            if (!res.ok) throw new Error(result.message);
            showToast("User deleted successfully", "success");

        } catch (err) {
            setUsers(originalUsers);
            showToast(err.message || "Failed to delete", "error");
        }
    };

    // --- Process Data (Search + Sort) ---
    const processedUsers = useMemo(() => {
        let data = [...users];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(u =>
                u.username.toLowerCase().includes(lowerTerm) ||
                u.email.toLowerCase().includes(lowerTerm)
            );
        }

        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [users, searchTerm, sortConfig]);

    return (
        <section className="ad_us_section">
            {/* --- 3. Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <Container>
                {/* --- Header --- */}
                <div className="ad_us_header">
                    <div className="ad_us_title_wrap">
                        <h2 className="ad_us_title">Manage Users</h2>
                        <p className="ad_us_subtitle">Total Users: <strong>{users.length}</strong></p>
                    </div>
                </div>

                {/* --- Control Bar (Search + Dropdown) --- */}
                <div className="ad_us_control_bar">
                    <div className="ad_us_search_box">
                        <i className="ri-search-line"></i>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* New Custom Dropdown */}
                    <UserSortDropdown currentSort={sortConfig} onSortChange={setSortConfig} />
                </div>

                {/* --- Glassy Table --- */}
                <div className="ad_us_glass_card">
                    {loading ? (
                        <div className="ad_us_loading">
                            <div className="ad_us_spinner"></div>
                            <p>Loading Community...</p>
                        </div>
                    ) : (
                        <div className="ad_us_table_responsive">
                            <table className="ad_us_table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedUsers.length > 0 ? (
                                        processedUsers.map(u => (
                                            <tr key={u._id} className="ad_us_row">
                                                <td>
                                                    <div className="ad_us_user_cell">
                                                        <div className="ad_us_avatar">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="ad_us_username">{u.username}</span>
                                                    </div>
                                                </td>
                                                <td className="ad_us_email">{u.email}</td>
                                                <td>
                                                    <span className={`ad_us_role ${u.role === 'admin' ? 'role_admin' : 'role_user'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u._id !== user._id ? (
                                                        <button
                                                            className="ad_us_btn_delete"
                                                            onClick={() => handleDelete(u._id)}
                                                            title="Delete User"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    ) : (
                                                        <span className="ad_us_me_tag">(You)</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default ManageUsers;