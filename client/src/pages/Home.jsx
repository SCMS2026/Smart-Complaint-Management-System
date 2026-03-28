import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import banner_img from "../images/logo.png";

// Icons
const LightningIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.6-4A12 12 0 0112 3a12 12 0 01-9 6c0 5.5 3.8 10 9 11.6 5.2-1.6 9-6.1 9-11.6 0-1-.1-2-.4-3z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h4v7H5zM10 5h4v14h-4zM15 9h4v10h-4z" />
  </svg>
);

const Home = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);

    let start = 0;
    const end = 1280;
    const duration = 2000;
    const step = 5;
    const interval = duration / (end / step);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, interval);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      <div className="pt-20 overflow-hidden">

        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full">

            {/* LEFT */}
            <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
              <div className="inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 text-blue-700 text-sm">
                🚀 Next-Generation Issue Tracking
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                We Hear You. We{" "}
                <span className="text-blue-600">Resolve</span> It.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-lg">
                Report, track, and resolve issues faster with full transparency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  Register Complaint
                </button>
                <button className="w-full sm:w-auto px-6 py-3 border rounded-xl hover:bg-gray-100 transition">
                  Track Status
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className={` transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
              <img
                src={banner_img}
                alt="banner"
                className="w-[90%] sm:w-full max-w-md lg:max-w-lg mx-auto"
              />
            </div>

          </div>  
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">How It Works</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {["Submit Complaint", "Smart Routing", "Resolution"].map((title, i) => (
                <div key={i} className="p-6 border rounded-2xl hover:shadow-lg transition">
                  <div className="text-2xl font-bold text-blue-600 mb-3">0{i + 1}</div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">
                    Easy and fast process to manage complaints efficiently.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">Features</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
                <LightningIcon />
                <h3 className="mt-4 font-bold">Fast Reporting</h3>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
                <ChartIcon />
                <h3 className="mt-4 font-bold">Analytics</h3>
              </div>

              <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg">
                <ShieldIcon />
                <h3 className="mt-4 font-bold">Secure</h3>
              </div>

            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-20 bg-slate-900 text-white text-center">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            <div>
              <h1 className="text-4xl font-bold">{count}+</h1>
              <p>Complaints</p>
            </div>

            <div>
              <h1 className="text-4xl font-bold">{Math.floor(count * 0.85)}+</h1>
              <p>Resolved</p>
            </div>

            <div>
              <h1 className="text-4xl font-bold">98%</h1>
              <p>Satisfaction</p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold">
            Register Now
          </button>
        </section>

        {/* FOOTER */}
        <footer className="bg-black text-gray-400 py-10 text-center">
          <p>© 2026 SmartComplaint</p>
        </footer>

      </div>
    </div>
  );
};

export default Home;