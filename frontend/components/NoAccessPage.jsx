import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const NoAccessPage = () => {
    return (
        <div className="no-access-page">
            <h1>Access Denied</h1>
            <p>Sorry, you don’t have permission to access this page.</p>
            <p>If you believe this is a mistake, please contact the administrator or support.</p>
            <Link to="/" className="go-back-home">
                Go Back to Home
            </Link>
        </div>
    );
};

export default NoAccessPage;
