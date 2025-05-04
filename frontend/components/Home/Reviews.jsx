import React, { useState, useEffect } from "react";
import { useOnScreen } from './UseOnScreen'; // Import the custom hook
import "../../css/Home/Reviews.css";

export const Reviews = ({ refreshKey }) => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  // Fetch reviews from the server
  // const fetchReviews = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3000/home/getreviews");
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch reviews");
  //     }
  //     const data = await response.json();

  //     // Select top 5 reviews with highest rating, ensuring unique users
  //     const uniqueReviews = [];
  //     const usernames = new Set();

  //     // Sort by rating in descending order
  //     const sortedReviews = data.reviews.sort((a, b) => b.rating - a.rating);

  //     for (const review of sortedReviews) {
  //       if (!usernames.has(review.username)) {
  //         uniqueReviews.push(review);
  //         usernames.add(review.username);
  //       }
  //       if (uniqueReviews.length === 5) break; // Stop when we have 5 reviews
  //     }

  //     setReviews(uniqueReviews);
  //   } catch (err) {
  //     console.error("Error fetching reviews:", err);
  //   }
  // };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/home/getreviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };
  

  useEffect(() => {
    fetchReviews();
  }, [refreshKey]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getPositionClass = (index) => {
    const relativeIndex = (index - currentIndex + reviews.length) % reviews.length;

    if (relativeIndex === 0) return "testimonial-center";
    if (relativeIndex === 1) return "testimonial-right";
    if (relativeIndex === reviews.length - 1) return "testimonial-left";
    return "testimonial-hidden";
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating); // Display stars based on rating
  };

  const isVisible = useOnScreen({ id: "reviews-section" }); // Apply hook for reviews section

  if (reviews.length === 0) {
    return <p className="testimonial-loading">Loading reviews...</p>;
  }

  return (
    <>
      
      <section
        className={`testimonial-testimonials fade-in`} // Apply fade-in class when in view
        id="reviews-section"
      ><h2>What Our Users Say</h2>
        <div className="testimonial-slider">
          {reviews.map((review, index) => (
            <div
              className={`testimonial-card ${getPositionClass(index)}`}
              key={index}
            >
              <p>"{review.text}"</p>
              <div className="testimonial-stars">{renderStars(review.rating)}</div>
              <h4>- {review.username}</h4>
            </div>
          ))}
        </div>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
        <button className="testimonial-nav-button testimonial-left" onClick={handlePrev}>
          &#8592;
        </button>
        <button className="testimonial-nav-button testimonial-right" onClick={handleNext}>
          &#8594;
        </button>
      </div>
      </section>


    </>
  );
};