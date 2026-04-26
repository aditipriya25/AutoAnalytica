"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Network, Settings, Play, DownloadCloud, Image as ImageIcon } from "lucide-react";
import DatasetLock from "@/components/DatasetLock";
import html2canvas from "html2canvas";

// Dynamically import Plotly to avoid SSR issues with window object
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => <div className="animate-pulse bg-blue-500/5 w-full h-full rounded-lg" /> });

export default function ClusteringPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [clusters, setClusters] = useState(3);
  const [cleaningModalOpen, setCleaningModalOpen] = useState(false);
  const [nullCount, setNullCount] = useState(0);

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
  }, []);

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="Clustering Architectures" />;

  const simulateTraining = async (strategy = "none") => {
    setIsRunning(true);
    setCleaningModalOpen(false);
    try {
        const formData = new FormData();
        formData.append("clusters", clusters.toString());
        formData.append("cleaning_strategy", strategy);

        const res = await fetch("http://localhost:8000/api/clustering/kmeans", {
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
            localStorage.setItem("dataset_clustering", JSON.stringify(data.results));
        } else {
            alert((await res.json()).detail || "Mathematical execution failed in backend.");
        }
    } catch(err) {
        alert("CRITICAL ERROR: Failed to isolate data across inference node.");
    } finally {
        setIsRunning(false);
    }
  };

  const exportAsPNG = async () => {
    const target = document.getElementById("cluster-graph");
    if (!target) return;
    try {
      const canvas = await html2canvas(target, { backgroundColor: "#0B0E14", scale: 2 });
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.setAttribute("download", `Clustering_K${clusters}_AutoAnalytica.png`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto relative">
      
      {/* Data Cleaning Modal Overlay */}
      {cleaningModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0B0E14] border border-blue-500/30 p-8 rounded-xl shadow-2xl max-w-xl w-full flex flex-col gap-6">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-blue-500/20 pb-4">
                  <Network className="text-blue-500 w-6 h-6" /> Data Cleaning Required
               </h2>
               <p className="text-slate-300">
                  The AI Engine detected <strong className="text-red-400">{nullCount} rows</strong> with missing values (Nulls). 
                  Mathematical algorithms cannot process empty fields. Please choose a cleaning strategy before proceeding:
               </p>
               
               <div className="flex flex-col gap-4 mt-2">
                  <button onClick={() => simulateTraining("drop")} className="text-left p-4 rounded-lg border border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 transition group">
                     <h3 className="font-bold text-red-400 text-lg mb-1 group-hover:text-red-300">🗑️ Drop Rows</h3>
                     <p className="text-sm text-slate-400"><strong className="text-green-400">Advantage:</strong> Maintains 100% original, pure data points without adding synthetic noise.</p>
                     <p className="text-sm text-slate-400"><strong className="text-red-400">Disadvantage:</strong> You permanently lose data volume, which hurts algorithmic accuracy if you drop too much.</p>
                  </button>
                  
                  <button onClick={() => simulateTraining("impute")} className="text-left p-4 rounded-lg border border-blue-500/20 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 transition group">
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
        <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
          <Network className="text-slate-300" /> Unsupervised Clustering (K-Means)
        </h1>
        <p className="text-slate-400 mt-2">
          Discover hidden algorithmic relationships mapped across PCA-reduced dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-1 flex flex-col gap-5">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-blue-500/10 pb-3">
            <Settings className="w-5 h-5 text-blue-500" /> Model Parameters
          </h2>
          
          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-400">Number of Centroids (K)</label>
             <input type="number" value={clusters} onChange={(e) => setClusters(Number(e.target.value))} min="1" max="15" className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition" />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-400">Dimensionality Reduction</label>
             <select className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition">
               <option>PCA (Principal Component Analysis)</option>
               <option>t-SNE (T-distributed Stochastic)</option>
             </select>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button 
              onClick={simulateTraining}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition shadow-md ${
                isRunning ? "bg-blue-500/10 text-slate-400 cursor-not-allowed" : "bg-slate-300 text-white hover:bg-slate-300 hover:shadow-lg"
              }`}
            >
              {isRunning ? <span className="animate-spin text-xl">⚙</span> : <Play className="w-5 h-5" />}
              {isRunning ? "Isolating Nodes..." : "Execute Clustering"}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-2 relative min-h-[400px] flex flex-col">
          
          {!results && !isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
               <Network className="w-16 h-16 mb-4 text-slate-400" />
               <p>Awaiting Execution Command...</p>
            </div>
          )}

          {isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="w-full max-w-xs h-2 bg-black/40 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-slate-300 to-blue-500 animate-pulse w-full"></div>
               </div>
            </div>
          )}

          {results && !isRunning && (
             <div className="flex-1 w-full h-[400px] animate-in zoom-in-95 duration-300">
                <div className="flex justify-end gap-3 mb-4">
                   <button 
                     onClick={() => alert("Cluster assignments and Centroid vectors compiled! (Simulation: In production, this prompts a CSV download mapped from the Postgres cluster).")}
                     className="flex items-center gap-2 px-4 py-2 rounded border border-blue-500/10 text-sm text-blue-500 hover:text-blue-500 hover:bg-blue-500/5 transition"
                   >
                     <DownloadCloud className="w-4 h-4" /> Extract Assignments CSV
                   </button>
                   <button 
                     onClick={exportAsPNG}
                     className="flex items-center gap-2 px-4 py-2 rounded border border-blue-500/10 text-sm text-slate-300 hover:bg-slate-300/10 transition"
                   >
                     <ImageIcon className="w-4 h-4" /> Download PNG Map
                   </button>
                </div>
                <div id="cluster-graph" className="w-full h-full">
                  <Plot
                  data={[
                    {
                      x: results.x,
                      y: results.y,
                      mode: 'markers',
                      type: 'scatter',
                      marker: { size: 8, color: results.color, colorscale: 'Viridis', opacity: 0.8 },
                    }
                  ]}
                  layout={{
                    title: `K-Means Clusters (k=${results.clusters}, inertia=${results.inertia})`,
                    autosize: true,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(255,255,255,0.05)',
                    font: { color: '#fff' },
                    xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
                    yaxis: { gridcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%" }}
                  config={{ displayModeBar: false }}
                />
                </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
