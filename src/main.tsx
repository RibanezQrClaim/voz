import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";              // 👈 IMPORTANTE
import App from "./app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
