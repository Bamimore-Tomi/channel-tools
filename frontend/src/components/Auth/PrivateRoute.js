// frontend/src/components/Auth/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        // Redirect to login page and save the location they tried to access
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    // For admin routes, check if user is an admin
    if (adminOnly && !isAdmin) {
        // Redirect non-admin users to home page
        return <Navigate to="/" replace />;
    }

    // User is authenticated (and is admin if adminOnly=true)
    return children;
};

export default PrivateRoute;