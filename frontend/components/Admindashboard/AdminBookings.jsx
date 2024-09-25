import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"

Chart.register(...registerables);

const AdminBookings = () => {
  const [dailyBookingsData, setDailyBookingsData] = useState([]);
  const [monthlyBookingsData, setMonthlyBookingsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dailyBookingsRes = await fetch('http://localhost:3000/api/dashboard/daily-bookings');
        const monthlyBookingsRes = await fetch('http://localhost:3000/api/dashboard/monthly-bookings');

        if (!dailyBookingsRes.ok || !monthlyBookingsRes.ok) {
          throw new Error('Network response was not ok');
        }
        const dailyBookingsData = await dailyBookingsRes.json();
        const monthlyBookingsData = await monthlyBookingsRes.json();

        setDailyBookingsData(dailyBookingsData);
        setMonthlyBookingsData(monthlyBookingsData);

      } catch (err) {
        console.error("Error fetching dashboard data", err);
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
    <div>
       <div className="chart-section-2">
                <div className="chart-container">
                <h2>Daily Bookings</h2>
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
    </div>
  )
}

export default AdminBookings