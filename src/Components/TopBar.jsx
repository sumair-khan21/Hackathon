import React from 'react';
import { Menu, Sparkles, RefreshCw, Share2, Download } from 'lucide-react';

const TopBar = ({
  sidebarOpen,
  setSidebarOpen,
  responseData,
  generatePitch,
  handleShare,
  handleExportPDF
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white active:text-cyan-400 transition-colors p-2 -m-2 touch-manipulation"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-white text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          AI Startup Pitch Generator
        </h1>
      </div>

      {responseData && !responseData.error && (
        <div className="flex items-center gap-2">
          <button
            onClick={generatePitch}
            className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;
