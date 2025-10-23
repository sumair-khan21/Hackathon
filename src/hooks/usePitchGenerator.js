import { useState } from 'react';
import toast from 'react-hot-toast';

export const usePitchGenerator = (user, currentConversationId, currentChatId, responseData, supabase, fetchSavedPitches) => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Formal");
  const [isFollowUp, setIsFollowUp] = useState(false);

  const isValidStartupPrompt = (text) => {
    const lowerText = text.toLowerCase().trim();
    if (!lowerText) return false;
    if (responseData?.name) return true;

    const rejectedPatterns = [
      /^who is (donald trump|elon musk|bill gates|mark zuckerberg)/i,
      /^what is the capital of/i,
      /^who won (the|an?) (election|world cup|war)/i,
      /^what is (covid|coronavirus|weather)/i,
      /^when (was|is) (christmas|ramadan|diwali)/i,
      /^where is (pakistan|india|usa|uk)/i,
      /^how tall is/i,
      /^tell me a joke/i,
      /^what's (the time|today's date)/i,
    ];

    const isRejected = rejectedPatterns.some(pattern => pattern.test(lowerText));
    if (isRejected) return false;

    const startupKeywords = [
      "startup", "app", "application", "idea", "product", "business",
      "service", "platform", "tool", "solution", "feature", "features",
      "project", "venture", "enterprise", "saas", "software",
      "build", "create", "develop", "make", "design", "launch",
      "connect", "help", "solve", "improve", "optimize",
      "students", "teachers", "developers", "users", "customers",
      "freelancers", "entrepreneurs", "businesses", "companies",
      "web", "mobile", "ai", "machine learning", "blockchain",
      "cloud", "api", "database", "website", "automation",
      "name", "tagline", "pitch", "audience", "color", "logo",
      "brand", "marketing", "landing page",
      "i want", "i need", "can you", "help me", "generate",
      "create me", "build me", "suggest", "recommend"
    ];

    const hasKeyword = startupKeywords.some(keyword => lowerText.includes(keyword));
    const isLongDescription = text.trim().length > 40;

    return hasKeyword || isLongDescription;
  };

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

  const generatePitch = async (setResponseData, setCurrentChatId) => {
    if (!prompt.trim()) {
      toast.error("Please enter an idea or prompt.");
      return;
    }

    if (!isValidStartupPrompt(prompt)) {
      toast.error(
        responseData?.name
          ? "Please ask about your pitch or describe a new startup idea"
          : "Please describe your startup idea. E.g., 'An app that connects students with mentors' or 'A food delivery service for healthy meals'",
        { duration: 4000 }
      );
      return;
    }

    setLoading(true);
    setResponseData(null);

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const isFollowUpQuestion =
        responseData?.name &&
        (prompt.toLowerCase().includes("name") ||
          prompt.toLowerCase().includes("feature") ||
          prompt.toLowerCase().includes("audience") ||
          prompt.toLowerCase().includes("color") ||
          prompt.toLowerCase().includes("logo"));

      let fullPrompt = "";

      if (isFollowUpQuestion) {
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

      const parsed = isFollowUpQuestion ? responseData : parsePitchResponse(text);
      setResponseData(parsed);
      setIsFollowUp(isFollowUpQuestion);

      // Save to conversation history
      if (currentConversationId && user?.id) {
        await supabase.from("pitch_conversations").insert([
          {
            conversation_id: currentConversationId,
            user_id: user.id,
            pitch_id: currentChatId ? parseInt(currentChatId) : null,
            message_type: isFollowUpQuestion ? "user_question" : "user_prompt",
            user_message: prompt,
            response_data: parsed,
          },
        ]);
      }

      // Save new pitch to database
      if (!isFollowUpQuestion && parsed && parsed.name && user?.id) {
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

        if (!error) {
          setCurrentChatId(insertedData[0].id);
          fetchSavedPitches(user.id);
          toast.success("Pitch generated and saved!");
        }
      } else if (isFollowUpQuestion && currentChatId) {
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

  return {
    loading,
    prompt,
    setPrompt,
    tone,
    setTone,
    isFollowUp,
    generatePitch,
  };
};