import React, { useState } from 'react';

const AddLocation = () => {
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState(''); // To store success/error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/addBranch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: location }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Location added successfully!');
        setLocation('');
      } else {
        setMessage(result.message); 
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while adding the location.');
    }
  };

  return (
    <div>
      <h2>Add Location</h2>
      <form id="locationForm" onSubmit={handleSubmit}>
        <label htmlFor="branch-B">Location Name:</label>
        <input
          type="text"
          required
          id="branch-B"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">SUBMIT</button>
      </form>
      {message && <p>{message}</p>} {/* Display success or error message */}
    </div>
  );
};

export default AddLocation;
