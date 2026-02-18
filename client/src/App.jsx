import React from "react";
import Navbar from "./pages/Navbar";
import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navbar />} />
          
        </Routes>
      </main>
    </div>
  );
}

export default App;
