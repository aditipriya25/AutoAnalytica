"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

export default function DatasetLock({ featureName }: { featureName: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative group">
        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
        <Lock className="w-24 h-24 text-red-500/80 mb-6 drop-shadow-md relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-4 tracking-tight drop-shadow-md">
        System <span className="text-red-500">Locked</span>
      </h1>
      <p className="text-slate-400 text-lg mb-10 max-w-lg text-center leading-relaxed">
        The <span className="text-blue-500 font-bold">{featureName}</span> requires a physical dataset buffer to execute. Please inject a file via the Upload Node to dynamically unlock all computational features.
      </p>
      <Link 
        href="/dashboard/upload"
        className="px-10 py-4 bg-blue-500 text-white rounded-full font-bold hover:bg-slate-300 hover:shadow-lg transition shadow-md transform hover:-translate-y-1 block text-center"
      >
        Launch Upload Portal
      </Link>
    </div>
  );
}
