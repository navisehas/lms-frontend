"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate API call to send reset email
    setTimeout(() => {
      setStatus("success");
      // In a real app, you would call: await axios.post('/api/auth/forgot-password', { email })
    }, 2000);
  };

  // SUCCESS STATE (Show this after sending)
  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your mail</h2>
        <p className="text-gray-600 mb-8">
          We have sent a password recover instructions to your email.
        </p>
        <button 
            onClick={() => window.open('https://gmail.com', '_blank')}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-4"
        >
            Open Email App
        </button>
        <div className="text-sm text-gray-500">
          Did not receive the email? Check your spam filter, or <button onClick={() => setStatus("idle")} className="text-blue-600 font-bold hover:underline">try another email address</button>.
        </div>
        <div className="mt-8 border-t pt-6">
            <Link href="/login" className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition">
                <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
        </div>
      </div>
    );
  }

  // DEFAULT FORM STATE
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="text-sm text-gray-500 mt-2">
            No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {status === "loading" ? "Sending Instructions..." : "Reset Password"}
        </button>

      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}