import { useState } from "react";

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "services", label: "Services" },
    { id: "accounts", label: "User Accounts" },
    { id: "conduct", label: "User Conduct" },
    { id: "complaints", label: "Complaint Submission" },
    { id: "intellectual", label: "Intellectual Property" },
    { id: "disclaimer", label: "Disclaimer" },
    { id: "termination", label: "Termination" },
    { id: "governing", label: "Governing Law" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-main)" }}>Terms of Service</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Last updated: May 4, 2026</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar navigation */}
          <nav className="md:col-span-1">
            <div className="sticky top-20 md:top-24 rounded-2xl border p-3 md:p-4" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 md:mb-3" style={{ color: "var(--text-secondary)" }}>Contents</p>
              <ul className="space-y-1">
                {sections.map(s => (
                  <li key={s.id}>
                    <button
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition ${
                        activeSection === s.id
                          ? "bg-sky-500 text-white"
                          : "hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                      style={{ color: activeSection === s.id ? "#fff" : "var(--text-main)" }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border p-4 md:p-6 lg:p-8" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              
              {activeSection === "acceptance" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Acceptance of Terms</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    By accessing or using the SmartComplaint Management System (the "Service"), you agree to be bound by these Terms of Service 
                    ("Terms") and our Privacy Policy. If you are using the Service on behalf of an organization, you represent that you have 
                    authority to bind that organization to these Terms.
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on this page 
                    and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                  </p>
                  <div className="p-4 rounded-lg border-l-4 border-sky-500" style={{ backgroundColor: "rgba(14,165,233,0.1)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>Please read these Terms carefully before using our Service.</p>
                  </div>
                </div>
              )}

              {activeSection === "services" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Description of Services</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    SmartComplaint provides a digital platform for citizens to report civic issues and for government departments to manage 
                    and resolve these complaints efficiently. Our services include:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>Online complaint submission and tracking</li>
                    <li>Real-time status updates and notifications</li>
                    <li>Department-level complaint management dashboards</li>
                    <li>Analytics and reporting tools</li>
                    <li>Multi-channel communication between citizens and officials</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We reserve the right to modify, suspend, or discontinue any part of the Service at any time without liability.
                  </p>
                </div>
              )}

              {activeSection === "accounts" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>User Accounts</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    To access certain features, you must register for an account. When registering, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Promptly update your information as needed</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    You are responsible for all activities that occur under your account. You must be at least 13 years old to create an account.
                  </p>
                </div>
              )}

              {activeSection === "conduct" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>User Conduct</h2>
                  <p style={{ color: "var(--text-secondary)" }}>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>Post false, misleading, or fraudulent complaints</li>
                    <li>Submit complaints with malicious intent or spam</li>
                    <li>Impersonate any person or entity</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Attempt to gain unauthorized access to accounts or systems</li>
                    <li>Use the Service for any illegal purpose</li>
                    <li>Upload viruses or harmful code</li>
                    <li>Scrape or extract data from the platform</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We reserve the right to suspend or terminate accounts that violate these conduct rules.
                  </p>
                </div>
              )}

              {activeSection === "complaints" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Complaint Submission</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    When submitting complaints, you agree that:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>All information provided is truthful and accurate to the best of your knowledge</li>
                    <li>You have the right to submit the complaint you are filing</li>
                    <li>You will not submit duplicate complaints for the same issue</li>
                    <li>Complaint descriptions should be factual and constructive</li>
                    <li>You may upload photos or documents only if you have the right to share them</li>
                    <li>You understand that complaints are public records subject to RTI and other laws</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We reserve the right to verify complaints, request additional information, or decline to process complaints 
                    that appear fraudulent, abusive, or outside the scope of our service.
                  </p>
                </div>
              )}

              {activeSection === "intellectual" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Intellectual Property</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    The Service and its original content, features, and functionality are owned by SmartComplaint and are protected 
                    by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    The SmartComplaint name, logo, and related marks are trademarks of SmartComplaint Inc. You may not use these 
                    marks without our prior written consent.
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    You retain ownership of content you submit to the Service, but by submitting, you grant us a worldwide, 
                    non-exclusive, royalty-free license to use, modify, and display such content in connection with the Service.
                  </p>
                </div>
              )}

              {activeSection === "disclaimer" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Disclaimer</h2>
                  <div className="space-y-3">
                    <p style={{ color: "var(--text-secondary)" }}>
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      WE DO NOT WARRANT OR MAKE ANY REPRESENTATIONS ABOUT THE ACCURACY, RELIABILITY, OR CORRECTNESS OF CONTENT.
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                      YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. YOU ASSUME FULL RESPONSIBILITY FOR ANY DAMAGE TO YOUR DEVICE 
                      OR LOSS OF DATA RESULTING FROM YOUR USE OF THE SERVICE.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === "termination" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Termination</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
                    for any reason whatsoever, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>Breach of these Terms</li>
                    <li>Fraudulent or abusive behavior</li>
                    <li>Violation of applicable laws</li>
                    <li>Extended period of inactivity</li>
                    <li>Technical or security reasons</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, 
                    you may simply stop using the Service.
                  </p>
                </div>
              )}

              {activeSection === "governing" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Governing Law</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict 
                    of law provisions.
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Any dispute arising from or related to these Terms or your use of the Service shall be subject to the exclusive 
                    jurisdiction of the courts in [City], India.
                  </p>
                  <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <p><strong>Contact Information:</strong></p>
                    <p>Email: legal@smartcomplaint.in</p>
                    <p>Phone: 1800-XXX-XXXX</p>
                  </div>
                </div>
              )}
</div>
           </div>
         </div>
       </div>

       <footer className="py-8 text-center" style={{ backgroundColor: "var(--bg-main)", borderTop: "1px solid var(--border-color)" }}>
         <p className="text-sm" style={{ color: "var(--text-secondary)" }}>© 2026 SmartComplaint — Terms of Service</p>
         <div className="mt-4 flex justify-center gap-6 text-xs">
           <a href="/privacy-policy" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Privacy Policy</a>
           <a href="/accessibility" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Accessibility</a>
         </div>
       </footer>
     </div>
   );
};

export default TermsOfService;