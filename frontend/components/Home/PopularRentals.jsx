import React, { useRef, useEffect } from 'react';
import { useOnScreen } from './UseOnScreen'; // Import the custom hook
import '../../css/Home/PopularRentals.css';
import { Link, useNavigate } from 'react-router-dom';
export const PopularRentals = () => {
  const rentalCardsRef = useRef([]);
  const isVisible = useOnScreen({ id: 'popular-rentals' });
  const navigate = useNavigate();
  useEffect(() => {
    // Observer options
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Trigger the animation when 50% of the element is visible
    };

    // Create a new Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in'); // Add the class to trigger animation
          observer.unobserve(entry.target); // Stop observing once the element is visible
        }
      });
    }, options);

    // Only observe rental cards once they are present in the DOM
    if (rentalCardsRef.current.length > 0) {
      rentalCardsRef.current.forEach((card) => {
        if (card) observer.observe(card);
      });
    }

    // Clean up observer when component unmounts or rental cards change
    return () => {
      rentalCardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card); // Clean up observer
      });
    };
  }, []);

  return (
    <section className={`popular-rentals ${isVisible ? 'fade-in' : ''}`} id="popular-rentals">
      <h2>Popular Rentals</h2>
      <div  className="rental-cards hero-description">
      <div onClick={() => navigate("/category/cars")}  className="rental-card" ref={(el) => (rentalCardsRef.current[0] = el)}>
          <img
            src="frontend\assets\popularrentals\car.jpg"
            alt="Car"
            className='popularimage'
          />
          <h3>Car Rental</h3>
          <p>Rent a Car for your next adventure.</p>
        </div>
        <div onClick={() => navigate("/category/bikes")} className="rental-card" ref={(el) => (rentalCardsRef.current[1] = el)}>
          <img
            src="https://www.royalenfield.com/content/dam/royal-enfield/super-meteor-650/motorcycles/home/motorcycle/super-meteor-650-motorcycle.jpg"
            alt="Bike"
            className='popularimage'
          />
          <h3>Bike Rental</h3>
          <p>Rent a bike for your next adventure.</p>
        </div>
        <div onClick={() => navigate("/category/cameras")} className="rental-card" ref={(el) => (rentalCardsRef.current[2] = el)}>
          <img
            src="https://i1.adis.ws/i/canon/eos-r8-frt_gallery-module_05_aa065f319187416e9ccdd3d67a9ba48b?$hotspot-dt-jpg$"
            alt="Camera"
            className='popularimage'
          />
          <h3>Camera Rental</h3>
          <p>Capture your memories with our cameras.</p>
        </div>
        <div onClick={() => navigate("/category/drones")} className="rental-card" ref={(el) => (rentalCardsRef.current[3] = el)}>
          <img
            src="https://m.media-amazon.com/images/I/61OgU7rf79L.AC_UF1000,1000_QL80.jpg"
            alt="Drone"
            className='popularimage'
          />
          <h3>Drone Rental</h3>
          <p>Fly a drone and explore the skies.</p>
        </div>
      </div>
    </section>
  );
};
