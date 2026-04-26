"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UploadCloud, Database, Network, BarChart3, Binary, FileText, Settings, Activity, Lock } from "lucide-react";

export default function DashboardHub() {
  const [hasDataset, setHasDataset] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasDataset(localStorage.getItem("dataset_active") === "true");
    }
  }, []);
  
  const hubTiles = [
    {
      name: "Upload Data",
      href: "/dashboard/upload",
      icon: UploadCloud,
      desc: "Drag & drop CSV/Excel files into the memory buffer.",
      image: "/images/hub_upload.png",
      span: "md:col-span-2",
      theme: "blue-500"
    },
    {
      name: "EDA Summary",
      href: "/dashboard/eda",
      icon: Database,
      desc: "Statistical node extraction and null computing.",
      image: "/images/feature_pipeline.png",
      span: "md:col-span-1",
      theme: "slate-300"
    },
    {
      name: "Machine Learning Array",
      href: "/dashboard/ml",
      icon: Binary,
      desc: "Autonomous Random Forest generation & Feature logic.",
      image: "/images/hub_ml.png",
      span: "md:col-span-3",
      theme: "blue-500"
    },
    {
      name: "Visualizations Engine",
      href: "/dashboard/visualizations",
      icon: BarChart3,
      desc: "35+ 3D Plotly cartesian models and structural graphics.",
      image: "/images/hero_dashboard.png",
      span: "md:col-span-2",
      theme: "blue-500"
    },
    {
      name: "Outlier Scanning",
      href: "/dashboard/outliers",
      icon: Activity,
      desc: "Deep isolation forest algorithmic fraud scans.",
      image: "/images/feature_visuals.png",
      span: "md:col-span-1",
      theme: "red-500"
    },
    {
      name: "Clustering Algorithms",
      href: "/dashboard/clustering",
      icon: Network,
      desc: "K-Means unsupervised data pairing architectures.",
      image: "/images/hub_cluster.png",
      span: "md:col-span-1",
      theme: "purple-500"
    },
    {
      name: "DeepSeek NLP Synthesis",
      href: "/dashboard/nlp",
      icon: FileText,
      desc: "Live Natural Language summaries of structural metrics.",
      image: "/images/hub_nlp.png",
      span: "md:col-span-2",
      theme: "slate-300"
    }
  ];

  const containerLoader = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const tileAnim = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Central Hub Header */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-blue-500/10 gap-6">
         <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-blue-500 drop-shadow-xl mb-3">
               Central Analytics <span className="text-blue-500">Hub</span>
            </h1>
            <p className="text-slate-400 text-lg">
              {hasDataset ? "Select a computational protocol to launch full-screen immersion." : "Upload a physical dataset to automatically unlock platform analytics."}
            </p>
         </div>

         {/* Mini Overview Panel */}
         <div className="flex gap-4 glass-panel-cyber p-4 rounded-xl border border-blue-500/10 shadow-md">
            <div className="text-center px-4 border-r border-blue-500/10">
               <div className="text-sm text-slate-400 font-medium">Datasets Memory</div>
               <div className={`text-2xl font-bold font-mono ${hasDataset ? 'text-blue-500' : 'text-slate-400'}`}>
                 {hasDataset ? "1" : "0"}
               </div>
            </div>
            <div className="text-center px-4 border-r border-blue-500/10">
               <div className="text-sm text-slate-400 font-medium">Total Rows Parsed</div>
               <div className={`text-2xl font-bold font-mono ${hasDataset ? 'text-slate-300' : 'text-slate-400'}`}>
                 {hasDataset ? "10K" : "0"}
               </div>
            </div>
            <div className="text-center px-4">
               <div className="text-sm text-slate-400 font-medium">Compute</div>
               <div className="text-2xl font-bold text-green-400 font-mono">Online</div>
            </div>
         </div>
      </div>

      {hasDataset && (
         <div className="flex justify-end">
            <button 
              onClick={() => { localStorage.removeItem("dataset_active"); window.location.reload(); }}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Force Clear Dataset Memory (Lock Hub)
            </button>
         </div>
      )}

      {/* Massive Framer Motion OS Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]"
        variants={containerLoader}
        initial="hidden"
        animate="show"
      >
         {hubTiles.map((tile, i) => {
            const Icon = tile.icon;
            const isUpload = tile.name === "Upload Data";
            const isLocked = !hasDataset && !isUpload;

            return (
              <motion.div
                key={tile.name}
                variants={tileAnim}
                whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                className={`relative rounded-3xl overflow-hidden glass-panel-cyber border group shadow-lg ${tile.span} ${
                  isLocked ? "border-blue-500/10 opacity-60 grayscale cursor-not-allowed" : "border-white/15 cursor-pointer"
                }`}
              >
                 {!isLocked && <Link href={tile.href} className="absolute inset-0 z-20"></Link>}
                 {isLocked && <div className="absolute inset-0 z-20" onClick={() => alert("Memory Locked: Please upload a dataset first via the Upload Data tile.")}></div>}
                 
                 {/* Generated Art Background */}
                 <Image 
                   src={tile.image}
                   alt={tile.name}
                   layout="fill"
                   objectFit="cover"
                   className={`opacity-50 mix-blend-screen transition-all duration-[1.5s] object-center ${!isLocked && 'group-hover:scale-110 group-hover:opacity-70'}`}
                 />
                 
                 {/* Darkness Overlay gradient */}
                 <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-colors duration-500 ${
                   isLocked ? "from-black via-cyberBg/90 to-black/50" : "from-cyberBg via-cyberBg/70 to-transparent group-hover:from-black"
                 }`}></div>
                 
                 {/* Interactive Content */}
                 <div className="absolute bottom-0 left-0 p-8 w-full group-hover:pb-10 transition-all duration-300">
                    <div className={`mb-3 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md shadow-md transition-colors ${
                      isLocked ? "bg-gray-800/50 border border-gray-600/30 text-slate-400" : `bg-${tile.theme}/20 border border-${tile.theme}/30 text-${tile.theme} group-hover:bg-${tile.theme} group-hover:text-white`
                    }`}>
                       <Icon className={`w-6 h-6 ${!isLocked && `text-${tile.theme} group-hover:text-white`}`} />
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className={`text-2xl font-bold transition-colors ${isLocked ? 'text-slate-400' : 'text-blue-500 group-hover:text-slate-300'}`}>
                        {tile.name}
                      </h2>
                      {isLocked && <Lock className="w-5 h-5 text-red-500/50" />}
                    </div>
                    <p className={`text-sm line-clamp-2 pr-4 ${isLocked ? 'text-gray-600' : 'text-blue-500'}`}>
                       {isLocked ? "SYSTEM LOCKED: Awaiting initial dataset buffer injection." : tile.desc}
                    </p>
                 </div>
              </motion.div>
            );
         })}
      </motion.div>

    </div>
  );
}
