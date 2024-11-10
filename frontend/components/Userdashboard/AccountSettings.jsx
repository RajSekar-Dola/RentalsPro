import React, { useEffect, useState } from 'react';
import "../../css/Userdashboardcss/AccountSettings.css";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // Initially empty for security
  });
  const [message, setMessage] = useState('ACCOUNT SETTINGS');
  const [updateMessage, setUpdateMessage] = useState(''); // For user feedback
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("http://localhost:3000/grabDetails", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            username: data.username,
            email: data.email,
            password: '', // Keep password hidden
          });
        } else {
          setError("Failed to fetch account details");
        }
      } catch (err) {
        setError("An error occurred while fetching account details");
      }
    };

    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/settings", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editUsername: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setUpdateMessage('Details updated successfully!');
        setMessage('ACCOUNT SETTINGS');
      } else {
        setError('Failed to update details');
      }

      setTimeout(() => {
        setUpdateMessage('');
      }, 3000);

      // Refetch the latest details after the update
      const updatedResponse = await fetch("http://localhost:3000/grabDetails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setFormData({
          username: updatedData.username,
          email: updatedData.email,
          password: '', // Keep password hidden again
        });
      } else {
        throw new Error('Failed to fetch updated details');
      }

    } catch (err) {
      setError('An error occurred while updating details');
    }
  };

  return (
    <div className="account-settings-page">
      <h2>{message}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="settings-container">
        <div className="settings-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="save-button">Save Changes</button>
      </form>
      {updateMessage && <p>{updateMessage}</p>} {/* Display feedback */}
    </div>
  );
};

export default AccountSettings;