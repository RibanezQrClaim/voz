import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app' // si el archivo es app.jsx
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
console.log("🚀 React montando en #root");
