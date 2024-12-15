import React, { useEffect, useState } from 'react';
import '../../css/Admindashboardcss/ManagerBookingNotifications.css';

const ManagerBookingNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [bids, setBids] = useState([]);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedRows, setExpandedRows] = useState({});
    const toggleRowDetails = (index) => {
        setExpandedRows((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    // Fetch unseen notifications on component mount
    useEffect(() => {
        fetchBookingNotifications();
    }, []);

    // Fetch list of bids when `bids` state updates
    useEffect(() => {
        if (bids.length > 0) {
            fetchLists();
        }
    }, [bids]);

    const fetchBookingNotifications = async () => {
        try {
            const managerId = "66f6309bc8a9f2fc1a901f3a";
            const response = await fetch('http://localhost:3000/manager/fetchBookingnotifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ managerid: managerId }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            const notifs = data.notifications || [];
            if (notifs.length > 0) {
                const extractedBids = notifs.map((notif) => notif.bookingid);
                setBids(extractedBids);
                setNotifications(notifs);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchLists = async () => {
        try {
            const response = await fetch('http://localhost:3000/manager/bookingnotifications/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bids }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch list of bids');
            }

            const data = await response.json();
            const results = data.results || [];
            setList(results);
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };
    const updateBookingLevel = async (bookingId, index,newLevel) => {
        try {
            console.log(bookingId,newLevel)
            const response = await fetch('http://localhost:3000/manager/bookingnotifications/updatelevel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bid: bookingId,  // ID of the booking
                    level: newLevel,  // New level value
                }),
            });
            
            if (response.ok) {
                const data=await response.json();
                console.log(data);
                if (data.result === true) {
                    // Update the local state
                    setList((prevList) =>
                        prevList.map((item) =>
                            item.booking._id === bookingId
                                ? { ...item, booking: { ...item.booking, level: newLevel } }
                                : item
                        )
                    );
                } else {
                    console.error('Failed to update booking level');
                }
            } else {
                console.log(response);
                console.error(`Error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    const updatelevelfunction=(x,index,y)=>{
        updateBookingLevel(x,index,y);
    }
    
    return (
        <div className="mbn-container">
            <table className="mbn-table">
                <thead className="mbn-thead">
                    <tr>
                        <th>Product Name</th>
                        <th>Owner Name</th>
                        <th>Buyer Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item, index) => (
                        <React.Fragment key={index}>
                            <tr className="mbn-row">
                                <td>{item.productname}</td>
                                <td>{item.ownername}</td>
                                <td>{item.buyername}</td>
                                <td className="mbn-actions">
                                    <button disabled={item.booking.level !== 0} className="mbn-btn mbn-btn-x" onClick={()=>updatelevelfunction(bids[index],index,1)}>OWNER SUBMITTED</button>
                                    <button disabled={item.booking.level !== 1} className="mbn-btn mbn-btn-y" onClick={()=>updatelevelfunction(bids[index],index,2)}>BUYER RECEIVED</button>
                                    <button disabled={item.booking.level !== 2} className="mbn-btn mbn-btn-z" onClick={()=>updatelevelfunction(bids[index],index,3)}>BUYER RETURNED</button>
                                    <button
                                        className="mbn-btn mbn-btn-view"
                                        onClick={() => toggleRowDetails(index)}
                                    >
                                        {expandedRows[index] ? 'Hide Details' : 'View Details'}
                                    </button>
                                </td>
                            </tr>
                            {expandedRows[index] && (
                                <tr>
                                    <td colSpan="4">
                                        <div className="mbn-details-container">
                                            <img
                                                src={item.productphoto}
                                                alt={item.productname}
                                                className="mbn-details-photo"
                                            />
                                            <p><strong>Owner Email:</strong> {item.owneremail}</p>
                                            <p><strong>Buyer Email:</strong> {item.buyeremail}</p>
                                            <p>
                                                <strong>Booking Dates:</strong>{' '}
                                                {new Date(item.booking.fromDateTime).toLocaleDateString()} -{' '}
                                                {new Date(item.booking.toDateTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManagerBookingNotifications;
