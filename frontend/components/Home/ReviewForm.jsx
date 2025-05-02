import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useOnScreen } from './UseOnScreen'; // Import the custom hook
import '../../css/Home/ReviewForm.css'; // Import the CSS file

export const ReviewForm = ({ onSubmitSuccess }) => {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const isVisible = useOnScreen({ id: "review-form" });

  useEffect(() => {
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
        console.log(response)
        setMessage("Review not successful!");
      } else {
        setMessage("Review submitted successfully!");
        setTimeout(() => {
          setReview('');
          setRating(0);
          setMessage('')
        }, 1000);
        onSubmitSuccess();
      }
    } catch (e) {
      console.log("Failed!");
    }

  };

  return (
    <section
      className={`review-form-container  hero-description`} // Apply fade-in when in view
    >         <h2>Submit Your Review</h2>
      <form onSubmit={handleSubmit} className={`review-form hero-description ${isVisible ? "fade-in" : ""}`}  id="review-form" data-testid="review-form">
        <div className="textarea-container hero-description">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            rows="5"
            className="review-textarea"
          />
        </div>

        <div className="rating-container hero-description">
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
        {message && <div style={{color:"black"}}>{message}</div>}
      </form>
      
    </section>
  );
};