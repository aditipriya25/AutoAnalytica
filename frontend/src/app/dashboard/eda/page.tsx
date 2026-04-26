"use client";

import { useEffect, useState } from "react";
import { Database, TableProperties, Sigma, AlertTriangle } from "lucide-react";
import DatasetLock from "@/components/DatasetLock";

export default function EDAPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [edaData, setEdaData] = useState<any>(null);

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
    
    try {
       const storedEda = localStorage.getItem("dataset_eda");
       if (storedEda) setEdaData(JSON.parse(storedEda));
    } catch(e) {}
  }, []);

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="Exploratory Data Analysis" />;
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-blue-500">
          <Database className="text-slate-300" /> Exploratory Data Analysis (EDA)
        </h1>
        <p className="text-slate-400 mt-2">
          Autonomous dataset parsing exhibiting structural schemas and statistical moments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Schema Table */}
         <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-2">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-blue-500/10 pb-2">
               <TableProperties className="w-5 h-5 text-blue-500" /> Detected Schema Layout
            </h2>
            <div className="w-full overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-blue-500/5 border-b border-blue-500/10">
                     <tr>
                        <th className="p-4 text-blue-500">Feature Column</th>
                        <th className="p-4 text-blue-500">Data Type</th>
                        <th className="p-4 text-blue-500">Null Count</th>
                        <th className="p-4 text-blue-500">Unique Values</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {edaData?.schema ? edaData.schema.map((item: any) => (
                       <tr key={item.name} className="hover:bg-blue-500/5">
                          <td className="p-4 font-mono">{item.name}</td>
                          <td className="p-4"><span className="px-2 py-1 bg-slate-300/10 text-slate-300 rounded">{item.type}</span></td>
                          <td className={`p-4 ${item.null_count > 0 ? "text-yellow-400 font-bold" : "text-green-400"}`}>
                             {item.null_count}
                          </td>
                          <td className="p-4 text-blue-500">{item.unique_values}</td>
                       </tr>
                     )) : (
                        <tr><td colSpan={4} className="p-4 text-center text-slate-400">No schema generated. Did you upload a dataset natively?</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Statistical Moments */}
         <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-2">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-blue-500/10 pb-2">
               <Sigma className="w-5 h-5 text-slate-300" /> Extracted Statistical Moments
            </h2>
            <div className="w-full overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-blue-500/5 border-b border-blue-500/10">
                     <tr>
                        <th className="p-4 text-blue-500">Numeric Feature</th>
                        <th className="p-4 text-blue-500">Mean</th>
                        <th className="p-4 text-blue-500">Std Dev</th>
                        <th className="p-4 text-blue-500">Min</th>
                        <th className="p-4 text-blue-500">Max</th>
                        <th className="p-4 text-blue-500">Skewness</th>
                        <th className="p-4 text-blue-500">Kurtosis</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {edaData?.statistical_summary ? Object.entries(edaData.statistical_summary).map(([col, stats]: [string, any]) => (
                       <tr key={col} className="hover:bg-blue-500/5">
                          <td className="p-4 font-mono text-blue-500">{col}</td>
                          <td className="p-4">{stats.mean.toFixed(2)}</td>
                          <td className="p-4">{stats.std.toFixed(2)}</td>
                          <td className="p-4">{stats.min.toFixed(2)}</td>
                          <td className="p-4 text-blue-500 font-bold">{stats.max.toFixed(2)}</td>
                          <td className="p-4">{stats.skewness.toFixed(3)}</td>
                          <td className="p-4">{stats.kurtosis.toFixed(3)}</td>
                       </tr>
                     )) : (
                        <tr><td colSpan={7} className="p-4 text-center text-slate-400">No numeric statistics detected.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

      </div>
    </div>
  );
}
