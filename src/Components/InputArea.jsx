import React from 'react';
import { Send } from 'lucide-react';

const InputArea = ({
  prompt,
  setPrompt,
  tone,
  setTone,
  loading,
  generatePitch
}) => {
  return (
    <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-3 focus-within:border-cyan-500/50 transition-all">
            <textarea
              placeholder="Describe your startup idea... (e.g., An app that connects students with mentors)"
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none max-h-32"
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generatePitch();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
              <select
                className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="Formal">Formal</option>
                <option value="Fun">Fun</option>
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
              </select>
              <span className="text-xs text-slate-500">Press Enter to send</span>
            </div>
          </div>
          <button
            onClick={generatePitch}
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-4 rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;