"use client";

import { useState, useEffect } from "react";
import { Download, FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ComprehensiveReportPage() {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      try {
        const eda = JSON.parse(localStorage.getItem("dataset_eda") || "{}");
        let ml = null;
        let outliers = null;
        let clustering = null;
        try {
          ml = JSON.parse(localStorage.getItem("dataset_ml") || "null");
          outliers = JSON.parse(localStorage.getItem("dataset_outliers") || "null");
          clustering = JSON.parse(localStorage.getItem("dataset_clustering") || "null");
        } catch(e) {}

        const res = await fetch("http://localhost:8000/api/nlp/comprehensive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eda, ml, outliers, clustering })
        });
        
        const data = await res.json();
        setMarkdownContent(data.markdown || "### Report Generation Failed");
      } catch (err) {
        setMarkdownContent("### System Error\nUnable to reach NLP Engine.");
      } finally {
        setIsGenerating(false);
      }
    };
    generateReport();
  }, []);

  const exportPDF = async () => {
    const element = document.getElementById("multi-page-doc");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasHeightMM = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = canvasHeightMM;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, canvasHeightMM);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - canvasHeightMM;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, canvasHeightMM);
        heightLeft -= pdfHeight;
      }
      
      pdf.save("AutoAnalytica_DeepDive_Report.pdf");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full pb-20">
      
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-blue-500/10">
         <Link href="/dashboard/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
           <ArrowLeft className="w-5 h-5" /> Back to Dashboard
         </Link>
         
         <button 
           onClick={exportPDF}
           disabled={isGenerating}
           className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 transition shadow-lg"
         >
           <Download className="w-5 h-5" /> Download Enterprise PDF
         </button>
      </div>

      <div className="w-full flex justify-center">
         {/* A4 Paper Simulation (White Background to mimic physical reports) */}
         <div id="multi-page-doc" className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-2xl p-12 md:p-20 text-slate-900 font-sans rounded-sm">
            
            <div className="border-b-4 border-blue-600 pb-6 mb-8 flex items-end justify-between">
               <div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                   <FileText className="w-10 h-10 text-blue-600" />
                   Comprehensive Analytics Report
                 </h1>
                 <p className="text-slate-500 mt-2 font-mono text-sm tracking-widest uppercase">AutoAnalytica AI Generator</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-bold text-slate-800">Generated On</p>
                 <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
               </div>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 gap-4">
                 <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                 <p className="font-mono animate-pulse text-lg">Synthesizing dataset schema, ML models, and statistical covariance...</p>
                 <p className="text-sm">This may take up to 30 seconds for deep-dive extraction.</p>
              </div>
            ) : (
              <div className="prose prose-slate prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:text-blue-700 prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-a:text-blue-600 prose-strong:text-slate-900">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
              </div>
            )}
            
            <div className="mt-20 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-mono">
               <p>CONFIDENTIAL & PROPRIETARY — GENERATED BY AUTOANALYTICA ENTERPRISE ENGINE</p>
            </div>
         </div>
      </div>
      
    </div>
  );
}
