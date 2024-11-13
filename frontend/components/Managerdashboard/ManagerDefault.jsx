import React, { useEffect, useState } from 'react';

const ManagerDefault = () => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const response = await fetch("http://localhost:3000/grabManager", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include" // Include cookies with the request
                });

                if (response.ok) {
                    const managerName = await response.json(); // Expecting just a string
                    console.log("Manager Name:", managerName); // Log the response
                    setName(managerName); // Set the manager name state
                } else {
                    setError("Failed to fetch Manager"); // Handle server errors
                }
            } catch (err) {
                setError("An error occurred while fetching account details"); // Handle network errors
            }
        };

        fetchManager();
    }, []);

    return (
        <div className="welcome-container">
            {error ? (
                <h1 className="error-text">{error}</h1>
            ) : (
                <h1 className="welcome-text">WELCOME MANAGER</h1>
            )}
            {!error && <p className='adminName'>{name}</p>}
        </div>
    );
};

export default ManagerDefault;