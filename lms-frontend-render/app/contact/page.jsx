"use client";
import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  HelpCircle, 
  ChevronDown, 
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Navigation,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Contact() {

  // State for FAQ
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { 
      q: "How do I register for a class?", 
      a: "You can register online by clicking the 'Login' button and creating a student account. Alternatively, visit our office with your NIC/Postal ID." 
    },
    { 
      q: "Can I switch from Physical to Online?", 
      a: "Yes. You can change your learning mode at the beginning of every month through the Student Dashboard." 
    },
    { 
      q: "Where can I park my vehicle?", 
      a: "We have a dedicated parking slot for students and parents behind the main building (Slot B)." 
    },
    { 
      q: "What payment methods do you accept?", 
      a: "We accept cash payments at the office and online payments via PayHere (Cards, Bank Transfer, eZ Cash, mCash). You can pay directly through the Student Dashboard." 
    },
  ];

  // Contact methods data
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      subtitle: "Mon-Sun, 8AM-6PM",
      primary: "+94 77 123 4567",
      secondary: "041 2 123 456",
      action: "tel:+94771234567",
      actionText: "Call Now",
      gradient: "from-blue-500 to-blue-700",
      bgGlow: "bg-blue-100"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      subtitle: "Instant Chat Support",
      primary: "+94 77 123 4567",
      secondary: "Quick Response",
      action: "https://wa.me/94771234567",
      actionText: "Chat on WhatsApp",
      gradient: "from-green-500 to-emerald-600",
      bgGlow: "bg-green-100"
    },
    {
      icon: Mail,
      title: "Email",
      subtitle: "24/7 Support",
      primary: "info@institute.lk",
      secondary: "support@institute.lk",
      action: "mailto:info@institute.lk",
      actionText: "Send Email",
      gradient: "from-cyan-500 to-blue-600",
      bgGlow: "bg-cyan-100"
    }
  ];

  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden bg-gray-50">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated Glow Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Geometric shapes */}
        <div className="absolute top-16 right-16 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-24 left-16 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-28 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 rounded-full px-4 py-1.5 mb-6">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Get In Touch</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              We'd Love to
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Hear From You
              </span>
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Have questions about admissions, fees, or technical support? Reach out to us through any of the channels below — we're here to help.
            </p>

            {/* Mini chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: Clock, text: "Quick Response" },
                { icon: CheckCircle, text: "Friendly Support" },
                { icon: Sparkles, text: "24/7 Available" }
              ].map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <chip.icon className="w-4 h-4 text-cyan-300" />
                  {chip.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. CONTACT METHODS - 3 Cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-12 w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, idx) => (
            <a
              key={idx}
              href={method.action}
              target={method.action.startsWith("http") ? "_blank" : undefined}
              rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Decorative bg circle */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${method.bgGlow} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500 opacity-60`}></div>

              <div className="relative">
                <div className={`w-14 h-14 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform`}>
                  <method.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-xs text-gray-500 mb-3 font-medium">{method.subtitle}</p>
                
                <p className="text-base font-bold text-gray-900">{method.primary}</p>
                <p className="text-sm text-gray-500 mb-4">{method.secondary}</p>

                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  <span>{method.actionText}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-3xl transition-all duration-500 w-0 group-hover:w-full"></div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. LOCATION + OFFICE HOURS (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* LEFT: Info cards (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Card */}
            <div className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500 opacity-60"></div>

              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-gray-900 text-base">Main Center</h3>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">MATARA</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    No. 125, Anagarika Dharmapala Mawatha,<br />
                    Matara, Sri Lanka.
                  </p>
                  <a 
                    href="https://www.google.com/maps/dir/?api=1&destination=Matara+Sri+Lanka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500 opacity-60"></div>

              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-900 text-base mb-3">Office Hours</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Mon - Fri</span>
                      <span className="text-sm font-bold text-gray-900">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Saturday</span>
                      <span className="text-sm font-bold text-gray-900">7:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600">Sunday</span>
                      <span className="text-sm font-bold text-gray-900">7:00 AM - 5:00 PM</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Open Now
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative">
                <h3 className="font-extrabold text-lg mb-2">Follow Us</h3>
                <p className="text-blue-100 text-sm mb-4">Stay updated with our latest news & events</p>
                
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, href: "#", label: "Facebook" },
                    { icon: Instagram, href: "#", label: "Instagram" },
                    { icon: Youtube, href: "#", label: "YouTube" }
                  ].map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="w-11 h-11 bg-white/10 hover:bg-white backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:text-blue-600 transition-all hover:scale-110"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Map (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative p-[1px] bg-gradient-to-br from-blue-600 via-cyan-400 to-blue-600 rounded-3xl shadow-2xl h-full min-h-[500px]">
              <div className="bg-white rounded-[22px] overflow-hidden h-full relative">
                {/* Map Header */}
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100 flex items-center gap-3 max-w-[85%]">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Find us at</p>
                    <p className="text-sm font-extrabold text-gray-900 truncate">Matara, Sri Lanka</p>
                  </div>
                </div>

                {/* Google Map - Matara, Sri Lanka */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.726847651264!2d80.53506357492407!3d5.948933394037877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae13eccb98977b9%3A0x9f7e0c64f4a0d9c1!2sMatara%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: "500px" }} 
                  allowFullScreen
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Institute Location - Matara"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. FAQ SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Got Questions?
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                We Have Answers
              </span>
            </h2>
            <p className="text-base text-gray-600">
              Quick answers to the most common questions. Can't find what you're looking for? Reach out to us directly.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-blue-300 shadow-xl shadow-blue-100/50" 
                      : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"
                  }`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-5 text-left gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                        isOpen 
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md" 
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-bold transition-colors ${isOpen ? "text-blue-700" : "text-gray-900"}`}>
                        {faq.q}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isOpen 
                        ? "bg-blue-600 text-white rotate-180" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pl-16 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a 
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. CTA FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gray-900 pt-20 pb-16 overflow-hidden">
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wide">Visit Us Today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Start Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              Learning Journey?
            </span>
          </h2>

          <p className="text-base text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Drop by our Matara office or contact us online. Our friendly team is ready to help you find the perfect course.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/courses"
              className="group bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              View Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="tel:+94771234567"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
