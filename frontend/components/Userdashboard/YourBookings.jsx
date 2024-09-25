import React, { useEffect, useState } from 'react';
import "../../css/Userdashboardcss/YourRentals.css";  // Reusing YourRentals.css

const YourBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("YOUR BOOKINGS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);  // Initialize loading state

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch("http://localhost:3000/grabBookings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Something went wrong");
        } else {
          const data = await response.json();

          // Checking if booking data is valid and updating state
          if (!Array.isArray(data.BookingDetails) || !Array.isArray(data.ProductDetails)) {
            setMessage(data.message || "No Bookings found");
          } else {
            const bookings = data.BookingDetails;
            const products = data.ProductDetails;

            // Merging booking and product details
            const mergedArray = bookings.map((booking) => {
              const product = products.find((prod) => prod._id === booking.product_id) || {};
              return { ...product, ...booking }; // Combine booking and product details
            });
            setBookings(mergedArray);
          }
        }
      } catch (err) {
        setError("An error occurred while fetching account details");
      } finally {
        setLoading(false);  // Set loading to false after the fetch process
      }
    };

    fetchAccountDetails();
  }, []);

  return (
    <div className="your-rentals-page"> {/* Added root class */}
      {/* Uncommented message to display it */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className="rentals-container">
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <div key={index} className="rental-card">
                <h3>{booking.productType.toUpperCase().slice(0, -1)}</h3>
                <p>{booking.productName}</p>
                <p><strong>Location:</strong>{booking.locationName}</p>
                <p><strong>Owner Name:</strong> {booking.username || "N/A"}</p> 
                <p><strong>From:</strong> {new Date(booking.fromDateTime).toLocaleString()}</p>
                <p><strong>To:</strong> {new Date(booking.toDateTime).toLocaleString()}</p>
                <p><strong>Price:</strong> Rs.{booking.price}</p>
                {booking.photo && booking.photo.length > 0 && (
                  <img
                    src={booking.photo[0]}
                    alt={booking.productName}
                    style={{ width: "200px" }}
                  />
                )}
              </div>
            ))
          ) : (
            <p>No Bookings found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default YourBookings;