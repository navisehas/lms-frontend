"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle,
  MapPin, 
  Calendar,
  Camera,
  Upload,
  BookOpen,
  ArrowRight,
  Shield,
  IdCard
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    gender: "Male",
    birthday: "",
    address: "",
    isic_no: "",
    profile_picture_url: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get today's date in YYYY-MM-DD format based on local timezone
  const todayObj = new Date();
  const maxDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, ''); 
    setFormData({ ...formData, phone_no: onlyNums });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_picture_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.name || !formData.phone_no || !formData.gender || !formData.birthday || !formData.address) {
      setMessage({ type: "error", text: "All fields except ISIC Number and Profile Picture are required." });
      setLoading(false);
      return;
    }

    if (formData.phone_no.length !== 10) {
      setMessage({ type: "error", text: "Please enter a valid 10-digit phone number." });
      setLoading(false);
      return;
    }

    if (formData.birthday >= maxDate) {
      setMessage({ type: "error", text: "Date of Birth must be a date in the past." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok) {
        setMessage({ type: "success", text: `Success! Your ID is ${data.userId}. Please wait for admin approval.` });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: data?.error || `Registration failed. Check that the backend is running at ${API}.`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* ═══ HEADER: Logo + Title + Avatar Side-by-Side ═══ */}
      <div className="flex items-center gap-4 mb-5">
        
        {/* Avatar Upload (LEFT) */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md opacity-40"></div>
          
          <div 
            className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current.click()}
            title="Upload Profile Picture"
          >
            {formData.profile_picture_url ? (
              <img 
                src={formData.profile_picture_url} 
                alt="Preview" 
                className="w-full h-full object-cover group-hover:opacity-60 transition" 
              />
            ) : (
              <User size={26} className="text-blue-600" />
            )}
            
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white">
              <Camera size={18} />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
        </div>

        {/* Title (RIGHT) */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Create your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Account
            </span>
          </h1>
          <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
            <Upload size={10}/> Click avatar to upload photo (optional)
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-3 p-2.5 rounded-lg flex items-start gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' 
            ? <CheckCircle size={14} className="shrink-0 mt-0.5"/> 
            : <AlertCircle size={14} className="shrink-0 mt-0.5"/>}
          <span>{message.text}</span>
        </div>
      )}

      {/* ═══ FORM: 2-Column Grid Layout ═══ */}
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ROW 1: Full Name + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'name' ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'name' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder="Kasun Perera"
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'phone_no' ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'phone_no' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input 
                  name="phone_no"
                  type="text" 
                  required
                  maxLength={10}
                  placeholder="0771234567"
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                  value={formData.phone_no}
                  onChange={handlePhoneChange} 
                  onFocus={() => setFocusedField('phone_no')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Gender + Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'gender' ? 'opacity-30' : ''}`}></div>
              <select 
                name="gender" 
                className="relative w-full px-3 py-2.5 rounded-lg text-gray-900 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all cursor-pointer" 
                onChange={handleChange} 
                value={formData.gender}
                onFocus={() => setFocusedField('gender')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'birthday' ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 pointer-events-none ${focusedField === 'birthday' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input 
                  name="birthday" 
                  type="date" 
                  required
                  max={maxDate}
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all" 
                  onChange={handleChange} 
                  value={formData.birthday} 
                  onFocus={() => setFocusedField('birthday')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Address + ISIC Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'address' ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'address' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input 
                  name="address"
                  type="text" 
                  required
                  placeholder="Colombo, Sri Lanka"
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* ISIC Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              ISIC Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative group transition-all duration-300">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'isic_no' ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <IdCard className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'isic_no' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input 
                  name="isic_no"
                  type="text" 
                  placeholder="If applicable"
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                  value={formData.isic_no}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('isic_no')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                Register Now
                <UserPlus size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>

      </form>

      {/* ═══ FOOTER: Security Badge + Login Link in one row ═══ */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Encrypted &amp; secure</span>
        </div>
        <p className="text-gray-600 text-xs">
          Already registered?{" "}
          <Link 
            href="/login" 
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group"
          >
            Sign In
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
