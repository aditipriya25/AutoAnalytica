"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

export default function UploadPage() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<{name: string, size: number, date: string}[]>([]);

  useEffect(() => {
    try {
       setHistory(JSON.parse(localStorage.getItem("dataset_history") || "[]"));
    } catch(e) {}
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileTarget(droppedFile)) setFile(droppedFile);
    }
  }, []);

  const isValidFileTarget = (file: File) => {
    const validTypes = [".csv", ".xlsx", ".json", ".tsv", ".sql"];
    return validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));
  };

  const handleDatasetUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setProgress(20);
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", "User dashboard stream.");
        formData.append("is_public", "false");

        const res = await fetch("http://localhost:8000/api/dataset/upload", {
            method: "POST",
            body: formData
        });
        setProgress(80);
        
        if (res.ok) {
            const payload = await res.json();
            
            // Store parsed EDA schemas natively for Dashboard rendering
            localStorage.setItem("dataset_eda", JSON.stringify(payload.eda));
            
            setProgress(100);
            const newHistoryItem = { name: file.name, size: file.size, date: new Date().toISOString() };
            const currentHistory = JSON.parse(localStorage.getItem("dataset_history") || "[]");
            localStorage.setItem("dataset_history", JSON.stringify([newHistoryItem, ...currentHistory]));

            localStorage.setItem("dataset_active", "true");
            alert("Upload Complete! EDA parsing successfully embedded into architecture.");
            window.location.href = "/dashboard";
        } else {
            alert("Failed to securely upload dataset.");
            setIsUploading(false);
        }
    } catch (err) {
        console.error(err);
        alert("CRITICAL ERROR: Failed to establish handshake with Python Backend port 8000.");
        setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
          Upload Dataset Workspace
        </h1>
        <p className="text-slate-400 mt-2">
          Securely inject raw operational data into the computational graph.
        </p>
      </div>

      <form onSubmit={handleDatasetUpload} className="flex flex-col gap-6">
        {/* Metdata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400 font-medium">Dataset Identifier String</label>
            <input required type="text" className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition" placeholder="e.g. Q3_Financial_Metrics" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400 font-medium">Access Matrix</label>
            <select className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition">
              <option>Private (Zero-Trust Isolated)</option>
              <option>Public (Visible to Organization)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400 font-medium">Dataset Description / Hypothesis Payload (Optional)</label>
          <textarea rows={3} className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition" placeholder="Explain the origin or objective to assist NLP Generation..."></textarea>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 transition-all duration-300 ${
            isHovering ? "border-slate-300 bg-slate-300/5" : "border-blue-500/10 hover:border-white/40 bg-black/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center mb-4">
                <UploadCloud className="w-10 h-10 text-blue-500" />
              </div>
              <p className="text-lg font-bold text-blue-500 mb-2">Drag & Drop Target Node</p>
              <p className="text-slate-400 text-sm mb-6">Supported Formats: CSV, Excel, JSON, SQL Dumps.</p>
              
              {/* File Input fallback */}
              <label className="px-6 py-3 rounded-full border border-blue-500 text-blue-500 font-bold hover:bg-blue-500 hover:text-blue-500 transition cursor-pointer shadow-md">
                Browse Global Filesys
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.json,.sql,.tsv"
                  onChange={(e) => { if(e.target.files?.length) setFile(e.target.files[0]) }}
                />
              </label>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <FileType className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-xl font-bold text-blue-500 mb-1">{file.name}</p>
              <p className="text-slate-400 font-mono text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Detected Stream</p>
              <button 
                type="button"
                onClick={() => setFile(null)}
                className="mt-4 text-red-400 text-sm hover:text-red-300 transition"
              >
                Clear Node Memory
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress Animation */}
        {isUploading && (
          <div className="w-full glass-panel-cyber p-4 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-blue-500">Uploading {file?.name}...</span>
              <span className="text-slate-300">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-slate-300 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file || isUploading}
          className={`py-4 rounded-xl font-bold text-lg transition-all ${
            file && !isUploading 
              ? "bg-blue-500 text-white shadow-md hover:bg-slate-300 hover:shadow-lg cursor-pointer" 
              : "bg-blue-500/5 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isUploading ? "Initializing Processing Graph..." : "Inject Dataset & Execute"}
        </button>

      </form>

      {/* Historical Dataset Reactivation Module */}
      {history.length > 0 && (
        <div className="mt-8 border-t border-blue-500/10 pt-8 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
               Historical Dataset Re-activation
            </h2>
            <button
              onClick={() => {
                if (!confirm("Clear all dataset history?")) return;
                localStorage.removeItem("dataset_history");
                setHistory([]);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-6">Return to a previous array. Clicking an old dataset instantly unlocks the analytical engines without re-uploading.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item, idx) => (
               <div 
                 key={idx} 
                 className="glass-panel-cyber p-4 rounded-xl border border-blue-500/10 hover:border-slate-300 transition flex justify-between items-center group shadow-lg drop-shadow-md"
               >
                 <div 
                   className="flex flex-col flex-1 cursor-pointer"
                   onClick={() => {
                      localStorage.setItem("dataset_active", "true");
                      window.location.href = "/dashboard";
                   }}
                 >
                   <span className="text-blue-500 font-bold text-lg group-hover:text-slate-300 transition truncate max-w-[200px]">{item.name}</span>
                   <span className="text-xs text-slate-400 font-mono mt-1">{(item.size / 1024 / 1024).toFixed(2)} MB • {new Date(item.date).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 
                     className="text-slate-300 w-6 h-6 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                     onClick={() => {
                       localStorage.setItem("dataset_active", "true");
                       window.location.href = "/dashboard";
                     }}
                   />
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       const updated = history.filter((_, i) => i !== idx);
                       setHistory(updated);
                       localStorage.setItem("dataset_history", JSON.stringify(updated));
                     }}
                     className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                     title="Delete this entry"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
