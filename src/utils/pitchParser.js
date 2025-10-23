export const formatLandingPage = (content) => {
  if (!content) return null;

  const sections = {
    hero: "",
    problem: "",
    solution: "",
    features: [],
    cta: "",
  };

  const lines = content.split("\n");
  let currentSection = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (/^Hero Section:/i.test(trimmed)) {
      currentSection = "hero";
      sections.hero = trimmed.replace(/^Hero Section:\s*/i, "");
    } else if (/^Problem Statement:/i.test(trimmed)) {
      currentSection = "problem";
      sections.problem = trimmed.replace(/^Problem Statement:\s*/i, "");
    } else if (/^Solution:/i.test(trimmed)) {
      currentSection = "solution";
      sections.solution = trimmed.replace(/^Solution:\s*/i, "");
    } else if (/^Key Features:/i.test(trimmed)) {
      currentSection = "features";
    } else if (/^Call to Action:/i.test(trimmed)) {
      currentSection = "cta";
      sections.cta = trimmed.replace(/^Call to Action:\s*/i, "");
    }  else if (currentSection === "features" && /^[•\-*]/.test(trimmed)) {
      sections.features.push(trimmed.replace(/^[•\-*]\s*/, ""));
    } else if (currentSection) {
      if (currentSection === "features" && sections.features.length > 0) {
        sections.features[sections.features.length - 1] += " " + trimmed;
      } else {
        sections[currentSection] += " " + trimmed;
      }
    }
  });

  return sections;
};

export const generateLandingPageCode = (responseData, formatLandingPage) => {
  const colors = responseData.colors || ["#06b6d4", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];
  const name = responseData.name || "Startup";
  const sections = formatLandingPage(responseData.landing);

  return `import React from 'react';
import { ChevronRight, Check, Lightbulb, Target } from 'lucide-react';

export default function LandingPage() {
  const colors = {
    primary: '${colors[0]}',
    secondary: '${colors[1]}',
    accent1: '${colors[2]}',
    accent2: '${colors[3]}',
    accent3: '${colors[4]}'
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div 
        className="text-white p-16 text-center relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{ background: \`linear-gradient(135deg, \${colors.primary}, \${colors.secondary})\` }}
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">${name}</h1>
          <p className="text-2xl opacity-90 mb-8">${sections?.hero || 'Your compelling headline here'}</p>
          <button 
            className="px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl text-gray-900"
            style={{ backgroundColor: 'white' }}
          >
            ${sections?.cta || 'Get Started'}
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
              style={{ backgroundColor: colors.accent2 + '20' }}
            >
              <Target className="w-8 h-8" style={{ color: colors.accent2 }} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem</h2>
              <p className="text-xl text-gray-700 leading-relaxed">${sections?.problem || 'Problem description'}</p>
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
              style={{ backgroundColor: colors.accent1 + '20' }}
            >
              <Lightbulb className="w-8 h-8" style={{ color: colors.accent1 }} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Solution</h2>
              <p className="text-xl text-gray-700 leading-relaxed">${sections?.solution || 'Solution description'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="p-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            ${
              sections?.features?.map((feature, idx) => {
                const color = colors[['primary', 'secondary', 'accent1', 'accent2', 'accent3'][idx % 5]];
                return `<div key="${idx}" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: '${color}' + '20' }}
              >
                <Check className="w-7 h-7" style={{ color: '${color}' }} />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">${feature}</p>
            </div>`;
              }).join('\n            ') || '<p>Features will appear here</p>'
            }
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div 
        className="p-16 text-white text-center py-24"
        style={{ background: \`linear-gradient(135deg, \${colors.accent3}, \${colors.accent2})\` }}
      >
        <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">${sections?.cta || 'Join thousands using our platform'}</p>
        <button 
          className="px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl text-gray-900"
          style={{ backgroundColor: 'white' }}
        >
          Sign Up Now
        </button>
      </div>
    </div>
  );
}`;
};