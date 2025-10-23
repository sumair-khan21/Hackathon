import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Components
import {
  Sidebar,
  TopBar,
  ChatArea,
  InputArea,
  LandingPageModal,
} from "../Components";

// Hooks
import { usePitchGenerator } from "../hooks/usePitchGenerator";
import { useLogoGenerator } from "../hooks/useLogoGenerator";
import { usePitchManagement } from "../hooks/usePitchManagement";

// Utils
import { formatLandingPage, generateLandingPageCode } from "../utils/pitchParser";
import { handleExportPDF } from "../utils/pdfExporter";

const Dashboard = () => {
  const navigate = useNavigate();

  // User & UI State
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(false);

  // Custom Hooks
  const pitchManagement = usePitchManagement(user, supabase, navigate);
  const {
    savedPitches,
    currentChatId,
    setCurrentChatId,
    currentConversationId,
    setCurrentConversationId,
    responseData,
    setResponseData,
    editMode,
    editedData,
    copiedSection,
    fetchSavedPitches,
    fetchConversationHistory,
    loadPitch,
    handleDeletePitch,
    handleNewChat,
    handleCopy,
    handleEdit,
    handleSave,
    handleInputChange,
    handleShare,
    handleLogout,
  } = pitchManagement;

  const pitchGenerator = usePitchGenerator(
    user,
    currentConversationId,
    currentChatId,
    responseData,
    supabase,
    fetchSavedPitches
  );
  const { loading, prompt, setPrompt, tone, setTone, isFollowUp } = pitchGenerator;

  const logoGenerator = useLogoGenerator(
    user,
    responseData,
    currentChatId,
    supabase,
    fetchSavedPitches
  );
  const {
    logoGenerating,
    generatedLogoUrl,
    setGeneratedLogoUrl,
    generateLogo,
    handleDownloadLogo,
  } = logoGenerator;

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
        fetchSavedPitches(session.user.id);

        const savedConvId = localStorage.getItem("currentConversationId");
        if (savedConvId) {
          setCurrentConversationId(savedConvId);
          fetchConversationHistory(savedConvId);
        } else {
          const newConvId = `conv_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          setCurrentConversationId(newConvId);
          localStorage.setItem("currentConversationId", newConvId);
        }
      } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          fetchSavedPitches(parsedUser.id);
        } else {
          navigate("/");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden">
      {/* <Toaster position="top-right" /> */}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleNewChat={() => handleNewChat(setGeneratedLogoUrl, setPrompt)}
        savedPitches={savedPitches}
        currentChatId={currentChatId}
        loadPitch={(pitch) => loadPitch(pitch, setGeneratedLogoUrl)}
        handleDeletePitch={handleDeletePitch}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen w-full lg:w-auto">
        {/* Top Bar */}
        <TopBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          responseData={responseData}
          generatePitch={() => pitchGenerator.generatePitch(setResponseData, setCurrentChatId)}
          handleShare={handleShare}
          handleExportPDF={() =>
            handleExportPDF(responseData, generatedLogoUrl, formatLandingPage)
          }
        />

        {/* Chat Area */}
        <ChatArea
          responseData={responseData}
          loading={loading}
          prompt={prompt}
          tone={tone}
          isFollowUp={isFollowUp}
          copiedSection={copiedSection}
          handleCopy={handleCopy}
          editMode={editMode}
          editedData={editedData}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleInputChange={handleInputChange}
          setShowLandingPage={setShowLandingPage}
          generateLandingPageCode={() =>
            generateLandingPageCode(responseData, formatLandingPage)
          }
          generatedLogoUrl={generatedLogoUrl}
          logoGenerating={logoGenerating}
          generateLogo={generateLogo}
          handleDownloadLogo={handleDownloadLogo}
        />

        {/* Input Area */}
        <InputArea
          prompt={prompt}
          setPrompt={setPrompt}
          tone={tone}
          setTone={setTone}
          loading={loading}
          generatePitch={() => pitchGenerator.generatePitch(setResponseData, setCurrentChatId)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Landing Page Modal */}
      <LandingPageModal
        showLandingPage={showLandingPage}
        setShowLandingPage={setShowLandingPage}
        responseData={responseData}
        formatLandingPage={formatLandingPage}
      />

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
    </div>
  );
};

export default Dashboard;
