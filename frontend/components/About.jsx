import React from "react";
import "../css/About.css";

const About = () => {
  return (
    <div className="about-us-page">
      <h1>About Us</h1>
      <div id="about-central">
        <div id="about-left">
          <div id="mission">
            <h2>Our Mission</h2>
            <p>We aim to connect people with the equipment they need in a fast, reliable, and cost-effective way. Our goal is to become the top platform for all rental needs.</p>
          </div>
        </div>
        <div id="about-right">
          <p>Welcome to our rentals website! We specialize in renting out bikes, cars, cameras, drones, speakers, and fishing rods.</p>
          <p>Our platform allows people to rent a wide variety of items with ease, and provides a seamless experience for both renters and owners.</p>
          <p>We offer three user types: <strong>Admin</strong>, <strong>Manager</strong>, and <strong>User</strong>, each with tailored functionalities and dashboards.</p>
          <p>Whether you're looking to rent your gear or borrow equipment, we are here to make it simple and efficient.</p>
        </div>
      </div>
    </div>
  );
};

export default About;