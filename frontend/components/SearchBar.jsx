import React, { useState } from 'react';
import "../css/SearchBar.css"; // Ensure this path is correct based on your project structure

const SearchBar = ({setsearchinput}) => {
    const [input, setInput] = useState('');

    const handleChange = (value) => {
        setInput(value);
        setsearchinput(value);
    };


    return (
        <div style={{width:"75%",fontSize:"1.5rem"}}>
            <input
                style={{backgroundColor:"white"}}
                placeholder='Type to Search...'
                value={input}
                onChange={(e) => handleChange(e.target.value)} // Directly use event value
            />
        </div>
    );
};

export default SearchBar;
