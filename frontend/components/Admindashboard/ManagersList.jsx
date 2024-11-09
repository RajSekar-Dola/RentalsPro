import React, { useState, useEffect } from 'react';
import '../../css/Admindashboardcss/users.css';

const Managers = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    branch: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [managers, setManagers] = useState([]);
  const [count, setCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectManagerId, setSelectManagerId] = useState(null);
  const [deletingManagers, setDeletingManagers] = useState(new Set());
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/locations')
        .then((response) => response.json())
        .then((data) => setLocations(data.locations))
        .catch((error) => console.error('Error fetching locations:', error));
}, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:3000/admindashboard/registeredmanagers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setManagers(data.managers);
      setCount(data.registercount);
    } catch (error) {
      setError('Failed to fetch Managers');
      console.error(error);
    }
  };

  const handleDelete = async (id, forceDelete = false) => {
    try {
      const response = await fetch('http://localhost:3000/admindashboard/deletemanagers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_id: id, forceDelete }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.alert) {
        setShowConfirm(true);
        setSelectManagerId(id);
      } else {
        setDeletingManagers((prev) => new Set(prev).add(id));

        setTimeout(() => {
          setManagers((prevManagers) => prevManagers.filter((manager) => manager._id !== id));
          setCount((prevCount) => prevCount - 1);
          setDeletingManagers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }, 1000);
      }
    } catch (error) {
      setError('Failed to delete manager');
      console.error(error);
    }
  };

  const confirmDelete = () => {
    if (selectManagerId) {
      handleDelete(selectManagerId, true);
      setShowConfirm(false);
      setSelectManagerId(null);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage('');
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    const { username, email, password, branch } = formData;

    if (!username || !email || !password || !branch) {
      setMessage("All fields are required.");
      setError(true);
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/admindashboard/createmanager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setMessage(errorResponse.error || "An error occurred.");
        setError(true);
      } else {
        setMessage("Form submitted successfully!");
        setError(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          branch: ''
        });
        fetchManagers(); // Fetch updated managers after submission
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setMessage("An error occurred during submission. Please try again.");
      setError(true);
    }
  };

  return (
    <>
      <div className="user-management">
        <h1>Registered Managers</h1>
        <div className="countboard">
          <p>Total Registered Managers</p>
          <span>{count}</span>
        </div>
        {error && <p className="error">{error}</p>}
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers && managers.map((manager) => (
              <tr key={manager._id} className="user-row">
                {deletingManagers.has(manager._id) ? (
                  <td colSpan="4" className="delete-message">
                    Manager deleted successfully!
                  </td>
                ) : (
                  <>
                    <td>{manager.username}</td>
                    <td>{manager.email}</td>
                    <td>{manager.branch}</td>
                    <td>
                      <button onClick={() => handleDelete(manager._id)} className="delete-button">
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <p>Are you sure you want to delete this manager?</p>
              <div className="modal-buttons">
                <button onClick={confirmDelete} className="confirm-button">Yes, Delete</button>
                <button onClick={() => setShowConfirm(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2>Create New Manager</h2>
        <form id='ManagerForm' style={{ display: 'flex', flexDirection: "column" }} onSubmit={handleSubmit}>
          <label htmlFor='username'>USERNAME:</label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete='on'
          />

          <label htmlFor='email'>EMAIL:</label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor='password'>PASSWORD:</label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor='branch'>Branch:</label>
          <select id='branch' name='branch' value={formData.branch} onChange={handleChange} required>
            <option value="">Select a branch</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>

          <button type='submit'>SUBMIT</button>

          <br />
          <div id="message" className={`message ${error ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        </form>
      </div>
    </>
  );
};

export default Managers;