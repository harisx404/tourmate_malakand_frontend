import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Higher-Order Component (HOC) for protecting administrative routes.
 * Enforces Role-Based Access Control (RBAC) by checking if the user is an admin.
 * @returns {JSX.Element|null} The protected content (Outlet) or a redirect to login.
 */
const AdminRoute = () => {
    const { user, loading } = useContext(AuthContext);

    // Suspend rendering until authentication status is confirmed to prevent premature redirects.
    if (loading) return null;

    // Enforce RBAC: Only unauthenticated users or non-admins are redirected.
    if (!user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    // Render the protected admin content.
    return <Outlet />;
};

export default AdminRoute;