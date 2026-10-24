import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

/**
 * RentLink Entry Point
 * --------------------
 * This file mounts the React application into the DOM element with id="root".
 * It initializes:
 *  1. React.StrictMode - development tool that highlights potential problems
 *  2. BrowserRouter    - client-side routing provider (respects Vite's BASE_URL for both dev & prod subpaths)
 *  3. App              - root application component with Context Providers & Routes
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* basename ensures routing works correctly both in local dev ('/') and on GitHub Pages ('/FYP-10/') */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
