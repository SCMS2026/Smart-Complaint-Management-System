import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ── Animated Counter ──────────────────────────────────────────────
const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / (duration / 16);
        const t = setInterval(() => {
          start = Math.min(start + step, end);
          setVal(Math.floor(start));
          if (start >= end) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

const IconReport = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
  </svg>
);
const IconRoute = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
  </svg>
);
const IconTrack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
  </svg>
);
const IconResolve = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}>
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}>
    <path d="M16 8v8m-8-5v5m4-9v9M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}>
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}>
    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}>
    <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

// ── Floating Particle Background ──────────────────────────────────
const Particles = () => {
  const dots = Array.from({length: 18}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    dur: 8 + Math.random() * 12,
    delay: Math.random() * 8,
  }));
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {dots.map(d => (
        <div key={d.id} style={{
          position:'absolute', left:`${d.x}%`, top:`${d.y}%`,
          width:d.size, height:d.size, borderRadius:'50%',
          background:'rgba(59,130,246,0.25)',
          animation:`floatDot ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
        }}/>
      ))}
    </div>
  );
};

// ── FAQ Item ──────────────────────────────────────────────────────
const FAQItem = ({ q, a, c }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border:`1px solid ${c.border}`, borderRadius:16, overflow:'hidden',
      marginBottom:12, background:c.surface, transition:'box-shadow 0.2s',
      boxShadow: open ? '0 4px 20px rgba(37,99,235,0.08)' : 'none',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width:'100%', textAlign:'left', padding:'20px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'transparent', border:'none', cursor:'pointer',
        color:c.text, fontFamily:'inherit',
      }}>
        <span style={{fontSize:16,fontWeight:600}}>{q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{width:20,height:20,flexShrink:0,marginLeft:16,transition:'transform 0.3s',transform:open?'rotate(180deg)':'rotate(0deg)'}}>
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div style={{maxHeight:open?300:0, overflow:'hidden', transition:'max-height 0.35s ease'}}>
        <div style={{padding:'0 24px 20px', color:c.muted, fontSize:15, lineHeight:1.75}}>{a}</div>
      </div>
    </div>
  );
};

// ── Contact Form ──────────────────────────────────────────────────
const ContactForm = ({ c }) => {
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const handle = e => setForm(f => ({...f, [e.target.name]: e.target.value}));
  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false); setSent(true);
  };

  const inputStyle = {
    width:'100%', padding:'14px 16px', borderRadius:12, fontSize:15,
    border:`1.5px solid ${c.border}`, background:c.surface2,
    color:c.text, fontFamily:'inherit', outline:'none',
    boxSizing:'border-box', transition:'border-color 0.2s',
  };

  if (sent) return (
    <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:20,padding:'48px 32px',textAlign:'center'}}>
      <div style={{fontSize:48,marginBottom:16}}>✅</div>
      <h3 style={{fontSize:22,fontWeight:700,color:'#10b981',marginBottom:8}}>Message Sent!</h3>
      <p style={{color:c.muted,fontSize:15}}>We'll get back to you within 24 hours.</p>
      <button onClick={() => {setSent(false);setForm({name:'',email:'',subject:'',message:''});}}
        style={{marginTop:20,padding:'10px 24px',borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.text,cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:600}}>
        Send Another
      </button>
    </div>
  );

  return (
    <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:c.muted,display:'block',marginBottom:6}}>Full Name *</label>
          <input name="name" value={form.name} onChange={handle} placeholder="Rajan Mehta" required style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor=c.border}/>
        </div>
        <div>
          <label style={{fontSize:13,fontWeight:600,color:c.muted,display:'block',marginBottom:6}}>Email Address *</label>
          <input name="email" value={form.email} onChange={handle} placeholder="you@email.com" type="email" required style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor=c.border}/>
        </div>
      </div>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:c.muted,display:'block',marginBottom:6}}>Subject</label>
        <input name="subject" value={form.subject} onChange={handle} placeholder="How can we help?" style={inputStyle}
          onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor=c.border}/>
      </div>
      <div>
        <label style={{fontSize:13,fontWeight:600,color:c.muted,display:'block',marginBottom:6}}>Message *</label>
        <textarea name="message" value={form.message} onChange={handle} placeholder="Tell us about your issue or query..." required rows={5}
          style={{...inputStyle,resize:'vertical',minHeight:120}}
          onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor=c.border}/>
      </div>
      <button type="submit" disabled={sending} style={{
        background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',border:'none',borderRadius:12,
        padding:'15px 32px',fontSize:16,fontWeight:600,cursor:sending?'not-allowed':'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.25s',
        fontFamily:'inherit',opacity:sending?0.7:1,boxShadow:'0 4px 20px rgba(37,99,235,0.35)',
      }}>
        {sending ? 'Sending...' : <><span>Send Message</span><IconArrow/></>}
      </button>
    </form>
  );
};

// ── Main Component ─────────────────────────────────────────────────
const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [trackId, setTrackId] = useState('');
  const [activeTesti, setActiveTesti] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTesti(p => (p + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, []);

  const steps = [
    {icon:<IconReport/>,num:'01',title:'Submit',desc:'Report your issue in seconds — photo, location, category. Takes under 2 minutes.'},
    {icon:<IconRoute/>,num:'02',title:'Auto-Route',desc:'AI automatically assigns to the right department & worker based on category and location.'},
    {icon:<IconTrack/>,num:'03',title:'Track',desc:'Real-time status updates at every stage. Know exactly where your complaint stands.'},
    {icon:<IconResolve/>,num:'04',title:'Resolved',desc:'Confirm resolution or reject if unsatisfied. Full closure loop with your approval.'},
  ];

  const features = [
    {icon:<IconBolt/>,color:'#f59e0b',bg:'rgba(245,158,11,0.12)',title:'Lightning Fast',desc:'Submit a complaint in under 2 minutes. Smart forms auto-fill location and category.'},
    {icon:<IconShield/>,color:'#10b981',bg:'rgba(16,185,129,0.12)',title:'Transparent & Secure',desc:'JWT-secured accounts. Every status change is logged. Your data stays private.'},
    {icon:<IconChart/>,color:'#3b82f6',bg:'rgba(59,130,246,0.12)',title:'Live Analytics',desc:'Real-time dashboards for departments. SLA tracking, resolution rates, trend maps.'},
    {icon:<IconBell/>,color:'#8b5cf6',bg:'rgba(139,92,246,0.12)',title:'Smart Notifications',desc:'Get email & in-app alerts at every stage. Never miss an update on your complaint.'},
    {icon:<IconUsers/>,color:'#ef4444',bg:'rgba(239,68,68,0.12)',title:'Multi-Role System',desc:'Separate dashboards for citizens, workers, admins, departments, and analysts.'},
    {icon:<IconTrack/>,color:'#06b6d4',bg:'rgba(6,182,212,0.12)',title:'SLA Monitoring',desc:'Automatic escalation when deadlines are missed. Accountability built-in.'},
  ];

  const categories = [
    {emoji:'🛣️',name:'Roads & Potholes'},{emoji:'💧',name:'Water Supply'},
    {emoji:'⚡',name:'Electricity'},{emoji:'🗑️',name:'Sanitation'},
    {emoji:'🌳',name:'Parks & Gardens'},{emoji:'🏗️',name:'Public Buildings'},
    {emoji:'🚦',name:'Traffic Signals'},{emoji:'🔆',name:'Street Lights'},
  ];

  const testimonials = [
    {name:'Priya Sharma',role:'Citizen, Surat',avatar:'PS',avatarColor:'#2563eb',rating:5,text:'I filed a complaint about a broken street light and it was fixed within 3 days! The tracking feature kept me informed at every step. Incredible experience.'},
    {name:'Arun Patel',role:'Ward Resident, Ahmedabad',avatar:'AP',avatarColor:'#7c3aed',rating:5,text:'The pothole outside my building was ignored for months. After using this system, a worker was assigned within hours and the road was repaired in a week. Fantastic!'},
    {name:'Meena Joshi',role:'Department Admin',avatar:'MJ',avatarColor:'#10b981',rating:5,text:'Managing complaints used to be chaotic. Now with automated routing and SLA tracking, our team responds 3x faster. The analytics dashboard is a game changer.'},
    {name:'Rahul Desai',role:'Citizen, Vadodara',avatar:'RD',avatarColor:'#f59e0b',rating:5,text:'Water leakage in our area was resolved in 48 hours after submitting here. The government actually listens now. I love the real-time status updates.'},
    {name:'Kavita Nair',role:'Local Councillor',avatar:'KN',avatarColor:'#ef4444',rating:5,text:'As a councillor, I can finally see what issues citizens care about most. The analytics help us prioritize better. Our ward satisfaction scores have improved 40%.'},
  ];

  const faqs = [
    {q:'How do I file a complaint?',a:'Simply click "File a Complaint", sign in or register for free, select a category, describe your issue, attach a photo if available, and submit. The whole process takes under 2 minutes. Your complaint is immediately logged and auto-assigned to the right department.'},
    {q:'How long does resolution take?',a:'Resolution time varies by complaint type. Most complaints are acknowledged within 24 hours and resolved within 3–7 working days. Our SLA monitoring ensures that overdue complaints are automatically escalated to supervisors.'},
    {q:'Can I track my complaint without an account?',a:'Yes! You can track any complaint using its unique Complaint ID on the Track Status page — no login required. Simply enter your Complaint ID in the quick-track bar and see real-time status.'},
    {q:'What if I am not satisfied with the resolution?',a:'When a complaint is marked resolved by a worker, you receive a notification asking you to confirm or reject the resolution. If you reject it with a reason, the complaint is automatically reopened and re-escalated.'},
    {q:'Is my personal data safe?',a:'Absolutely. We use JWT-secured authentication, encrypted data storage, and strict access controls. Your personal information is never sold or shared with third parties. Only authorized officials handling your complaint can view your contact details.'},
    {q:'Which types of issues can I report?',a:'You can report roads & potholes, water supply issues, electricity problems, sanitation concerns, park maintenance, public building damage, traffic signal faults, broken street lights, and many more civic categories. If your issue doesn\'t fit a category, use "Other" with a description.'},
  ];

  const c = {
    bg: isDark?'#0b1120':'#f0f4ff', surface:isDark?'#111827':'#ffffff',
    surface2:isDark?'#1a2236':'#f8fafc', border:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)',
    text:isDark?'#f1f5f9':'#0f172a', muted:isDark?'#8892a4':'#64748b', accent:'#2563eb',
  };

  return (
    <div style={{background:c.bg,color:c.text,fontFamily:"'Sora','DM Sans',sans-serif",overflowX:'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes floatDot{from{transform:translateY(0) scale(1)}to{transform:translateY(-24px) scale(1.3)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeLeft{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse2{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .hero-left{animation:fadeRight 0.9s cubic-bezier(.22,.68,0,1.2) both}
        .hero-right{animation:fadeLeft 0.9s 0.15s cubic-bezier(.22,.68,0,1.2) both}
        .testi-anim{animation:slideIn 0.4s cubic-bezier(.22,.68,0,1.2) both}
        .btn-primary{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:14px;padding:15px 32px;font-size:16px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.25s;box-shadow:0 4px 20px rgba(37,99,235,0.35);font-family:inherit;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,99,235,0.45)}
        .btn-ghost{background:transparent;border-radius:14px;padding:14px 28px;font-size:16px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.25s;font-family:inherit;}
        .step-card{transition:transform 0.25s,box-shadow 0.25s}.step-card:hover{transform:translateY(-6px)}
        .feat-card{transition:transform 0.25s,box-shadow 0.25s}.feat-card:hover{transform:translateY(-5px)}
        .cat-pill{transition:all 0.2s;cursor:pointer}.cat-pill:hover{transform:translateY(-3px) scale(1.04)}
        .track-input:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.15)}
        .grad-text{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 50%,#0ea5e9 100%);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradMove 4s ease infinite}
        .ring-spin{position:absolute;border-radius:50%;border:1.5px solid rgba(37,99,235,0.18);animation:spin linear infinite}
        .contact-info-card{transition:transform 0.2s}.contact-info-card:hover{transform:translateY(-3px)}
      `}</style>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{position:'relative',minHeight:'95vh',display:'flex',alignItems:'center',
        background:isDark?'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(37,99,235,0.18) 0%,transparent 70%),#0b1120':'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(37,99,235,0.10) 0%,transparent 70%),#f0f4ff',
        overflow:'hidden'}}>
        <Particles/>
        <div className="ring-spin" style={{width:520,height:520,top:'50%',left:'50%',transform:'translate(-50%,-50%)',animationDuration:'40s'}}/>
        <div className="ring-spin" style={{width:720,height:720,top:'50%',left:'50%',transform:'translate(-50%,-50%)',animationDuration:'60s',animationDirection:'reverse'}}/>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'80px 24px 60px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',position:'relative',zIndex:1,width:'100%'}}>
          <div className="hero-left">
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:isDark?'rgba(37,99,235,0.15)':'rgba(37,99,235,0.08)',border:'1px solid rgba(37,99,235,0.25)',borderRadius:100,padding:'6px 16px',marginBottom:24,fontSize:13,fontWeight:600,color:'#3b82f6'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#3b82f6',display:'inline-block',animation:'pulse2 2s infinite'}}/>
              Smart Government Complaint Portal
            </div>
            <h1 style={{fontSize:'clamp(2.4rem,5vw,3.8rem)',fontWeight:800,lineHeight:1.1,marginBottom:20,letterSpacing:'-0.02em'}}>
              Your Voice.<br/><span className="grad-text">Our Priority.</span>
            </h1>
            <p style={{fontSize:18,lineHeight:1.7,color:c.muted,marginBottom:36,maxWidth:480}}>
              Report civic issues, track resolutions in real-time, and hold your local government accountable. Fast. Transparent. Effective.
            </p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:48}}>
              <button className="btn-primary" onClick={() => navigate('/complaint')}>File a Complaint <IconArrow/></button>
              <button className="btn-ghost" onClick={() => navigate('/track')} style={{color:c.text,border:`1.5px solid ${c.border}`}}>Track Status</button>
            </div>
            <div style={{display:'flex',gap:32}}>
              {[['12K+','Complaints Filed'],['94%','Resolution Rate'],['48hr','Avg Response']].map(([n,l]) => (
                <div key={l}>
                  <div style={{fontSize:22,fontWeight:800,color:c.accent}}>{n}</div>
                  <div style={{fontSize:12,color:c.muted,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right" style={{position:'relative'}}>
            <div style={{background:c.surface,borderRadius:24,padding:24,border:`1px solid ${c.border}`,boxShadow:isDark?'0 24px 80px rgba(0,0,0,0.5)':'0 24px 80px rgba(0,0,0,0.12)'}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>Recent Complaints</div>
                {[
                  {id:'#4821',title:'Pothole on MG Road',status:'In Progress',color:'#f59e0b'},
                  {id:'#4819',title:'Street Light Out — Sec 14',status:'Resolved ✓',color:'#10b981'},
                  {id:'#4817',title:'Water Leakage — Ward 3',status:'Assigned',color:'#3b82f6'},
                ].map(item => (
                  <div key={item.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderRadius:12,background:c.surface2,marginBottom:8,border:`1px solid ${c.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:item.color,flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{item.title}</div>
                        <div style={{fontSize:11,color:c.muted}}>{item.id}</div>
                      </div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:item.color,background:`${item.color}18`,borderRadius:100,padding:'3px 10px'}}>{item.status}</span>
                  </div>
                ))}
              </div>
              <div style={{borderTop:`1px solid ${c.border}`,paddingTop:16}}>
                <div style={{fontSize:11,fontWeight:600,color:c.muted,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>Weekly Resolutions</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:8,height:60}}>
                  {[40,65,50,80,70,90,75].map((h,i) => (
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{width:'100%',height:`${h}%`,background:i===5?'#2563eb':(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'),borderRadius:6}}/>
                      <span style={{fontSize:9,color:c.muted}}>{['M','T','W','T','F','S','S'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{position:'absolute',top:-18,right:-18,background:'linear-gradient(135deg,#2563eb,#7c3aed)',color:'#fff',borderRadius:16,padding:'12px 18px',fontSize:13,fontWeight:700,boxShadow:'0 8px 24px rgba(37,99,235,0.4)',animation:'pulse2 3s ease-in-out infinite'}}>
              🚀 Live Tracking
            </div>
          </div>
        </div>

        <svg style={{position:'absolute',bottom:0,left:0,width:'100%',display:'block'}} viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,80 1440,40 L1440,60 L0,60 Z" fill={c.surface}/>
        </svg>
      </section>

      {/* ── QUICK TRACK BAR ───────────────────────────────── */}
      <section style={{background:c.surface,padding:'32px 24px'}}>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center'}}>
          <p style={{fontSize:14,fontWeight:600,color:c.muted,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.08em'}}>Track your complaint instantly</p>
          <div style={{display:'flex',gap:12}}>
            <input className="track-input" value={trackId} onChange={e => setTrackId(e.target.value)}
              placeholder="Enter Complaint ID  e.g. 68001a2b..."
              style={{flex:1,padding:'14px 20px',borderRadius:12,fontSize:15,border:`1.5px solid ${c.border}`,background:c.surface2,color:c.text,fontFamily:'inherit',transition:'all 0.2s'}}/>
            <button className="btn-primary" onClick={() => navigate('/track')}>Track</button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section style={{background:c.surface2,padding:'100px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Process</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>How it works</h2>
            <p style={{color:c.muted,fontSize:17,maxWidth:500,margin:'0 auto'}}>From complaint to resolution — a seamless 4-step journey.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24}}>
            {steps.map((s,i) => (
              <div key={i} className="step-card" style={{background:c.surface,borderRadius:20,padding:'32px 28px',border:`1px solid ${c.border}`,boxShadow:isDark?'0 4px 24px rgba(0,0,0,0.2)':'0 4px 24px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-10,right:12,fontSize:80,fontWeight:900,color:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)',lineHeight:1,pointerEvents:'none',userSelect:'none'}}>{s.num}</div>
                <div style={{width:54,height:54,borderRadius:14,background:'rgba(37,99,235,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#2563eb',marginBottom:20}}>{s.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:c.accent,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:8}}>{s.num}</div>
                <h3 style={{fontSize:20,fontWeight:700,marginBottom:10}}>{s.title}</h3>
                <p style={{color:c.muted,fontSize:14,lineHeight:1.7}}>{s.desc}</p>
                {i < steps.length-1 && (
                  <div style={{position:'absolute',right:-12,top:'50%',transform:'translateY(-50%)',width:24,height:24,borderRadius:'50%',background:c.accent,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,zIndex:2,boxShadow:'0 2px 8px rgba(37,99,235,0.4)'}}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ──────────────────────────────────── */}
      <section style={{background:'linear-gradient(135deg,#1e40af 0%,#1d4ed8 40%,#7c3aed 100%)',padding:'80px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.05) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(255,255,255,0.05) 0%,transparent 50%)'}}/>
        <div style={{maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:40,textAlign:'center',position:'relative'}}>
          {[{end:12480,suffix:'+',label:'Complaints Filed'},{end:94,suffix:'%',label:'Resolution Rate'},{end:48,suffix:'hr',label:'Avg Response Time'},{end:5200,suffix:'+',label:'Citizens Served'}].map((s,i) => (
            <div key={i}>
              <div style={{fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,color:'#fff',letterSpacing:'-0.02em'}}><Counter end={s.end} suffix={s.suffix}/></div>
              <div style={{fontSize:14,color:'rgba(255,255,255,0.65)',marginTop:6,fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section style={{background:c.surface,padding:'100px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Features</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>Everything you need</h2>
            <p style={{color:c.muted,fontSize:17,maxWidth:500,margin:'0 auto'}}>Powerful tools for citizens, workers, and administrators — all in one platform.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
            {features.map((f,i) => (
              <div key={i} className="feat-card" style={{background:c.surface2,borderRadius:18,padding:'28px 26px',border:`1px solid ${c.border}`}}>
                <div style={{width:56,height:56,borderRadius:14,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',color:f.color,marginBottom:18}}>{f.icon}</div>
                <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>{f.title}</h3>
                <p style={{color:c.muted,fontSize:14,lineHeight:1.75}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section style={{background:c.surface2,padding:'80px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Categories</div>
          <h2 style={{fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:800,marginBottom:12,letterSpacing:'-0.02em'}}>What can you report?</h2>
          <p style={{color:c.muted,fontSize:16,marginBottom:40}}>From potholes to power outages — we cover all civic issues.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
            {categories.map((cat,i) => (
              <div key={i} className="cat-pill" onClick={() => navigate('/complaint')} style={{display:'flex',alignItems:'center',gap:10,background:c.surface,border:`1.5px solid ${c.border}`,borderRadius:100,padding:'12px 22px',fontSize:14,fontWeight:600,boxShadow:isDark?'0 2px 12px rgba(0,0,0,0.2)':'0 2px 12px rgba(0,0,0,0.06)'}}>
                <span style={{fontSize:20}}>{cat.emoji}</span>{cat.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section style={{background:c.surface,padding:'100px 24px',overflow:'hidden'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Testimonials</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>What citizens are saying</h2>
            <p style={{color:c.muted,fontSize:17,maxWidth:500,margin:'0 auto'}}>Real stories from people who got real results.</p>
          </div>

          {/* Main active testimonial */}
          <div key={activeTesti} className="testi-anim" style={{
            background:isDark?'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06))':'linear-gradient(135deg,rgba(37,99,235,0.04),rgba(124,58,237,0.03))',
            border:`1px solid ${c.border}`,borderRadius:24,padding:'48px',marginBottom:32,position:'relative',
          }}>
            <div style={{position:'absolute',top:24,right:32,fontSize:80,lineHeight:1,fontWeight:900,color:isDark?'rgba(37,99,235,0.15)':'rgba(37,99,235,0.08)',fontFamily:'Georgia,serif',pointerEvents:'none'}}>"</div>
            <div style={{display:'flex',gap:4,marginBottom:20,color:'#f59e0b'}}>
              {Array(testimonials[activeTesti].rating).fill(0).map((_,i) => <IconStar key={i}/>)}
            </div>
            <p style={{fontSize:'clamp(1rem,2.2vw,1.25rem)',lineHeight:1.8,color:c.text,marginBottom:32,maxWidth:760,fontWeight:400}}>
              "{testimonials[activeTesti].text}"
            </p>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:'50%',flexShrink:0,background:testimonials[activeTesti].avatarColor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,fontWeight:700}}>
                {testimonials[activeTesti].avatar}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{testimonials[activeTesti].name}</div>
                <div style={{color:c.muted,fontSize:13,marginTop:2}}>{testimonials[activeTesti].role}</div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:40}}>
            {testimonials.map((_,i) => (
              <button key={i} onClick={() => setActiveTesti(i)} style={{
                width:i===activeTesti?32:10,height:10,borderRadius:100,border:'none',cursor:'pointer',
                background:i===activeTesti?c.accent:(isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)'),
                transition:'all 0.3s',
              }}/>
            ))}
          </div>

          {/* Mini preview cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            {testimonials.map((t,i) => (
              <div key={i} onClick={() => setActiveTesti(i)} style={{
                background:i===activeTesti?(isDark?'rgba(37,99,235,0.12)':'rgba(37,99,235,0.06)'):c.surface2,
                border:`1.5px solid ${i===activeTesti?'rgba(37,99,235,0.4)':c.border}`,
                borderRadius:16,padding:'16px',cursor:'pointer',transition:'all 0.25s',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:t.avatarColor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>{t.avatar}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{t.name}</div>
                    <div style={{fontSize:11,color:c.muted}}>{t.role}</div>
                  </div>
                </div>
                <p style={{fontSize:12,color:c.muted,lineHeight:1.6,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────── */}
      <section style={{background:c.surface2,padding:'100px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>For Everyone</div>
            <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:800,letterSpacing:'-0.02em'}}>Built for every stakeholder</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            {[
              {emoji:'👤',role:'Citizen',desc:'File complaints, track status, approve resolutions.',color:'#2563eb'},
              {emoji:'🔧',role:'Worker',desc:'See assigned tasks, update progress, upload proof.',color:'#10b981'},
              {emoji:'🏢',role:'Dept. Admin',desc:'Manage department complaints, assign workers, view stats.',color:'#f59e0b'},
              {emoji:'👑',role:'Super Admin',desc:'Full system control, user management, all analytics.',color:'#8b5cf6'},
              {emoji:'📊',role:'Analyzer',desc:'Access analytics dashboards and generate reports.',color:'#ef4444'},
            ].map((r,i) => (
              <div key={i} style={{background:c.surface,borderRadius:16,padding:'24px 20px',border:`1px solid ${c.border}`,textAlign:'center',transition:'transform 0.2s,box-shadow 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{fontSize:36,marginBottom:12}}>{r.emoji}</div>
                <div style={{fontSize:16,fontWeight:700,color:r.color,marginBottom:8}}>{r.role}</div>
                <div style={{fontSize:13,color:c.muted,lineHeight:1.6}}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section style={{background:c.surface,padding:'100px 24px'}}>
        <div style={{maxWidth:820,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>FAQ</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>Frequently asked questions</h2>
            <p style={{color:c.muted,fontSize:17,maxWidth:480,margin:'0 auto'}}>Everything you need to know about using the platform.</p>
          </div>
          {faqs.map((faq,i) => <FAQItem key={i} q={faq.q} a={faq.a} c={c}/>)}
          <div style={{textAlign:'center',marginTop:40}}>
            <p style={{color:c.muted,fontSize:15,marginBottom:16}}>Still have questions?</p>
            <button className="btn-primary" onClick={() => document.getElementById('contact-section').scrollIntoView({behavior:'smooth'})}>
              Contact Us <IconArrow/>
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────── */}
      <section id="contact-section" style={{background:c.surface2,padding:'100px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:13,fontWeight:700,color:c.accent,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Contact</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:14}}>Get in touch</h2>
            <p style={{color:c.muted,fontSize:17,maxWidth:500,margin:'0 auto'}}>Have a question, feedback, or partnership inquiry? We'd love to hear from you.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:40,alignItems:'start'}}>
            {/* Info column */}
            <div>
              <div style={{marginBottom:28}}>
                <h3 style={{fontSize:20,fontWeight:700,marginBottom:8}}>SmartComplaint System</h3>
                <p style={{color:c.muted,fontSize:15,lineHeight:1.7}}>A citizen-first civic complaint platform connecting communities to accountable governance.</p>
              </div>
              {[
                {icon:<IconMail/>,label:'Email Us',value:'support@smartcomplaint.gov.in',color:'#2563eb'},
                {icon:<IconPhone/>,label:'Helpline',value:'1800-XXX-XXXX (Toll Free)',color:'#10b981'},
                {icon:<IconLocation/>,label:'Office',value:'Civil Services Building, Ward 7, Surat, Gujarat 395001',color:'#f59e0b'},
              ].map((info,i) => (
                <div key={i} className="contact-info-card" style={{display:'flex',gap:16,alignItems:'flex-start',background:c.surface,border:`1px solid ${c.border}`,borderRadius:16,padding:'20px',marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:`${info.color}18`,display:'flex',alignItems:'center',justifyContent:'center',color:info.color}}>{info.icon}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:c.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em'}}>{info.label}</div>
                    <div style={{fontSize:14,fontWeight:600,lineHeight:1.5}}>{info.value}</div>
                  </div>
                </div>
              ))}
              <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:16,padding:'20px',marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,color:c.muted,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Office Hours</div>
                {[['Mon – Fri','9:00 AM – 6:00 PM'],['Saturday','10:00 AM – 2:00 PM'],['Sunday','Closed']].map(([day,time]) => (
                  <div key={day} style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:14}}>
                    <span style={{color:c.muted}}>{day}</span>
                    <span style={{fontWeight:600}}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Form column */}
            <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:20,padding:'40px',boxShadow:isDark?'0 8px 40px rgba(0,0,0,0.3)':'0 8px 40px rgba(0,0,0,0.07)'}}>
              <h3 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Send us a message</h3>
              <p style={{color:c.muted,fontSize:14,marginBottom:28}}>We'll respond within 24 hours on working days.</p>
              <ContactForm c={c}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{padding:'100px 24px',textAlign:'center',background:isDark?'radial-gradient(ellipse 80% 100% at 50% 100%,rgba(37,99,235,0.15) 0%,transparent 70%),#0b1120':'radial-gradient(ellipse 80% 100% at 50% 100%,rgba(37,99,235,0.08) 0%,transparent 70%),#f0f4ff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'relative',zIndex:1,maxWidth:600,margin:'0 auto'}}>
          <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.02em',marginBottom:16}}>
            Ready to make your<br/><span className="grad-text">voice heard?</span>
          </h2>
          <p style={{color:c.muted,fontSize:17,marginBottom:40,lineHeight:1.7}}>
            Join thousands of citizens already using Smart Complaint System to get real results from their local government.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={() => navigate('/signup')} style={{padding:'16px 36px',fontSize:17}}>Get Started Free <IconArrow/></button>
            <button className="btn-ghost" onClick={() => navigate('/complaint')} style={{color:c.text,border:`1.5px solid ${c.border}`,padding:'15px 28px',fontSize:17}}>File a Complaint</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{background:c.surface,borderTop:`1px solid ${c.border}`,padding:'48px 24px 32px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:12}}><span style={{color:c.accent}}>Smart</span>Complaint</div>
            <p style={{color:c.muted,fontSize:14,lineHeight:1.7,maxWidth:260}}>A next-generation civic complaint management platform connecting citizens to their government.</p>
          </div>
          {[
            {head:'Platform',links:[{label:'File Complaint',path:'/complaint'},{label:'Track Status',path:'/track'},{label:'Analytics',path:'/analytics'},{label:'Resources',path:'/resources'}]},
            {head:'Roles',links:[{label:'Citizens',path:'/'},{label:'Workers',path:'/contractor'},{label:'Departments',path:'/department-admin'},{label:'Admins',path:'/admin'}]},
            {head:'Legal',links:[{label:'Privacy Policy',path:'/privacy-policy'},{label:'Terms of Service',path:'/terms-of-service'},{label:'Accessibility',path:'/accessibility'}]},
          ].map((col,i) => (
            <div key={i}>
              <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:c.muted,marginBottom:14}}>{col.head}</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {col.links.map(l => (
                  <a key={l.label} href={l.path} style={{fontSize:14,color:c.muted,textDecoration:'none',cursor:'pointer',transition:'color 0.2s'}}
                    onMouseEnter={e=>e.target.style.color=c.text} onMouseLeave={e=>e.target.style.color=c.muted}>{l.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{maxWidth:1200,margin:'40px auto 0',paddingTop:24,borderTop:`1px solid ${c.border}`,textAlign:'center',color:c.muted,fontSize:13}}>
          © 2026 SmartComplaint System. Built for a more accountable government.
        </div>
      </footer>
    </div>
  );
};

export default Home;