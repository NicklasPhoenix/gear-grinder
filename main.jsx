import React from 'react'
import ReactDOM from 'react-dom/client'
import GearGrinder from './gear-grinder.jsx'
import './index.css'

// Polyfill for window.storage API using localStorage
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async remove(key) {
    localStorage.removeItem(key);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GearGrinder />
  </React.StrictMode>,
)
