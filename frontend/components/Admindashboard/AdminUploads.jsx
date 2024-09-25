import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "../../css/Admindashboardcss/AdminBookings.css"

Chart.register(...registerables);

const AdminUploads = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const dailyRes = await fetch('http://localhost:3000/api/dashboard/daily-uploads');
      const monthlyRes = await fetch('http://localhost:3000/api/dashboard/monthly-uploads');

      if(!dailyRes.ok || !monthlyRes.ok){
        throw new Error('Network response was not ok');
      }

      const dailyData = await dailyRes.json();
      const monthlyData = await monthlyRes.json();

      setDailyData(dailyData);
      setMonthlyData(monthlyData);
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
    <div>
       <div className="chart-section-2" >
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
    </div>
  )
}

export default AdminUploads