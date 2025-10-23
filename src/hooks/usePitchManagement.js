import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePitchManagement = (user, supabase, navigate) => {
  const [savedPitches, setSavedPitches] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    tagline: false,
    pitch: false,
    audience: false,
  });
  const [editedData, setEditedData] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

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

  const loadPitch = (pitch, setGeneratedLogoUrl) => {
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

    // Load generated logo if exists
    if (pitch.generated_logo_url) {
      setGeneratedLogoUrl(pitch.generated_logo_url);
    } else {
      setGeneratedLogoUrl(null);
    }
  };

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

  const handleNewChat = (setGeneratedLogoUrl, setPrompt) => {
    const newConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentConversationId(newConvId);
    localStorage.setItem("currentConversationId", newConvId);

    setPrompt("");
    setResponseData(null);
    setCurrentChatId(null);
    setConversationHistory([]);
    setEditedData(null);
    setEditMode({ name: false, tagline: false, pitch: false, audience: false });
    setGeneratedLogoUrl(null);

    toast.success("New pitch conversation started!");
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

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

  const handleShare = async () => {
    if (!currentChatId) {
      toast.error("No pitch to share");
      return;
    }

    const shareUrl = `${window.location.origin}/pitch/${currentChatId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/");
  };

  return {
    savedPitches,
    currentChatId,
    setCurrentChatId,
    currentConversationId,
    setCurrentConversationId,
    conversationHistory,
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
  };
};