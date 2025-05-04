import React, { useState, useEffect } from 'react';
import '../../css/Admindashboardcss/WelcomeAdmin.css';

const WelcomeAdmin = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
      const fetchAdmin = async () => {
          try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/grabAdmin`, {
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
                  setError("UNAUTHORIZED ACCESS TO ADMIN"); // Handle server errors
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
        <h1 className="welcome-text">WELCOME ADMIN</h1>
      )}
      {!error && <p className='adminName'>{name}</p>}  
    </div>
  );
};

export default WelcomeAdmin;