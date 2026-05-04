import { useState } from "react";

const Accessibility = () => {
  const [activeSection, setActiveSection] = useState("commitment");

  const sections = [
    { id: "commitment", label: "Our Commitment" },
    { id: "features", label: "Accessibility Features" },
    { id: "navigation", label: "Keyboard Navigation" },
    { id: "screen", label: "Screen Reader Support" },
    { id: "contrast", label: "Visual Design" },
    { id: "media", label: "Media Accessibility" },
    { id: "forms", label: "Forms & Inputs" },
    { id: "contact", label: "Contact & Feedback" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-main)" }}>Accessibility Statement</h1>
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
          <div className="lg:col-span-3">
            <div className="rounded-2xl border p-8" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              
              {activeSection === "commitment" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Our Commitment to Accessibility</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    SmartComplaint is committed to ensuring digital accessibility for people with disabilities. We continually 
                    improve the user experience for everyone and apply relevant accessibility standards.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Standards Compliance</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Our goal is to meet WCAG 2.1 Level AA standards for web content accessibility.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Ongoing Efforts</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        We conduct regular accessibility audits and incorporate user feedback to improve accessibility.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "features" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Accessibility Features</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Theme Options</h3>
                      <ul className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>• Dark mode for reduced eye strain</li>
                        <li>• High contrast mode</li>
                        <li>• System preference detection</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Text Scaling</h3>
                      <ul className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>• Responsive text sizing</li>
                        <li>• Browser zoom support up to 200%</li>
                        <li>• Relative units for readability</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Reduced Motion</h3>
                      <ul className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>• Respects prefers-reduced-motion setting</li>
                        <li>• Option to disable animations</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Keyboard Shortcuts</h3>
                      <ul className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <li>• Tab navigation throughout</li>
                        <li>• Skip to main content link</li>
                        <li>• Focus indicators on interactive elements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "navigation" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Keyboard Navigation</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    The SmartComplaint platform is fully navigable using a keyboard. Here's how to navigate efficiently:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border" style={{ borderColor: "var(--border-color)" }}>
                      <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <tr>
                          <th className="p-3 text-left font-semibold" style={{ color: "var(--text-main)" }}>Key</th>
                          <th className="p-3 text-left font-semibold" style={{ color: "var(--text-main)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: "1px solid var(--border-color)" }}>
                          <td className="p-3 font-mono">Tab</td>
                          <td className="p-3" style={{ color: "var(--text-secondary)" }}>Move to next interactive element</td>
                        </tr>
                        <tr style={{ borderTop: "1px solid var(--border-color)" }}>
                          <td className="p-3 font-mono">Shift + Tab</td>
                          <td className="p-3" style={{ color: "var(--text-secondary)" }}>Move to previous interactive element</td>
                        </tr>
                        <tr style={{ borderTop: "1px solid var(--border-color)" }}>
                          <td className="p-3 font-mono">Enter</td>
                          <td className="p-3" style={{ color: "var(--text-secondary)" }}>Activate links and buttons</td>
                        </tr>
                        <tr style={{ borderTop: "1px solid var(--border-color)" }}>
                          <td className="p-3 font-mono">Space</td>
                          <td className="p-3" style={{ color: "var(--text-secondary)" }}>Activate checkboxes and buttons</td>
                        </tr>
                        <tr style={{ borderTop: "1px solid var(--border-color)" }}>
                          <td className="p-3 font-mono">Esc</td>
                          <td className="p-3" style={{ color: "var(--text-secondary)" }}>Close modals and dropdowns</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === "screen" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Screen Reader Support</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    SmartComplaint is designed to work with popular screen readers:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li><strong>NVIDIA Narrator:</strong> Built-in screen reader on Windows</li>
                    <li><strong>JAWS:</strong> Job Access With Speech for Windows</li>
                    <li><strong>NVDA:</strong> NonVisual Desktop Access for Windows</li>
                    <li><strong>VoiceOver:</strong> Built-in screen reader on macOS and iOS</li>
                    <li><strong>TalkBack:</strong> Screen reader on Android devices</li>
                  </ul>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We use proper heading structures (H1-H6), ARIA labels, and semantic HTML to ensure screen readers 
                    can navigate the content effectively.
                  </p>
                </div>
              )}

              {activeSection === "contrast" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Visual Design & Contrast</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    We ensure sufficient color contrast ratios to support users with visual impairments:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-1" style={{ color: "var(--text-main)" }}>Normal Text</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Minimum 4.5:1 contrast ratio</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-1" style={{ color: "var(--text-main)" }}>Large Text</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Minimum 3:1 contrast ratio</p>
                    </div>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <h3 className="font-bold mb-1" style={{ color: "var(--text-main)" }}>UI Components</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Minimum 3:1 contrast ratio</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "media" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Media Accessibility</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Images</h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        All meaningful images include descriptive alt text. Decorative images are marked as decorative 
                        so screen readers can skip them appropriately.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Videos</h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        Video content includes captions where applicable. We are working to add audio descriptions 
                        for instructional videos.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: "var(--text-main)" }}>Icons</h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        Icons include accessible labels and tooltips for clarity. Decorative icons are hidden 
                        from screen readers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "forms" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Forms & Input Accessibility</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Our forms are designed for accessibility:
                  </p>
                  <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>All form fields have associated labels</li>
                    <li>Required fields are clearly indicated</li>
                    <li>Error messages are descriptive and programmatically associated with fields</li>
                    <li>Auto-focus is used sparingly and can be easily escaped</li>
                    <li>Input instructions are provided where necessary</li>
                    <li>Form validation errors are announced to screen readers</li>
                  </ul>
                </div>
              )}

{activeSection === "contact" && (
                 <div className="space-y-4">
                   <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Contact & Feedback</h2>
                   <p style={{ color: "var(--text-secondary)" }}>
                     We welcome your feedback on the accessibility of SmartComplaint. If you encounter accessibility 
                     barriers or have suggestions for improvement, please contact us:
                   </p>
                   <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
                       <p><strong>Email:</strong> accessibility@smartcomplaint.in</p>
                       <p><strong>Phone:</strong> 1800-XXX-XXXX</p>
                       <p><strong>Mail:</strong> Accessibility Team, SmartComplaint Inc., 123 Government Complex, City, State - PIN</p>
                   </div>
                   <p style={{ color: "var(--text-secondary)" }}>
                       We aim to respond to accessibility feedback within 2 business days and will work with you to resolve 
                       any issues you may encounter.
                   </p>
                 </div>
               )}
              </div>
            </div>
          </div>
        </div>

        <footer className="py-8 text-center" style={{ backgroundColor: "var(--bg-main)", borderTop: "1px solid var(--border-color)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>© 2026 SmartComplaint — Accessibility Statement</p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <a href="/privacy-policy" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Privacy Policy</a>
            <a href="/terms-of-service" className="hover:opacity-70 transition" style={{ color: "var(--text-secondary)" }}>Terms of Service</a>
          </div>
        </footer>
      </div>
    );
};

export default Accessibility;