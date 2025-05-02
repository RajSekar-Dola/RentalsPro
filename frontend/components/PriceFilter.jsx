import React, { useState } from 'react';
import '../css/PriceFilter.css'; // Import the updated CSS file for better styling

const PriceFilter = ({setminprice,setmaxprice}) => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);

  // Handle Min Price Change
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    setMinPrice(value);
    setminprice(value);
  };

  // Handle Max Price Change
  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    setMaxPrice(value);
    setmaxprice(value);

  };

  return (
    <div className="price-filter">
      <div className="price-input">
        <label htmlFor="min-price">Min Price:</label>
        <input
        data-testid="min-price-input"
          type="number"
          id="min-price"
          value={minPrice}
          onChange={handleMinPriceChange}
          placeholder="Min"
          min="0" // Minimum price can't be negative
        />
      </div>
      <div className="price-input">
        <label htmlFor="max-price">Max Price:</label>
        <input
        data-testid="max-price-input"
          type="number"
          id="max-price"
          value={maxPrice}
          onChange={handleMaxPriceChange}
          placeholder="Max"
          min={minPrice || '0'} // Max price should be greater than or equal to min price
        />
      </div>
    </div>
  );
};

export default PriceFilter;