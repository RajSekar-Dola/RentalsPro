import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"

Chart.register(...registerables);

const ManagerUploads = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("http://localhost:3000/grabBranch", {
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
        const dailyRes = await fetch('http://localhost:3000/api/dashboard/daily-uploads-cat', {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        const monthlyRes = await fetch('http://localhost:3000/api/dashboard/monthly-uploads-cat', {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!dailyRes.ok || !monthlyRes.ok) {
          throw new Error('Network response was not ok');
        }

        const dailyData = await dailyRes.json();
        const monthlyData = await monthlyRes.json();

        setDailyData(dailyData);
        setMonthlyData(monthlyData);
      } catch (err) {
        console.log("Error loading Data")
      } finally {
        setLoading(false);  // Set loading to false after the fetch process
      }
    }
    fetchDashboardData();
  }, [])

  const dailyLabels = dailyData.map(item => item._id);
  const dailyCounts = dailyData.map(item => item.count);

  const monthlyLabels = monthlyData.map(item => `${item._id.year}-${item._id.month}`);
  const monthlyCounts = monthlyData.map(item => item.count);

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Products Uploaded Per Day',
        data: dailyCounts,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Products Uploaded Per Month',
        data: monthlyCounts,
        backgroundColor: 'green',
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
        <div className="chart-section-2" >
          <div className="location-m">{location}</div>
          <div className="chart-container">
            <h2>Daily Product Uploads (Last 7 Days)</h2>
            {dailyData.length > 0 ? (
              <Line data={dailyChartData} />
            ) : (
              <p>No daily data available</p>
            )}
          </div>
          <div className="chart-container">
            <h2>Monthly Product Uploads</h2>
            {monthlyData.length > 0 ? (
              <Bar data={monthlyChartData} />
            ) : (
              <p>No monthly data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerUploads