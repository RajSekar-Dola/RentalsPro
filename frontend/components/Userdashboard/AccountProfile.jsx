import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import "../../css/Userdashboardcss/AccountProfile.css";
import { FaUser, FaClipboardList, FaShoppingCart, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { IoNotificationsCircleSharp } from "react-icons/io5";
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/action.js';
import { NoAccessPage } from '..//NoAccessPage.jsx';
const AccountProfile = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.role);
  const navigate = useNavigate();
  if (role !== "User") {
    return <NoAccessPage />;  // Redirect to NoAccessPage if role is not Admin
  }
  const [usernotificationcount, setusernotificationcount] = useState(0);
  useEffect(() => {
    fetchUnseenNotifications();
  }, [])
  const updateusernotificationcount = () => {
    markAsSeen();
    setusernotificationcount(0);
  }

  const markAsSeen = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/notifications/markallAsSeen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(),
      });

      if (!response.ok) throw new Error("Failed to mark notification as seen");
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchUnseenNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/notifications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      const allNotifications = data.notifications;
      const unseenNotifications = allNotifications.filter(notification => !notification.seen);
      setusernotificationcount(unseenNotifications.length);
    } catch (error) {

    } finally {

    }
  };





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
        dispatch(logoutUser());
        navigate("/");
      } else {
        console.error("Failed to sign out");
      }
    } catch (err) {
      console.error("An error occurred during sign-out", err);
    }
  };

  return (
    <>
      <Header />
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
                  <NavLink
                    onClick={updateusernotificationcount}
                    to="/accountProfile/notifications"
                    className={({ isActive }) => (isActive ? "active-li" : "")}
                  >
                    <IoNotificationsCircleSharp />
                    Account Earnings
                    {usernotificationcount !== 0 && <span>({usernotificationcount})</span>}
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
      <Footer />
    </>
  );
};

export default AccountProfile;