// YourRentals.js

import React, { useEffect, useState } from 'react';
import "../../css/Userdashboardcss/YourRentals.css";

const YourRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState("YOUR RENTALS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch("http://localhost:3000/grabRentals", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          if (!Array.isArray(data.rentedProducts)) {
            setMessage(data.message || "No rentals found");
          } else {
            setRentals(data.rentedProducts);
          }
        } else {
          setError("Failed to fetch account details");
        }
      } catch (err) {
        setError("An error occurred while fetching account details");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, []);

  return (
    <div className="your-rentals-page">
      <h2>{message}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="rentals-container">
          {rentals.length > 0 ? (
            rentals.map((rental, index) => (
              <div key={index} className="rental-card">
                {rental.photo && rental.photo.length > 0 && (
                  <img
                    src={rental.photo[0]}
                    alt={rental.productName}
                  />
                )}
                <div className="card-content">
                  <p><strong>Name:</strong> {rental.productName}</p>
                  <p><strong>Type:</strong> {rental.productType.toUpperCase()}</p>
                  <p><strong>Location:</strong> {rental.locationName}</p>
                  <p><strong>From:</strong> {new Date(rental.fromDateTime).toLocaleString()}</p>
                  <p><strong>To:</strong> {new Date(rental.toDateTime).toLocaleString()}</p>
                  <p><strong>Price:</strong> Rs.{rental.price} /hr</p>
                </div>
              </div>
            ))
          ) : (
            <p>No rentals found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default YourRentals;
