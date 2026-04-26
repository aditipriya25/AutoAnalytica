"use client";

import dynamic from "next/dynamic";
import { BookOpen, Code, Database, Terminal } from "lucide-react";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function DocsPage() {
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
           <a href="/docs" className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors cursor-pointer hidden md:flex">Docs</a>
           <a href="/contact" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Contact</a>
           <a href="/auth" className="px-5 py-2 rounded-full border border-cyberMagenta/40 hover:bg-cyberMagenta/10 transition backdrop-blur-md text-cyberMagenta shadow-[0_0_10px_rgba(208,0,255,0.2)]">
             Login
           </a>
        </div>
      </nav>

      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-40 pb-16 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom duration-500">
         
         {/* Sidebar Navigation */}
         <div className="w-full md:w-64 shrink-0 border-r border-cyberCyan/20 pr-8">
             <div className="text-xs font-bold text-cyberCyan mb-4 uppercase tracking-widest">Documentation Core</div>
             <ul className="space-y-3 text-sm text-white/70">
                 <li><a href="#" className="flex gap-2 items-center text-cyberMagenta font-bold drop-shadow-[0_0_10px_rgba(208,0,255,0.5)]"><BookOpen size={16} /> Getting Started</a></li>
                 <li><a href="#" className="flex gap-2 items-center hover:text-cyberCyan transition"><Database size={16} /> Dataset Architecture</a></li>
                 <li><a href="#" className="flex gap-2 items-center hover:text-cyberCyan transition"><Code size={16} /> API Integration Reference</a></li>
                 <li><a href="#" className="flex gap-2 items-center hover:text-cyberCyan transition"><Terminal size={16} /> Local Server Config</a></li>
             </ul>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 glass-panel-cyber rounded-3xl p-10 border border-cyberCyan/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] min-h-[500px]">
             <div className="inline-flex w-fit px-3 py-1 rounded border border-cyberMagenta/40 bg-cyberMagenta/10 text-cyberMagenta font-bold text-xs mb-6 shadow-[0_0_10px_rgba(208,0,255,0.3)]">
               VERSION 4.2.1
             </div>
             <h1 className="text-4xl font-bold mb-6 text-white">Getting Started with AutoAnalytica</h1>
             <p className="text-white/80 leading-relaxed mb-6">
                 Welcome to the official developer documentation for AutoAnalytica. Our platform seamlessly isolates your multidimensional dataset requirements into robust, completely local machine-learning execution environments.
             </p>
             <h2 className="text-2xl font-bold mt-10 mb-4 text-cyberCyan">1. The Zero-Trust File Uploader</h2>
             <p className="text-white/80 leading-relaxed mb-4">
                 Whenever you upload a dataset, it does not persist rigidly. We map it temporarily in the session memory leveraging <code>fastapi.UploadFile</code> alongside native Python memory buffers.
             </p>
             <div className="bg-black/60 border border-cyberCyan/20 p-4 rounded-xl font-mono text-sm text-cyberMagenta/90 shadow-inner">
                 POST /api/upload<br />
                 Content-Type: multipart/form-data<br />
                 Body: {'{'} file: [binary-stream] {'}'}
             </div>
         </div>

      </div>
    </main>
  );
}
