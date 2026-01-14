import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, ChevronDown, Car, Shield, Heart, MapPin, 
  Users, Activity, Phone, Mail, Globe, Star, CheckCircle, 
  Zap, Target, Clock, ChevronRight, HelpCircle, Plus, Send, MessageSquare,
  FileText, Video, Award, Stethoscope, Menu, X, ShieldCheck
} from 'lucide-react';

const logoImg = "/logo.png"; 

const LandingPage = ({ onGetStarted, onVolunteerJoin }) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScroll = (id) => {
    setIsMobileMenuOpen(false); 
    const element = document.getElementById(id);
    if (element) {
        const offset = 80; 
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index) => setActiveFaq(activeFaq === index ? null : index);
  const handleContactSubmit = () => alert("Message Sent! We will contact you shortly.");

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-green-500 selection:text-black">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex justify-between items-center ${scrollY > 20 ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => smoothScroll('home')}>
            <img src={logoImg} alt="AssistAll" className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-green-500 transition" onError={(e) => {e.target.style.display='none';}} />
            <span className="text-xl font-black tracking-tight text-white group-hover:text-gray-200 transition">AssistAll</span>
        </div>
        
        <div className="hidden md:flex gap-1 text-sm font-medium bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            {['Home', 'Services', 'Volunteer', 'FAQ', 'Contact'].map((item) => (
                <button key={item} onClick={() => smoothScroll(item.toLowerCase())} className="px-5 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition">{item}</button>
            ))}
        </div>

        <div className="hidden md:flex gap-3">
            <button onClick={onGetStarted} className="px-5 py-2 text-sm font-bold text-white hover:text-green-400 transition">Log In</button>
            <button onClick={onVolunteerJoin} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition transform hover:scale-105">Get Started</button>
        </div>

        <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-10">
              {['Home', 'Services', 'Volunteer', 'FAQ', 'Contact'].map((item) => (
                  <button key={item} onClick={() => smoothScroll(item.toLowerCase())} className="text-2xl font-bold text-left text-gray-300 hover:text-white border-b border-white/10 pb-4">{item}</button>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                  <button onClick={onGetStarted} className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-bold border border-white/10">Log In</button>
                  <button onClick={onVolunteerJoin} className="w-full bg-green-600 text-black py-4 rounded-xl font-bold">Get Started</button>
              </div>
          </div>
      )}

      {/* Hero */}
      <section id="home" className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center min-h-[90vh] justify-center z-10">
        <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:border-green-500/50 transition">
                <span className="text-xs font-bold text-gray-300"><span className="text-green-400">12 Volunteers</span> active nearby</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                Freedom to <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">Move & Live.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                The community-powered mobility platform. Connect with verified neighbors for rides, help, and companionship.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full">
                <button onClick={onGetStarted} className="w-full md:w-auto px-8 py-4 bg-green-600 text-black rounded-full font-bold text-lg flex items-center justify-center hover:bg-green-500 hover:scale-105 transition group">
                    Find Help Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform"/>
                </button>
                <button onClick={onVolunteerJoin} className="w-full md:w-auto px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/5 transition flex items-center justify-center gap-2">
                    <Heart size={20} className="text-red-500"/> Volunteer
                </button>
            </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 relative z-10 bg-neutral-950">
          <div className="max-w-6xl mx-auto">
              <div className="mb-16">
                  <h2 className="text-4xl font-black mb-4">Our Services</h2>
                  <p className="text-gray-400 max-w-lg">Designed for seniors, students, and anyone needing a helping hand.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2 bg-neutral-900/50 border border-white/10 p-8 rounded-3xl hover:border-green-500/30 transition group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110"><Car size={200}/></div>
                      <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-green-500"><Car size={24}/></div>
                      <h3 className="text-2xl font-bold mb-2">Transport & Rides</h3>
                      <p className="text-gray-400 max-w-sm">Door-to-door rides for medical appointments, social visits, and errands.</p>
                  </div>
                  <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-3xl hover:border-blue-500/30 transition group">
                      <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-blue-500"><Heart size={24}/></div>
                      <h3 className="text-xl font-bold mb-2">Companionship</h3>
                      <p className="text-gray-400 text-sm">Friendly faces for walks or just a chat.</p>
                  </div>
                  <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-3xl hover:border-purple-500/30 transition group">
                      <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-purple-500"><Activity size={24}/></div>
                      <h3 className="text-xl font-bold mb-2">Medicine Delivery</h3>
                      <p className="text-gray-400 text-sm">Prescriptions picked up safely.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Volunteer CTA */}
      <section id="volunteer" className="py-24 px-6 bg-neutral-900 border-y border-white/5 relative overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                  <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block">Join the Mission</span>
                  <h2 className="text-4xl font-black mb-6 text-white">Become a Verified Volunteer</h2>
                  <p className="text-gray-400 mb-8 text-lg leading-relaxed">Earn money, build community trust, and make a real difference.</p>
                  <div className="space-y-8">
                      <div className="flex gap-5"><div className="w-14 h-14 bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20"><FileText size={28}/></div><div><h4 className="text-white font-bold text-xl">1. Verification</h4><p className="text-gray-400 text-sm mt-1">Government ID check.</p></div></div>
                      <div className="flex gap-5"><div className="w-14 h-14 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-500 shrink-0 border border-purple-500/20"><Video size={28}/></div><div><h4 className="text-white font-bold text-xl">2. Interview</h4><p className="text-gray-400 text-sm mt-1">Live video screening.</p></div></div>
                  </div>
                  <button onClick={onVolunteerJoin} className="mt-12 bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2 group">Apply Now <ChevronRight className="group-hover:translate-x-1 transition"/></button>
              </div>
              <div className="relative flex justify-center">
                  <div className="bg-black border border-white/10 rounded-[40px] p-8 shadow-2xl relative rotate-3 hover:rotate-0 transition duration-500 max-w-sm w-full">
                      <div className="bg-[#121212] p-4 rounded-2xl border border-green-900/50 flex items-center gap-3">
                          <div className="bg-green-600 rounded-full p-2 text-white shadow-lg"><ShieldCheck size={24}/></div>
                          <div><p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Status</p><p className="font-bold text-white text-lg">Verified Partner</p></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-neutral-950 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black mb-10 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {[
                      { q: "Is AssistAll really free?", a: "The app is free to use. Riders pay a nominal fee to volunteers to cover fuel and maintenance costs." },
                      { q: "How are volunteers verified?", a: "Every volunteer submits Government ID (Aadhaar/License) and undergoes a background check and live video interview." },
                      { q: "Do I need Geriatric Training?", a: "No, it is optional. However, uploading a valid certificate gives you a 'Pro' badge and priority for elderly care requests." }
                  ].map((item, i) => (
                      <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-neutral-900">
                          <button onClick={() => toggleFaq(i)} className="w-full p-5 flex justify-between items-center text-left hover:bg-white/5 transition">
                              <span className="font-bold">{item.q}</span>
                              <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}/>
                          </button>
                          {activeFaq === i && <div className="p-5 pt-0 text-gray-400 text-sm animate-in slide-in-from-top-2">{item.a}</div>}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 relative z-10 bg-black border-t border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                  <h2 className="text-4xl font-black mb-6">Get in Touch</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">Have questions about our services or interested in partnering? We'd love to hear from you.</p>
                  <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><Mail size={24}/></div><div><p className="text-xs text-gray-500 uppercase font-bold">Email Us</p><p className="text-white font-bold">help@assistall.com</p></div></div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Phone size={24}/></div><div><p className="text-xs text-gray-500 uppercase font-bold">Call Us</p><p className="text-white font-bold">+91 8089 123 456</p></div></div>
                  </div>
              </div>
              <div className="bg-neutral-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-green-500"/> Send Message</h3>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="First Name" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                          <input type="text" placeholder="Last Name" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                      </div>
                      <input type="email" placeholder="Email Address" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"/>
                      <textarea rows="4" placeholder="How can we help?" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition resize-none"></textarea>
                      <button onClick={handleContactSubmit} className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">Send Message <Send size={18}/></button>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition">
                  <img src={logoImg} alt="logo" className="w-6 h-6 rounded-full grayscale" onError={(e) => {e.target.style.display='none';}}/>
                  <span className="font-bold text-sm">AssistAll Inc.</span>
              </div>
              <p className="text-gray-600 text-xs">© 2025 All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
};
export default LandingPage;