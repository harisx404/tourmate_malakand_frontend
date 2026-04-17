import React, { useRef, useEffect, useState, useContext } from "react";
import { Container, Row, Button } from "reactstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import avatar from "../../assets/images/avatar.jpg";
import "./header.css";

import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import CustomToast from "../../shared/CustomToast";
import { confirmAction } from "../../utils/alerts";

/*
  Navigation Links:
  Represents the different sections of the website.
  Used for navigation and accessibility.
*/
const nav__Links = [
    { path: "/", display: "Home" },
    { path: "/spots", display: "All Spots" },
    { path: "/map", display: "Map" },
    { path: "/emergencyContacts", display: "Emergency Contacts" },
    { path: "/contact", display: "Contact Us" },
];

/*
  Header Component:
  Represents the header section of the website.
  Used for navigation and accessibility.
*/
const Header = () => {
    // Refs
    const headerRef = useRef(null);
    const menuRef = useRef(null);
    const profileRef = useRef(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const { user, dispatch } = useContext(AuthContext);

    /*
      Toast State:
      Represents the state of the toast.
      Used for toast notifications.
    */
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

    // --- Logout Handler ---
    const logout = () => {
        dispatch({ type: "LOGOUT" });
        setIsProfileOpen(false);
        showToast("Logged out successfully.", "success");
        navigate("/");
    };

    // --- Delete Account Handler ---
    const deleteAccount = async () => {
        // Safety Check Preserved
        const isConfirmed = await confirmAction({
            title: "Delete Account?",
            text: "WARNING: This will permanently delete your account and all your reviews. This action cannot be undone.",
            confirmButtonText: "Yes, Delete Everything",
            icon: "warning"
        });

        if (!isConfirmed) return;

        try {
            const res = await fetch(`${BASE_URL}/users/${user._id}`, {
                method: "DELETE",
                credentials: "include" // Cookie Auth Preserved
            });

            const result = await res.json();

            if (res.ok) {
                showToast("Account deleted successfully.", "success");

                // Wait 1s for user to read the message, then clear session
                setTimeout(() => {
                    dispatch({ type: "LOGOUT" });
                    navigate("/");
                }, 1000);
            } else {
                showToast(result.message || "Failed to delete account.", "error");
            }
        } catch (err) {
            showToast("Server error. Please try again later.", "error");
        }
    };

    // Sticky Header Logic
    const stickyHeaderFunc = () => {
        window.addEventListener("scroll", () => {
            if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
                headerRef.current?.classList.add("main-header-sticky");
            } else {
                headerRef.current?.classList.remove("main-header-sticky");
            }
        });
    };

    useEffect(() => {
        stickyHeaderFunc();
        return () => window.removeEventListener("scroll", stickyHeaderFunc);
    }, []);

    // Click Outside Profile Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        menuRef.current.classList.toggle('main-header-show-menu');
    }

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    return (
        <>
            <header className="main-header-section" ref={headerRef}>
                <Container>
                    <Row>
                        <div className="main-header-nav-wrapper d-flex align-items-center justify-content-between">

                            {/* ============ Logo ============ */}
                            <div className="main-header-logo">
                                <Link to="/">
                                    <img src={logo} alt="TourMate" />
                                </Link>
                            </div>

                            {/* ============ Navigation ============ */}
                            <div className="main-header-navigation" ref={menuRef} onClick={toggleMenu}>
                                <ul className="main-header-menu-list d-flex align-items-center gap-4">
                                    <div className="main-header-mobile-head d-lg-none">
                                        <h5>Menu</h5>
                                        <span className="main-header-mobile-close"><i className="ri-close-line"></i></span>
                                    </div>

                                    {nav__Links.map((item, index) => (
                                        <li className="main-header-nav-item" key={index}>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) => (isActive ? "main-header-active-link" : "")}
                                            >
                                                {item.display}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ============ Right Side (Auth & Profile) ============ */}
                            <div className="main-header-right d-flex align-items-center gap-4">
                                <div className="main-header-btns d-flex align-items-center gap-2">

                                    {user ? (
                                        /* === LOGGED IN: CIRCULAR PROFILE DROPDOWN === */
                                        <div className="main-header-profile-container" ref={profileRef}>

                                            {/* Avatar Trigger */}
                                            <div className="main-header-profile-trigger" onClick={toggleProfile}>
                                                <img
                                                    src={user.photo || avatar}
                                                    alt={user.username}
                                                />
                                            </div>

                                            {/* Dropdown Menu */}
                                            <div className={`main-header-profile-dropdown ${isProfileOpen ? "active" : ""}`}>
                                                <div className="main-header-dropdown-header">
                                                    <span className="main-header-greeting">Signed in as</span>
                                                    <h6 className="main-header-username-text">{user.username}</h6>
                                                </div>

                                                <div className="main-header-dropdown-divider"></div>

                                                {/* ADMIN DASHBOARD LINK (Only visible for Admins) */}
                                                {user.role === 'admin' && (
                                                    <Link to="/admin/dashboard" className="main-header-dropdown-item main-header-admin-item" onClick={() => setIsProfileOpen(false)}>
                                                        <i className="ri-dashboard-3-line"></i>
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                )}

                                                {/* LOGOUT */}
                                                <div className="main-header-dropdown-item main-header-logout-item" onClick={logout}>
                                                    <i className="ri-logout-box-r-line"></i>
                                                    <span>Logout</span>
                                                </div>

                                                <div className="main-header-dropdown-divider"></div>

                                                {/* --- DELETE ACCOUNT BUTTON --- */}
                                                <div
                                                    className="main-header-dropdown-item main-header-delete-account"
                                                    onClick={deleteAccount}
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                    <span>Delete Account</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* === LOGGED OUT: BUTTONS === */
                                        <>
                                            <Link to="/login">
                                                <Button className="btn main-header-btn-login">Login</Button>
                                            </Link>
                                            <Link to="/signup">
                                                <Button className="btn main-header-btn-signup">Sign Up</Button>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Mobile Hamburger */}
                                <span className="main-header-mobile-trigger" onClick={toggleMenu}>
                                    <i className="ri-menu-4-line"></i>
                                </span>
                            </div>
                        </div>
                    </Row>
                </Container>

                {/* Mobile Overlay */}
                {isMenuOpen && <div className="main-header-menu-overlay d-lg-none" onClick={toggleMenu}></div>}
            </header>

            {/* --- Render Custom Toast --- */}
            <CustomToast
                show={toastState.show}
                message={toastState.message}
                type={toastState.type}
                onClose={closeToast}
            />
        </>
    );
};

export default Header;