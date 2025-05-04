import React, { useEffect, useState } from 'react';
import '../../css/Userdashboardcss/AccountNotifications.css';

const AccountNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingIds, setBookingIds] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [unseencount, setUnseencount] = useState();
    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchUnseenNotifications();
    }, []);

    useEffect(() => {
        if (bookingIds.length > 0) {
            fetchProductDetails();
        }
    }, [bookingIds]);

    const fetchUnseenNotifications = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/notifications`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Failed to fetch notifications");

            const data = await response.json();
            const allNotifications = data.notifications;
            const unseenNotifications = allNotifications.filter(notification => !notification.seen);
            setUnseencount(unseenNotifications.length);
            setNotifications(allNotifications);
            const bids = allNotifications.map(notification => notification.message);
            setBookingIds(bids);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/notifications/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bookingids: bookingIds }),
            });
            if (!response.ok) throw new Error("Failed to fetch product details");

            const data = await response.json();
            setProducts(data.products);
            const total = data.products.reduce((sum, product) => {
                const booking = product.reqbooking;
                return sum + (booking.price * 10 / 11);
            }, 0);
            setTotalAmount(total.toFixed(2));
        } catch (error) {
            setError(error.message);
        }
    };

    const markAsSeen = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/notifications/markAsSeen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ notificationid: id }),
            });

            if (!response.ok) throw new Error("Failed to mark notification as seen");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleNotificationClick = async(notificationId, index) => {
        if (selectedNotificationId === notificationId) {
            setSelectedNotificationId(null);
        } else {
            setSelectedNotificationId(notificationId);
            if (products[index]) {
                const data = products[index];
                setSelectedBooking(data.reqbooking);
                setSelectedProduct(data.reqproduct);
                setSelectedBuyer(data.reqbuyer);
                await markAsSeen(notificationId);
                await fetchUnseenNotifications();                
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="account-notifications-page">
            <div className="notifications-container">
            <h2>Earnings {totalAmount !== 0 ? `Rs. ${totalAmount}` : ''}</h2>
                {notifications.length === 0 ? (
                    <p>No new notifications</p>
                ) : (
                    <ul>
                        {notifications.map((notification, index) => (
                            <li key={notification._id} className="notification-item">
                                <p onClick={() => handleNotificationClick(notification._id, index)}>
                                    {products[index]?.reqproduct?.productName
                                        ? `${products[index].reqproduct.productName} is booked! Click to view details.`
                                        : "Loading product details..."}
                                </p>
                                {selectedNotificationId === notification._id && selectedBooking && (
                                    <div className="product-details-modal">
                                        <div>
                                            <h3>Booking Details</h3>
                                            <p><strong>Product name:</strong> {selectedProduct.productName}</p>
                                            <p><strong>Buyer Name:</strong> {selectedBuyer.username}</p>
                                            <p><strong>Buyer Email:</strong> {selectedBuyer.email}</p>
                                            <p><strong>Booking Price:</strong> Rs.{(selectedBooking.price * 10 / 11).toFixed(2)}</p>
                                            <p><strong>Booked From:</strong> {new Date(selectedBooking.fromDateTime).toLocaleString()}</p>
                                            <p><strong>Booked To:</strong> {new Date(selectedBooking.toDateTime).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <img
                                                src={selectedProduct.photo[0]}
                                                alt={selectedProduct.productName}
                                            />
                                            <div
                                                className={`mbn-user-bookingstatus ${selectedBooking.level === 0
                                                        ? 'booked'
                                                        : selectedBooking.level === 1
                                                            ? 'ready'
                                                            : selectedBooking.level === 2
                                                                ? 'using'
                                                                : selectedBooking.level === 3
                                                                    ? 'completed'
                                                                    : 'unknown'
                                                    }`}
                                            >
                                                {(() => {
                                                    switch (selectedBooking.level) {
                                                        case 0:
                                                            return 'to be Delivered';
                                                        case 1:
                                                            return 'Delivered';
                                                        case 2:
                                                            return 'Using';
                                                        case 3:
                                                            return 'Returned';
                                                        default:
                                                            return 'Unknown Status';
                                                    }
                                                })()}
                                            </div>
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
