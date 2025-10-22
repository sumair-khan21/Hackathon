import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Rocket,
  Sparkles,
  Tag,
  Target,
  Lightbulb,
  Globe,
  Palette,
  ArrowLeft,
  Download,
  Copy,
  Check,
  Loader,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import toast, { Toaster } from "react-hot-toast";

const SharedPitch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    fetchPitch();
  }, [id]);

  const fetchPitch = async () => {
    try {
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setPitch({
          name: data.name,
          tagline: data.tagline,
          pitch: data.pitch,
          audience: data.audience,
          landing: data.landing,
          colors: data.colors ? data.colors.split(",") : [],
          logoIdea: data.logo_idea || "",
          generatedLogoUrl: data.generated_logo_url || null,
        });
      }
    } catch (error) {
      console.error("Error fetching pitch:", error);
      toast.error("Pitch not found");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatLandingPage = (content) => {
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
      } else if (currentSection === "features" && /^[•\-\*]/.test(trimmed)) {
        sections.features.push(trimmed.replace(/^[•\-\*]\s*/, ""));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
          <p className="text-slate-400">Loading pitch...</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pitch Not Found</h1>
          <p className="text-slate-400 mb-6">The pitch you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            <span className="text-white font-semibold">PitchCraft</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Startup Name */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Tag className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">Startup Name</p>
                <h3 className="text-3xl font-bold text-white">{pitch.name}</h3>
              </div>
            </div>
            <button
              onClick={() => handleCopy(pitch.name, "name")}
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

        {/* Tagline */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">Tagline</p>
                <p className="text-xl italic text-slate-300">{pitch.tagline}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(pitch.tagline, "tagline")}
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

        {/* Elevator Pitch */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">Elevator Pitch</p>
                <p className="text-slate-300 leading-relaxed">{pitch.pitch}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(pitch.pitch, "pitch")}
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

        {/* Target Audience */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Target className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">Target Audience</p>
                <p className="text-slate-300 leading-relaxed">{pitch.audience}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(pitch.audience, "audience")}
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

        {/* Brand Colors */}
        {pitch.colors && pitch.colors.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-pink-400" />
                <h4 className="text-xl font-semibold text-white">Brand Colors</h4>
              </div>
              <button
                onClick={() => handleCopy(pitch.colors.join(", "), "colors")}
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
              {pitch.colors.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-slate-600 shadow-lg"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-slate-300 text-sm font-mono">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logo Concept */}
        {pitch.logoIdea && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Target className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm mb-2">Logo Concept</p>
                  <p className="text-slate-300 leading-relaxed">{pitch.logoIdea}</p>
                  
                  {/* Generated Logo */}
                  {pitch.generatedLogoUrl && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-sm mb-3">Generated Logo</p>
                      <div className="flex justify-center bg-white/5 rounded-lg p-6">
                        <img
                          src={pitch.generatedLogoUrl}
                          alt="Generated Logo"
                          className="max-w-xs w-full h-auto rounded-lg shadow-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleCopy(pitch.logoIdea, "logo")}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              >
                {copiedSection === "logo" ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPitch;