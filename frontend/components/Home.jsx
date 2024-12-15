import React,{useState} from "react";
import "../css/Home.css"; // Correct import for the CSS file
import {Reviews} from "./Home/Reviews.jsx"
import { ReviewForm } from "./Home/ReviewForm.jsx";
import {Steps} from"./Home/Steps.jsx";
import { PopularRentals } from "./Home/PopularRentals.jsx";
function Home() {

  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewSubmit = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Increment to notify Testimonials to refresh
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
        <h2 className="poiret-one-regular">WELCOME TO OUR Rentals PRO</h2>
        <p className="hero-description">Find the best products to rent for your needs</p>
        </div>
      </section>
      
      <Steps/>
      <PopularRentals/>
      <div style={{boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}}>
      <Reviews refreshKey={refreshKey}/>
      </div>
      <ReviewForm onSubmitSuccess={handleReviewSubmit}/>
      {/* Contact Us Section */}
    </div>
  );
}

export default Home;