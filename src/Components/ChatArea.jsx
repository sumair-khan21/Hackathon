import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import PitchCard from './PitchCard';

const ChatArea = ({
  responseData,
  loading,
  prompt,
  tone,
  isFollowUp,
  copiedSection,
  handleCopy,
  editMode,
  editedData,
  handleEdit,
  handleSave,
  handleInputChange,
  setShowLandingPage,
  generateLandingPageCode,
  generatedLogoUrl,
  logoGenerating,
  generateLogo,
  handleDownloadLogo
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
        {/* Empty State */}
        {!responseData && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl mb-6">
              <Rocket className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              What's your startup idea?
            </h2>
            <p className="text-slate-400 text-lg">
              Describe your idea and let AI craft the perfect pitch
            </p>
          </div>
        )}

        {/* User Input Bubble */}
        {prompt && responseData && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-2xl rounded-tr-sm max-w-2xl">
              <p className="text-sm opacity-90 mb-1">Your Idea</p>
              <p>{prompt}</p>
              <p className="text-xs opacity-75 mt-2">Tone: {tone}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-start gap-4 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-sm p-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <span className="text-slate-400 text-sm ml-2">
                  Generating your pitch...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Response Cards */}
        {responseData && !responseData.error && (
          <PitchCard
            responseData={responseData}
            isFollowUp={isFollowUp}
            copiedSection={copiedSection}
            handleCopy={handleCopy}
            editMode={editMode}
            editedData={editedData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleInputChange={handleInputChange}
            setShowLandingPage={setShowLandingPage}
            generateLandingPageCode={generateLandingPageCode}
            generatedLogoUrl={generatedLogoUrl}
            logoGenerating={logoGenerating}
            generateLogo={generateLogo}
            handleDownloadLogo={handleDownloadLogo}
          />
        )}

        {/* Error State */}
        {responseData?.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center animate-fade-in">
            <p className="text-red-400">{responseData.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;