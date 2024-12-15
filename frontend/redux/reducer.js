// // reducer.js

// const initialState = {
//     role: sessionStorage.getItem('role') || 'user'
//   };
  
//   export const authReducer = (state = initialState, action) => {
//     switch (action.type) {
//       case 'SET_USER_ROLE':
//         sessionStorage.setItem('role', action.payload);
//         return {
//           ...state,
//           role: action.payload,
//         };
//       case 'LOGOUT_USER':
//         sessionStorage.removeItem('role');
//         return {
//           ...state,
//           role: 'user',
//         };
//       default:
//         return state;
//     }
//   };
  // reducer.js
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage)

const persistConfig = {
  key: 'auth', // The key under which the persisted state will be stored
  storage,     // Default to localStorage, you can customize this if needed
};

const initialState = {
  role: 'user',  // Default value for the role
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_ROLE':
      return {
        ...state,
        role: action.payload, // Set the new role
      };
    case 'LOGOUT_USER':
      return {
        ...state,
        role: 'user', // Reset role to default
      };
    default:
      return state;
  }
};

// Wrap the reducer with persistReducer to enable persistence
export const persistedReducer = persistReducer(persistConfig, authReducer);
