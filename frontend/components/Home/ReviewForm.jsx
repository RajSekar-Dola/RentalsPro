import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../css/Home/ReviewForm.css'; // Import the CSS file

export const ReviewForm = ({ onSubmitSuccess }) => {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMessage();
    const checkLoginStatus = () => {
      const userIdCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("user_id="));

      if (userIdCookie && userIdCookie.split("=")[1]) {
        setIsLogin(true);
      }
    };
    checkLoginStatus();
  }, []);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    setMessage("");
    e.preventDefault();
    if (!isLogin) {
      navigate("/login");
    }
    if (!review || rating === 0) {
      alert("Please provide a review and select a rating.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/home/postreview", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: review.trim(),
          rating: rating,
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        setMessage("Review not successful!");
      } else {
        setMessage("Review submitted successfully!");
      }
    } catch (e) {
      console.log("Failed!");
    }
    setReview('');
    setRating(0);
    onSubmitSuccess();
  };

  return (
    <section className="review-form-container">
      <form onSubmit={handleSubmit} className="review-form">
        <h2>Submit Your Review</h2>

        <div className="textarea-container">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            rows="5"
            className="review-textarea"
          />
        </div>

        <div className="rating-container">
          <label>Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`star ${star <= rating ? "active" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">Submit</button>
      </form>
      <div className="message">{message}</div>
    </section>
  );
};
