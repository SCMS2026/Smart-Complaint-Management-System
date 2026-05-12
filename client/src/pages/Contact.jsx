import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const contactDetails = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@smartcomplaint.gov.in",
    accent: "bg-sky-100 text-sky-600",
  },
  {
    icon: Phone,
    label: "Helpline",
    value: "1800-XXX-XXXX (Toll Free)",
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Civil Services Building, Ward 7, Surat, Gujarat 395001",
    accent: "bg-amber-100 text-amber-600",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-28 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-400 mb-3">
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Let’s solve it together.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Have a question, a complaint update, or need support? Reach out to our team and we’ll help you move things forward.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] items-start">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Quick contact info</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">
                Use any of the options below to connect with our support team, or submit the form and we’ll reply as soon as possible.
              </p>
              <div className="space-y-4">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
                  Office hours
                </p>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Mon – Fri</span>
                    <span className="font-semibold">9:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">10:00 AM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 font-semibold">Send a message</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">We’re here to listen.</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Complete the form and our support team will respond within one business day.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</span>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us how we can help"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition hover:bg-sky-700"
                >
                  <Send className="mr-2" size={16} />
                  Send message
                </button>
                {submitted && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Message submitted successfully!</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
