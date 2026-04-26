"use client";
import { API_URL } from "@/lib/config";

import { LogOut, LayoutGrid, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalChatWidget from "@/components/GlobalChatWidget";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHub = pathname === "/dashboard";

  const clearDataset = async () => {
    if (!confirm("Are you sure you want to clear the current dataset? All analysis results will be lost.")) return;
    try {
      await fetch(`${API_URL}/api/dataset/clear`, { method: "DELETE" });
    } catch {}
    localStorage.removeItem("dataset_active");
    localStorage.removeItem("dataset_eda");
    localStorage.removeItem("dataset_ml");
    localStorage.removeItem("dataset_filename");
    window.location.href = "/dashboard/upload";
  };

  return (
    <div className="flex flex-col h-screen bg-cyberBg overflow-hidden relative text-blue-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <ParticleBackground />
      </div>

      {/* Top Navigation Bar */}
      <nav className="w-full glass-panel-cyber border-b border-blue-500/10 flex justify-between items-center z-20 px-8 py-4 bg-cyberBg/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
           <Link href="/dashboard" className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-slate-300 drop-shadow-md">
            AutoAnalytica.
           </Link>
           {!isHub && (
             <Link href="/dashboard" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 transition text-sm font-medium">
                <LayoutGrid className="w-4 h-4" /> Return to Hub
             </Link>
           )}
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full border border-blue-500/30 text-blue-500 text-xs font-bold bg-blue-500/10 shadow-md">
            v1.0.0 Enterprise Hub
          </div>
          <button
            onClick={clearDataset}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium text-sm border border-transparent hover:border-red-500/20"
            title="Clear current dataset"
          >
            <Trash2 className="w-4 h-4" /> Clear Dataset
          </button>
          <button 
            onClick={() => {
               localStorage.removeItem("dataset_active");
               window.location.href = "/auth";
            }}
            className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:text-red-400 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      {/* Main Full-Screen Frame */}
      <main className="flex-1 overflow-auto z-10 p-8 relative">
        <div className="max-w-[100rem] mx-auto h-full">
           {children}
        </div>
        <GlobalChatWidget />
      </main>
    </div>
  );
}
