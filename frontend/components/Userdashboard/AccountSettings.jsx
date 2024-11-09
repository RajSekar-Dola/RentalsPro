import React, { useEffect, useState } from 'react';
import "../../css/Userdashboardcss/AccountSettings.css";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('ACCOUNT SETTINGS');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

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
            password: '', // Do not pre-fill password
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

    // Validate password if it's the password input
    if (name === "password") {
      validatePassword(value);
    }

    // Validate email if it's the email input
    if (name === "email") {
      validateEmail(value);
    }
  };

  const validatePassword = (password) => {
    // Password validation pattern
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (passwordPattern.test(password)) {
      setPasswordError('');
      setPasswordStrength(password.length >= 8 ? 'Strong' : 'Medium');
    } else {
      setPasswordError('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.');
      setPasswordStrength('');
    }
  };

  const validateEmail = (email) => {
    // Email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|int|info|biz|co|in|us|uk|io|ai|tech|me|dev|xyz|live|store|tv)$/i;

    if (emailPattern.test(email)) {
      setEmailError('');
    } else {
      setEmailError('Invalid email format. Please enter a valid email address.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if password or email validation has failed before submitting
    if (passwordError || emailError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/settings", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Details updated successfully!');
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setError('Failed to update details');
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
            style={{ border: emailError ? '2px solid red' : '' }}
          />
          {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
        </div>

        <div className="settings-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            style={{ border: passwordError ? '2px solid red' : '' }}
          />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          <label className="password-strength">Password Strength: {passwordStrength}</label>
        </div>

        <button type="submit" className="save-button">Save Changes</button>
      </form>
    </div>
  );
};

export default AccountSettings;
