import React from 'react'
import '../css/AdminPage.css';
import { Outlet, useNavigation, NavLink, useNavigate } from 'react-router-dom';
const ManagerPage = () => {
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

  return (
    <div className='dashboard-container'>
      <div className='dashboard-menu'>
        <h2>Menu</h2>
        <ul>
          <li className="options"><NavLink to='/managerpage/bookings'>BOOKINGS</NavLink></li>
          <li className="options"><NavLink to='/managerpage/uploads'>UPLOADS</NavLink></li>
          <li className="options"><NavLink to='/managerpage/revenue'>REVENUE</NavLink></li>
          <li className="options"><NavLink to='/managerpage/notifications'>NOTIFICATIONS</NavLink></li>
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
