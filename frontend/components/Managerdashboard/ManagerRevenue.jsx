import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"
Chart.register(...registerables);

const ManagerRevenue = () => {
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
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
                const dailyRevenueRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/daily-revenue-cat`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                const monthlyRevenueRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/monthly-revenue-cat`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!dailyRevenueRes.ok || !monthlyRevenueRes.ok) {
                    throw new Error('Network response was not ok');
                }

                const dailyRevenueData = await dailyRevenueRes.json();
                const monthlyRevenueData = await monthlyRevenueRes.json();

                setDailyRevenueData(dailyRevenueData);
                setMonthlyRevenueData(monthlyRevenueData);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);  // Set loading to false after the fetch process
            }
        }
        fetchDashboardData()
    }, [])

    const dailyRevenueLabels = dailyRevenueData.map(item => item._id);
    const dailyRevenueCounts = dailyRevenueData.map(item => item.totalRevenue);

    const monthlyRevenueLabels = monthlyRevenueData.map(item => `${item._id.year}-${item._id.month}`);
    const monthlyRevenueCounts = monthlyRevenueData.map(item => item.totalRevenue);

    const dailyRevenueChartData = {
        labels: dailyRevenueLabels,
        datasets: [
            {
                label: 'Revenue Per Day',
                data: dailyRevenueCounts,
                backgroundColor: '#FF9F40',
                borderColor: '#FF9F40',
                fill: false,
            },
        ],
    };

    const monthlyRevenueChartData = {
        labels: monthlyRevenueLabels,
        datasets: [
            {
                label: 'Revenue Per Month',
                data: monthlyRevenueCounts,
                backgroundColor: '#4BC0C0',
                borderColor: '#4BC0C0',
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
                        <h2>Daily Revenue(Previous 7 days)</h2>
                        {dailyRevenueData.length > 0 ? (
                            <Line data={dailyRevenueChartData} />
                        ) : (
                            <p>No daily revenue data available</p>
                        )}
                    </div>

                    <div className="chart-container">
                        <h2>Monthly Revenue</h2>
                        {monthlyRevenueData.length > 0 ? (
                            <Bar data={monthlyRevenueChartData} />
                        ) : (
                            <p>No monthly revenue data available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManagerRevenue