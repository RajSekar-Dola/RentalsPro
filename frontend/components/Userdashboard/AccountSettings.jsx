import React, { useEffect, useState } from 'react';
import "../../css/Userdashboardcss/AccountSettings.css"

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // Initially empty for security
  });
  const [message, setMessage] = useState('ACCOUNT SETTINGS');
  const [updateMessage, setUpdateMessage] = useState(''); // For user feedback
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState(''); // To display password validation errors

  // Password validation function
  const validPassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordPattern.test(password);
  };

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

    // If the password field is changed, validate the password
    if (name === 'password') {
      if (!validPassword(value)) {
        setPasswordError('Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.');
      } else {
        setPasswordError('');
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if the password is invalid
    if (passwordError) {
      setError('Please correct the errors before submitting.');
      return;
    }

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
          <label htmlFor="username">SET USERNAME</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="email">SET EMAIL</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="password">SET PASSWORD</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>} {/* Show password error */}
        </div>

        <button type="submit" className="save-button" disabled={!!passwordError}>
          Save Changes
        </button> {/* Disable button if password is invalid */}
      </form>
      {updateMessage && <p>{updateMessage}</p>} {/* Display feedback */}
    </div>
  );
};

export default AccountSettings;
