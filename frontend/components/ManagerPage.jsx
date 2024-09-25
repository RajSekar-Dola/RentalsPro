import React from 'react'
import '../css/AdminPage.css';
import { Outlet, useNavigation,NavLink,useNavigate } from 'react-router-dom';
const ManagerPage = () => {
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
                <li className="logout"><a>Logout</a></li>
            </ul>
      </div>
      <div className='dashboard-content'>
        <Outlet/>
      </div>
    </div>
  )
}

export default ManagerPage
