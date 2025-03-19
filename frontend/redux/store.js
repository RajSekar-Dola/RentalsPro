import { createStore } from 'redux';
import { persistedReducer } from './reducer'; 
import { persistStore } from 'redux-persist'; 

export const store = createStore(persistedReducer); 
export const persistor = persistStore(store); 
