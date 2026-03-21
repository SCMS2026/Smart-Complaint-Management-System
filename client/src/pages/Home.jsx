import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

// Icons as SVG components
const LightningIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Home = () => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger initial fade-in animation
    const timeout = setTimeout(() => setIsVisible(true), 100);
    
    let start = 0;
    const end = 1280;

    if(start === end) return;

    let duration = 2000;
    let incrementTime = Math.floor(duration / end);

    const timer = setInterval(() => {
      start += 5;
      setCount(start);
      if(start >= end) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <Navbar />

      <div className="pt-20 w-screen overflow-x-hidden">

        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full z-10">
            {/* Left Content */}
            <div className={`transform transition-all duration-1000 ease-out text-center lg:text-left ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm tracking-wide shadow-sm border border-blue-200 animate-pulse">
                🚀 Next-Generation Issue Tracking
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight max-w-xl mx-auto lg:mx-0">
                We Hear You. We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Resolve</span> It.
              </h1>
              
              <p className="text-xl text-slate-600 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                Empowering citizens and organizations to report, track, and resolve issues with unprecedented transparency and speed. Welcome to the modern Smart Complaint Management System.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                  <span>Register a Complaint</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl font-semibold shadow-sm transform hover:-translate-y-1 transition-all duration-300">
                  Track Status
                </button>
              </div>
            </div>

            {/* Right Image Content */}
            <div className={`relative flex justify-center lg:justify-end xl:ml-10 transform transition-all duration-1000 delay-300 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
              <style>
                {`
                  @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                  }
                  .animate-float {
                    animation: float 6s ease-in-out infinite;
                  }
                `}
              </style>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <img src="/dashboard-hero.png" alt="Smart Complaint Dashboard" className="relative z-10 w-full max-w-lg rounded-3xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] animate-float" />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Process</h2>
              <p className="mt-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">
                How It Works
              </p>
              <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
                A streamlined three-step process to ensure your voice is heard and issues are resolved promptly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100" />
              
              {[
                { step: "01", title: "Submit Complaint", desc: "Easily file a report with location data, images, and detailed descriptions using our intuitive portal." },
                { step: "02", title: "Smart Routing", desc: "Our system automatically categorizes and routes the issue to the right administrative department for quick action." },
                { step: "03", title: "Resolution & Feedback", desc: "Track progress in real-time and provide feedback once your issue is marked as completely resolved." }
              ].map((item, index) => (
                <div key={index} className="relative flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center text-2xl font-bold text-blue-600 mb-6 group-hover:scale-110 group-hover:border-blue-100 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 z-10">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-28 bg-slate-50 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">
                Powerful Capabilities
              </p>
              <p className="mt-4 max-w-3xl text-xl text-slate-500 mx-auto">
                Built-in tools to make complaint management efficient, transparent, and scalable for any organization.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                  <LightningIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Fast & Intuitive Reporting</h3>
                <p className="text-slate-600 leading-relaxed">
                  Submit complaints instantly with our user-friendly interface. Add attachments, precise locations, and categorical details in seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                  <ChartIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Analytics & Dashboard</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gain actionable insights with rich data visualization. Monitor resolution times, common issues, and department performance.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-purple-100 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                  <ShieldIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Secure & Confidential</h3>
                <p className="text-slate-600 leading-relaxed">
                  Enterprise-grade security ensures all reports and user data are encrypted and protected with strict role-based access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE COUNTER / STATS */}
        <section className="py-24 relative overflow-hidden bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Impact by the Numbers</h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">See how our platform is making a difference every single day.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 cursor-default">
                <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
                  {count.toLocaleString()}+
                </h1>
                <p className="text-slate-300 text-lg font-medium tracking-wide">Complaints Registered</p>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 cursor-default">
                <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                  {Math.floor(count * 0.85).toLocaleString()}+
                </h1>
                <p className="text-slate-300 text-lg font-medium tracking-wide">Issues Resolved</p>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 cursor-default">
                <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  <span className="flex items-center justify-center">98<span className="text-4xl ml-1">%</span></span>
                </h1>
                <p className="text-slate-300 text-lg font-medium tracking-wide">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Abstract background blobs for CTA */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-10 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to streamline your issue management?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already experiencing a faster, more transparent way to resolve complaints.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                Register Now
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">C</span>
              </div>
              <span className="text-white font-semibold text-lg hover:text-blue-400 transition-colors cursor-pointer">SmartComplaint</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">About Us</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
            
            <p className="text-sm">© 2026 SmartComplaint Platform. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;