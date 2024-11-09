import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/SignupLogin.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');  // Default role is 'User'
  const [message, setMessage] = useState('');
  const [Error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),  // Send role in request
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.errormessage);
        setError(true);
        setMessage(data.errormessage || "Error occurred!");
      } else {
        setUsername('');
        setPassword('');
        setError(false);
        setMessage('Sign In successful!');

        // Navigate based on role
        if (role === 'Manager') {
          navigate('/managerPage');
        }else if(role === 'Admin'){
          navigate("/adminpage")
        }else {
          const sessionvalue = sessionStorage.getItem('lastpage');
          if (sessionvalue === "NotFound" || sessionvalue === "signup") {
            sessionStorage.setItem('lastpage', 'login');
            navigate('/');
            return;
          } else {
            sessionStorage.setItem('lastpage', 'login');
            navigate(-1);
            return;
          }
        }
      }
    } catch (error) {
      setError(true);
      setMessage('An unexpected error occurred.');
      console.log(error);
    }
  };

  return (
    <div id="signin-login-page">
      <div>
        <div className="auth-toggle">
          <button onClick={() => navigate('/Signup')}>Sign up</button>
          <button className="activebutton" onClick={() => navigate('/login')}>Sign in</button>
        </div>
        <div className="signup-login-container login-animate">
          <div>
            <h2 className="signup-login-title">Sign In</h2>
            <form id="signupForm" onSubmit={handleSubmit}>
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                autoComplete='on'
              />

              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />

              <label htmlFor="role">Role</label>
              <select 
                id="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>

              <button type="submit">Sign In</button>
              <div id="message" className={`form-message ${Error ? 'error-message' : 'success-message'}`}>
                {message}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
