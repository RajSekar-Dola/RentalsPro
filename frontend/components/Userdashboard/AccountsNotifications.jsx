import React, { useEffect, useState } from 'react';
import Carousel from '../Carousel.jsx';

const AccountNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingids, setbookingids] = useState([]);
    const [selectedbooking, setselectedbooking] = useState(null);
    const [selectedproduct, setselectedproduct] = useState(null);
    const [selectedbuyer, setselectedbuyer] = useState(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null); // Store selected notification ID

    // Fetch unseen notifications on component mount
    useEffect(() => {
        fetchUnseenNotifications();
    }, []);

    const fetchUnseenNotifications = async () => {
        try {
            const response = await fetch('http://localhost:3000/user/notifications', {
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
            const filteredbookingids = filteredNotifications.map(notification => notification.message);
            setbookingids(filteredbookingids);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchProductDetails = async (bookingid) => {
        try {
            const response = await fetch(`http://localhost:3000/user/notifications/${bookingid}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                console.log(response);
            }

            const data = await response.json();
            setselectedbooking(data.reqbooking);
            setselectedproduct(data.reqproduct);
            setselectedbuyer(data.reqbuyer);
        } catch (error) {
            setError(error.message);
        }
    };

    const markAsSeen = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/user/notifications/markAsSeen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ notificationid: id}),
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
        if (selectedNotificationId === notificationId) {
            // If the clicked notification is already selected, hide the details
            setSelectedNotificationId(null);
        } else {
            // Otherwise, show the details for the clicked notification
            setSelectedNotificationId(notificationId);
            fetchProductDetails(productId);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="account-settings-page">
        <div className="notifications-container">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={notification._id} className="notification-item">
                            <p onClick={() => handleNotificationClick(notification._id, bookingids[index])}>
                                {`${notification.message} is booked! Click to view details.`}
                            </p>
                            {selectedNotificationId === notification._id && selectedbooking && ( // Only show details for the selected notification
                                <div className="product-details-modal">
                                    <div>
                                    <h3>Booking Details</h3>
                                    <p>Product name: {selectedproduct.productName}</p>
                                    <p>Buyer Name: {selectedbuyer.username}</p>
                                    <p>Buyer Email: {selectedbuyer.email}</p>
                                    <p>Booking Price: {selectedbooking.price*(10/11)}</p>
                                    <p>Booked From: {new Date(selectedbooking.fromDateTime).toLocaleString()}</p>
                                    <p>Booked To: {new Date(selectedbooking.toDateTime).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <Carousel images={selectedproduct.photo}/>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </div>
    );
};

export default AccountNotifications;
