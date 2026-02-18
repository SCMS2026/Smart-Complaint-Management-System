import React from "react";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/" element={<Login />} />
          <Route path="/" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
