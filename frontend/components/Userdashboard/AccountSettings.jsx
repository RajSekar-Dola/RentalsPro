import React, { useEffect, useState } from "react";
import "../../css/Userdashboardcss/AccountSettings.css";

const validateUsername = (username) => /^[a-z][a-z0-9]{4,}$/.test(username);
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|int|info|biz|co|in|us|uk|io|ai|tech|me|dev|xyz|live|store|tv)$/i.test(email);
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "", // Initially empty for security
  });
  const [message, setMessage] = useState("");
  const [updateMessage, setUpdateMessage] = useState(""); // For user feedback
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/grabDetails`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            username: data.username,
            email: data.email,
            password: "", // Keep password hidden
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

    // Perform validations
    if (!validateUsername(formData.username)) {
      setError("Username: at least 5 characters, lowercase letters/digits, starts with a lowercase letter.!");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Invalid email address.");
      return;
    }
    if (formData.password && !validatePassword(formData.password)) {
      setError(
        "Invalid password. It must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    try {
      const body = {
        editUsername: formData.username,
        email: formData.email,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/settings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const responseData = await response.json(); // Parse server response

      if (response.ok) {
        setUpdateMessage(responseData.message || "Details updated successfully!");
        setError("");
      } else {
        setError(responseData.message || "Failed to update details");
      }

      setTimeout(() => {
        setUpdateMessage("");
      }, 3000);

      // Refetch the latest details after the update
      const updatedResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/grabDetails`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setFormData({
          username: updatedData.username,
          email: updatedData.email,
          password: "", // Keep password hidden again
        });
      } else {
        throw new Error("Failed to fetch updated details");
      }
    } catch (err) {
      setError("An error occurred while updating details");
    }
  };

  return (
    <>
      <h2>{message}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="account-settings-page">
        <h2>ACCOUNT SETTINGS</h2>
        <div className="settings-field">
          <label htmlFor="username">USERNAME</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="email">EMAIL</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="password">PASSWORD</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="save-button">
          SAVE CHANGES
        </button>
      </form>
      {updateMessage && <p style={{ color: "green" }}>{updateMessage}</p>}
    </>
  );
};

export default AccountSettings;
