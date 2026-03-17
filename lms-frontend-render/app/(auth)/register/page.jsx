"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  UserPlus, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle,
  MapPin, 
  Calendar,
  Camera,
  Upload
} from "lucide-react";

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

  // (Converts to Base64)
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

    // 1. Check for missing fields
    if (!formData.name || !formData.phone_no || !formData.gender || !formData.birthday || !formData.address) {
      setMessage({ type: "error", text: "All fields except ISIC Number and Profile Picture are required." });
      setLoading(false);
      return;
    }

    // 2. Validate Phone Number
    if (formData.phone_no.length !== 10) {
      setMessage({ type: "error", text: "Please enter a valid 10-digit phone number." });
      setLoading(false);
      return;
    }

    // 3. Validate Birthday (Cannot be today or in the future)
    if (formData.birthday >= maxDate) {
      setMessage({ type: "error", text: "Date of Birth must be a date in the past." });
      setLoading(false);
      return;
    }

    try {
      // CALL BACKEND API
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Success! Your ID is ${data.userId}. Please wait for admin approval.` });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-500 mt-2">Join us to start your learning journey.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} className="shrink-0"/> : <AlertCircle size={20} className="shrink-0"/>}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* --- PROFILE PICTURE UPLOAD --- */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div 
            className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-sm bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
            onClick={() => fileInputRef.current.click()}
            title="Upload Profile Picture"
          >
            {formData.profile_picture_url ? (
              <img src={formData.profile_picture_url} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition" />
            ) : (
              <User size={40} className="text-gray-700" />
            )}
            
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white">
              <Camera size={24} />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <p className="text-xs text-gray-700 mt-2 font-medium flex items-center gap-1">
            <Upload size={12}/> Click to upload photo (Optional)
          </p>
        </div>
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
            <input 
              name="name"
              type="text" 
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
              placeholder="Kasun Perera"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
              <input 
                name="phone_no"
                type="text" 
                required
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
                placeholder="0771234567"
                value={formData.phone_no}
                onChange={handlePhoneChange} 
              />
            </div>
          </div>
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
            <div className="relative">  
              <select 
                name="gender" 
                className="w-full p-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-700" 
                onChange={handleChange} 
                value={formData.gender}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <div className="relative">
               <Calendar className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
               <input 
                 name="birthday" 
                 type="date" 
                 required
                 max={maxDate} // Restricts the HTML calendar picker
                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700" 
                 onChange={handleChange} 
                 value={formData.birthday} 
               />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
              <input 
                name="address"
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
                placeholder="Colombo, Sri Lanka"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ISIC Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISIC Number (Optional)</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-700 w-5 h-5" />
            <input 
              name="isic_no"
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
              placeholder="Enter ISIC Number if applicable"
              value={formData.isic_no}
              onChange={handleChange}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-500 mt-4"
        >
          {loading ? "Creating Account..." : <>Register Now <UserPlus className="w-5 h-5" /></>}
        </button>

      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}