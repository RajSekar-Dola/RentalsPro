// import React, { useState } from 'react';
// import "../css/SearchBar.css"; // Ensure this path is correct based on your project structure

// const SearchBar = ({setsearchinput}) => {
//     const [input, setInput] = useState('');

//     const handleChange = (value) => {
//         setInput(value);
//         setsearchinput(value);
//     };


//     return (
//         <div style={{width:"75%",fontSize:"1.5rem"}}>
//             <input
//                 style={{backgroundColor:"white"}}
//                 placeholder='Type to Search...'
//                 value={input}
//                 onChange={(e) => handleChange(e.target.value)} // Directly use event value
//             />
//         </div>
//     );
// };

// export default SearchBar;

import React, { useState, useEffect, useRef } from 'react';
import "../css/SearchBar.css";

const SearchBar = ({ setsearchinput }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/autocomplete?query=${encodeURIComponent(input)}`,
          { credentials: 'include' }
        );

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setsearchinput(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.productName);
    setsearchinput(suggestion.productName);
    setSuggestions([]);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search products..."
        value={input}
        onChange={handleChange}
        autoComplete="off"
      />
      
      {isLoading && <div className="search-loading">Loading...</div>}

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion._id}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.productName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;