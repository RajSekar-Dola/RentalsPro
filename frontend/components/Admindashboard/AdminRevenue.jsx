import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"
Chart.register(...registerables);

const AdminRevenue = () => {
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dailyRevenueRes = await fetch('http://localhost:3000/api/dashboard/daily-revenue');
                const monthlyRevenueRes = await fetch('http://localhost:3000/api/dashboard/monthly-revenue');

                if (!dailyRevenueRes.ok || !monthlyRevenueRes.ok) {
                    throw new Error('Network response was not ok');
                }

                const dailyRevenueData = await dailyRevenueRes.json();
                const monthlyRevenueData = await monthlyRevenueRes.json();

                setDailyRevenueData(dailyRevenueData);
                setMonthlyRevenueData(monthlyRevenueData);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        }
        fetchDashboardData()
    }, [])

    const dailyRevenueLabels = dailyRevenueData.map(item => item._id);
    const dailyRevenueCounts = dailyRevenueData.map(item => item.totalRevenue); // Assuming your API returns total revenue per day

    const monthlyRevenueLabels = monthlyRevenueData.map(item => `${item._id.year}-${item._id.month}`);
    const monthlyRevenueCounts = monthlyRevenueData.map(item => item.totalRevenue); // Assuming your API returns total revenue per month

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
        <div>
            <div className="chart-section-2">
                <div className="chart-container">
                    <h2>Daily Revenue</h2>
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
        </div>
    )
}

export default AdminRevenue