import { use } from 'framer-motion/m';
import React, { useState } from 'react';

const BranchForm = () => {
    const [branchName, setBranchName] = useState('');
    const [message,setmessage]=useState('');
    const handleSubmit =async (e) => {
        e.preventDefault();
        try{
        const response = await fetch('http://localhost:3000/admindashboard/createbranch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({branchname:branchName}),
            credentials: 'include',
        });
        if(!response.ok)
        {   
            const errorResponse = await response.json();
            setmessage(errorResponse.message);
        }
        else{
            setmessage("branch created successfully !");
        }
        setBranchName('');
    }
    catch(error)
    {
        console.log(error);
        setmessage("Internal Srver error");
    }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="branchName">Branch Name:</label>
                <input
                    type="text"
                    id="branchName"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Create</button>
        </form>
    );
};

export default BranchForm;
