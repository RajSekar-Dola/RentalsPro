import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/SignupLogin.css';

const SignupForm = () => {
  sessionStorage.setItem('lastpage',"signup");
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [dateofbirth, setdateofbirth] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');


  function validateUsername(username) {
    return /^[a-z][a-z0-9]{4,}$/.test(username);
}


  useEffect(() => {
    if (!isFocused && email !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|int|info|biz|co|in|us|uk|io|ai|tech|me|dev|xyz|live|store|tv)$/i;
      setEmailError(!emailPattern.test(email));
    }
  }, [isFocused, email]);

  useEffect(()=>{
    if (dateofbirth&&!validAge(dateofbirth)) {
      setError(true);
      setMessage("You must be at least 18 years old to sign up.");
      return;
    }
    else{
      setError(false);
      setMessage('');
    }
  
  },[dateofbirth])

  useEffect(() => {
    setConfirmPasswordError(password !== confirmpassword);
  }, [confirmpassword, password]);

  useEffect(() => {
    if (password.length >= 8) {
      setPasswordStrength('Strong');
    } else if (password.length >= 4) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  }, [password]);

  const handleFocus = () => {
    setEmailError(false);
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const validAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const validPassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordPattern.test(password);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);
    
    if(!validateUsername(username))
    {
      setError(true);
      setMessage("Username: at least 5 characters, lowercase letters/digits, starts with a lowercase letter.!")
      return
    }

    if (!validPassword(password)) {
      setError(true);
      // setMessage("Password must be 8 characters with upper, lower, digit, and special character.");
      setMessage("Invalid password. It must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    if (password !== confirmpassword) {
      setError(true);
      setMessage("Password and confirm password must be equal!");
      return;
    }
  
    if (!validAge(dateofbirth)) {
      setError(true);
      setMessage("You must be at least 18 years old to sign up.");
      return;
    }
  
    if (emailError) { 
      setError(true);
      setMessage("Please enter a valid email!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, dateofbirth, password }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        console.log(errorResponse.errormessage);
        setError(true);
        setMessage(errorResponse.errormessage || "Error occurred!");
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setdateofbirth('');
        setError(false);
        setMessage('Signup successful!');
        sessionStorage.setItem('lastpage', 'signup');
        setTimeout(() => {
          navigate('/login');
        }, 1000);   
      }
    } catch (error) {
      setError(true);
      setMessage('An unexpected error occurred.');
      console.log(error);
    }
  };

  return (
    <div id="signin-login-page">
      {/* <div><img id="leftimage" src={leftimage}></img></div> */}
      <div>
      <div className="auth-toggle">

      <button
            className="activebutton"
            onClick={() => navigate('/Signup')}
          >
            Signup
          </button>

          <button className='inactivebutton'
            onClick={() => navigate('/login')}
          >
            Login
          </button>

        </div>
    <div className="signup-login-container signin-animate">
      <div>
      <h2 className="signup-login-title">Signup</h2>

      <form id="signupForm" className="signup-login" onSubmit={handleSubmit}>
        <label htmlFor="username" className="form-label">Username</label>
        <input 
          type="text" 
          id="username" 
          className="form-input" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          autoComplete='on'
        />

        <label htmlFor="email" className="form-label">Email ID</label>
        <input 
          type="email" 
          id="email" 
          className="form-input" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          onFocus={handleFocus} 
          onBlur={handleBlur}
          style={{ border: emailError ? "2px solid red" : "" }} 
          required 
          autoComplete='on'
        />

        <label htmlFor='dateofbirth' className="form-label">Date of Birth</label>
        <input
          type="date"
          id="dateofbirth"
          className="form-input"
          value={dateofbirth}
          onChange={(e) => {setdateofbirth(e.target.value)}}
          required
        />

        <label htmlFor="password" className="form-label">Password</label>
        <input 
          type="password" 
          id="password" 
          className="form-input" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        <label htmlFor="confirmpassword" className="form-label">Confirm Password</label>
        <input 
          type="password" 
          id="confirmpassword" 
          className="form-input" 
          value={confirmpassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          style={{ border: confirmPasswordError ? "2px solid red" : "" }} 
          required 
        />
        <label className="form-password-strength">Password Strength: {passwordStrength}</label>
        <button type="submit" className="form-button">Sign Up</button>
        <div id="message-login" className={` ${error ? 'error-message-login' : 'success-message-login'}`}>
          {message}
        </div>
      </form>
    </div>
    </div>
    </div>
</div>
  );
};
export default SignupForm;