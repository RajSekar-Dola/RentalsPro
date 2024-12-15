// actions.js
export const setUserRole = (role) => ({
    type: 'SET_USER_ROLE',
    payload: role,
  });
  
  export const logoutUser = () => ({
    type: 'LOGOUT_USER',
  });
  