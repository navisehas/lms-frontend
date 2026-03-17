"use client"; // This directive is crucial
import { useEffect } from "react";

export default function Chatbot() {
  useEffect(() => {

    if (document.getElementById("jotform-agent-script")) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jotfor.ms/agent/embedjs/019c3da4a45d7897a9cacca2348d12ec1793/embed.js";
    script.id = "jotform-agent-script";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      
    };
  }, []);

  return null; 
}