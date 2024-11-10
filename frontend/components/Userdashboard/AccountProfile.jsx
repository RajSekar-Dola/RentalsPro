import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import "../../css/Userdashboardcss/AccountProfile.css";
import { FaUser, FaClipboardList, FaShoppingCart, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { IoNotificationsCircleSharp } from "react-icons/io5"
const AccountProfile = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const response = await fetch("http://localhost:3000/signOut", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.error("Failed to sign out");
      }
    } catch (err) {
      console.error("An error occurred during sign-out", err);
    }
  };

  return (
    <div className="account-profile-page"> {/* Outer class to scope styles */}
      <div className="account-profile">
        <h1 style={{ color: '#A3FFD6' }}>Account Profile</h1>
        <div className="profile-container">
          <nav className="options">
            <ul>
              <li>
                <NavLink to="/accountProfile/details" className={({ isActive }) => (isActive ? "active-li" : "")}>
                  <FaUser /> Account Details
                </NavLink>
              </li>
              <li>
                <NavLink to="/accountProfile/bookings" className={({ isActive }) => (isActive ? "active-li" : "")}>
                  <FaClipboardList /> Your Bookings
                </NavLink>
              </li>
              <li>
                <NavLink to="/accountProfile/rentals" className={({ isActive }) => (isActive ? "active-li" : "")}>
                  <FaShoppingCart /> Your Rentals
                </NavLink>
              </li>
              <li>
                <NavLink to="/accountProfile/settings" className={({ isActive }) => (isActive ? "active-li" : "")}>
                  <FaCog /> Account Settings
                </NavLink>
              </li>
              <li>
              <NavLink to="/accountProfile/notifications" className={({ isActive }) => (isActive ? "active-li" : "")}>
              <IoNotificationsCircleSharp /> Account Earnings
                </NavLink>
              </li>
              <li>
                <button className="signout-button" onClick={handleSignOut}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </li>
            </ul>
          </nav>
          <div className="card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;