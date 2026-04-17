import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../utils/config";
import { AuthContext } from "../../context/AuthContext";
import CustomToast from "../../shared/CustomToast"; // <--- 1. Import CustomToast
import "./admin-dashboard.css";

import Loader from "../../components/Common/Loader";

/**
 * AdminDashboard
 * The central hub for administrators.
 */
const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ spots: 0, users: 0 });
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

    useEffect(() => {
        /**
         * Retreives the total count of tourism spots.
         */
        const fetchSpotCount = async () => {
            try {
                const res = await fetch(`${BASE_URL}/spots/search/getSpotCount`);
                const result = await res.json();

                if (res.ok) {
                    setStats(prev => ({ ...prev, spots: result.data || 0 }));
                }
            } catch (err) {
                showToast("Failed to load spot stats.", "error");
            }
        };

        /**
         * Retrieves the total count of registered users.
         */
        const fetchUserCount = async () => {
            if (!user) return;

            try {
                const res = await fetch(`${BASE_URL}/users`, {
                    credentials: "include"
                });
                const result = await res.json();

                if (res.ok) {
                    let count = 0;
                    if (result.count !== undefined) count = result.count;
                    else if (Array.isArray(result.data)) count = result.data.length;
                    else if (Array.isArray(result)) count = result.length;

                    setStats(prev => ({ ...prev, users: count }));
                } else {
                    // Suppress UI errors for non-critical stat failures
                }
            } catch (err) {
                showToast("Failed to load user stats.", "error");
            }
        };

        /**
         * Execute all metric requests concurrently.
         */
        const fetchAll = async () => {
            setLoading(true);
            await Promise.all([fetchSpotCount(), fetchUserCount()]);
            setLoading(false);
        };

        fetchAll();
    }, [user]);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (loading) return <Loader />;

    return (
        <section className="ad_dash_section">
            {/* --- 3. Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />

            <Container>
                {/* --- Header: Welcome Message & Date Context --- */}
                <div className="ad_dash_welcome mb-5">
                    <div>
                        <h2 className="ad_dash_title">Admin Dashboard</h2>
                        <p className="ad_dash_subtitle">
                            Welcome back, <span className="ad_dash_highlight">{user && user.username}</span>
                        </p>
                    </div>
                    <div className="ad_dash_date_pill">
                        <i className="ri-calendar-event-line"></i>
                        <span>{today}</span>
                    </div>
                </div>

                {/* --- KPI Stats Row --- */}
                <Row className="mb-5">
                    <Col lg="6" md="6" className="mb-4 mb-md-0">
                        <div className="ad_dash_glass_card ad_dash_stat_widget ad_dash_primary_widget">
                            <div className="stat-content">
                                <h5 className="ad_dash_stat_label">Total Spots</h5>
                                <h2 className="ad_dash_stat_num">{stats.spots}</h2>
                                <p className="ad_dash_stat_desc">Active tourism spots</p>
                            </div>
                            <div className="ad_dash_icon_wrap">
                                <i className="ri-map-pin-2-fill"></i>
                            </div>
                        </div>
                    </Col>
                    <Col lg="6" md="6">
                        <div className="ad_dash_glass_card ad_dash_stat_widget ad_dash_secondary_widget">
                            <div className="stat-content">
                                <h5 className="ad_dash_stat_label">Community</h5>
                                <h2 className="ad_dash_stat_num">{stats.users}</h2>
                                <p className="ad_dash_stat_desc">Registered users</p>
                            </div>
                            <div className="ad_dash_icon_wrap">
                                <i className="ri-group-fill"></i>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* --- Quick Actions --- */}
                <div className="ad_dash_acts_header mb-4">
                    <h4 className="ad_dash_acts_title">Quick Management</h4>
                    <div className="ad_dash_acts_divider"></div>
                </div>

                <Row>
                    <Col lg="3" md="6" sm="6" className="mb-4">
                        <Link to="/admin/add-spot" className="ad_dash_act_link">
                            <div className="ad_dash_glass_card ad_dash_act_card">
                                <div className="ad_dash_icon_circle ad_dash_color_sec">
                                    <i className="ri-add-circle-fill"></i>
                                </div>
                                <h5>Add Spot</h5>
                                <div className="ad_dash_hover_ind"><i className="ri-arrow-right-line"></i></div>
                            </div>
                        </Link>
                    </Col>
                    <Col lg="3" md="6" sm="6" className="mb-4">
                        <Link to="/admin/manage-spots" className="ad_dash_act_link">
                            <div className="ad_dash_glass_card ad_dash_act_card">
                                <div className="ad_dash_icon_circle ad_dash_color_blue">
                                    <i className="ri-settings-4-fill"></i>
                                </div>
                                <h5>Manage Spots</h5>
                                <div className="ad_dash_hover_ind"><i className="ri-arrow-right-line"></i></div>
                            </div>
                        </Link>
                    </Col>
                    <Col lg="3" md="6" sm="6" className="mb-4">
                        <Link to="/admin/emergency-contacts" className="ad_dash_act_link">
                            <div className="ad_dash_glass_card ad_dash_act_card">
                                <div className="ad_dash_icon_circle ad_dash_color_red">
                                    <i className="ri-hospital-fill"></i>
                                </div>
                                <h5>Emergency Contacts</h5>
                                <div className="ad_dash_hover_ind"><i className="ri-arrow-right-line"></i></div>
                            </div>
                        </Link>
                    </Col>

                    <Col lg="3" md="6" sm="6" className="mb-4">
                        <Link to="/admin/inquiries" className="ad_dash_act_link">
                            <div className="ad_dash_glass_card ad_dash_act_card">
                                <div className="ad_dash_icon_circle ad_dash_color_blue">
                                    <i className="ri-mail-unread-fill"></i>
                                </div>
                                <h5>Inquiries</h5>
                                <div className="ad_dash_hover_ind"><i className="ri-arrow-right-line"></i></div>
                            </div>
                        </Link>
                    </Col>

                    <Col lg="3" md="6" sm="6" className="mb-4">
                        <Link to="/admin/inquiries" className="ad_dash_act_link">
                            <div className="ad_dash_glass_card ad_dash_act_card">
                                <div className="ad_dash_icon_circle ad_dash_color_teal">
                                    <i className="ri-user-settings-fill"></i>
                                </div>
                                <h5>Users</h5>
                                <div className="ad_dash_hover_ind"><i className="ri-arrow-right-line"></i></div>
                            </div>
                        </Link>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AdminDashboard;