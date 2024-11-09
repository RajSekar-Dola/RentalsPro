import React, { useState, useEffect } from 'react';

const ManagerForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        branch: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [locations, setLocations] = useState([]);

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    useEffect(() => {
        fetch('http://localhost:3000/locations')
            .then((response) => response.json())
            .then((data) => setLocations(data.locations))
            .catch((error) => console.error('Error fetching locations:', error));

            console.log(locations);
    }, []);

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
            }
        } catch (error) {
            console.error("Error during submission:", error);
            setMessage("An error occurred during submission. Please try again.");
            setError(true);
        }
    };

    return (
        <div>
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
                    <option value="">Select a location</option>
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
    );
};

export default ManagerForm;