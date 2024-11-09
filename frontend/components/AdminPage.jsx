import React from 'react'
import '../css/AdminPage.css';
import { Outlet, useNavigation, NavLink, useNavigate } from 'react-router-dom';
const AdminPage = () => {
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
    <div className='dashboard-container'>
      <div className='dashboard-menu'>
        <h2>Menu</h2>
        <ul>
          <li className="options"><NavLink to='/adminpage/addLocation'>ADD BRANCH</NavLink></li>
          <li className="options"><NavLink to='/adminpage/managers'>MANAGERS</NavLink></li>
          <li className="options"><NavLink to='/adminpage/bookings'>BOOKINGS</NavLink></li>
          <li className="options"><NavLink to='/adminpage/uploads'>UPLOADS</NavLink></li>
          <li className="options"><NavLink to='/adminpage/users'>USERS</NavLink></li>
          <li className="options"><NavLink to='/adminpage/revenue'>REVENUE</NavLink></li>
          <li className="options"><NavLink to='/adminpage/availCategories'>CATEGORIES</NavLink></li>
          <li className="options out" onClick={handleSignOut}>SIGN OUT</li>
        </ul>
      </div>
      <div className='dashboard-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminPage
