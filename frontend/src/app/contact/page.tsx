"use client";

import dynamic from "next/dynamic";
import { Send } from "lucide-react";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-cyberBg text-white overflow-hidden font-sans" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(208, 0, 255, 0.15), transparent 30%), radial-gradient(circle at 85% 30%, rgba(0, 229, 255, 0.15), transparent 30%)" }}>
      
      <div className="absolute inset-0 z-0">
          <ParticleBackground />
      </div>
      
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-transparent border-b border-cyberCyan/10 backdrop-blur-sm">
        <a href="/" className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyberMagenta to-cyberCyan drop-shadow-[0_0_10px_rgba(208,0,255,0.4)]">
          AutoAnalytica
        </a>
        <div className="flex items-center gap-8 text-sm font-bold text-white/70">
           <a href="/" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Home</a>
           <a href="/about" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">About</a>
           <a href="/pricing" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Pricing</a>
           <a href="/docs" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Docs</a>
           <a href="/contact" className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors cursor-pointer hidden md:flex">Contact</a>
           <a href="/auth" className="px-5 py-2 rounded-full border border-cyberMagenta/40 hover:bg-cyberMagenta/10 transition backdrop-blur-md text-cyberMagenta shadow-[0_0_10px_rgba(208,0,255,0.2)]">
             Login
           </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-40 pb-16 animate-in slide-in-from-bottom duration-500 flex flex-col md:flex-row gap-16">
         
         <div className="flex-1">
             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                 Secure <span className="text-cyberMagenta">Comms.</span>
             </h1>
             <p className="text-xl text-cyberCyan/70 max-w-xl mb-10 leading-relaxed">
                 Need a customized V8 backend rendering pipeline? Looking for academic deployment limits? Open a secure support channel directly with the core engineering node.
             </p>
             <div className="glass-panel-cyber p-8 rounded-3xl border border-cyberCyan/20">
                 <div className="flex flex-col gap-6">
                    <div>
                        <div className="text-cyberCyan font-bold text-sm mb-1">ENTERPRISE HOTLINE</div>
                        <div className="text-white text-xl">1-800-NEURAL-AI</div>
                    </div>
                    <div>
                        <div className="text-cyberCyan font-bold text-sm mb-1">SECURE ENCRYPTED EMAIL</div>
                        <div className="text-white text-xl">system@autoanalytica.ai</div>
                    </div>
                 </div>
             </div>
         </div>

         <div className="flex-1">
             <div className="glass-panel-cyber rounded-3xl p-8 border border-cyberMagenta/30 shadow-[0_0_30px_rgba(208,0,255,0.2)]">
                 <h3 className="text-2xl font-bold mb-6 text-white">Initialize Thread</h3>
                 <form className="flex flex-col gap-4">
                     <div className="flex flex-col gap-1">
                         <label className="text-sm text-cyberCyan/80 font-bold">Node Identification</label>
                         <input type="text" className="bg-black/40 border border-cyberCyan/30 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-cyberMagenta transition backdrop-blur-md" placeholder="Full Name or Org" />
                     </div>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm text-cyberCyan/80 font-bold">Encrypted Reply Address</label>
                         <input type="email" className="bg-black/40 border border-cyberCyan/30 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-cyberMagenta transition backdrop-blur-md" placeholder="analyst@domain.com" />
                     </div>
                     <div className="flex flex-col gap-1">
                         <label className="text-sm text-cyberCyan/80 font-bold">Transmission Protocol (Message)</label>
                         <textarea rows={4} className="bg-black/40 border border-cyberCyan/30 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-cyberMagenta transition backdrop-blur-md" placeholder="Detail your pipeline requirements..." />
                     </div>
                     <button type="button" className="mt-4 bg-cyberMagenta text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(208,0,255,0.5)] hover:bg-cyberCyan hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition flex items-center justify-center gap-2">
                         <Send size={18} /> Transmit Query
                     </button>
                 </form>
             </div>
         </div>

      </div>

    </main>
  );
}
