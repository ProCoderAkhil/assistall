import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowRight, ChevronDown, Car, Heart, Activity, Phone, Mail, 
  Send, MessageSquare, Menu, X, ShieldCheck, User, Zap, CheckCircle, 
  FileText, Video
} from 'lucide-react';

const logoImg = "/logo.png"; 

// --- CUSTOM CSS FOR ANIMATIONS ---
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
  .glass-nav { background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
`;

const LandingPage = ({ onLogin, onSignup, onVolunteer }) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  
  const containerRef = useRef(null);

  // ✅ Updated Nav Items (Removed Gold/Pricing)
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Volunteer', id: 'volunteer' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
        if (containerRef.current) setScrollY(containerRef.current.scrollTop);
    };
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => { if (container) container.removeEventListener('scroll', handleScroll); };
  }, []);

  const smoothScroll = (id) => {
    setIsMobileMenuOpen(false); 
    const element = document.getElementById(id);
    const container = containerRef.current;
    if (element && container) {
        const offset = 100; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + container.scrollTop - offset;
        container.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => {
      setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => { 
      e.preventDefault(); 
      alert("Message Sent! We will contact you shortly."); 
  };

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#050505] text-white font-sans overflow-y-auto overflow-x-hidden relative scroll-smooth selection:bg-green-500/30">
      <style>{styles}</style>

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- ROLE SELECTOR MODAL --- */}
      {showRoleSelector && (
         <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[32px] max-w-3xl w-full relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
               <button onClick={() => setShowRoleSelector(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><X size={20}/></button>
               
               <div className="text-center mb-10">
                   <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">AssistAll</span></h2>
                   <p className="text-gray-400">How would you like to use the platform?</p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                  {/* User Card */}
                  <button onClick={() => { setShowRoleSelector(false); onSignup(); }} className="group text-left p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex flex-col items-center text-center relative overflow-hidden">
                      <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 text-green-500 group-hover:scale-110 transition border border-green-500/20"><User size={32}/></div>
                      <h3 className="text-xl font-bold text-white mb-2">I Need Assistance</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">Book rides, find companionship, and request help.</p>
                      <span className="mt-auto py-2 px-4 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest group-hover:bg-green-500 group-hover:text-black transition">Register Now</span>
                  </button>

                  {/* Volunteer Card */}
                  <button onClick={() => { setShowRoleSelector(false); onVolunteer(); }} className="group text-left p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center text-center relative overflow-hidden">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition border border-blue-500/20"><Heart size={32}/></div>
                      <h3 className="text-xl font-bold text-white mb-2">I Want to Volunteer</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">Earn money & help neighbors.</p>
                      <span className="mt-auto py-2 px-4 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest group-hover:bg-blue-500 group-hover:text-black transition">Join Team</span>
                  </button>
               </div>
            </div>
         </div>
       )}

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center ${scrollY > 20 ? 'glass-nav py-3' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => smoothScroll('home')}>
            <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-lg opacity-0 group-hover:opacity-40 transition duration-500"></div>
                <img src={logoImg} alt="AssistAll" className="w-9 h-9 rounded-xl relative z-10" onError={(e) => {e.target.style.display='none';}} />
            </div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-green-400 transition">AssistAll</span>
        </div>
        
        <div className="hidden md:flex gap-1 text-xs font-bold bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map((item) => (
                <button key={item.name} onClick={() => smoothScroll(item.id)} className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition uppercase tracking-wide">{item.name}</button>
            ))}
        </div>

        <div className="hidden md:flex gap-3">
            <button onClick={onLogin} className="px-5 py-2 text-sm font-bold text-white hover:text-green-400 transition">Log In</button>
            <button onClick={() => setShowRoleSelector(true)} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition transform hover:scale-105 shadow-lg shadow-white/10">Get Started</button>
        </div>

        <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-[#050505] pt-24 px-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-10">
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"><X/></button>
              {navItems.map((item) => (
                  <button key={item.name} onClick={() => smoothScroll(item.id)} className="text-3xl font-black text-left text-gray-500 hover:text-white transition">{item.name}</button>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                  <button onClick={onLogin} className="w-full py-4 text-lg font-bold border border-white/20 rounded-2xl">Log In</button>
                  <button onClick={() => { setIsMobileMenuOpen(false); setShowRoleSelector(true); }} className="w-full py-4 text-lg font-bold bg-green-600 text-black rounded-2xl">Get Started</button>
              </div>
          </div>
      )}

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center min-h-screen justify-center z-10">
        <div className="max-w-5xl mx-auto relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live in Kerala</span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-white animate-in slide-in-from-bottom-8 duration-700">
                Humanity <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500">On Demand.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-100">
                The community-powered mobility platform connecting verified neighbors for rides, companionship, and care.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full animate-in slide-in-from-bottom-8 duration-1000 delay-200">
                <button onClick={() => setShowRoleSelector(true)} className="w-full md:w-auto px-10 py-5 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 hover:scale-105 transition shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    Start Now <ArrowRight size={20}/>
                </button>
                <button onClick={() => smoothScroll('services')} className="w-full md:w-auto px-10 py-5 glass-card rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                    Explore Services
                </button>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 md:gap-24 border-t border-white/10 pt-10 animate-in fade-in duration-1000 delay-500">
                <div><h3 className="text-3xl md:text-4xl font-black text-white">12k+</h3><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Lives Impacted</p></div>
                <div><h3 className="text-3xl md:text-4xl font-black text-white">800+</h3><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Volunteers</p></div>
                <div><h3 className="text-3xl md:text-4xl font-black text-white">4.9</h3><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Avg Rating</p></div>
            </div>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id="services" className="py-32 px-6 relative z-10 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
              <div className="mb-20 text-center">
                  <h2 className="text-4xl md:text-5xl font-black mb-6">Designed for <span className="text-blue-500">Everyone</span></h2>
                  <p className="text-gray-400 max-w-xl mx-auto text-lg">Whether you need a ride to the hospital or someone to talk to, we are here.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="col-span-1 md:col-span-2 bg-[#121212] border border-white/10 p-10 rounded-[40px] hover:border-green-500/30 transition group relative overflow-hidden h-96 flex flex-col justify-end">
                      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-20 transition transform group-hover:scale-110 duration-700"><Car size={300}/></div>
                      <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg shadow-green-500/20"><Car size={32}/></div>
                      <h3 className="text-3xl font-bold mb-3 text-white">Transport & Mobility</h3>
                      <p className="text-gray-400 text-lg max-w-md">Affordable door-to-door rides for medical appointments, social visits, and errands. Wheelchair accessible options available.</p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-[#121212] border border-white/10 p-10 rounded-[40px] hover:border-blue-500/30 transition group relative overflow-hidden h-96 flex flex-col justify-end">
                      <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg shadow-blue-500/20"><Heart size={32}/></div>
                      <h3 className="text-2xl font-bold mb-3 text-white">Companionship</h3>
                      <p className="text-gray-400">Friendly volunteers for walks, chats, or just being there.</p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-[#121212] border border-white/10 p-10 rounded-[40px] hover:border-purple-500/30 transition group relative overflow-hidden h-80 flex flex-col justify-end">
                      <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg shadow-purple-500/20"><Activity size={32}/></div>
                      <h3 className="text-2xl font-bold mb-3 text-white">Medical Aid</h3>
                      <p className="text-gray-400">Medicine delivery and non-emergency health support.</p>
                  </div>

                  {/* Card 4 */}
                  <div className="col-span-1 md:col-span-2 bg-[#121212] border border-white/10 p-10 rounded-[40px] hover:border-yellow-500/30 transition group relative overflow-hidden h-80 flex flex-col justify-end">
                      <div className="absolute top-10 right-10 flex gap-4">
                          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 animate-bounce"><ShieldCheck size={32} className="text-green-500"/></div>
                          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 animate-pulse"><Zap size={32} className="text-yellow-500"/></div>
                      </div>
                      <h3 className="text-3xl font-bold mb-3 text-white">Safety First</h3>
                      <p className="text-gray-400 text-lg max-w-lg">Every volunteer is ID-verified and background checked. Real-time ride tracking ensures peace of mind for you and your loved ones.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- VOLUNTEER CTA --- */}
      <section id="volunteer" className="py-32 px-6 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
              <div className="flex-1">
                  <div className="inline-block bg-blue-500/10 text-blue-400 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6 border border-blue-500/20">Join the Force</div>
                  <h2 className="text-5xl font-black mb-8 text-white leading-tight">Make Money.<br/>Make a Difference.</h2>
                  <p className="text-gray-400 text-lg mb-10 leading-relaxed">Join thousands of verified volunteers. Set your own schedule, help your neighbors, and earn for every ride.</p>
                  <div className="flex gap-4">
                      <button onClick={onVolunteer} className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-blue-50 transition">Apply as Volunteer</button>
                  </div>
              </div>
              <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-blue-500/20 filter blur-[100px] rounded-full"></div>
                  <div className="glass-card p-8 rounded-[40px] relative z-10 transform rotate-3 hover:rotate-0 transition duration-500">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                          <div><h4 className="font-bold text-white text-lg">Akhil Kumar</h4><p className="text-green-400 text-sm font-bold">Verified Partner</p></div>
                      </div>
                      <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-2xl mb-4">
                          <span className="text-gray-400">Total Earnings</span>
                          <span className="text-2xl font-black text-white">₹12,450</span>
                      </div>
                      <div className="flex gap-2">
                          <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold">45 Rides</span>
                          <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-lg text-xs font-bold">4.9 ★</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-black mb-12 text-center text-white">Common Questions</h2>
              <div className="space-y-4">
                  {[
                      { q: "Is AssistAll completely free?", a: "Most services are community-driven and low cost. Volunteers may charge a nominal fee for fuel." },
                      { q: "How are volunteers verified?", a: "We require Government ID (Aadhaar/License) and a live video interview before activation." },
                      { q: "Is it safe for seniors?", a: "Yes! We offer live ride tracking, SOS alerts, and specialized geriatric-trained volunteers." }
                  ].map((item, i) => (
                      <div key={i} className="border border-white/10 rounded-2xl overflow-hidden bg-[#121212]">
                          <button onClick={() => toggleFaq(i)} className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition">
                              <span className="font-bold text-lg text-white">{item.q}</span>
                              <ChevronDown className={`transition-transform duration-300 text-gray-400 ${activeFaq === i ? 'rotate-180' : ''}`}/>
                          </button>
                          {/* FAQ Answer Animation */}
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="p-6 pt-0 text-gray-400 leading-relaxed">{item.a}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                  <h2 className="text-4xl font-black mb-6 text-white">Get in Touch</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">Have questions or interested in partnering? We'd love to hear from you.</p>
                  <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><Mail size={24}/></div>
                          <div><p className="text-xs text-gray-500 uppercase font-bold">Email Us</p><p className="text-white font-bold">help@assistall.com</p></div>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Phone size={24}/></div>
                          <div><p className="text-xs text-gray-500 uppercase font-bold">Call Us</p><p className="text-white font-bold">+91 8089 123 456</p></div>
                      </div>
                  </div>
              </div>
              <div className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><MessageSquare size={20} className="text-green-500"/> Send Message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="First Name" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                          <input type="text" placeholder="Last Name" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                      </div>
                      <input type="email" placeholder="Email Address" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                      <textarea rows="4" placeholder="How can we help?" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition resize-none"></textarea>
                      <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">Send Message <Send size={18}/></button>
                  </form>
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition">
                  <img src={logoImg} alt="logo" className="w-8 h-8 rounded-lg grayscale" onError={(e) => {e.target.style.display='none';}}/>
                  <span className="font-bold text-white tracking-tight">AssistAll Inc.</span>
              </div>
              <div className="flex gap-8 text-sm text-gray-500 font-medium">
                  <a href="#" className="hover:text-white transition">Privacy</a>
                  <a href="#" className="hover:text-white transition">Terms</a>
                  <a href="#" className="hover:text-white transition">Safety</a>
                  <a href="#" className="hover:text-white transition">Contact</a>
              </div>
              <p className="text-gray-600 text-xs">© 2025 All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
};
export default LandingPage;