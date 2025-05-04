import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"

Chart.register(...registerables);

const ManagerBookings = () => {
  const [dailyBookingsData, setDailyBookingsData] = useState([]);
  const [monthlyBookingsData, setMonthlyBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/grabBranch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include" // Include cookies with the request
        });

        if (response.ok) {
          const branch = await response.json();
          setLocation(branch); // Set the branch location state
        } else {
          setError("Failed to fetch Branch"); // Handle server errors
        }
      } catch (err) {
        setError("An error occurred while fetching account details"); // Handle network errors
      }
    };

    fetchLocation();
  }, []);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dailyBookingsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/daily-bookings-cat`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        const monthlyBookingsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/monthly-bookings-cat`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!dailyBookingsRes.ok || !monthlyBookingsRes.ok) {
          throw new Error('Network response was not ok');
        }
        const dailyBookingsData = await dailyBookingsRes.json();
        const monthlyBookingsData = await monthlyBookingsRes.json();

        setDailyBookingsData(dailyBookingsData);
        setMonthlyBookingsData(monthlyBookingsData);

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);  // Set loading to false after the fetch process
      }
    }
    fetchDashboardData();
  }, [])

  const dailyBookingsLabels = dailyBookingsData.map(item => item._id);
  const dailyBookingsCounts = dailyBookingsData.map(item => item.count);

  const monthlyBookingsLabels = monthlyBookingsData.map(item => `${item._id.year}-${item._id.month}`);
  const monthlyBookingsCounts = monthlyBookingsData.map(item => item.count);

  const dailyBookingsChartData = {
    labels: dailyBookingsLabels,
    datasets: [
      {
        label: 'Bookings Per Day',
        data: dailyBookingsCounts,
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        fill: false,
      },
    ],
  };

  const monthlyBookingsChartData = {
    labels: monthlyBookingsLabels,
    datasets: [
      {
        label: 'Bookings Per Month',
        data: monthlyBookingsCounts,
        backgroundColor: '#FFCE56',
        borderColor: 'black',
        fill: false,
      },
    ],
  };

  return (
    <div style={{ textAlign: "center" }} >
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="chart-section-2">
          <div className="location-m">{location}</div>
          <div className="chart-container">
            <h2>Daily Bookings(Previous 7 days)</h2>
            {dailyBookingsData.length > 0 ? (
              <Line data={dailyBookingsChartData} />
            ) : (
              <p>No daily bookings data available</p>
            )}
          </div>

          <div className="chart-container">
            <h2>Monthly Bookings</h2>
            {monthlyBookingsData.length > 0 ? (
              <Bar data={monthlyBookingsChartData} />
            ) : (
              <p>No monthly bookings data available</p>
            )}
          </div>
        </div>
      )
      }
    </div>
  )
}

export default ManagerBookings