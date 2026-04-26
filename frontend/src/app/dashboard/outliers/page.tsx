"use client";
import { API_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AlertOctagon, Settings, ShieldAlert, DownloadCloud, Image as ImageIcon } from "lucide-react";
import DatasetLock from "@/components/DatasetLock";
import html2canvas from "html2canvas";

// Plotly loaded dynamically
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => <div className="animate-pulse bg-blue-500/5 w-full h-[400px] rounded-lg" /> });

export default function OutliersPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [contamination, setContamination] = useState(0.05);
  const [cleaningModalOpen, setCleaningModalOpen] = useState(false);
  const [nullCount, setNullCount] = useState(0);

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
  }, []);

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="Outlier Scanning Engine" />;

  const simulateIsolationForest = async (strategy = "none") => {
    setIsRunning(true);
    setCleaningModalOpen(false);
    try {
        const formData = new FormData();
        formData.append("contamination", contamination.toString());
        formData.append("cleaning_strategy", strategy);

        const res = await fetch(`${API_URL}/api/outliers/scan`, {
            method: "POST",
            body: formData
        });
        
        if (res.status === 428) {
           const data = await res.json();
           if (data.detail && data.detail.startsWith("REQUIRES_CLEANING:")) {
               setNullCount(parseInt(data.detail.split(":")[1]));
               setCleaningModalOpen(true);
               return; // Halt and wait for user selection
           }
        }
        
        if (res.ok) {
            const data = await res.json();
            setResults(data.results);
            localStorage.setItem("dataset_outliers", JSON.stringify(data.results));
        } else {
            alert((await res.json()).detail || "Isolation protocol collapsed inside API execution block.");
        }
    } catch (e) {
        alert("CRITICAL ERROR: Disconnected from computational node port 8000.");
    } finally {
        setIsRunning(false);
    }
  };

  const exportAsPNG = async () => {
    const target = document.getElementById("outlier-graph");
    if (!target) return;
    try {
      const canvas = await html2canvas(target, { backgroundColor: "#0B0E14", scale: 2 });
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.setAttribute("download", "Outliers_AutoAnalytica_Network.png");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto relative">
      
      {/* Data Cleaning Modal Overlay */}
      {cleaningModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0B0E14] border border-blue-500/30 p-8 rounded-xl shadow-2xl max-w-xl w-full flex flex-col gap-6">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-blue-500/20 pb-4">
                  <ShieldAlert className="text-red-500 w-6 h-6" /> Data Cleaning Required
               </h2>
               <p className="text-slate-300">
                  The AI Engine detected <strong className="text-red-400">{nullCount} rows</strong> with missing values (Nulls). 
                  Mathematical algorithms cannot process empty fields. Please choose a cleaning strategy before proceeding:
               </p>
               
               <div className="flex flex-col gap-4 mt-2">
                  <button onClick={() => simulateIsolationForest("drop")} className="text-left p-4 rounded-lg border border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 transition group">
                     <h3 className="font-bold text-red-400 text-lg mb-1 group-hover:text-red-300">🗑️ Drop Rows</h3>
                     <p className="text-sm text-slate-400"><strong className="text-green-400">Advantage:</strong> Maintains 100% original, pure data points without adding synthetic noise.</p>
                     <p className="text-sm text-slate-400"><strong className="text-red-400">Disadvantage:</strong> You permanently lose data volume, which hurts algorithmic accuracy if you drop too much.</p>
                  </button>
                  
                  <button onClick={() => simulateIsolationForest("impute")} className="text-left p-4 rounded-lg border border-blue-500/20 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 transition group">
                     <h3 className="font-bold text-blue-400 text-lg mb-1 group-hover:text-blue-300">🧠 Impute Data (Mean/Mode)</h3>
                     <p className="text-sm text-slate-400"><strong className="text-green-400">Advantage:</strong> Keeps your data volume high by mathematically guessing the missing values.</p>
                     <p className="text-sm text-slate-400"><strong className="text-red-400">Disadvantage:</strong> Injects "synthetic" data which might slightly skew your variance and natural topography.</p>
                  </button>
               </div>
               
               <button onClick={() => setCleaningModalOpen(false)} className="mt-4 px-4 py-2 border border-slate-500 text-slate-300 rounded hover:bg-slate-500/20 self-center">
                  Cancel Training
               </button>
            </div>
         </div>
      )}

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
          <AlertOctagon className="text-red-500" /> Autonomous Anomaly Detection
        </h1>
        <p className="text-slate-400 mt-2">
          Universal Isolation Forest scanning. Flags structurally disparate nodes across all numeric matrices without assuming temporal shapes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Controls */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-1 flex flex-col gap-5">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-blue-500/10 pb-3">
            <Settings className="w-5 h-5 text-slate-400" /> Sensitivity Tuning
          </h2>
          
          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-400">Contamination Rate (λ)</label>
             <input type="range" value={contamination} onChange={(e) => setContamination(Number(e.target.value))} min="0.01" max="0.1" step="0.01" className="accent-red-500" />
             <div className="flex justify-between text-xs text-slate-400 font-mono">
               <span>1% Strict</span>
               <span>10% Loose</span>
             </div>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-400">Execution Vector</label>
             <select className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-red-500 transition">
               <option>Global Dataset Search</option>
               <option>Specific Feature Target</option>
             </select>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={simulateIsolationForest}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition shadow-md ${
                isRunning ? "bg-blue-500/10 text-slate-400 cursor-not-allowed" : "bg-red-500 text-blue-500 hover:bg-red-600"
              }`}
            >
              {isRunning ? <span className="animate-spin text-xl">⚙</span> : <ShieldAlert className="w-5 h-5" />}
              {isRunning ? "Scanning Forests..." : "Execute Isolation"}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-3 relative min-h-[500px] flex flex-col">
          
          {!results && !isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
               <AlertOctagon className="w-16 h-16 mb-4 text-slate-400" />
               <p>Awaiting mathematical contamination scan...</p>
            </div>
          )}

          {isRunning && (
             <div className="flex-1 flex flex-col items-center justify-center gap-4">
                 <div className="w-full max-w-sm h-1 bg-black/40 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-red-500 animate-[bounce_1s_infinite]"></div>
                 </div>
                 <p className="text-red-400 font-mono text-sm animate-pulse">Computing multi-dimensional forest paths...</p>
             </div>
          )}

          {results && !isRunning && (
             <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex gap-4">
                      <div className="px-3 py-1 rounded bg-white/50 border border-blue-500/10 border border-blue-500/10 font-mono text-sm flex gap-2 items-center">
                        <span className="text-slate-400">Analyzed Nodes:</span> 
                        <span className="text-blue-500 font-bold">{results.total_analyzed}</span>
                      </div>
                      <div className="px-3 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-sm flex gap-2 items-center">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Isolated Outliers:</span> 
                        <span className="font-bold">{results.outlier_count}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => alert("Scatter coordinates and Isolation Forest contamination paths have been compiled! (Simulation: In production, this prompts a CSV download mapped from the Postgres cluster).")}
                     className="flex items-center gap-2 px-4 py-2 rounded border border-blue-500/10 text-sm text-blue-500 hover:text-blue-500 hover:bg-blue-500/5 transition"
                   >
                     <DownloadCloud className="w-4 h-4" /> Extract Scatter CSV
                   </button>
                   <button 
                     onClick={exportAsPNG}
                     className="flex items-center gap-2 px-4 py-2 rounded border border-blue-500/10 text-sm text-slate-300 hover:bg-slate-300/10 transition"
                   >
                     <ImageIcon className="w-4 h-4" /> Download PNG Map
                   </button>
                </div>

                <div id="outlier-graph" className="w-full h-[450px] p-2 rounded-lg">
                  <Plot
                    data={[
                      {
                        x: results.x,
                        y: results.y,
                        mode: 'markers',
                        type: 'scatter',
                        marker: { 
                           size: results.sizes, 
                           color: results.color, 
                           opacity: 0.8,
                           line: { color: 'rgba(255,255,255,0.2)', width: 1 }
                        },
                        name: 'Data Nodes'
                      }
                    ]}
                    layout={{
                      autosize: true,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(255,255,255,0.05)',
                      font: { color: '#fff' },
                      margin: { t: 10, b: 30, l: 30, r: 10 },
                      xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                      yaxis: { gridcolor: 'rgba(255,255,255,0.1)' }
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    config={{ displayModeBar: true, responsive: true }}
                  />
                </div>
             </div>
          )}

        </div>

      </div>
    </div>
  );
}
