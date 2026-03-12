import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Home = () => {

  const [count,setCount] = useState(0)

  useEffect(()=>{
    let start = 0
    const end = 1280

    if(start === end) return

    let duration = 2000
    let incrementTime = Math.floor(duration / end)

    const timer = setInterval(()=>{
      start += 5
      setCount(start)
      if(start >= end){
        setCount(end)
        clearInterval(timer)
      }
    },incrementTime)

  },[])

  return (
    <>
      <Navbar />

      <div className="pt-20 w-screen overflow-x-hidden">

        {/* HERO */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

          <h1 className="text-6xl font-bold mb-6 animate-pulse">
            Complaint Management System
          </h1>

          <p className="text-xl max-w-2xl mb-10 opacity-90">
            Register, track and resolve complaints with our intelligent
            management platform.
          </p>

          <div className="flex gap-5">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition">
              Register Complaint
            </button>

            <button className="border border-white px-8 py-3 rounded-xl hover:bg-white hover:text-blue-600 transition">
              View Complaints
            </button>
          </div>

        </section>

        {/* FEATURES */}
        <section className="py-28 bg-gray-100 px-8">

          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">

            <div className="bg-white p-10 rounded-3xl shadow-lg transform hover:-translate-y-4 hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-bold mb-4">⚡ Fast Complaint</h3>
              <p className="text-gray-600">
                Submit complaints instantly with asset details and tracking.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg transform hover:-translate-y-4 hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-bold mb-4">📊 Smart Analytics</h3>
              <p className="text-gray-600">
                Advanced analytics to monitor system complaints.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-lg transform hover:-translate-y-4 hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-bold mb-4">🔒 Secure System</h3>
              <p className="text-gray-600">
                Secure authentication and role-based access control.
              </p>
            </div>

          </div>

        </section>

        {/* LIVE COUNTER */}
        <section className="py-28 bg-indigo-700 text-white text-center">

          <h2 className="text-4xl font-bold mb-16">
            Platform Statistics
          </h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

            <div>
              <h1 className="text-6xl font-bold">{count}+</h1>
              <p className="mt-3 text-lg">Total Complaints</p>
            </div>

            <div>
              <h1 className="text-6xl font-bold">980+</h1>
              <p className="mt-3 text-lg">Resolved Issues</p>
            </div>

            <div>
              <h1 className="text-6xl font-bold">250+</h1>
              <p className="mt-3 text-lg">Active Users</p>
            </div>

          </div>

        </section>

        {/* PRODUCT SECTION */}
        <section className="py-28 px-8">

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

            <div>
              <h2 className="text-4xl font-bold mb-6">
                Smart SaaS Platform
              </h2>

              <p className="text-gray-600 text-lg mb-6">
                Our platform allows organizations to manage complaints
                efficiently with automation and smart workflows.
              </p>

              <button className="bg-indigo-600 text-white px-7 py-3 rounded-xl hover:bg-indigo-700 transition">
                Learn More
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-72 rounded-3xl shadow-xl flex items-center justify-center text-white text-2xl font-bold">
              Dashboard Preview
            </div>

          </div>

        </section>

        {/* TRUST */}
        <section className="py-24 bg-gray-100 text-center">

          <h2 className="text-3xl font-bold mb-12">
            Trusted by Organizations
          </h2>

          <div className="flex justify-center gap-10 text-gray-500 text-lg">
            <span>Company A</span>
            <span>Company B</span>
            <span>Company C</span>
            <span>Company D</span>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-gray-400 text-center py-10">
          <p>© 2026 SmartComplaint Platform</p>
        </footer>

      </div>
    </>
  );
};

export default Home;