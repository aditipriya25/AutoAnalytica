"use client";

import { Activity, Shield, Zap, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function AboutPage() {
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
           <a href="/about" className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors cursor-pointer hidden md:flex">About</a>
           <a href="/pricing" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Pricing</a>
           <a href="/docs" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Docs</a>
           <a href="/contact" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Contact</a>
           <a href="/auth" className="px-5 py-2 rounded-full border border-cyberMagenta/40 hover:bg-cyberMagenta/10 transition backdrop-blur-md text-cyberMagenta shadow-[0_0_10px_rgba(208,0,255,0.2)]">
             Login
           </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-40 pb-20 text-center">
         <div className="inline-flex w-fit px-4 py-2 rounded-full border border-cyberCyan/40 bg-cyberCyan/10 text-cyberCyan font-bold backdrop-blur-md text-sm shadow-[0_0_15px_rgba(0,229,255,0.3)] mb-6 animate-in slide-in-from-bottom duration-500">
           What We Do
         </div>
         <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 drop-shadow-[0_0_15px_rgba(208,0,255,0.4)] animate-in slide-in-from-bottom duration-700">
           Autonomous Intelligence <br/>
           <span className="text-cyberCyan text-3xl md:text-5xl">Without The Overhead.</span>
         </h1>
         <p className="max-w-3xl mx-auto text-lg text-cyberMagenta/80 leading-relaxed animate-in slide-in-from-bottom duration-1000">
             AutoAnalytica is an enterprise-grade data science engine wrapped inside an intuitive WebGL dashboard. We've completely stripped away the complexities of Python machine learning, deploying an architecture that ingests raw CSVs and outputs interactive Neural visualisations instantly.
         </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Detailed Block 1 */}
          <div className="glass-panel-cyber rounded-3xl p-10 flex flex-col justify-center border border-cyberCyan/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] animate-in slide-in-from-left duration-1000">
             <div className="w-16 h-16 rounded-2xl bg-cyberCyan/20 flex flex-col items-center justify-center text-cyberCyan mb-6 border border-cyberCyan/50 shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                 <Zap size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-4">Immediate Execution</h3>
             <p className="text-cyberCyan/70 leading-relaxed">
                 You don't need Jupyter Notebooks, dependency mapping, or deployment orchestration. Our Zero-Trust Python backend catches your datasets securely via OAuth2 streams and fires K-Means multidimensional arrays back to the browser in under ~400ms.
             </p>
          </div>

          {/* Detailed Block 2 */}
          <div className="glass-panel-cyber rounded-3xl p-10 flex flex-col justify-center border border-cyberMagenta/30 shadow-[0_0_30px_rgba(208,0,205,0.15)] animate-in slide-in-from-right duration-1000">
             <div className="w-16 h-16 rounded-2xl bg-cyberMagenta/20 flex flex-col items-center justify-center text-cyberMagenta mb-6 border border-cyberMagenta/50 shadow-[0_0_15px_rgba(208,0,255,0.5)]">
                 <Shield size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-4">Total Security Protocol</h3>
             <p className="text-cyberMagenta/80 leading-relaxed">
                 Your data never permanently persists in open memory pools. Datasets are heavily verified against strict Regex boundaries and purged upon session crash. Our backend actively scrubs DataFrame remnants.
             </p>
          </div>
      </div>

    </main>
  );
}
