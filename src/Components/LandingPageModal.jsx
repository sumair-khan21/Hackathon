import React from 'react';
import { X, Globe, Target, Lightbulb, Check } from 'lucide-react';

const LandingPageModal = ({ showLandingPage, setShowLandingPage, responseData, formatLandingPage }) => {
  if (!showLandingPage || !responseData?.landing) return null;

  const sections = formatLandingPage(responseData.landing);
  const colors = responseData.colors || ["#06b6d4", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];
  const primaryColor = colors[0] || "#3B82F6";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4 sticky top-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-lg border border-slate-700">
            <h2 className="text-white text-2xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6 text-teal-400" />
              {responseData.name} - Landing Page Preview
            </h2>
            <button
              onClick={() => setShowLandingPage(false)}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Landing Page Preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {sections && (
              <>
                {/* Hero Section */}
                <div
                  className="text-white p-16 text-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                  }}
                >
                  <div className="relative z-10">
                    <h1 className="text-6xl font-bold mb-6">{responseData.name}</h1>
                    <p className="text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
                      {sections.hero}
                    </p>
                    <button
                      className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                      style={{ color: primaryColor }}
                    >
                      {sections.cta}
                    </button>
                  </div>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                  </div>
                </div>

                {/* Problem Section */}
                <div className="p-16 bg-gray-50">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-6">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${colors[2]}20` }}
                      >
                        <Target
                          className="w-8 h-8"
                          style={{ color: colors[2] }}
                        />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                          The Problem
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                          {sections.problem}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="p-16 bg-white">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-6">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${colors[3]}20` }}
                      >
                        <Lightbulb
                          className="w-8 h-8"
                          style={{ color: colors[3] }}
                        />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                          Our Solution
                        </h2>
                        <p className="text-xl text-gray-700 leading-relaxed">
                          {sections.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                {sections.features.length > 0 && (
                  <div className="p-16 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Key Features
                      </h2>
                      <div className="grid md:grid-cols-3 gap-8">
                        {sections.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                          >
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                              style={{
                                backgroundColor:
                                  colors[idx % colors.length] + "20",
                              }}
                            >
                              <Check
                                className="w-7 h-7"
                                style={{ color: colors[idx % colors.length] }}
                              />
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">
                              {feature}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Section */}
                <div
                  className="p-16 text-white text-center"
                  style={{
                    background: `linear-gradient(135deg, ${colors[3]}, ${colors[4]})`,
                  }}
                >
                  <h2 className="text-5xl font-bold mb-6">
                    Ready to Get Started?
                  </h2>
                  <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                    {sections.cta}
                  </p>
                  <button
                    className="bg-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                    style={{ color: colors[3] }}
                  >
                    Sign Up Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageModal;