import React, { useState,useEffect } from 'react'
import '../css/AdminPage.css';
import { Outlet, useNavigation, NavLink, useNavigate } from 'react-router-dom';
const ManagerPage = () => {
  const navigate = useNavigate();
  const [managerNotifications,setManagernotificationcount] = useState(0);

  const handleSignOut = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/signOut`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        console.error("Failed to sign out")
      }
    } catch (err) {
      console.error("An error occurred during sign-out", err)
    }
  };


  const fetchUnseenNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/manager/notifications/countUnseen`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      const allNotifications = data.notifications;
      const unseenNotifications = allNotifications.filter(notification => !notification.seen);
      setManagernotificationcount(unseenNotifications.length);
    } catch (error) {

    } finally {

    }
  };

  
  useEffect(() => {
    fetchUnseenNotifications();
  }, [])

  return (
    <div className='dashboard-container'>
      <div className='dashboard-menu'>
        <h2>Menu</h2>
        <ul >
          <li className="options"><NavLink to='/managerpage/bookings'>BOOKINGS</NavLink></li>
          <li className="options"><NavLink to='/managerpage/uploads'>UPLOADS</NavLink></li>
          <li className="options"><NavLink to='/managerpage/revenue'>REVENUE</NavLink></li>
          <li className="options"><NavLink to='/managerpage/uploadnotifications' onClick={()=>setManagernotificationcount(0)} style={{fontSize:"14px"}} 
          >UPLOAD NOTIFICATIONS {managerNotifications !== 0 && <span>({managerNotifications})</span>}
          </NavLink></li>
          <li className="options"><NavLink to='/managerpage/Bookingnotifications' style={{fontSize:"14px"}} >BOOKING NOTIFICATIONS</NavLink></li>
          <li className="options"><NavLink to='/managerpage/availCategories'>CATEGORIES</NavLink></li>
          <li className="options out" onClick={handleSignOut}>SIGN OUT</li>
        </ul>
      </div>
      <div className='dashboard-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default ManagerPage