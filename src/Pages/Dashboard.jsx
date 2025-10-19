import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  Rocket,
  Sparkles,
  Send,
  Plus,
  History,
  Trash2,
  Download,
  Copy,
  RefreshCw,
  LogOut,
  Menu,
  X,
  User,
  Target,
  Lightbulb,
  Globe,
  Tag,
  Check,
  ExternalLink,
  ChevronRight,
  Edit2,
  Save,
  Share2,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // User & Auth State
  const [user, setUser] = useState(null);
  const [showLandingPage, setShowLandingPage] = useState(false);
  // Input State
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Formal");
  
  // Response State
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Saved Pitches
  const [savedPitches, setSavedPitches] = useState([]);
  // const [currentChatId, setCurrentChatId] = useState(null);
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedSection, setCopiedSection] = useState(null);
  
  // Edit State
  const [currentChatId, setCurrentChatId] = useState(null);
const [currentConversationId, setCurrentConversationId] = useState(null);
const [conversationHistory, setConversationHistory] = useState([]);
  const [editMode, setEditMode] = useState({
    name: false,
    tagline: false,
    pitch: false,
    audience: false,
  });
  const [editedData, setEditedData] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);  


  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSavedPitches(parsedUser.id);
      // Initialize or get existing conversation from localStorage
const savedConvId = localStorage.getItem("currentConversationId");
if (savedConvId) {
  setCurrentConversationId(savedConvId);
  fetchConversationHistory(savedConvId);
} else {
  const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setCurrentConversationId(newConvId);
  localStorage.setItem("currentConversationId", newConvId);
}
    } else {
      navigate("/");
    }
  }, [navigate]);

  

  // ========================================
  // FETCH SAVED PITCHES
  // ========================================
  const fetchSavedPitches = async (userId) => {
    const { data, error } = await supabase
      .from("pitches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching pitches:", error.message);
    } else {
      setSavedPitches(data);
    }
  };

  // ========================================
// FETCH CONVERSATION HISTORY
// ========================================
const fetchConversationHistory = async (convId) => {
  const { data, error } = await supabase
    .from("pitch_conversations")
    .select("*")
    .eq("conversation_id", convId)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: true });

  if (!error) {
    setConversationHistory(data || []);
  }
};

// ========================================
// VALIDATE USER PROMPT (Keyword Check)
// ========================================
const isValidStartupPrompt = (text) => {
  const keywords = [
    "startup", "app", "idea", "product", "business", 
    "service", "platform", "tool", "solution", "feature",
    "project", "venture", "enterprise", "saas", "web",
    "mobile", "software", "build", "create", "develop",
    "name", "tagline", "audience", "feature", "color", "logo",
    "what is", "tell me", "describe", "explain", "show"
  ];
  
  const lowerText = text.toLowerCase();
  
  const rejectedPatterns = [
    /^who (is|are|was|were)/i,
    /^what is the (capital|president|prime minister|population|weather|covid)/i,
    /^when (is|are|was|were)/i,
    /^where (is|are)/i,
    /^how (many|much) (is|are|does)/i,
  ];

  const isRejected = rejectedPatterns.some(pattern => pattern.test(lowerText));
  if (isRejected) return false;

  if (responseData?.name) {
    return true; 
  }

  const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));
  return hasKeyword || text.trim().length > 50;
};

// ========================================
// BUILD CONTEXT FOR LLM (Previous Pitch)
// ========================================
const buildContextPrompt = (userPrompt) => {
  const lowerPrompt = userPrompt.toLowerCase();
  
  let context = "";
  
  if (responseData?.name) {
    // Detect karo user kya pooch raha hy
    let questionType = "general";
    
    if (lowerPrompt.includes("name")) {
      questionType = "name";
    } else if (lowerPrompt.includes("tagline")) {
      questionType = "tagline";
    } else if (lowerPrompt.includes("pitch") || lowerPrompt.includes("elevator")) {
      questionType = "pitch";
    } else if (lowerPrompt.includes("audience")) {
      questionType = "audience";
    } else if (lowerPrompt.includes("feature")) {
      questionType = "feature";
    } else if (lowerPrompt.includes("color") || lowerPrompt.includes("brand")) {
      questionType = "color";
    } else if (lowerPrompt.includes("logo")) {
      questionType = "logo";
    }

    context = `You are a helpful assistant. A startup pitch has been previously generated with these details:

Startup Name: ${responseData.name}
Tagline: ${responseData.tagline}
Pitch: ${responseData.pitch}
Target Audience: ${responseData.audience}
Brand Colors: ${responseData.colors.join(", ")}
Logo Concept: ${responseData.logoIdea}

User's Question: "${userPrompt}"
Question Type: ${questionType}

IMPORTANT INSTRUCTIONS:
- Answer ONLY what the user is asking about
- Do NOT repeat the entire pitch
- Be concise and direct
- If asking about "${questionType}", provide ONLY that information

For example:
- If asking "name" → Answer: "The startup name is [name]"
- If asking "tagline" → Answer: "The tagline is [tagline]"
- If asking "features" → Answer: "The key features are: [list features]"
- Do NOT include other information unless specifically asked

User Question: ${userPrompt}`;
  } else {
    context = userPrompt;
  }
  
  return context;
};
  // ========================================
  // GENERATE PITCH (GEMINI API)
  // ========================================
const generatePitch = async () => {
  if (!prompt.trim()) {
    toast.error("Please enter an idea or prompt.");
    return;
  }

  // Validate prompt
  if (!isValidStartupPrompt(prompt)) {
    toast.error(
      "Please ask startup-related questions. E.g., 'I want an app that connects students with mentors' or 'Tell me about the features of the last pitch'"
    );
    return;
  }

  setLoading(true);
  setResponseData(null);

  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Build context with previous pitch
    // const contextPrompt = buildContextPrompt(prompt);
    
    // Check if this is a follow-up question or new pitch request
    const isFollowUp = responseData?.name && 
      (prompt.toLowerCase().includes("name") || 
       prompt.toLowerCase().includes("feature") ||
       prompt.toLowerCase().includes("audience") ||
       prompt.toLowerCase().includes("color") ||
       prompt.toLowerCase().includes("logo"));

    let fullPrompt = "";

    if (isFollowUp) {
  // Follow-up question - just answer from existing data
  fullPrompt = `You are a helpful assistant. A startup pitch has been previously generated with these details:

Startup Name: ${responseData.name}
Tagline: ${responseData.tagline}
Pitch: ${responseData.pitch}
Target Audience: ${responseData.audience}
Brand Colors: ${responseData.colors.join(", ")}
Logo Concept: ${responseData.logoIdea}

User Question: "${prompt}"

ANSWER ONLY THE QUESTION ASKED. BE CONCISE.
- Do NOT repeat the entire pitch
- Do NOT include unrelated information
- Answer directly and briefly

Example answers:
- "The tagline is: Bridging the Gap, Building Futures."
- "The key features are: [list]"
- "The brand colors are: [colors]"

Now answer this question: ${prompt}`;

    } else {
      // New pitch request
      fullPrompt = `
You are a startup pitch assistant.
Task: Generate a startup name, tagline, pitch, target audience, landing page content, brand colors, and logo concept.

For Landing Page Content, structure it EXACTLY like this:
Hero Section: [compelling headline and subheadline]
Problem Statement: [the problem your startup solves]
Solution: [how your product/service solves it]
Key Features:
- [feature 1]
- [feature 2]
- [feature 3]
Call to Action: [strong CTA]

Brand Colors: [Provide 5 hex color codes separated by commas]
Logo Concept: [Describe a simple logo idea]

Format your response EXACTLY in this structure:

Startup Name: [name]
Tagline: [tagline]
Pitch: [2-3 sentence elevator pitch]
Target Audience: [describe ideal customers]
Landing Page Content:
Hero Section: [content]
Problem Statement: [content]
Solution: [content]
Key Features:
- [feature 1]
- [feature 2]
- [feature 3]
Call to Action: [content]
Brand Colors: [#hex1, #hex2, #hex3, #hex4, #hex5]
Logo Concept: [description]

Business Idea: ${prompt}
Tone: ${tone}
`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini model.";

    const parsed = isFollowUp ? responseData : parsePitchResponse(text);
    setResponseData(parsed);
    setIsFollowUp(isFollowUp); 

    // Save to conversation history
    if (currentConversationId && user?.id) {
      const { error: convError } = await supabase
        .from("pitch_conversations")
        .insert([
          {
            conversation_id: currentConversationId,
            user_id: user.id,
            pitch_id: currentChatId ? parseInt(currentChatId) : null,
            message_type: isFollowUp ? "user_question" : "user_prompt",
            user_message: prompt,
            response_data: parsed,
          },
        ]);

      if (convError) {
        console.error("Error saving conversation:", convError.message);
      }
    }

    // Save new pitch to database (only if it's a new pitch, not follow-up)
    if (!isFollowUp && parsed && parsed.name && user?.id) {
      const { data: insertedData, error } = await supabase
        .from("pitches")
        .insert([
          {
            user_id: user.id,
            conversation_id: currentConversationId,
            idea: prompt,
            tone,
            name: parsed.name,
            tagline: parsed.tagline,
            pitch: parsed.pitch,
            audience: parsed.audience,
            landing: parsed.landing,
            colors: parsed.colors.join(","),
            logo_idea: parsed.logoIdea,
            is_latest_pitch: true,
          },
        ])
        .select();

      if (error) {
        console.error("Error saving pitch:", error.message);
      } else {
        setCurrentChatId(insertedData[0].id);
        fetchSavedPitches(user.id);
        toast.success("Pitch generated and saved!");
      }
    } else if (isFollowUp && currentChatId) {
      toast.success("Response generated!");
    }
  } catch (error) {
    console.error("Error calling Gemini:", error);
    toast.error("Something went wrong. Please try again.");
    setResponseData({ error: "Something went wrong. Please try again." });
  } finally {
    setLoading(false);
  }
};


  // ========================================
  // PARSE GEMINI RESPONSE
  // ========================================
  const parsePitchResponse = (text) => {
    const lines = text.split("\n").map((l) => l.trim());
    const sections = {
      name: "",
      tagline: "",
      pitch: "",
      audience: "",
      landing: "",
      colors: [],
      logoIdea: "",
    };

    let currentKey = null;
    let landingContent = "";

    lines.forEach((line) => {
      if (/^Startup Name:/i.test(line) || /^Name:/i.test(line)) {
        currentKey = "name";
        sections.name = line.replace(/^(Startup Name:|Name:)\s*/i, "");
      } else if (/^Tagline:/i.test(line)) {
        currentKey = "tagline";
        sections.tagline = line.replace(/^Tagline:\s*/i, "");
      } else if (/^Pitch:/i.test(line)) {
        currentKey = "pitch";
        sections.pitch = line.replace(/^Pitch:\s*/i, "");
      } else if (/^Target Audience:/i.test(line)) {
        currentKey = "audience";
        sections.audience = line.replace(/^Target Audience:\s*/i, "");
      } else if (/^Landing Page Content:/i.test(line)) {
        currentKey = "landing";
      } else if (/^Brand Colors:/i.test(line)) {
        currentKey = "colors";
        const colorStr = line.replace(/^Brand Colors:\s*/i, "");
        sections.colors = colorStr
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.startsWith("#"));
      } else if (/^Logo Concept:/i.test(line)) {
        currentKey = "logoIdea";
        sections.logoIdea = line.replace(/^Logo Concept:\s*/i, "");
      } else if (currentKey === "landing") {
        landingContent += line + "\n";
      } else if (currentKey === "logoIdea") {
        sections.logoIdea += " " + line;
      } else if (currentKey && currentKey !== "colors") {
        sections[currentKey] += " " + line;
      }
    });

    sections.landing = landingContent.trim();
    return sections;
  };

  // ========================================
  // FORMAT LANDING PAGE SECTIONS
  // ========================================
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
// ========================================
// GENERATE LANDING PAGE CODE
// ========================================
const generateLandingPageCode = () => {
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
  // ========================================
  // COPY TO CLIPBOARD
  // ========================================
  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // ========================================
  // EDIT MODE HANDLERS
  // ========================================
  const handleEdit = (field) => {
    if (!editedData) {
      setEditedData({ ...responseData });
    }
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field) => {
    setEditMode({ ...editMode, [field]: false });
    setResponseData({ ...editedData });

    // Update in Supabase
    if (currentChatId) {
      const { error } = await supabase
        .from("pitches")
        .update({ [field]: editedData[field] })
        .eq("id", currentChatId);

      if (error) {
        toast.error("Failed to save changes");
      } else {
        toast.success("Changes saved!");
        fetchSavedPitches(user.id);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  // ========================================
  // EXPORT PDF
  // ========================================
  const handleExportPDF = () => {
    if (!responseData) {
      toast.error("No content to export.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = 20;

    // Header with brand colors
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PitchCraft", margin, 18);

    yPos = 45;

    // Startup Name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(responseData.name || "Untitled", maxWidth);
    doc.text(nameLines, margin, yPos);
    yPos += nameLines.length * 10 + 5;

    // Tagline
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const taglineLines = doc.splitTextToSize(responseData.tagline || "", maxWidth);
    doc.text(taglineLines, margin, yPos);
    yPos += taglineLines.length * 7 + 15;

    // Pitch
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("📝 Elevator Pitch", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const pitchLines = doc.splitTextToSize(responseData.pitch || "", maxWidth);
    doc.text(pitchLines, margin, yPos);
    yPos += pitchLines.length * 6 + 12;

    // Target Audience
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("🎯 Target Audience", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const audienceLines = doc.splitTextToSize(responseData.audience || "", maxWidth);
    doc.text(audienceLines, margin, yPos);
    yPos += audienceLines.length * 6 + 12;

    // Landing Page Content
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("🌐 Landing Page Content", margin, yPos);
    yPos += 10;

    const landingSections = formatLandingPage(responseData.landing);
    if (landingSections) {
      const addSection = (title, content) => {
        if (!content) return;
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin + 5, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content, maxWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 8;
      };

      addSection("✨ Hero Section:", landingSections.hero);
      addSection("📌 Problem Statement:", landingSections.problem);
      addSection("💡 Solution:", landingSections.solution);

      if (landingSections.features.length > 0) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text("🎯 Key Features:", margin + 5, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        landingSections.features.forEach((feature) => {
          const featureLines = doc.splitTextToSize("• " + feature, maxWidth - 15);
          doc.text(featureLines, margin + 10, yPos);
          yPos += featureLines.length * 5 + 3;
        });
        yPos += 5;
      }

      addSection(" Call to Action:", landingSections.cta);
    }

    // Brand Colors
    if (responseData.colors && responseData.colors.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212);
      doc.text("🎨 Brand Colors", margin, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(responseData.colors.join(", "), margin + 5, yPos);
      yPos += 12;
    }

    // Logo Concept
    if (responseData.logoIdea) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212);
      doc.text("🎯 Logo Concept", margin, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const logoLines = doc.splitTextToSize(responseData.logoIdea, maxWidth - 10);
      doc.text(logoLines, margin + 5, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by PitchCraft • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    doc.save(`PitchCraft-${responseData.name || "Pitch"}.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  // ========================================
  // SHARE LINK
  // ========================================
  const handleShare = async () => {
    if (!currentChatId) {
      toast.error("No pitch to share");
      return;
    }

    const shareUrl = `${window.location.origin}/pitch/${currentChatId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  // ========================================
  // DELETE PITCH
  // ========================================
  const handleDeletePitch = async (id) => {
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete pitch");
    } else {
      toast.success("Pitch deleted");
      fetchSavedPitches(user.id);
      if (currentChatId === id) {
        setResponseData(null);
        setCurrentChatId(null);
      }
    }
  };

  // ========================================
  // NEW CHAT
  // ========================================
  const handleNewChat = () => {
  // Create new conversation
  const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setCurrentConversationId(newConvId);
  localStorage.setItem("currentConversationId", newConvId);
  
  setPrompt("");
  setResponseData(null);
  setCurrentChatId(null);
  setConversationHistory([]);
  setEditedData(null);
  setEditMode({ name: false, tagline: false, pitch: false, audience: false });
  
  toast.success("New pitch conversation started!");
};

  // ========================================
  // LOAD SAVED PITCH
  // ========================================
  const loadPitch = (pitch) => {
    setResponseData({
      name: pitch.name,
      tagline: pitch.tagline,
      pitch: pitch.pitch,
      audience: pitch.audience,
      landing: pitch.landing,
      colors: pitch.colors ? pitch.colors.split(",") : [],
      logoIdea: pitch.logo_idea || "",
    });
    setCurrentChatId(pitch.id);
    setPrompt(pitch.idea);
  };

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/");
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden">
      {/* ============== SIDEBAR ============== */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 overflow-hidden flex flex-col h-screen`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">PitchCraft</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Pitch
          </button>
        </div>

        {/* Saved Pitches */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <History className="w-4 h-4" />
            <span>Recent Pitches</span>
          </div>

          {savedPitches.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No saved pitches yet
            </p>
          ) : (
            <div className="space-y-2">
              {savedPitches.map((pitch) => (
                <div
                  key={pitch.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    currentChatId === pitch.id
                      ? "bg-slate-800 border border-cyan-500/50"
                      : "bg-slate-800/30 hover:bg-slate-800/50 border border-transparent"
                  }`}
                  onClick={() => loadPitch(pitch)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {pitch.name || "Untitled"}
                      </p>
                      <p className="text-slate-400 text-xs truncate mt-1">
                        {pitch.tagline}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(pitch.created_at).toLocaleDateString()} •{" "}
                        {new Date(pitch.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePitch(pitch.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.user_metadata?.["Display name"] ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ============== MAIN CONTENT ============== */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white"
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

        {/* Chat Area - SCROLLABLE */}
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
          <div className="space-y-4 animate-fade-in">
          {/* Follow-up Response Display */}
    {isFollowUp && responseData && (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all animate-fade-in">
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

            {/* Landing Page Content */}
            {/* <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-teal-400" />
                  <h4 className="text-xl font-semibold text-white">
                    Landing Page Content
                  </h4>
                </div>
                <button
                  onClick={() => handleCopy(responseData.landing, "landing")}
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                >
                  {copiedSection === "landing" ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {(() => {
                const sections = formatLandingPage(responseData.landing);
                if (sections) {
                  return (
                    <div className="space-y-4">
                      {sections.hero && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-cyan-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <h5 className="font-semibold text-cyan-400 text-sm">
                              Hero Section
                            </h5>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {sections.hero}
                          </p>
                        </div>
                      )}

                      {sections.problem && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-red-400" />
                            <h5 className="font-semibold text-red-400 text-sm">
                              Problem Statement
                            </h5>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {sections.problem}
                          </p>
                        </div>
                      )}

                      {sections.solution && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-green-400" />
                            <h5 className="font-semibold text-green-400 text-sm">
                              Solution
                            </h5>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {sections.solution}
                          </p>
                        </div>
                      )}

                      {sections.features.length > 0 && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-purple-400">
                          <div className="flex items-center gap-2 mb-3">
                            <ChevronRight className="w-4 h-4 text-purple-400" />
                            <h5 className="font-semibold text-purple-400 text-sm">
                              Key Features
                            </h5>
                          </div>
                          <ul className="space-y-2">
                            {sections.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-slate-300 text-sm"
                              >
                                <span className="text-purple-400 mt-1">•</span>
                                <span className="leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sections.cta && (
                        <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-yellow-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Rocket className="w-4 h-4 text-yellow-400" />
                            <h5 className="font-semibold text-yellow-400 text-sm">
                              Call to Action
                            </h5>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {sections.cta}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {responseData.landing}
                    </p>
                  );
                }
              })()}
            </div> */}
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

            {/* Logo Concept */}
            {responseData.logoIdea && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Target className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Logo Concept</p>
                      <p className="text-slate-300 leading-relaxed">
                        {responseData.logoIdea}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(responseData.logoIdea, "logo")}
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
        )}

        {/* Error State */}
        {responseData?.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center animate-fade-in">
            <p className="text-red-400">{responseData.error}</p>
          </div>
        )}
      </div>
    </div>

    {/* Input Area - FIXED AT BOTTOM */}
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
  </div>

  {/* Mobile Sidebar Overlay */}
  {sidebarOpen && (
    <div
      className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* Custom Animations */}
  <style>{`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
  `}</style>
  {/* Landing Page Modal */}
{showLandingPage && responseData?.landing && (
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
          {(() => {
            const sections = formatLandingPage(responseData.landing);
            const primaryColor = responseData.colors?.[0] || "#3B82F6";
            
            if (!sections) return null;
            
            return (
              <>
                {/* Hero Section */}
                <div 
                  className="text-white p-16 text-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${responseData.colors[0]}, ${responseData.colors[1]})` }}
                >
                  <div className="relative z-10">
                    <h1 className="text-6xl font-bold mb-6">{responseData.name}</h1>
                    <p className="text-2xl opacity-90 mb-8 max-w-3xl mx-auto">{sections.hero}</p>
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
                      <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${responseData.colors[2]}20` }}>
                        <Target className="w-8 h-8" style={{ color: responseData.colors[2] }} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem</h2>
                        <p className="text-xl text-gray-700 leading-relaxed">{sections.problem}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="p-16 bg-white">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${responseData.colors[3]}20` }}>
                        <Lightbulb className="w-8 h-8" style={{ color: responseData.colors[3] }} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Solution</h2>
                        <p className="text-xl text-gray-700 leading-relaxed">{sections.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                {sections.features.length > 0 && (
                  <div className="p-16 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Key Features</h2>
                      <div className="grid md:grid-cols-3 gap-8">
                        {sections.features.map((feature, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                          >
                            <div 
                              className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                              style={{ backgroundColor: responseData.colors[idx % responseData.colors.length] + "20" }}
                            >
                              <Check 
                                className="w-7 h-7"
                                style={{ color: responseData.colors[idx % responseData.colors.length] }}
                              />
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Section */}
                <div 
                  className="p-16 text-white text-center"
                  style={{ background: `linear-gradient(135deg, ${responseData.colors[3]}, ${responseData.colors[4]})` }}
                >
                  <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
                  <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">{sections.cta}</p>
                  <button 
                    className="bg-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                    style={{ color: responseData.colors[3] }}
                  >
                    Sign Up Now
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  </div>
)}
</div>
);
};
export default Dashboard;















