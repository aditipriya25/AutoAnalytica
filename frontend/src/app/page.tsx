"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Zap, Layers } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });
const CinematicIntro = dynamic(() => import("@/components/CinematicIntro"), { ssr: false });

export default function LandingPage() {
  const [cinematicCompleted, setCinematicCompleted] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, mass: 1, damping: 15 } }
  };

  return (
    <main className="relative min-h-screen bg-cyberBg text-white overflow-hidden font-sans" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08), transparent 30%), radial-gradient(circle at 85% 30%, rgba(148, 163, 184, 0.08), transparent 30%)" }}>
      
      {!cinematicCompleted && <CinematicIntro onComplete={() => setCinematicCompleted(true)} />}

      {cinematicCompleted && (
        <>
          {/* Immersive Dark Poly Web Background spanning the whole website via fixed positioning */}
          <div className="fixed inset-0 z-0 opacity-100 mix-blend-screen">
              <ParticleBackground onIntroComplete={() => setIntroCompleted(true)} />
          </div>
      
      <AnimatePresence>
        {introCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative z-10"
          >
            {/* Navigation Bar */}
            <motion.nav 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-transparent"
            >
              <div className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-slate-200">
                AutoAnalytica
              </div>
              <div className="flex items-center gap-8 text-sm font-medium text-slate-300">
                 <a href="/" className="hover:text-white transition-colors cursor-pointer hidden md:flex">Home</a>
                 <a href="/about" className="hover:text-blue-400 transition-colors cursor-pointer hidden md:flex">About</a>
                 <a href="/pricing" className="hover:text-blue-400 transition-colors cursor-pointer hidden md:flex">Pricing</a>
                 <a href="/docs" className="hover:text-blue-400 transition-colors cursor-pointer hidden md:flex">Docs</a>
                 <a href="/contact" className="hover:text-blue-400 transition-colors cursor-pointer hidden md:flex">Contact</a>
                 <a href="/auth" className="px-6 py-2.5 rounded-full border border-slate-600 hover:bg-slate-800 transition backdrop-blur-md text-slate-100 shadow-sm">
                   Login
                 </a>
              </div>
            </motion.nav>

            {/* ================= HERO SECTION ================= */}
            <div className="relative z-10 max-w-[90rem] mx-auto px-8 min-h-[90vh] flex flex-col lg:flex-row items-center justify-center gap-16 pt-32 pb-20">
               
               {/* Text Left */}
               <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex-1 flex flex-col gap-8 z-10 w-full"
               >
                 <motion.div variants={itemVariants} className="inline-flex w-fit px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 font-medium backdrop-blur-md text-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                   Announcing Advanced BI Integration v2.0
                 </motion.div>
                 
                 <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] text-slate-100">
                   Unleash The <br/>
                   <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-slate-300">
                     Intelligence
                   </span> Of Data.
                 </motion.h1>
                 
                 <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-lg leading-relaxed font-light">
                   Enterprise-grade visual analytics and AI. AutoAnalytica trains classification algorithms and generates executive summaries directly from your tabular data with zero backend code.
                 </motion.p>
                 
                 <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
                    <a href="/auth" className="px-8 py-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
                      Get Started <ArrowRight size={18} />
                    </a>
                    <a href="/dashboard" className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-all duration-300 flex items-center justify-center">
                      Explore Dashboard
                    </a>
                 </motion.div>
               </motion.div>

               {/* Visual Right Component */}
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="flex-1 w-full max-w-xl z-10 hidden lg:flex"
               >
                 <div className="relative w-full aspect-square md:aspect-[4/3] glass-panel-cyber rounded-3xl p-6 overflow-hidden">
                     
                     {/* Decorative Abstract Graph Lines */}
                     <div className="absolute top-6 left-6 right-6 bottom-6 flex flex-col gap-4">
                        <div className="w-full flex items-center justify-between opacity-70">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Enterprise Neural Analysis</div>
                          <div className="h-6 w-16 bg-blue-900/40 rounded-full border border-blue-500/30 flex justify-end p-1"><div className="w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div></div>
                        </div>
                        
                        <div className="flex-1 w-full flex items-end gap-2 px-4 border-b border-slate-700 pb-4">
                           {[40, 25, 75, 50, 90, 60, 100].map((h, i) => (
                              <div key={i} className="flex-1 bg-gradient-to-t from-blue-900/50 to-blue-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                           ))}
                        </div>

                        <div className="h-20 w-full bg-slate-800/60 rounded-xl px-4 flex items-center justify-between border border-white/5 backdrop-blur-xl">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                  <Activity size={18} />
                               </div>
                               <div>
                                  <div className="text-sm font-semibold text-slate-200">Insight Generated</div>
                                  <div className="text-xs text-slate-400">Correlation Detected (0.92)</div>
                               </div>
                           </div>
                           <span className="text-xs font-semibold text-blue-400">+42.8%</span>
                        </div>
                     </div>
                 </div>
               </motion.div>
            </div>
               
            {/* ================= PLATFORM ARCHITECTURE FEATURES ================= */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative z-10 max-w-[90rem] mx-auto px-8 py-32 border-t border-slate-800"
            >
               <div className="text-center mb-20">
                   <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-slate-100">
                       The AutoAnalytica <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-200">Cognitive Engine</span>
                   </h2>
                   <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                       Explore the architecture powering the next generation of autonomous enterprise data science. Completely localized, fiercely secure.
                   </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="glass-panel-cyber rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
                       <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 shadow-sm">
                           <Layers size={24} />
                       </div>
                       <h3 className="text-2xl font-semibold text-slate-100 mb-3">AI Deep Clustering</h3>
                       <p className="text-slate-400 leading-relaxed text-sm font-light">
                           High-dimensional data mapping relying on robust machine learning algorithms. The Engine dynamically builds clean visual structures inside an isolated environment.
                       </p>
                   </div>

                   <div className="glass-panel-cyber rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
                       <div className="w-14 h-14 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                           <Zap size={24} />
                       </div>
                       <h3 className="text-2xl font-semibold text-slate-100 mb-3">Zero-Trust Pipeline</h3>
                       <p className="text-slate-400 leading-relaxed text-sm font-light">
                           Local computation protocols enforce strict corporate security bounds. Datasets are purged on session collapse utilizing fast memory-safe execution.
                       </p>
                   </div>

                   <div className="glass-panel-cyber rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
                       <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-sm">
                           <Activity size={24} />
                       </div>
                       <h3 className="text-2xl font-semibold text-slate-100 mb-3">Continuous Inference</h3>
                       <p className="text-slate-400 leading-relaxed text-sm font-light">
                           Execute autonomous analytical sweeps instantaneously. Generates comprehensive PDF executive reports wrapping live statistical findings.
                       </p>
                   </div>
               </div>
            </motion.div>

            {/* ================= HOW IT WORKS ================= */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 max-w-[90rem] mx-auto px-8 py-24 bg-[#0a0f1a]/80 border-y border-slate-800 backdrop-blur-md"
            >
               <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-100">Integrating into your <span className="text-blue-400">Workflow</span></h2>
               </div>
               <div className="flex flex-col md:flex-row gap-12 justify-center max-w-5xl mx-auto relative">
                   <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 z-0"></div>
                   
                   {["Secure Authentication", "Upload Master Data", "Access Insights"].map((step, i) => (
                       <div key={i} className="flex-1 flex flex-col items-center text-center relative z-10">
                           <div className="w-14 h-14 rounded-full bg-[#060A14] border border-blue-500 text-blue-400 font-semibold flex items-center justify-center text-xl mb-6 shadow-sm">
                               {i + 1}
                           </div>
                           <h3 className="text-xl font-semibold text-slate-100 mb-2">{step}</h3>
                           <p className="text-sm text-slate-400 px-4 font-light">
                               {i === 0 && "Sign up seamlessly via zero-trust corporate directory login flows."}
                               {i === 1 && "Ingest massive datasets securely inside your browser runtime memory."}
                               {i === 2 && "A fully interactive BI dashboard is autonomously mapped and generated."}
                           </p>
                       </div>
                   ))}
               </div>
            </motion.div>

            {/* ================= STANDARD FOOTER ================= */}
            <footer className="relative z-10 bg-[#060A14]/90 pt-16 pb-8 px-8 backdrop-blur-xl border-t border-slate-800">
                <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row justify-between gap-12 border-b border-slate-800 pb-12 mb-8">
                    <div className="max-w-xs">
                        <div className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-slate-200 mb-4">
                          AutoAnalytica
                        </div>
                        <p className="text-sm text-slate-500 font-light">The premier enterprise data intelligence and BI reporting platform for agile corporate teams.</p>
                    </div>
                    <div className="flex gap-16">
                        <div>
                            <h4 className="text-slate-200 font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-blue-400 transition">Reporting</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition">Analytics</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition">Integrations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-200 font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition">Enterprise</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-light">
                    <p>&copy; 2026 AutoAnalytica Inc. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
                    </div>
                </div>
            </footer>
            
            {/* Dense Environment Fog */}
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#060A14] to-transparent z-0 pointer-events-none"></div>

          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </main>
  );
}
