"use client";

import { useEffect, useState } from "react";
import { Sparkles, FileText, Loader2, BarChart3, PieChart, TrendingUp, Box, GitBranch, Activity, Layers, AreaChart, Sigma, AlertTriangle, Grid3X3, LineChart, BarChart } from "lucide-react";
import DatasetLock from "@/components/DatasetLock";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GRAPH_OPTIONS = [
  { id: "histogram", label: "Numeric Distributions", icon: BarChart3, desc: "Histograms of top numeric columns" },
  { id: "correlation", label: "Correlation Heatmap", icon: GitBranch, desc: "Color matrix of feature correlations" },
  { id: "categorical", label: "Categorical Bar Chart", icon: BarChart, desc: "Top values in first categorical column" },
  { id: "boxplot", label: "Box Plot", icon: Box, desc: "Spread, median, and outliers" },
  { id: "scatter", label: "Scatter Plot (Top Pair)", icon: TrendingUp, desc: "Two most correlated features" },
  { id: "pie", label: "Pie Chart", icon: PieChart, desc: "Proportions of first categorical feature" },
  { id: "kde", label: "KDE Density Plot", icon: Activity, desc: "Kernel density estimation curves" },
  { id: "violin", label: "Violin Plot", icon: Layers, desc: "Distribution shape with density" },
  { id: "mean_bar", label: "Mean Values Bar", icon: BarChart3, desc: "Average value per numeric feature" },
  { id: "std_bar", label: "Std Deviation Bar", icon: Sigma, desc: "Volatility per numeric feature" },
  { id: "missing", label: "Missing Values Chart", icon: AlertTriangle, desc: "Null count per feature" },
  { id: "pairplot", label: "Pair Plot Matrix", icon: Grid3X3, desc: "Scatter matrix of top 3 features" },
  { id: "cdf", label: "Cumulative Distribution", icon: LineChart, desc: "CDF curves for numeric features" },
  { id: "cat_all", label: "All Category Distributions", icon: BarChart, desc: "Bar charts for every categorical column" },
  { id: "area", label: "Area Chart", icon: AreaChart, desc: "Stacked area chart of feature values" },
  { id: "hist_all", label: "All Individual Histograms", icon: BarChart3, desc: "Separate histogram for every numeric column" },
];

interface GraphData {
  title: string;
  base64: string;
}

export default function NLPInsightsPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);
  const [graphs, setGraphs] = useState<GraphData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>(["histogram", "correlation", "categorical", "boxplot", "scatter"]);

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
  }, []);

  const toggleGraph = (id: string) => {
    setSelectedGraphs((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedGraphs(GRAPH_OPTIONS.map((g) => g.id));
  const deselectAll = () => setSelectedGraphs([]);

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const eda = JSON.parse(localStorage.getItem("dataset_eda") || "{}");
      const res = await fetch("http://localhost:8000/api/nlp/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eda, selected_graphs: selectedGraphs }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setMarkdownReport(data.markdown || "No report content received.");
      setGraphs(data.graphs || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate NLP report.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="NLP Business Intelligence" />;

  const exportAsPDF = async () => {
    const el = document.getElementById("nlp-report-container");
    if (!el) { window.print(); return; }
    try {
      const canvas = await html2canvas(el, { backgroundColor: "#0B0E14", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (canvas.height * pw) / canvas.width;
      let left = ph, pos = 0;
      pdf.addImage(imgData, "PNG", 0, pos, pw, ph);
      left -= pdf.internal.pageSize.getHeight();
      while (left > 0) { pos = left - ph; pdf.addPage(); pdf.addImage(imgData, "PNG", 0, pos, pw, ph); left -= pdf.internal.pageSize.getHeight(); }
      pdf.save("AutoAnalytica_NLP_Report.pdf");
    } catch { window.print(); }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
            <Sparkles className="text-slate-300" /> NLP Business Intelligence
          </h1>
          <p className="text-slate-400 mt-2">AI-powered analytical report with custom visualizations.</p>
        </div>
        {markdownReport && (
          <button onClick={exportAsPDF} className="px-6 py-3 rounded-lg border border-slate-300 text-slate-300 hover:bg-slate-300 hover:text-white font-bold transition flex items-center gap-2">
            <FileText className="w-5 h-5" /> Export PDF
          </button>
        )}
      </div>

      {/* Graph Selection Panel */}
      {!isGenerating && !markdownReport && (
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-400">📊 Select Visualizations ({selectedGraphs.length}/{GRAPH_OPTIONS.length})</h2>
              <p className="text-sm text-slate-400 mt-0.5">Choose which graphs to embed in your report.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={selectAll} className="px-3 py-1.5 text-xs rounded-md border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition">Select All</button>
              <button onClick={deselectAll} className="px-3 py-1.5 text-xs rounded-md border border-slate-600/50 text-slate-400 hover:bg-slate-500/10 transition">Deselect All</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {GRAPH_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const on = selectedGraphs.includes(opt.id);
              return (
                <button key={opt.id} onClick={() => toggleGraph(opt.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${on ? "border-blue-500 bg-blue-500/10" : "border-slate-700/50 bg-slate-900/30 hover:border-slate-500/50"}`}>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${on ? "bg-blue-500/20" : "bg-slate-800/50"}`}>
                    <Icon className={`w-4 h-4 ${on ? "text-blue-400" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs ${on ? "text-blue-400" : "text-slate-400"}`}>{opt.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${on ? "border-blue-500 bg-blue-500" : "border-slate-600"}`}>
                    {on && <span className="text-white text-[8px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={generateReport}
            className="mt-5 w-full px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:opacity-90 transition flex items-center justify-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" /> Generate Full Report
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-panel-cyber p-6 rounded-xl border border-red-500/30 text-red-400">
          <p className="font-bold">⚠️ Generation Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-xl text-blue-500">Generating report & rendering {selectedGraphs.length} visualizations...</p>
          <p className="text-sm text-slate-400">This may take 15-40 seconds.</p>
        </div>
      )}

      {/* Report + Graphs */}
      {!isGenerating && markdownReport && (
        <>
          <div id="nlp-report-container" className="flex flex-col gap-6">
            {/* Markdown Report */}
            <div className="glass-panel-cyber p-8 md:p-12 rounded-xl border border-blue-500/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-300 to-blue-500"></div>
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500 pb-2 border-b border-blue-500/20">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 text-blue-400">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-300">{children}</h3>,
                  p: ({ children }) => <p className="text-blue-500/90 leading-relaxed mb-4 text-[15px]">{children}</p>,
                  table: ({ children }) => <div className="overflow-x-auto my-4 rounded-lg border border-blue-500/10"><table className="w-full text-sm">{children}</table></div>,
                  thead: ({ children }) => <thead className="bg-blue-500/10 text-slate-300 uppercase text-xs">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 text-left font-semibold border-b border-blue-500/10">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2.5 border-b border-blue-500/5 text-blue-500/80">{children}</td>,
                  strong: ({ children }) => <strong className="text-slate-300 font-bold">{children}</strong>,
                  em: ({ children }) => <em className="text-blue-400 italic">{children}</em>,
                  li: ({ children }) => <li className="text-blue-500/90 mb-2 leading-relaxed">{children}</li>,
                  hr: () => <hr className="my-6 border-blue-500/10" />,
                  code: ({ children }) => <code className="bg-blue-500/10 text-slate-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                }}>{markdownReport}</ReactMarkdown>
              </div>
            </div>

            {/* Graphs rendered directly */}
            {graphs.length > 0 && (
              <div className="glass-panel-cyber p-8 md:p-12 rounded-xl border border-blue-500/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400"></div>
                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 pb-2 border-b border-blue-500/20">
                  📊 Visual Data Renderings ({graphs.length} graphs)
                </h2>
                <div className="flex flex-col gap-8">
                  {graphs.map((g, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-slate-300">{g.title}</h3>
                      <img
                        src={`data:image/png;base64,${g.base64}`}
                        alt={g.title}
                        className="rounded-lg w-full max-w-4xl shadow-lg border border-blue-500/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Regenerate */}
          <button onClick={() => { setMarkdownReport(null); setGraphs([]); }}
            className="self-center px-6 py-3 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-semibold transition flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Configure & Regenerate Report
          </button>
        </>
      )}
    </div>
  );
}
