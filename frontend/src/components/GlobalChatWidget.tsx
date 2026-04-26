"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Command, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "AutoAnalytica Copilot loaded. How can I assist you with your current visual matrices?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : "Dashboard";
      const datasetEda = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('dataset_eda') || '{}') : {};
      
      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, context: currentPath, dataset_schema: datasetEda.schema || null })
      });

      if (!res.ok) throw new Error("API Error");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: "⚠️ Network Error: Unable to connect to inference engine." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="mb-4 w-80 md:w-96 h-[500px] max-h-[80vh] flex flex-col glass-panel-cyber-cyber shadow-md rounded-3xl overflow-hidden border border-slate-300/30"
          >
            {/* Header */}
            <div className="bg-cyberBg/90 backdrop-blur-md p-4 border-b border-blue-500/10 flex justify-between items-center z-10 shadow-md">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300 flex items-center justify-center relative">
                   <Bot className="w-4 h-4 text-slate-300" />
                   <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 </div>
                 <div>
                   <h3 className="text-blue-500 font-bold text-sm">AI Copilot</h3>
                   <p className="text-xs text-slate-400">DeepSeek Synthetic Engine</p>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-blue-500 transition">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 relative">
               <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none -z-10"></div>
               
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                     msg.role === 'user' 
                       ? 'bg-gradient-to-r from-blue-500 to-slate-300 text-white font-medium rounded-br-sm'
                       : 'bg-black/40 text-blue-500 border border-blue-500/10 rounded-bl-sm'
                   }`}>
                      {msg.text}
                   </div>
                 </div>
               ))}
               
               {isTyping && (
                 <div className="flex justify-start">
                   <div className="max-w-[85%] rounded-3xl px-4 py-3 bg-black/40 text-blue-500 border border-blue-500/10 rounded-bl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing data...
                   </div>
                 </div>
               )}
               
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-cyberBg border-t border-blue-500/10">
               <div className="relative flex items-center">
                 <Command className="w-4 h-4 text-slate-400 absolute left-3" />
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Ask about your matrices..."
                   className="w-full bg-black/50 border border-blue-500/10 rounded-full py-2.5 pl-9 pr-12 text-sm text-blue-500 focus:outline-none focus:border-slate-300 transition shadow-inner"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={isTyping}
                    className="absolute right-1.5 p-1.5 bg-slate-300 text-white rounded-full hover:bg-slate-300 hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                 </button>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-slate-300 flex items-center justify-center shadow-md group z-50 transition-all border border-blue-500/10"
      >
        <Bot className="w-6 h-6 text-white group-hover:animate-bounce" />
      </motion.button>
    </div>
  );
}
