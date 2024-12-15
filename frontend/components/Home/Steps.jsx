import React, { useState, useEffect, useRef } from 'react';
import '../../css/Home/Steps.css';
import { useOnScreen } from './UseOnScreen';

export const Steps = () => {
  const stepIconsRef = useRef([]);
  const isVisible = useOnScreen({ id: 'how-it-works' });

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

    // Only observe step icons once they are present in the DOM
    if (stepIconsRef.current.length > 0) {
      stepIconsRef.current.forEach((icon) => {
        if (icon) observer.observe(icon);
      });
    }

    // Clean up observer when component unmounts or steps change
    return () => {
      stepIconsRef.current.forEach((icon) => {
        if (icon) observer.unobserve(icon); // Clean up observer
      });
    };
  }, []);

  return (
    <section className={`how-it-works ${isVisible ? 'fade-in' : ''}`} id="how-it-works">
      <h2 style={{
        background: "linear-gradient(90deg,#f6f8fb 0%,#355593 50%, #06193d 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        MozBackgroundClip: "text",
        MozTextFillColor: "transparent",
      }}>
        HOW IT WORKS
      </h2>

      <div className='steps'>
        <div className="step" ref={(el) => (stepIconsRef.current[0] = el)}>
          <div className="step-icon"  >1</div>
          <h3>CHOOSE A PRODUCT</h3>
          <p>Select a product available for rent.</p>
        </div>
        <div className="step" ref={(el) => (stepIconsRef.current[1] = el)}>
          <div className="step-icon">2</div>
          <h3>Book It Online</h3>
          <p>Book the product easily through our platform.</p>
        </div>
        <div className="step" ref={(el) => (stepIconsRef.current[2] = el)}>
          <div className="step-icon">3</div>
          <h3>Collect it.</h3>
          <p>Collect it at your location's branch.</p>
        </div>
        <div className="step" ref={(el) => (stepIconsRef.current[3] = el)}>
          <div className="step-icon">4</div>
          <h3>Enjoy and Return</h3>
          <p>Use the product and return it when you're done.</p>
        </div>
      </div>
    </section>
  );
};
