import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';

const ManagerCategory = () => {
    const [totalProducts, setTotalProducts] = useState(0);
    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: [],
    });
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
                const categoriesRes = await fetch('http://localhost:3000/api/dashboard/categories-cat', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                if (!categoriesRes.ok) {
                    throw new Error('Network response was not ok');
                }

                const categoriesData = await categoriesRes.json();
                const categoryLabels = categoriesData.map(category => category._id || 'Unknown');
                const categoryCounts = categoriesData.map(category => category.count || 0);
                const total = categoryCounts.reduce((acc, count) => acc + count, 0);
                setTotalProducts(total);

                setCategoryData({
                    labels: categoryLabels,
                    datasets: [
                        {
                            label: 'Products by Category',
                            data: categoryCounts,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                        },
                    ],
                });
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);  // Set loading to false after the fetch process
            }
        }

        fetchDashboardData();
        return () => {
            setCategoryData({ labels: [], datasets: [] });
        };
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true, // To use square shapes for labels
                    pointStyle: 'rect',  // Use a rectangular (square) shape for the legend
                    font: {
                        size: 14 // You can adjust the font size here
                    }
                }
            }
        }
    };

    return (
        <div className="chart-wrapper" style={{ textAlign: "center" }} >
            {
                loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="chart-section">
                        <h2 className='cat' >Products by Category</h2>
                        <div className="chart-container">
                            {categoryData.labels.length > 0 ? (
                                <Pie data={categoryData} options={chartOptions} />
                            ) : (
                                <p>No data available for categories</p>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default ManagerCategory;