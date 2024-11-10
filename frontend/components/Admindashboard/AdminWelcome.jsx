import React, { useState, useEffect } from 'react';
import '../../css/Admindashboardcss/WelcomeAdmin.css';

const WelcomeAdmin = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
      const fetchAdmin = async () => {
          try {
              const response = await fetch("http://localhost:3000/grabAdmin", {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  credentials: "include" // Include cookies with the request
              });

              if (response.ok) {
                  const data = await response.json(); // Expecting an object now
                  console.log("Admin Data:", data); // Log the response
                  setName(data.name); // Set the admin name state from the object
              } else {
                  setError("Failed to fetch Admin"); // Handle server errors
              }
          } catch (err) {
              setError("An error occurred while fetching account details"); // Handle network errors
          }
      };

      fetchAdmin();
  }, []);

  return (
    <div className="welcome-container">
      {error ? (
        <h1 className="error-text">{error}</h1>
      ) : (
        <h1 className="welcome-text">WELCOME {name}</h1>
      )}
    </div>
  );
};

export default WelcomeAdmin;