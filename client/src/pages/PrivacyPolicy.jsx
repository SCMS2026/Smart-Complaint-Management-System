import { useState } from "react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", label: "Introduction" },
    { id: "info", label: "Information We Collect" },
    { id: "use", label: "How We Use Your Information" },
    { id: "sharing", label: "Information Sharing" },
    { id: "cookies", label: "Cookies & Tracking" },
    { id: "security", label: "Data Security" },
    { id: "rights", label: "Your Rights" },
    { id: "contact", label: "Contact Us" },
  ];

  
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-main)" }}>Privacy Policy</h1>
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
              
              {activeSection === "intro" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Introduction</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    SmartComplaint Management System ("we", "us", or "our") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    By accessing or using our services, you agree to the terms outlined in this policy. 
                    We encourage you to read this policy carefully to understand our practices regarding your personal data.
                  </p>
                </div>
              )}

              {activeSection === "info" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Information We Collect</h2>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text-main)" }}>Personal Information</h3>
                      <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>Name, email address, and phone number when you register</li>
                        <li>Profile picture/avatar URL (optional)</li>
                        <li>Location information for complaint mapping</li>
                        <li>Department affiliation for government users</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text-main)" }}>Complaint Data</h3>
                      <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>Complaint details, descriptions, and attachments</li>
                        <li>Category, priority level, and location of issues</li>
                        <li>Communication history related to complaints</li>
                        <li>Resolution feedback and approval status</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text-main)" }}>Technical Data</h3>
                      <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>IP address and browser information</li>
                        <li>Device type and operating system</li>
                        <li>Usage analytics and page interaction data</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "use" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>How We Use Your Information</h2>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>To create and manage your account</li>
                    <li>To process, route, and track complaints efficiently</li>
                    <li>To communicate with you about complaint status and updates</li>
                    <li>To provide personalized dashboard experiences based on your role</li>
                    <li>To generate analytics and reports for system improvement</li>
                    <li>To ensure platform security and prevent fraudulent activity</li>
                    <li>To comply with legal obligations and government regulations</li>
                  </ul>
                </div>
              )}

              {activeSection === "sharing" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Information Sharing</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We do not sell or rent your personal information to third parties. We may share information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li><strong>With Department Officials:</strong> Complaint details are shared with relevant department admins for resolution</li>
                    <li><strong>With Workers:</strong> Assigned workers receive necessary complaint information to complete tasks</li>
                    <li><strong>Legal Compliance:</strong> When required by law, subpoena, or government request</li>
                    <li><strong>System Protection:</strong> To protect our rights, property, or safety of users</li>
                    <li><strong>Service Providers:</strong> With trusted partners who assist in operating our platform</li>
                  </ul>
                </div>
              )}

              {activeSection === "cookies" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Cookies & Tracking</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We use cookies and similar technologies to enhance your experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings like theme and language</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    You can control cookies through your browser settings, though disabling essential cookies may affect functionality.
                  </p>
                </div>
              )}

              {activeSection === "security" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Data Security</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>Encrypted data transmission using HTTPS/TLS</li>
                    <li>Password hashing and secure authentication tokens</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Role-based access control for sensitive information</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    While we strive to protect your information, no method of transmission over the internet is 100% secure.
                  </p>
                </div>
              )}

              {activeSection === "rights" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Your Rights</h2>
                  <p style={{ color: "var(--text-secondary)" }}>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                    <li><strong>Delete:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                    <li><strong>Export:</strong> Receive your data in a portable format</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    To exercise these rights, please contact us using the information below.
                  </p>
                </div>
              )}

              {activeSection === "contact" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Contact Us</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    If you have questions about this Privacy Policy or your personal data, please contact us:
                  </p>
                  <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <p><strong>Email:</strong> privacy@smartcomplaint.in</p>
                    <p><strong>Phone:</strong> 1800-XXX-XXXX</p>
                    <p><strong>Address:</strong> SmartComplaint Inc., 123 Government Complex, City, State - PIN</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center" style={{ backgroundColor: "var(--bg-main)", borderTop: "1px solid var(--border-color)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>© 2026 SmartComplaint — Privacy Policy</p>
        <div className="mt-4 flex justify-center gap-6 text-xs">
          <a href="/terms-of-service" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Terms of Service</a>
          <a href="/accessibility" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Accessibility</a>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;