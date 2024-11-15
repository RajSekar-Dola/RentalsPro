import React from "react";
import "../css/home.css"; // Correct import for the CSS file

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Our Rentals</h2>
          <p className="hero-description">Find the best products to rent for your needs</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="step">
          <div className="step-icon">1</div>
          <h3>Choose a Product</h3>
          <p>Select from a wide range of products available for rent.</p>
        </div>
        <div className="step">
          <div className="step-icon">2</div>
          <h3>Book It Online</h3>
          <p>Book the product easily through our platform.</p>
        </div>
        <div className="step third-step">
          <div className="step-icon">3</div>
          <h3>Get It Delivered or Collect</h3>
          <p>We can deliver the product to your doorstep or you can collect it yourself.</p>
        </div>
        <div className="step">
          <div className="step-icon">4</div>
          <h3>Enjoy and Return</h3>
          <p>Use the product and return it when you're done.</p>
        </div>
      </section>

      {/* Popular Rentals Section */}
      <section className="popular-rentals">
        <h2>Popular Rentals</h2>
        <div className="rental-cards">
          <div className="rental-card">
            <img
              src="https://www.royalenfield.com/content/dam/royal-enfield/super-meteor-650/motorcycles/home/motorcycle/super-meteor-650-motorcycle.jpg"
              alt="Bike"
            />
            <h3>Bike Rental</h3>
            <p>Rent a bike for your next adventure.</p>
          </div>
          <div className="rental-card">
            <img
              src="https://i1.adis.ws/i/canon/eos-r8-frt_gallery-module_05_aa065f319187416e9ccdd3d67a9ba48b?$hotspot-dt-jpg$"
              alt="Camera"
            />
            <h3>Camera Rental</h3>
            <p>Capture your memories with our cameras.</p>
          </div>
          <div className="rental-card">
            <img
              src="https://m.media-amazon.com/images/I/61OgU7rf79L.AC_UF1000,1000_QL80.jpg"
              alt="Drone"
            />
            <h3>Drone Rental</h3>
            <p>Fly a drone and explore the skies.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-card">
          <p>"Great service and high-quality products!"</p>
          <h4>- John Doe</h4>
        </div>
        <div className="testimonial-card">
          <p>"Very easy process to rent, highly recommend."</p>
          <h4>- Jane Smith</h4>
        </div>
        {/* Additional Reviews */}
        <div className="testimonial-card">
          <p>"Smooth booking process and great customer service. Highly recommend!"</p>
          <h4>- Mark Evans</h4>
        </div>
        <div className="testimonial-card">
          <p>"Affordable and convenient. The delivery service was top-notch."</p>
          <h4>- Linda Brown</h4>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="contact-us">
        <h2>Contact Us</h2>
        <p>Have any questions? Reach out to us!</p>
        <form>
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}

export default Home;