import React, { useEffect, useState } from 'react'; 
import "../../css/Userdashboardcss/AccountDetails.css";

const AccountDetails = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/grabDetails`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setName(data.username);
          setEmail(data.email);
        } else {
          setError("Failed to fetch account details");
        }
      } catch (err) {
        setError("An error occurred while fetching account details");
      }
    };

    fetchAccountDetails();
  }, []);

  return (
    <div className="container-1">
      <h2 className="header-1">Account Details</h2>
      <div className="details-1">
        <span className="label-1">USERNAME:</span> {name}
      </div>
      <div className="details-1">
        <span className="label-1">EMAIL:</span> {email}
      </div>
      {error && <div className="error-1">{error}</div>}
    </div>
  );
};

export default AccountDetails;