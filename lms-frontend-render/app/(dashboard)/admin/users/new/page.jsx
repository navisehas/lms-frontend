"use client";
import { useState, useRef } from "react";
import { 
  User, Phone, MapPin, Calendar, CreditCard, 
  ArrowLeft, Camera, X, Download, CheckCircle,
  Briefcase, Shield, GraduationCap, Users
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { authFetch } from "@/lib/auth";
const API = process.env.NEXT_PUBLIC_API_URL;


export default function RegisterUser() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [registeredUser, setRegisteredUser] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    gender: "", // Start empty to force user selection
    birthday: "",
    address: "",
    profile_picture: "",
    isic_no: "",
    specialization: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);

  // Get today's date in YYYY-MM-DD format based on local timezone
  const todayObj = new Date();
  const maxDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, phone_no: onlyNums });
    if (errors.phone_no) setErrors({ ...errors, phone_no: null });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profile_picture: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormData({ ...formData, profile_picture: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (formData.phone_no.length !== 10) newErrors.phone_no = "Phone number must be exactly 10 digits";
    if (!formData.gender) newErrors.gender = "Gender is required";
    
    // --- FIXED: Birthday Validation ---
    if (!formData.birthday) {
      newErrors.birthday = "Date of Birth is required";
    } else if (formData.birthday >= maxDate) {
      newErrors.birthday = "Date of Birth must be a date in the past";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (role === "TEACHER") {
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
      if (!formData.description.trim()) newErrors.description = "Description/Bio is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    setLoading(true);

    let endpoint = "/students"; 
    if (role === "TEACHER") endpoint = "/teachers";
    if (role === "MANAGER") endpoint = "/managers";
    if (role === "ADMIN") endpoint = "/admins";

    try {
      const response = await authFetch(`${API}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisteredUser({
          role: role,
          name: formData.name,
          user_id: data.userId || data.studentId, 
          password: data.password,
          profile_picture_url: formData.profile_picture 
        });
        window.scrollTo(0,0);
      } else {
        if (data.error === "Phone number already registered") {
          setErrors((prev) => ({ 
            ...prev, 
            phone_no: "This phone number is already registered in the system." 
          }));
        } else {
          alert(`Registration Failed: ${data.details || data.error}`);
        }
      }
    } catch (error) {
      alert("Server connection failed. Please check your internet or backend status.");
    } finally {
      setLoading(false);
    }
  };

  const downloadIDCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: "#ffffff", scale: 3, useCORS: true, logging: false
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${registeredUser.user_id}_ID_Card.png`;
    link.click();
  };

  const resetForm = () => {
    setRegisteredUser(null);
    setFormData({ 
      name: "", phone_no: "", gender: "", birthday: "", 
      address: "", profile_picture: "", isic_no: "", specialization: "", description: "" 
    });
    setErrors({});
  };

  // --- SUCCESS VIEW (ID CARD GENERATOR) ---
  if (registeredUser) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col items-center">
        
        <div className="bg-green-50 text-green-700 p-6 rounded-xl flex items-center gap-4 mb-8 border border-green-200 w-full max-w-md shadow-sm">
          <CheckCircle size={32} />
          <div>
            <h2 className="font-bold text-lg">{registeredUser.role} Registered Successfully!</h2>
            <p>System ID: <span className="font-mono font-bold">{registeredUser.user_id}</span></p>
            <p>Default Password: <span className="font-mono font-bold">{registeredUser.password}</span></p>
          </div>
        </div>

        {/* --- VISIBLE ID CARD FOR DOWNLOAD --- */}
        <div ref={cardRef} style={{ width: "340px", height: "540px", backgroundColor: "#ffffff", borderRadius: "16px", fontFamily: "sans-serif", position: "relative", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", zIndex: 0 }}></div>
          <div style={{ position: "relative", zIndex: 10, marginTop: "24px", color: "#ffffff", textAlign: "center", width: "100%" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase" }}>ENGLISH GATE</h2>
          </div>
          <div style={{ position: "relative", zIndex: 10, marginTop: "20px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {registeredUser.profile_picture_url ? (
                <img src={registeredUser.profile_picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : <User size={60} color="#9ca3af" />}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "16px 24px", zIndex: 10 }}>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "800", color: "#111827", textAlign: "center", lineHeight: "1.2" }}>
              {registeredUser.name}
            </h1>
            <div style={{ backgroundColor: registeredUser.role === 'ADMIN' ? '#fee2e2' : registeredUser.role === 'TEACHER' ? '#e0e7ff' : '#dcfce3', color: registeredUser.role === 'ADMIN' ? '#991b1b' : registeredUser.role === 'TEACHER' ? '#3730a3' : '#166534', padding: "4px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              {registeredUser.role}
            </div>
            <div style={{ fontSize: "16px", color: "#64748b", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px" }}>
              ID: {registeredUser.user_id}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "24px" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}>
              <QRCode value={registeredUser.user_id} size={160} level="M" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button onClick={downloadIDCard} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
            <Download size={20} /> Download ID Card
          </button>
          <button onClick={resetForm} className="px-6 py-3 text-gray-700 bg-gray-100 font-bold hover:bg-gray-200 rounded-xl transition">
            Register Another User
          </button>
        </div>
      </div>
    );
  }

  // --- REGISTRATION FORM VIEW ---
  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      <div className="flex items-center gap-4 mb-8 mt-6">
        <button type="button" onClick={() => window.history.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Register New User</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 justify-center">
        {[
          { id: "STUDENT", label: "Student", icon: GraduationCap },
          { id: "TEACHER", label: "Teacher", icon: Briefcase },
          { id: "MANAGER", label: "Manager", icon: Users },
          { id: "ADMIN", label: "Admin", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setRole(tab.id);
              setErrors({}); 
            }}
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              role === tab.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <tab.icon size={24} className="mb-2" />
            <span className="font-bold text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border space-y-8" noValidate>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition">
            {formData.profile_picture ? (
              <>
                <img src={formData.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full m-1">
                  <X size={12} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-700">
                <Camera size={32} />
                <span className="text-xs mt-1">Upload Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-700" />
              <input name="name" className={`w-full pl-10 p-2 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handleChange} value={formData.name} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-gray-700" />
              <input name="phone_no" maxLength="10" className={`w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone_no ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handlePhoneChange} value={formData.phone_no} />
            </div>
            {errors.phone_no && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone_no}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
            <select name="gender" className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.gender ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handleChange} value={formData.gender}>
              <option value="" disabled>-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.gender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-gray-700" />
              <input 
                name="birthday" 
                type="date" 
                max={maxDate} 
                className={`w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.birthday ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                onChange={handleChange} 
                value={formData.birthday} 
              />
            </div>
            {errors.birthday && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.birthday}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Address <span className="text-red-500">*</span></label>
          <div className="relative text-gray-700">
            <MapPin size={18} className="absolute left-3 top-3 text-gray-700" />
            <textarea name="address" rows="2" className={`w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handleChange} value={formData.address} />
          </div>
          {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.address}</p>}
        </div>

        {role === "STUDENT" && (
          <div className="pt-4 border-t animate-in fade-in slide-in-from-top-4">
            <label className="block text-sm font-medium mb-1 text-blue-600">ISIC Number <span className="text-gray-400 font-normal">(Optional)</span></label>
            <div className="relative text-gray-700">
              <CreditCard size={18} className="absolute left-3 top-3 text-gray-700" />
              <input name="isic_no" className="w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"  onChange={handleChange} value={formData.isic_no} />
            </div>
          </div>
        )}

        {role === "TEACHER" && (
          <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-600">Specialization <span className="text-red-500">*</span></label>
              <input name="specialization" placeholder="e.g. Mathematics, Science" className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 ${errors.specialization ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handleChange} value={formData.specialization} />
              {errors.specialization && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.specialization}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-600">Description / Bio <span className="text-red-500">*</span></label>
              <textarea name="description" rows="3" placeholder="Teacher qualifications..." className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700 ${errors.description ? 'border-red-500 ring-1 ring-red-500' : ''}`} onChange={handleChange} value={formData.description} />
              {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description}</p>}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 ${
            role === 'STUDENT' ? 'bg-blue-600' : 
            role === 'TEACHER' ? 'bg-blue-600' : 
            role === 'MANAGER' ? 'bg-blue-600' : 'bg-blue-600'
          }`}
        >
          {loading ? "Registering..." : `Register ${role}`}
        </button>
      </form>
    </div>
  );
}