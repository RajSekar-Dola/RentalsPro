import React, { useState, useRef, useEffect } from 'react';
import "../css/RentForm.css";
import { useNavigate } from 'react-router-dom';
const RentForm = () => {
    const [formData, setFormData] = useState({
        productType: '', productName: '', locationName: '', fromDate: '', toDate: '', price: ''
    });
    const [images, setImages] = useState([]); // Store images as File objects
    const [message, setmessage] = useState('');
    const [Error, setError] = useState(false);
    const fileInputRef = useRef(null); // Ref for the file input
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);

    const maxPriceMap = {
        "bikes": 100,
        "cars": 200,
        "speakers": 50,
        "fishingrods": 50,
        "drones": 100,
        "cameras": 100,
    };

    const [currentMaxPrice, setCurrentMaxPrice] = useState(null);
    const [minFromDate, setMinFromDate] = useState('');
    const [minToDate, setMinToDate] = useState('');

    useEffect(() => {
        fetch('http://localhost:3000/locations')
            .then((response) => response.json())
            .then((data) => setLocations(data.locations))
            .catch((error) => console.error('Error fetching locations:', error));

    }, []);

    useEffect(() => {
        const now = new Date();
        const roundedNow = roundUpToNextHalfHour(now);
        const minFrom = new Date(roundedNow.getTime() + 30 * 60000); // Add 30 minutes
        setMinFromDate(formatDateTimeLocal(minFrom));
    }, []);

    useEffect(() => {
        if (formData.fromDate) {
            const from = new Date(formData.fromDate);
            const minTo = new Date(from.getTime() + 24 * 60 * 60000); // Add 1 day
            setMinToDate(formatDateTimeLocal(minTo));
            if (formData.toDate && new Date(formData.toDate) < minTo) {
                setFormData(prev => ({ ...prev, toDate: '' }));
            }
        } else {
            setMinToDate('');
        }
    }, [formData.fromDate]);
    const roundUpToNextHalfHour = (date) => {
        const ms = 1000 * 60 * 30; // 30 minutes in milliseconds
        return new Date(Math.ceil(date.getTime() / ms) * ms);
    };
    const formatDateTimeLocal = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'productType') {
            setCurrentMaxPrice(maxPriceMap[value] || null);
            if (formData.price && maxPriceMap[value] && Number(formData.price) > maxPriceMap[value]) {
                setFormData(prev => ({ ...prev, price: '' }));
                setmessage(`Price exceeds the maximum limit for ${value}. Please enter a valid price.`);
                setError(true);
                return;
            } else {
                setmessage("");
                setError(false);
            }
        }
        if (name === 'price') {
            const priceValue = Number(value);
            if (currentMaxPrice && priceValue > currentMaxPrice) {
                setError(true);
                setmessage(`Price must be ₹${currentMaxPrice} or less for ${formData.productType}.`);
            } else if (priceValue < 1) {
                setError(true);
                setmessage("Price must be at least ₹1.");
            } else {
                setError(false);
                setmessage("");
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files)); // Store all selected files in the array
        setmessage("");
        setError(false);
    };

    const validateDates = (from, to) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const nowPlus30 = new Date();
        nowPlus30.setMinutes(nowPlus30.getMinutes() + 30);
        const roundedNow = roundUpToNextHalfHour(nowPlus30);

        if (fromDate < roundedNow) {
            setError(true);
            setmessage("The 'Rent From' date and time must be at least 30 minutes from now.");
            return false;
        }
        const minToDate = new Date(fromDate.getTime() + 24 * 60 * 60000); // Add 1 day

        if (toDate < minToDate) {
            setError(true);
            setmessage("The 'Rent Upto' date and time must be at least 1 day after the 'Rent From' date.");
            return false;
        }

        return true;
    };

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const handleSubmit = async (e) => {
        const userid = getCookieValue('user_id');
        if (!userid) {
            sessionStorage.setItem('lastpage', 'bookingpage');
            navigate('/login');
            return;
        }
        e.preventDefault();
        setmessage("");
        setError(false);
        if (!validateDates(formData.fromDate, formData.toDate)) {
            return;
        }
        if (images.length === 0) {
            setError(true);
            setmessage("Please upload at least one image.");
            return;
        }
        const price = Number(formData.price);
        if (isNaN(price) || price < 1) {
            setError(true);
            setmessage("Price must be at least ₹1.");
            return;
        }
        if (currentMaxPrice && price > currentMaxPrice) {
            setError(true);
            setmessage(`Price must be ₹${currentMaxPrice} or less for ${formData.productType}.`);
            return;
        }

        try {
            setmessage("");
            const base64Images = await Promise.all(images.map(image => convertToBase64(image))); // Convert images to base64
            const response = await fetch('http://localhost:3000/RentForm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    image: base64Images,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.log(errorResponse.errormessage);
                setError(true);
                setmessage(errorResponse.errormessage || "An error occurred.");
            } else {
                console.log("Form submitted:", formData);
                setmessage("Form submitted successfully!");
                setFormData({
                    productType: '',
                    productName: '',
                    locationName: '',
                    fromDate: '',
                    toDate: '',
                    price: ''
                });
                setImages([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset file input using ref
                }
                setCurrentMaxPrice(null);
                setError(false);
                const now = new Date();
                const roundedNow = roundUpToNextHalfHour(now);
                const minFrom = new Date(roundedNow.getTime() + 30 * 60000); // Add 30 minutes
                setMinFromDate(formatDateTimeLocal(minFrom));
                setMinToDate('');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (error) {
            console.log("Error during submission:", error);
            setError(true)
            setmessage("An error occurred during submission. Please try again.");
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div>
            <form id='productForm' style={{ display: 'flex', flexDirection: "column" }} onSubmit={handleSubmit}>
                <label htmlFor='productType'>SELECT PRODUCT TYPE:</label>
                <select id='productType' name='productType' value={formData.productType} onChange={handleChange} required>
                    <option value="">Select a product</option>
                    <option value="cars">CAR</option>
                    <option value="bikes">BIKE</option>
                    <option value="cameras">CAMERA</option>
                    <option value="drones">DRONE</option>
                    <option value="fishingrods">FISHING ROD</option>
                    <option value="speakers">SPEAKER</option>
                    <option value="cycles">CYCLE</option>
                </select>

                <label htmlFor="ProductName">ProductName</label>
                <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                    autoComplete='on'
                />

                <label htmlFor='locationName'>SELECT LOCATION:</label>
                <select id='locationName' name='locationName' value={formData.locationName} onChange={handleChange} required>
                    <option value="">Select a location</option>
                    {locations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                    ))}
                </select>

                <label htmlFor='fromDate'>RENT FROM:</label>
                <input
                    type='datetime-local'
                    id='fromDate'
                    name='fromDate'
                    value={formData.fromDate}
                    onChange={handleChange}
                    required
                    min={minFromDate}
                    step="1800" // 30 minutes
                />

                <label htmlFor='toDate'>RENT UPTO:</label>
                <input
                    type='datetime-local'
                    id='toDate'
                    name='toDate'
                    value={formData.toDate}
                    onChange={handleChange}
                    required
                    min={minToDate}
                    step="1800" // 30 minutes
                />

                <label htmlFor='price'>PRICE:</label>
                <input
                    type='number'
                    id='price'
                    name='price'
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="1"
                    step="1"
                />
                {currentMaxPrice && (
                    <span style={{ color: 'gray', fontSize: '0.9em' }}>
                        Maximum price for {formData.productType}: ₹{currentMaxPrice}
                    </span>
                )}

                <label htmlFor='photo'>UPLOAD PHOTO OF PRODUCT</label>
                <input ref={fileInputRef} id='photo' accept='image/*' type='file' multiple onChange={handleImageChange} required />

                <button type='submit'>SUBMIT</button>

                <br />
                <div id="message" className={`message ${Error ? 'error-message' : 'success-message'}`}>
                    {message}
                </div>
            </form>
        </div>
    );
};

export default RentForm;