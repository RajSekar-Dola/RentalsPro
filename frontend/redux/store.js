// import { createStore } from 'redux';
// import { authReducer } from './reducer';

// export const store = createStore(authReducer);
// store.js
import { createStore } from 'redux';
import { persistedReducer } from './reducer'; // Use the persistedReducer
import { persistStore } from 'redux-persist'; // For creating the persistor

export const store = createStore(persistedReducer); // Use the persisted reducer
export const persistor = persistStore(store); // Create persistor to manage rehydration
