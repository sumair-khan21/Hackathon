import React from 'react';
import {
  Tag,
  Sparkles,
  Lightbulb,
  Target,
  Globe,
  Palette,
  Copy,
  Check,
  Edit2,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';

const PitchCard = ({
  responseData,
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
    <div className="space-y-4 animate-fade-in">
      {/* Follow-up Response */}
      {isFollowUp && responseData && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-3">Response</p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {responseData.response || responseData.pitch}
              </p>
              <button
                onClick={() => handleCopy(responseData.response || responseData.pitch, "response")}
                className="mt-3 text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg flex items-center gap-2 text-sm"
              >
                {copiedSection === "response" ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Startup Name */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Tag className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Startup Name</p>
              {editMode.name ? (
                <input
                  type="text"
                  value={editedData?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleSave("name")}
                  autoFocus
                  className="text-3xl font-bold text-white bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 w-full focus:outline-none"
                />
              ) : (
                <h3
                  className="text-3xl font-bold text-white cursor-pointer hover:text-cyan-400 transition-colors"
                  onClick={() => handleEdit("name")}
                >
                  {responseData.name}
                </h3>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode.name && (
              <button
                onClick={() => handleEdit("name")}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleCopy(responseData.name, "name")}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              {copiedSection === "name" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Tagline</p>
              {editMode.tagline ? (
                <input
                  type="text"
                  value={editedData?.tagline || ""}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  onBlur={() => handleSave("tagline")}
                  autoFocus
                  className="text-xl italic text-slate-300 bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 w-full focus:outline-none"
                />
              ) : (
                <p
                  className="text-xl italic text-slate-300 cursor-pointer hover:text-purple-400 transition-colors"
                  onClick={() => handleEdit("tagline")}
                >
                  {responseData.tagline}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode.tagline && (
              <button
                onClick={() => handleEdit("tagline")}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleCopy(responseData.tagline, "tagline")}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              {copiedSection === "tagline" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Elevator Pitch */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Elevator Pitch</p>
              {editMode.pitch ? (
                <textarea
                  value={editedData?.pitch || ""}
                  onChange={(e) => handleInputChange("pitch", e.target.value)}
                  onBlur={() => handleSave("pitch")}
                  autoFocus
                  rows="3"
                  className="text-slate-300 leading-relaxed bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 w-full focus:outline-none resize-none"
                />
              ) : (
                <p
                  className="text-slate-300 leading-relaxed cursor-pointer hover:text-yellow-400 transition-colors"
                  onClick={() => handleEdit("pitch")}
                >
                  {responseData.pitch}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode.pitch && (
              <button
                onClick={() => handleEdit("pitch")}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleCopy(responseData.pitch, "pitch")}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              {copiedSection === "pitch" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Target className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Target Audience</p>
              {editMode.audience ? (
                <textarea
                  value={editedData?.audience || ""}
                  onChange={(e) => handleInputChange("audience", e.target.value)}
                  onBlur={() => handleSave("audience")}
                  autoFocus
                  rows="2"
                  className="text-slate-300 leading-relaxed bg-slate-700/50 border border-cyan-500 rounded-lg px-3 py-2 w-full focus:outline-none resize-none"
                />
              ) : (
                <p
                  className="text-slate-300 leading-relaxed cursor-pointer hover:text-red-400 transition-colors"
                  onClick={() => handleEdit("audience")}
                >
                  {responseData.audience}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode.audience && (
              <button
                onClick={() => handleEdit("audience")}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleCopy(responseData.audience, "audience")}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              {copiedSection === "audience" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Landing Page Preview Button */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-teal-400" />
            <div>
              <h4 className="text-xl font-semibold text-white">Landing Page</h4>
              <p className="text-slate-400 text-sm mt-1">View your startup's landing page</p>
            </div>
          </div>
          <button
            onClick={() => setShowLandingPage(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2 font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            Preview Landing Page
          </button>
        </div>
      </div>

      {/* Landing Page Code */}
      {responseData?.landing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-400" />
              <div>
                <h4 className="text-xl font-semibold text-white">Landing Page Code</h4>
                <p className="text-slate-400 text-sm mt-1">Copy the JSX code for your landing page</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">React JSX Component</span>
              <button
                onClick={() => {
                  handleCopy(generateLandingPageCode(), "landingCode");
                }}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg flex items-center gap-2"
              >
                {copiedSection === "landingCode" ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap break-words">
                {generateLandingPageCode()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Brand Colors */}
      {responseData.colors && responseData.colors.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-pink-400" />
              <h4 className="text-xl font-semibold text-white">Brand Colors</h4>
            </div>
            <button
              onClick={() =>
                handleCopy(responseData.colors.join(", "), "colors")
              }
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            >
              {copiedSection === "colors" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {responseData.colors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-slate-600 shadow-lg"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-slate-300 text-sm font-mono">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logo Concept & Generator */}
      {responseData.logoIdea && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <Target className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">Logo Concept</p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  {responseData.logoIdea}
                </p>

                {/* Generate Logo Button */}
                {!generatedLogoUrl && (
                  <button
                    onClick={generateLogo}
                    disabled={logoGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {logoGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating Logo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Logo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => handleCopy(responseData.logoIdea, "logo")}
              disabled={logoGenerating}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiedSection === "logo" ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Generated Logo Display */}
          {generatedLogoUrl && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Generated Logo
                </span>
                <button
                  onClick={handleDownloadLogo}
                  disabled={logoGenerating}
                  className="text-slate-400 hover:text-green-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>

              {/* Logo Image with Loading Overlay */}
              <div className="flex justify-center bg-white/5 rounded-lg p-6 relative">
                <img
                  src={generatedLogoUrl}
                  alt="Generated Logo"
                  className={`max-w-xs w-full h-auto rounded-lg shadow-xl transition-opacity ${
                    logoGenerating ? "opacity-30" : "opacity-100"
                  }`}
                />
                {logoGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
                      <p className="text-slate-300 text-sm font-medium">
                        Regenerating...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerate Button */}
              <button
                onClick={generateLogo}
                disabled={logoGenerating}
                className="mt-4 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700/50 touch-manipulation"
              >
                {logoGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Logo
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PitchCard;