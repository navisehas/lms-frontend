"use client";
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Contact() {
  
  // 1. STATE FOR FORM
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success

  // 2. STATE FOR FAQ
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  // 3. DATA
  const faqs = [
    { q: "How do I register for a class?", a: "You can register online by clicking the 'Login' button and creating a student account. Alternatively, visit our office with your NIC/Postal ID." },
    { q: "Can I switch from Physical to Online?", a: "Yes. You can change your learning mode at the beginning of every month through the Student Dashboard." },
    { q: "Where can I park my vehicle?", a: "We have a dedicated parking slot for students and parents behind the main building (Slot B)." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HERO HEADER */}
      <div className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-blue-200 max-w-xl mx-auto">
          Have questions about admissions, fees, or technical support? We are here to help.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: CONTACT INFO & MAP */}
          <div className="space-y-8">
            
            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Phone</h3>
                <p className="text-gray-600 text-sm mt-1">+94 77 123 4567</p>
                <p className="text-gray-600 text-sm">011 2 123 456</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">WhatsApp</h3>
                <p className="text-gray-600 text-sm mt-1">Chat Support Available</p>
                <a href="#" className="text-green-600 text-sm font-bold mt-1 hover:underline">Click to Chat</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
               <div className="flex items-start gap-4 mb-6">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                   <MapPin className="w-5 h-5 text-gray-600" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900">Main Center</h3>
                   <p className="text-gray-600 text-sm">No. 125, High Level Road, Nugegoda, Sri Lanka.</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                   <Clock className="w-5 h-5 text-gray-600" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900">Office Hours</h3>
                   <p className="text-gray-600 text-sm">Mon - Fri: 8:00 AM - 6:00 PM</p>
                   <p className="text-gray-600 text-sm">Sat - Sun: 7:00 AM - 5:00 PM</p>
                 </div>
               </div>
            </div>

            {/* GOOGLE MAP EMBED */}
            <div className="bg-white p-2 rounded-xl shadow-sm overflow-hidden h-80 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.80385597899!2d79.8562055!3d6.8649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a443532b465%3A0x629dd087e5b1522b!2sNugegoda%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>

          </div>

          {/* RIGHT COLUMN: FORM & FAQ */}
          <div className="space-y-8">
            
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {formStatus === "success" ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center">
                  <p className="font-bold">Message Sent Successfully!</p>
                  <p className="text-sm">We will get back to you within 24 hours.</p>
                  <button onClick={() => setFormStatus("idle")} className="mt-2 text-sm underline">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input required type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="077 123 4567" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                      <option>General Inquiry</option>
                      <option>Admission Support</option>
                      <option>Payment Issue</option>
                      <option>Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea required rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="How can we help you?"></textarea>
                  </div>

                  <button 
                    disabled={formStatus === "submitting"}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400"
                  >
                    {formStatus === "submitting" ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" /> Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
                    >
                      <span className="font-medium text-gray-700">{faq.q}</span>
                      {openFaq === index ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {openFaq === index && (
                      <div className="p-4 bg-white text-gray-600 text-sm border-t">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}