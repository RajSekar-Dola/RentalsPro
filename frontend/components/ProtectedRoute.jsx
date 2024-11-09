import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Assuming you're using js-cookie for cookie management

const ProtectedRoute = ({ element: Component, allowedRole }) => {
  const role = Cookies.get('role'); // Fetch the role from cookies

  // Check if the user has the correct role or show "Unauthorized access"
  if (!role || role !== allowedRole) {
    return <div>Unauthorized access</div>; // You can customize this response
  }

  return <Component />;
};

export default ProtectedRoute;
