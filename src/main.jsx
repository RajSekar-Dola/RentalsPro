// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
// import {store} from '../frontend/redux/store.js'
// import { Provider } from 'react-redux'
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Provider store={store}><App /></Provider>
//   </StrictMode>,
// )
// index.js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from '../frontend/redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate to wrap the app

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
