"use client";

import { useState, useEffect } from "react";
import { Binary, Target, Settings, Play, DownloadCloud, Activity } from "lucide-react";
import DatasetLock from "@/components/DatasetLock";

export default function MachineLearningPage() {
  const [hasDataset, setHasDataset] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [targetColumn, setTargetColumn] = useState("");
  const [schema, setSchema] = useState<any[]>([]);
  const [taskType, setTaskType] = useState("auto");
  const [algorithm, setAlgorithm] = useState("auto");
  const [cleaningModalOpen, setCleaningModalOpen] = useState(false);
  const [nullCount, setNullCount] = useState(0);

  const classificationAlgos = [
    { value: "auto", label: "Auto (Random Forest)" },
    { value: "random_forest", label: "Random Forest" },
    { value: "svm", label: "Support Vector Machine (SVM)" },
    { value: "logistic_regression", label: "Logistic Regression" },
    { value: "decision_tree", label: "Decision Tree" },
    { value: "knn", label: "K-Nearest Neighbors (KNN)" },
    { value: "gradient_boosting", label: "Gradient Boosting" },
    { value: "adaboost", label: "AdaBoost" },
    { value: "extra_trees", label: "Extra Trees" },
    { value: "bagging", label: "Bagging Ensemble" },
  ];

  const regressionAlgos = [
    { value: "auto", label: "Auto (Random Forest)" },
    { value: "random_forest", label: "Random Forest" },
    { value: "linear_regression", label: "Linear Regression" },
    { value: "ridge", label: "Ridge Regression (L2)" },
    { value: "lasso", label: "Lasso Regression (L1)" },
    { value: "elastic_net", label: "Elastic Net (L1+L2)" },
    { value: "decision_tree", label: "Decision Tree" },
    { value: "knn", label: "K-Nearest Neighbors (KNN)" },
    { value: "gradient_boosting", label: "Gradient Boosting" },
    { value: "svr", label: "Support Vector Regressor (SVR)" },
    { value: "adaboost", label: "AdaBoost" },
    { value: "extra_trees", label: "Extra Trees" },
    { value: "bagging", label: "Bagging Ensemble" },
  ];

  const getAlgoOptions = () => {
    if (taskType === "classification") return classificationAlgos;
    if (taskType === "regression") return regressionAlgos;
    // In auto mode, show all unique algorithms
    const all = [
      { value: "auto", label: "Auto-Select Best" },
      { value: "random_forest", label: "Random Forest" },
      { value: "decision_tree", label: "Decision Tree" },
      { value: "knn", label: "K-Nearest Neighbors (KNN)" },
      { value: "gradient_boosting", label: "Gradient Boosting" },
      { value: "adaboost", label: "AdaBoost" },
      { value: "extra_trees", label: "Extra Trees" },
      { value: "bagging", label: "Bagging Ensemble" },
      { value: "svm", label: "SVM / SVR" },
      { value: "logistic_regression", label: "Logistic / Linear Regression" },
      { value: "ridge", label: "Ridge Regression (L2)" },
      { value: "lasso", label: "Lasso Regression (L1)" },
      { value: "elastic_net", label: "Elastic Net (L1+L2)" },
    ];
    return all;
  };

  useEffect(() => {
    setHasDataset(localStorage.getItem("dataset_active") === "true");
    try {
       const eda = JSON.parse(localStorage.getItem("dataset_eda") || "{}");
       if (eda.schema) {
           setSchema(eda.schema);
           if (eda.schema.length > 0) setTargetColumn(eda.schema[0].name);
       }
    } catch(e) {}
  }, []);

  if (hasDataset === null) return null;
  if (!hasDataset) return <DatasetLock featureName="Machine Learning Pipeline" />;

  const simulateTraining = async (strategy = "none") => {
    setIsRunning(true);
    setCleaningModalOpen(false);
    try {
       const formData = new FormData();
       formData.append("target_column", targetColumn);
       formData.append("task_type", taskType);
       formData.append("cleaning_strategy", strategy);
       formData.append("algorithm", algorithm);

       const res = await fetch("http://localhost:8000/api/ml/train", {
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
           const payload = await res.json();
           setResults(payload.results);
           localStorage.setItem("dataset_ml", JSON.stringify(payload.results));
       } else {
           alert((await res.json()).detail || "Execution failed within Python Kernel.");
       }
    } catch (err) {
       alert("CRITICAL ERROR: AI Inference Pipeline Timeout.");
    } finally {
       setIsRunning(false);
    }
  };

  const downloadPkl = () => {
    const a = document.createElement("a");
    a.href = "data:application/octet-stream;charset=utf-8," + encodeURIComponent("scikit_learn_binary_buffer_001_mock_autoanalytica_payload");
    a.setAttribute("download", "RandomForest_Tuned_Model.pkl");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadApiConf = () => {
    // Generate a payload schema mapping based on the active dataset schema
    const payloadSchema: any = {};
    schema.forEach(col => {
      payloadSchema[col.name] = col.type.includes("int") || col.type.includes("float") ? 1.0 : "string_value";
    });

    const apiConf = {
      endpoint: "http://127.0.0.1:8000/api/ml/predict",
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer <YOUR_LOCAL_TOKEN>" },
      payload_schema: {
        "features": payloadSchema
      },
      status: "LIVE_LOCAL_READY"
    };
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apiConf, null, 2));
    a.setAttribute("download", "Live_Predict_API_Config.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto relative">
      
      {/* Data Cleaning Modal Overlay */}
      {cleaningModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0B0E14] border border-blue-500/30 p-8 rounded-xl shadow-2xl max-w-xl w-full flex flex-col gap-6">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-blue-500/20 pb-4">
                  <Activity className="text-blue-500 w-6 h-6" /> Data Cleaning Required
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
          <Binary className="text-slate-300" /> Auto-ML Pipeline
        </h1>
        <p className="text-slate-400 mt-2">
          Select your target parameter. System will automatically detect Classification vs Regression bounds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-1 flex flex-col gap-5">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-blue-500/10 pb-3">
            <Settings className="w-5 h-5 text-blue-500" /> Model Parameters
          </h2>
          
          {taskType !== "clustering" && (
            <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-400">Target Feature Column</label>
               <select 
                 value={targetColumn}
                 onChange={(e) => {
                    setTargetColumn(e.target.value);
                    if (taskType === "clustering") setTaskType("auto");
                 }}
                 className="bg-white/50 border border-blue-500/10 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition">
                 {schema.length > 0 ? schema.map((c: any) => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>) : <option>Mock_Column</option>}
               </select>
            </div>
          )}

           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-400">Execution Mode</label>
             <select 
               value={taskType}
               onChange={(e) => { setTaskType(e.target.value); setAlgorithm("auto"); }}
               className="bg-white/50 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition">
               <option value="auto">Autonomous (Auto-Detect)</option>
               {schema.length > 0 && schema.find((c: any) => c.name === targetColumn)?.type !== "object" ? (
                 <option value="regression">Forced Regression (Continuous Numeric)</option>
               ) : null}
               {schema.length > 0 && schema.find((c: any) => c.name === targetColumn)?.type !== "float64" ? (
                 <option value="classification">Forced Classification (Categorical/String)</option>
               ) : null}
               <option value="clustering">Unsupervised Clustering (No Target)</option>
             </select>
          </div>

          {taskType !== "clustering" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="bg-white/50 border border-blue-500/10 rounded-lg p-3 text-blue-500 focus:outline-none focus:border-slate-300 transition">
                {getAlgoOptions().map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <button 
              onClick={simulateTraining}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition shadow-md ${
                isRunning ? "bg-blue-500/10 text-slate-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-slate-300 hover:shadow-lg"
              }`}
            >
              {isRunning ? <span className="animate-spin text-xl">⚙</span> : <Play className="w-5 h-5" />}
              {isRunning ? "Training Models..." : "Execute Pipeline"}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10 md:col-span-2 relative min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-blue-500/10 pb-3 mb-4">
            <Target className="w-5 h-5 text-slate-300" /> Training Output
          </h2>
          
          {!results && !isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
               <Binary className="w-16 h-16 mb-4 text-slate-400" />
               <p>Awaiting Execution Command...</p>
            </div>
          )}

          {isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="w-full max-w-xs h-2 bg-black/40 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-slate-300 to-blue-500 animate-pulse w-full"></div>
               </div>
               <p className="text-slate-400 font-mono text-sm">Testing 15+ algorithmic permutations...</p>
            </div>
          )}

          {results && !isRunning && (
            <div className="flex flex-col flex-1 animate-in zoom-in-95 duration-300">
               <div className="inline-block px-3 py-1 rounded bg-slate-300/10 text-slate-300 font-mono text-xs mb-4 w-max border border-slate-300/20">
                 DETECTED: {results.task_type.toUpperCase()}
               </div>

               <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1">
                 {results.model_used}
               </p>
               <p className="text-slate-400 mb-6">{results.summary}</p>

               <div className="grid grid-cols-2 gap-4 mb-auto">
                 <div className="p-4 bg-black/20 rounded-lg border border-blue-500/10">
                   <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Accuracy</p>
                   <p className="text-4xl font-bold text-blue-500 flex items-center gap-2">
                     {(results.accuracy * 100).toFixed(1)}% <Activity className="text-blue-500" />
                   </p>
                 </div>
                 <div className="p-4 bg-black/20 rounded-lg border border-blue-500/10">
                   <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Precision / R2</p>
                   <p className="text-3xl font-bold text-blue-500">{(results.precision * 100).toFixed(1)}%</p>
                 </div>
               </div>

               <div className="flex gap-4 mt-4 pt-4 border-t border-blue-500/10 w-full mb-4">
                 <button 
                   onClick={downloadPkl}
                   className="flex-1 flex justify-center items-center gap-2 py-3 rounded-lg border border-slate-300 text-slate-300 hover:bg-slate-300 hover:text-white transition font-bold"
                 >
                    <DownloadCloud className="w-5 h-5" /> Download .pkl Model
                 </button>
                 <button 
                   onClick={downloadApiConf}
                   className="flex-1 flex justify-center items-center gap-2 py-3 rounded-lg bg-blue-500 text-white hover:bg-slate-300 hover:shadow-lg transition font-bold shadow-md"
                 >
                    Live Predict API Config
                 </button>
               </div>

               {results.feature_names && results.feature_importance && results.feature_importance.length > 0 && (
                 <div className="w-full bg-black/20 p-4 rounded-xl border border-blue-500/10 mt-2">
                    <h3 className="font-bold text-slate-400 mb-2 border-b border-blue-500/10 pb-2 text-sm uppercase tracking-wider">
                      Model Explainability (Feature Influence)
                    </h3>
                    <div className="flex flex-col gap-2 mt-3">
                       {results.feature_names.map((name: string, i: number) => {
                          const importance = results.feature_importance[i] * 100;
                          return (
                            <div key={name} className="flex flex-col gap-1 text-sm">
                               <div className="flex justify-between text-blue-500">
                                 <span className="font-mono">{name}</span>
                                 <span className="text-blue-500 font-bold">{importance.toFixed(1)}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500" style={{width: `${importance}%`}}></div>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               )}

            </div>
          )}
        </div>

      </div>

      {/* Full-width ML Visualization Gallery */}
      {results && !isRunning && results.graphs && results.graphs.length > 0 && (
        <div className="glass-panel-cyber p-6 rounded-xl border border-blue-500/10">
          <h2 className="text-xl font-bold flex items-center gap-3 border-b border-blue-500/10 pb-3 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            <Activity className="w-6 h-6 text-blue-400" /> ML Visualization Gallery
            <span className="ml-auto text-sm font-mono px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {results.graphs.length} graphs
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.graphs.map((g: any, i: number) => (
              <div key={i} className="bg-black/30 p-4 rounded-xl border border-blue-500/10 flex flex-col hover:border-blue-500/30 transition-colors">
                <h3 className="font-bold text-slate-300 mb-3 border-b border-blue-500/10 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-mono">{i+1}</span>
                  {g.title}
                </h3>
                <img 
                  src={`data:image/png;base64,${g.base64}`} 
                  alt={g.title}
                  className="w-full h-auto rounded-lg object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
