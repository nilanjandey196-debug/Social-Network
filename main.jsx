import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Mount the React application into the root element.  StrictMode helps
// highlight potential problems in your application by intentionally double
// invoking certain lifecycle methods.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);