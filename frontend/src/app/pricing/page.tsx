"use client";

import { CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function PricingPage() {
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
           <a href="/pricing" className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors cursor-pointer hidden md:flex">Pricing</a>
           <a href="/docs" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Docs</a>
           <a href="/contact" className="hover:text-cyberCyan transition-colors cursor-pointer hidden md:flex">Contact</a>
           <a href="/auth" className="px-5 py-2 rounded-full border border-cyberMagenta/40 hover:bg-cyberMagenta/10 transition backdrop-blur-md text-cyberMagenta shadow-[0_0_10px_rgba(208,0,255,0.2)]">
             Login
           </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-8 pt-40 pb-16 text-center animate-in slide-in-from-bottom duration-500">
         <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
             Commercial <span className="text-cyberCyan">Access Plans</span>
         </h1>
         <p className="text-xl text-cyberCyan/70 max-w-2xl mx-auto">
             Deploy local data execution. Zero dark patterns, simple pricing limits perfectly mapped to your enterprise memory bounds.
         </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-8 pb-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700">
          
          {/* Tier 1 */}
          <div className="glass-panel-cyber rounded-3xl p-8 border border-cyberCyan/20 hover:-translate-y-2 transition-transform shadow-[0_0_15px_rgba(0,229,255,0.1)]">
             <h3 className="text-xl font-bold mb-2">Student / Researcher</h3>
             <div className="text-4xl font-black text-white my-4">$0<span className="text-sm font-normal text-white/50">/mo</span></div>
             <p className="text-sm text-cyberCyan/60 mb-6">Execution locked to strict memory caps. Ideal for isolated academia testing.</p>
             <ul className="space-y-4 mb-8 text-sm text-white/80">
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberCyan" /> 5MB Local CSV Upload</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberCyan" /> Basic Regression Matrices</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberCyan" /> Standard Deviation Checking</li>
             </ul>
             <a href="/auth" className="block text-center w-full py-3 rounded-lg border border-cyberCyan text-cyberCyan font-bold hover:bg-cyberCyan hover:text-white transition">Deploy Local Node</a>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className="glass-panel-cyber rounded-3xl p-8 border border-cyberMagenta/50 transform md:-translate-y-4 shadow-[0_0_30px_rgba(208,0,255,0.3)] relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyberMagenta text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(208,0,255,0.5)]">
                 ENTERPRISE DEFAULT
             </div>
             <h3 className="text-xl font-bold mb-2 text-cyberMagenta">Neural Standard</h3>
             <div className="text-4xl font-black text-cyberMagenta my-4 drop-shadow-[0_0_10px_rgba(208,0,255,0.4)]">$145<span className="text-sm font-normal text-cyberMagenta/50">/mo</span></div>
             <p className="text-sm text-white/60 mb-6">Unrestricted pipeline throughput relying firmly on DeepSeek API bindings.</p>
             <ul className="space-y-4 mb-8 text-sm text-white/90 font-medium">
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberMagenta" /> Unlimited Memory Buffer Cap</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberMagenta" /> Full NLP Context Analytics</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberMagenta" /> Native PDF Output Generators</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberMagenta" /> 3D WebGL Neural Heatmaps</li>
             </ul>
             <a href="/auth" className="block text-center w-full py-3 rounded-lg bg-cyberMagenta text-white font-bold hover:bg-cyberCyan hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] transition">Initialize Pipeline</a>
          </div>

          {/* Tier 3 */}
          <div className="glass-panel-cyber rounded-3xl p-8 border border-cyberPurple/30 hover:-translate-y-2 transition-transform shadow-[0_0_15px_rgba(138,43,226,0.1)]">
             <h3 className="text-xl font-bold mb-2 text-cyberPurple drop-shadow-[0_0_10px_rgba(138,43,226,0.5)]">Dedicated Core</h3>
             <div className="text-4xl font-black text-white my-4">$850<span className="text-sm font-normal text-white/50">/mo</span></div>
             <p className="text-sm text-white/50 mb-6">For massive database interconnectivity spanning autonomous enterprise data vaults.</p>
             <ul className="space-y-4 mb-8 text-sm text-white/70">
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberPurple" /> Private V8 Environment</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberPurple" /> Zero-Trust Intranet Portals</li>
                 <li className="flex gap-3 items-center"><CheckCircle2 size={16} className="text-cyberPurple" /> Automatic Hyperparameter Tuning</li>
             </ul>
             <a href="#" className="block text-center w-full py-3 rounded-lg border border-cyberPurple text-cyberPurple font-bold hover:bg-cyberPurple hover:text-white transition">Contact Security Engineering</a>
          </div>

      </div>

    </main>
  );
}
