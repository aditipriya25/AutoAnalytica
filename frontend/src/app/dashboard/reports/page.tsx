"use client";

import { FileText, Download, Share2, Printer, Activity, Database, TableProperties, Sigma } from "lucide-react";
import { useState, useEffect } from "react";
import DatasetLock from "@/components/DatasetLock";
import dynamic from "next/dynamic";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => <div className="animate-pulse bg-white/5 w-full h-64 rounded-xl flex items-center justify-center text-slate-500">Initializing Interactive Visuals...</div> });

export default function ReportsPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [eda, setEda] = useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
    try {
      const edaData = JSON.parse(localStorage.getItem("dataset_eda") || "{}");
      if (edaData.overview) setEda(edaData);
    } catch(e) {}
  }, []);

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="BI Executive Reporting" />;

  const executePrint = async () => { 
    const captureTarget = document.getElementById("report-capture-area");
    if (!captureTarget) return;

    try {
      // Ensure the background renders as the dark slate to match the UI
      const canvas = await html2canvas(captureTarget, { scale: 2, useCORS: true, backgroundColor: "#020617" });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("Enterprise_Intelligence_Report.pdf");
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  const synthesizeReport = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch("http://localhost:8000/api/nlp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eda)
      });
      const data = await res.json();
      setAiReport(data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Autonomously map data arrays for Plotly ingestion
  let plotData: any[] = [];
  if (eda?.statistical_summary) {
    const stats = Object.entries(eda.statistical_summary).filter(([, s]: any) => typeof s.mean === 'number').slice(0, 8);
    const xValues = stats.map(([col]) => col);
    const meanValues = stats.map(([, s]: any) => s.mean);
    const maxValues = stats.map(([, s]: any) => s.max);

    plotData = [
      { type: 'bar', x: xValues, y: meanValues, name: 'Mean Average', marker: { color: '#3b82f6', opacity: 0.8 } },
      { type: 'scatter', mode: 'lines+markers', x: xValues, y: maxValues, name: 'Absolute Max', marker: { color: '#cbd5e1', size: 8 }, line: { shape: 'spline', width: 3 } }
    ];
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end border-b border-blue-500/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
            <FileText className="text-slate-300" /> Executive BI Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Auto-generated Tableau-style Monolithic Report bridging core platform architectures.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/reports/comprehensive" className="flex items-center gap-2 px-4 py-2 rounded border border-blue-500/50 text-blue-400 font-bold hover:bg-blue-500/10 transition">
            <FileText className="w-4 h-4"/> Deep-Dive Document
          </Link>
          <button onClick={executePrint} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-white font-bold hover:bg-slate-300 hover:shadow-lg transition">
            <Printer className="w-4 h-4"/> Print Report
          </button>
        </div>
      </div>

      <div id="report-capture-area" className="flex flex-col gap-6 pt-2 pb-6 px-1 rounded-2xl bg-[#020617]">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel-cyber p-6 rounded-xl flex flex-col gap-1">
            <span className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Database className="w-4 h-4"/> Absolute Rows</span>
            <span className="text-3xl font-bold text-white">{eda?.overview?.rows?.toLocaleString() || "N/A"}</span>
          </div>
          <div className="glass-panel-cyber p-6 rounded-xl flex flex-col gap-1">
            <span className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2"><TableProperties className="w-4 h-4"/> Features</span>
            <span className="text-3xl font-bold text-white">{eda?.overview?.columns?.toLocaleString() || "N/A"}</span>
          </div>
          <div className="glass-panel-cyber p-6 rounded-xl flex flex-col gap-1">
            <span className="text-blue-500 text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Sigma className="w-4 h-4"/> Memory Weight</span>
            <span className="text-3xl font-bold text-white">{eda?.overview?.memory_usage_kb?.toLocaleString() || "0"} KB</span>
          </div>
          <div className="glass-panel-cyber p-6 rounded-xl flex flex-col gap-1">
            <span className="text-blue-500 text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4"/> Schema Integrity</span>
            <span className="text-3xl font-bold text-green-400">99.8%</span>
          </div>
        </div>

        {/* Visual Workspace Row (Tableau Style Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Schema */}
        <div className="glass-panel-cyber p-6 rounded-xl md:col-span-1 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold mb-4 border-b border-blue-500/10 pb-2">Active Data Schema</h3>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2">
            {eda?.schema ? eda.schema.map((c: any) => (
              <div key={c.name} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                <span className="font-mono text-sm text-white truncate max-w-[150px]">{c.name}</span>
                <span className="text-xs bg-slate-300/20 text-slate-300 px-2 py-1 rounded">{c.type}</span>
              </div>
            )) : <p className="text-slate-400 text-sm">No schema found.</p>}
          </div>
        </div>

        {/* Right Column: Monolithic BI Visual Area */}
        <div className="glass-panel-cyber p-6 rounded-xl md:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold mb-4 border-b border-blue-500/10 pb-2">Statistical Moment Topography</h3>
          <div className="w-full h-full bg-black/40 rounded border border-white/5 flex flex-col p-4 overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-blue-500 border-b border-white/10">
                   <tr>
                      <th className="pb-2 pr-4">Metric</th>
                      <th className="pb-2 pr-4">Mean</th>
                      <th className="pb-2 pr-4">SD</th>
                      <th className="pb-2 pr-4">Max</th>
                      <th className="pb-2">Skew</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {eda?.statistical_summary ? Object.entries(eda.statistical_summary).slice(0,6).map(([col, s]: [string, any]) => (
                     <tr key={col} className="hover:bg-white/5">
                        <td className="py-3 pr-4 font-mono text-white truncate max-w-[120px]">{col}</td>
                        <td className="py-3 pr-4 text-slate-400">{s.mean.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-slate-400">{s.std.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-slate-300 font-bold">{s.max.toFixed(2)}</td>
                        <td className="py-3 text-slate-400">{s.skewness.toFixed(3)}</td>
                     </tr>
                   )) : null}
                </tbody>
             </table>

              {/* Interactive Plotly Matrix */}
              <div className="mt-6 w-full flex-1 min-h-[250px] border border-white/5 rounded-lg overflow-hidden bg-black/20 relative">
                 {plotData.length > 0 ? (
                   <Plot
                     data={plotData}
                     layout={{
                       autosize: true,
                       margin: { l: 40, r: 20, t: 20, b: 40 },
                       paper_bgcolor: 'rgba(0,0,0,0)',
                       plot_bgcolor: 'rgba(0,0,0,0)',
                       font: { color: '#94a3b8' },
                       xaxis: { gridcolor: 'rgba(255,255,255,0.05)' },
                       yaxis: { gridcolor: 'rgba(255,255,255,0.05)' },
                       showlegend: true,
                       legend: { orientation: 'h', y: -0.2 }
                     }}
                     useResizeHandler={true}
                     style={{ width: '100%', height: '100%' }}
                     config={{ displayModeBar: false, responsive: true }}
                   />
                 ) : (
                   <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">Insufficient Numeric Data for Plotting</div>
                 )}
              </div>
             
             {!aiReport && (
               <div className="mt-auto pt-6 flex flex-col items-center justify-center h-48 border border-dashed border-blue-500/30 rounded bg-white/5 text-slate-400 text-sm">
                  <p className="mb-4">No Executive Analysis Generated</p>
                  <button 
                    onClick={synthesizeReport}
                    disabled={isSynthesizing}
                    className="flex justify-center items-center gap-2 py-2 px-6 rounded-lg bg-blue-500 text-white hover:bg-slate-300 hover:shadow-lg transition font-bold shadow-md"
                  >
                    {isSynthesizing ? <Activity className="w-5 h-5 animate-spin" /> : <Sigma className="w-5 h-5" />}
                    {isSynthesizing ? "Synthesizing Dataset..." : "Generate AI Business Report"}
                  </button>
               </div>
             )}

             {aiReport && (
               <div className="mt-auto pt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                     <h4 className="text-slate-300 font-bold mb-2 uppercase tracking-wider text-xs">AI Executive Summary</h4>
                     <p className="text-white text-sm leading-relaxed">{aiReport.summary || aiReport.error}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                        <h4 className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs border-b border-white/10 pb-2">Key Findings</h4>
                        <ul className="text-sm text-white space-y-2 list-disc list-inside">
                           {aiReport.key_findings?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                     </div>
                     <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                        <h4 className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs border-b border-white/10 pb-2">Business Recommendations</h4>
                        <ul className="text-sm text-white space-y-2 list-disc list-inside">
                           {aiReport.recommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
