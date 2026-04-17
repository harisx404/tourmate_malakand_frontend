import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { NavLink, Outlet } from 'react-router-dom';
import './admin-layout.css';

/**
 * AdminLayout
 * * Serves as the primary shell for the authenticated admin interface.
 * Implements a responsive "Sidebar-to-Header" strategy:
 * - Desktop: Fixed sticky sidebar on the left.
 * - Mobile: Horizontal scrollable header at the top.
 * * Renders child routes via <Outlet />.
 */
const AdminLayout = () => {
    // Centralized navigation configuration for easier maintenance and role-based filtering implementation in the future.
    const navLinks = [
        { path: '/admin/dashboard', display: 'Dashboard', icon: 'ri-dashboard-3-line' },
        { path: '/admin/manage-spots', display: 'Manage Spots', icon: 'ri-map-pin-2-line' },
        { path: '/admin/add-spot', display: 'Add New Spot', icon: 'ri-add-circle-line' },
        { path: '/admin/emergency-contacts', display: 'Emergency Contacts', icon: 'ri-hospital-line' },
        { path: '/admin/inquiries', display: 'Manage Inquiries', icon: 'ri-mail-unread-line' },
        { path: '/admin/users', display: 'Manage Users', icon: 'ri-group-line' },
    ];

    return (
        <section className="ad_lay_main_section">
            <Container fluid className="p-0">
                <Row className="g-0 ad_lay_row_grid">

                    {/* Sidebar Column: Acts as a permanent sidebar on Desktop (lg), transforms to a top header on Mobile */}
                    <Col lg="2" className="ad_lay_sidebar_col">
                        <div className="ad_lay_glass_panel">

                            {/* Brand Identity Section */}
                            <div className="ad_lay_brand_wrap">
                                <h3 className="ad_lay_logo_title">Tour<span className="ad_lay_highlight_text">Mate</span>.</h3>
                            </div>

                            {/* Main Navigation Menu */}
                            <nav className="ad_lay_nav_container">
                                <ul className="ad_lay_nav_list">
                                    {navLinks.map((item, index) => (
                                        <li key={index}>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    isActive ? "ad_lay_link_item ad_lay_active_link" : "ad_lay_link_item"
                                                }
                                            >
                                                <div className="ad_lay_icon_box">
                                                    <i className={item.icon}></i>
                                                </div>
                                                <span className="nav-label">{item.display}</span>

                                                {/* Visual indicator (vertical bar) rendered only when the route is active */}
                                                <div className="ad_lay_active_bar"></div>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Static Info / Copyright */}
                            <div className="ad_lay_footer_wrap">
                                <p>© 2026 TourMate Admin</p>
                            </div>
                        </div>
                    </Col>

                    {/* Content Canvas: Renders the nested route components (Dashboard, Forms, etc.) */}
                    <Col lg="10" className="ad_lay_content_canvas">
                        <div className="ad_lay_inner_container">
                            <Outlet />
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AdminLayout;