// import React, { useEffect, useRef, useState } from 'react';
// import '../css/ItemCard.css';
// import { useNavigate } from 'react-router-dom';

// function ItemCard({ product_id, productName, locationName, fromDateTime, toDateTime, price, photo, frombookingdate, tobookingdate }) {
//   const cardRef = useRef(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const navigate = useNavigate();
//   useEffect(() => {
//     const observerOptions = {
//       root: null, // viewport
//       threshold: 0.3, // 30% of the element must be visible to trigger
//     };
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         } else {
//           setIsVisible(false);
//         }
//       });
//     }, observerOptions);

//     if (cardRef.current) {
//       observer.observe(cardRef.current);
//     }

//     return () => {
//       if (cardRef.current) {
//         observer.unobserve(cardRef.current);
//       }
//     };
//   }, []);

//   const queryparams = new URLSearchParams({
//     frombookingdate,
//     tobookingdate,
//   }).toString();

//   const bookingurl = `/productbooking/${product_id}?${queryparams}`;
//   const productPageUrl = `/products/${product_id}?${queryparams}`;

//   const handleCardClick = (event) => {
//     if (!frombookingdate || !tobookingdate) {
//       alert("Please select both 'from' and 'to' dates before proceeding.");
//     }
//     else if (event.target.tagName !== 'BUTTON') {
//       navigate(productPageUrl);
//     }
//   };

//   const handleBookingClick = (event) => {
//     event.stopPropagation();
//     if (!frombookingdate || !tobookingdate) {
//       alert("Please select both 'from' and 'to' dates before proceeding.");
//     } else {
//       navigate(bookingurl);
//     }
//   };
//   return (
//     <div className={`item-card ${isVisible ? 'visible' : ''}`} ref={cardRef} onClick={handleCardClick}>
//       <div>{productName}</div>
//       <div><img src={photo} alt={productName} /></div>
//       <div className="location">{locationName}</div>
//       <div className="date-range">{fromDateTime} - {toDateTime}</ div>
//       <div id="price_book">
//         <span className="price">Rs.{price} / hour</span>
//         <button onClick={handleBookingClick}>Book</button>
//       </div>
//     </div>
//   );
// }

// export default ItemCard;

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
      <div>{productName}</div>
      <div>
        <img src={photo} alt={productName} />
      </div>
      <div>
      <div className="location">{locationName}</div>
      <div className="date-range">
        {fromDateTime} - {toDateTime}
      </div>
      <div id="price_book">
        <span className="price">Rs. {price} / hour</span>
        <button onClick={handleBookingClick}>Book</button>
      </div>
      </div>
    </div>
  );
}

export default ItemCard;
