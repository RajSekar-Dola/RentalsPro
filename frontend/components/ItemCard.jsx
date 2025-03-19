import React, { useEffect, useRef, useState } from 'react';
import '../css/ItemCard.css';
import { useNavigate } from 'react-router-dom';

function ItemCard({
  product_id,
  productName,
  locationName,
  fromDateTime,
  toDateTime,
  price,
  photo,
  frombookingdate,
  tobookingdate,
}) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.3,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setIsVisible(entry.isIntersecting));
    }, observerOptions);

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const queryparams = new URLSearchParams({
    frombookingdate,
    tobookingdate,
  }).toString();

  const bookingurl = `/productbooking/${product_id}?${queryparams}`;
  const productPageUrl = `/products/${product_id}?${queryparams}`;

  const handleCardClick = (event) => {
    if (!frombookingdate || !tobookingdate) {
      alert("Please select both 'from' and 'to' dates before proceeding.");
    } else if (event.target.tagName !== 'BUTTON') {
      navigate(productPageUrl);
    }
  };

  const handleBookingClick = (event) => {
    event.stopPropagation();
    if (!frombookingdate || !tobookingdate) {
      alert("Please select both 'from' and 'to' dates before proceeding.");
    } else {
      navigate(bookingurl);
    }
  };

  return (
    <div
      className={`item-card ${isVisible ? 'visible' : ''}`}
      ref={cardRef}
      onClick={handleCardClick}
    >
      <img src={photo} alt={productName} />
      <div className="itemcard-pricebookdetails">
        {/* Product name visible by default */}
        <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly",margin:"5%"}}>
        <span className="itemcard-product-product-name" style={{fontWeight:600}} >{productName.toUpperCase()}</span>
        <span className="itemcard-product-price">Rs. {price} / hour</span>
        </div>
        {/* Hidden content visible on hover */}

        {/* <span className="itemcard-product-date-range">
          {fromDateTime} - {toDateTime}
        </span> */}
        <div id="price_book">
        <h3 className="itemcard-product-location">{locationName}</h3>
          <button className="itemcard-product-book-button" onClick={handleBookingClick}>
            Book
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default ItemCard;
 