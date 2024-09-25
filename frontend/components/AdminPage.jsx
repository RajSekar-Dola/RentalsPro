import React from 'react'
import '../css/AdminPage.css';
import { Outlet, useNavigation,NavLink,useNavigate } from 'react-router-dom';
const AdminPage = () => {
  return (
    <div className='dashboard-container'>
      <div className='dashboard-menu'>
            <h2>Menu</h2>
            <ul>
                <li className="options"><NavLink to='/adminpage/managers'>MANAGERS</NavLink></li>
                <li className="options"><NavLink to='/adminpage/bookings'>BOOKINGS</NavLink></li>
                <li className="options"><NavLink to='/adminpage/uploads'>UPLOADS</NavLink></li>
                <li className="options"><NavLink to='/adminpage/users'>USERS</NavLink></li>
                <li className="options"><NavLink to='/adminpage/revenue'>REVENUE</NavLink></li>
                <li className="options"><NavLink to='/adminpage/notifications'>NOTIFICATIONS</NavLink></li>
               <li className="options"><NavLink to='/adminpage/availCategories'>CATEGORIES</NavLink></li>
                <li className="logout"><a>Logout</a></li>
            </ul>
      </div>
      <div className='dashboard-content'>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminPage
