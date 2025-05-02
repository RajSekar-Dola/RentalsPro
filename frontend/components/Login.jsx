import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/SignupLogin.css';
import { useDispatch } from 'react-redux';
import { setUserRole } from '../redux/action.js'; // Import the Redux action

const LoginForm = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');  // Default role is 'User'
  const [message, setMessage] = useState('');
  const [Error, setError] = useState(false);
  const navigate = useNavigate();

  // Action to update the role in Redux
  const updaterole = async (role) => {
    dispatch(setUserRole(role));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setUsername('');
          setPassword('');
          setError(false);
          setMessage('Sign In successful!');

          // Set role in Redux and navigate
          updaterole(role);

          if (role === 'Manager') {
            navigate('/managerPage');
          } else if (role === 'Admin') {
            navigate("/adminpage");
          } else {
            const sessionvalue = sessionStorage.getItem('lastpage');
            if (sessionvalue === "NotFound" || sessionvalue === "signup") {
              sessionStorage.setItem('lastpage', 'login');
              navigate('/');
            } else {
              sessionStorage.setItem('lastpage', 'login');
              navigate(-1);
            }
          }
        } else {
          console.log(data.errormessage);
          setError(true);
          setMessage(data.errormessage || "Error occurred!");
        }
      }
    };

    xhr.onerror = function () {
      setError(true);
      setMessage('An unexpected error occurred.');
      console.log(xhr.statusText);
    };

    xhr.send(JSON.stringify({ username, password, role }));
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
            <form id="signupForm" data-testid="login-form" onSubmit={handleSubmit}>
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
              <div id="message-login" className={` ${Error ? 'error-message-login' : 'success-message-login'}`}>
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
