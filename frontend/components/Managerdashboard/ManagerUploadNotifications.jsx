import React, { useEffect, useState } from 'react';
import Carousel from '../Carousel.jsx';
import '../../css/Admindashboardcss/ManagerNotifications.css';

const ManagerUploadNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productids, setProductIds] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null); // Store selected notification ID

    // Fetch unseen notifications on component mount
    useEffect(() => {
        fetchUnseenNotifications();
    }, []);

    const fetchUnseenNotifications = async () => {
        try {
            const response = await fetch('http://localhost:3000/manager/uploadnotifications', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Assuming you're using cookies for session handling
            });

            if (!response.ok) {
                console.log(response);  
            }
            const data = await response.json();
            const notifs = data.notifications;
            const filteredNotifications = notifs.filter(notification => !notification.seen);
            setNotifications(filteredNotifications);
            const filteredProductIds = filteredNotifications.map(notification => notification.message);
            setProductIds(filteredProductIds);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchProductDetails = async (productId) => {
        try {
            const response = await fetch(`http://localhost:3000/manager/products/${productId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                console.log(response);
            }

            const productData = await response.json();
            setSelectedProduct(productData);
        } catch (error) {
            setError(error.message);
        }
    };

    const markAsSeen = async (id, selectedProductId, isRejected) => {
        try {
            const response = await fetch(`http://localhost:3000/manager/uploadnotifications/markAsSeen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ notificationid: id, productid: selectedProductId, rejected: isRejected }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as seen.');
            }
            fetchUnseenNotifications();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleNotificationClick = (notificationId, productId) => {
        setSelectedNotificationId(notificationId); // Set the currently selected notification ID
        fetchProductDetails(productId);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={notification._id} className="notification-item">
                            <p onClick={() => handleNotificationClick(notification._id, productids[index])}>
                                {`${notification.message} is uploaded! Click to view details.`}
                            </p>
                            {selectedNotificationId === notification._id && selectedProduct && ( // Only show details for the selected notification
                                <div className="product-details-modal">
                                    <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignContent:"center"}}>
                                    <div>
                                    <h3>Product Details</h3>
                                    <p>Category: {selectedProduct.productType}</p>
                                    <p>Product Name: {selectedProduct.productName}</p>
                                    <p>Price/hour: {selectedProduct.price}</p>
                                    <p>From: {new Date(selectedProduct.fromDateTime).toLocaleString()}</p>
                                    <p>To: {new Date(selectedProduct.toDateTime).toLocaleString()}</p>
                                    <p>Upload Date: {new Date(selectedProduct.uploadDate).toLocaleString()}</p>
                                    </div>
                                    <Carousel images={selectedProduct.photo}  imageClassName="carousel-image"  />
                                    </div>
                                    <div>
                                        <button className="approve-button" onClick={() => markAsSeen(notification._id, selectedProduct._id, false)}>Approve</button>
                                        <button className="reject-button" onClick={() => markAsSeen(notification._id, selectedProduct._id, true)}>Reject</button>
                                    </div>
                                    
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManagerUploadNotifications;
