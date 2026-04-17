import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";


//====== LAZY LOADED =====//
/*
  Performance Optimization:
  Components are imported lazily.
  The browser only downloads the code for a specific page when the user visits it.
*/
// --- PUBLIC PAGES ---
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Signup = lazy(() => import("../pages/Auth/Signup"));
const SpotsList = lazy(() => import("../pages/Spots-List/SpotsList"));
const SpotDetails = lazy(() => import("../pages/Spot-Details/SpotDetails"));
const SearchResults = lazy(() => import("../pages/Search-Results/SearchResults"));
const NotFound = lazy(() => import("../pages/PageNotFound/PageNotFound"));
const ContactUs = lazy(() => import("../pages/Contact-Us/ContactUs"));
const EmergencyContacts = lazy(() => import("../pages/Emergency-Contacts/EmergencyContacts"));
const ServerError = lazy(() => import("../pages/ServerError/ServerError"));
const Map = lazy(() => import("../pages/Map/Map"));

// --- LEGAL PAGES ---
const PrivacyPolicy = lazy(() => import('../pages/legal/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('../pages/legal/TermsOfUse'));

// --- ADMIN PAGES & LAYOUT ---
const AdminLayout = lazy(() => import("../components/Layout/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AddSpot = lazy(() => import("../pages/Admin/AddSpot"));
const ManageSpots = lazy(() => import("../pages/Admin/ManageSpots"));
const UpdateSpot = lazy(() => import("../pages/Admin/UpdateSpot"));
const ManageEmergency = lazy(() => import("../pages/Admin/ManageEmergency"));
const ManageUsers = lazy(() => import("../pages/Admin/ManageUsers"));
const ManageContacts = lazy(() => import("../pages/Admin/ManageContacts"));

// --- COMPONENTS ---
import Loader from "../components/Common/Loader";

// --- SECURITY ---
import AdminRoute from "../utils/AdminRoute";

/**
 * Main Router Component.
 * Defines all public and protected (admin) routes for the application.
 */
const Routers = () => {
    return (
        /*
          Suspense Boundary:
          Required for lazy-loaded components. Shows the <Loader /> UI
          while the specific page chunk is being fetched over the network.
        */
        <Suspense fallback={<Loader />}>
            <Routes>
                {/* ================= PUBLIC ROUTES ================= */}
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/map" element={<Map />} />
                <Route path="/spots" element={<SpotsList />} />
                <Route path="/spots/:id" element={<SpotDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/search-results" element={<SearchResults />} />
                <Route path='/contact' element={<ContactUs />} />
                <Route path='/emergencycontacts' element={<EmergencyContacts />} />
                <Route path="/server-error" element={<ServerError />} />

                {/* The URL path stays the same, only the file location changed */}
                <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                <Route path='/terms-of-use' element={<TermsOfUse />} />


                {/* ================= ADMIN ROUTES ================= */}
                {/* 1. Check if Admin (AdminRoute) */}
                {/* 2. Apply Admin Layout (Sidebar) */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        {/* These render INSIDE the AdminLayout Outlet */}
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="add-spot" element={<AddSpot />} />
                        <Route path="manage-spots" element={<ManageSpots />} />
                        <Route path="edit-spot/:id" element={<UpdateSpot />} />
                        <Route path="emergency-contacts" element={<ManageEmergency />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="inquiries" element={<ManageContacts />} />
                    </Route>
                </Route>

                {/* Catch-All Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default Routers;