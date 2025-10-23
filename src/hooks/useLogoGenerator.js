import { useState } from 'react';
import toast from 'react-hot-toast';

export const useLogoGenerator = (user, responseData, currentChatId, supabase, fetchSavedPitches) => {
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState(null);

  const uploadLogoToSupabase = async (base64Image, logoName) => {
    try {
      // Convert base64 to blob
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${logoName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`;
      const filePath = `logos/${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('hackathon-images')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('hackathon-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      throw error;
    }
  };

  const generateLogo = async () => {
    if (!responseData?.logoIdea) {
      toast.error("Logo concept not found. Generate a pitch first.");
      return;
    }

    if (!responseData?.name) {
      toast.error("Startup name not found. Please generate a pitch first.");
      return;
    }

    setLogoGenerating(true);

    try {
      const API_URL = "https://api.reve.com/v1/image/create";
      const API_KEY = import.meta.env.VITE_REVE_API_KEY;

      // Step 1: Generate logo from Reve API
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          prompt: `Professional startup logo: ${responseData.logoIdea}. Modern, clean, minimalist design for ${responseData.name}`,
          aspect_ratio: "1:1",
          version: "latest",
        }),
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();

      if (data.image) {
        const base64Image = `data:image/png;base64,${data.image}`;

        // Step 2: Upload to Supabase Storage
        toast.loading("Uploading logo to cloud storage...");
        const publicUrl = await uploadLogoToSupabase(
          base64Image,
          responseData.name
        );

        // Step 3: Update state with public URL
        setGeneratedLogoUrl(publicUrl);
        toast.dismiss();
        toast.success("Logo generated and saved successfully!");

        // Step 4: Save URL to database
        if (currentChatId) {
          const { error: updateError } = await supabase
            .from("pitches")
            .update({ generated_logo_url: publicUrl })
            .eq("id", currentChatId);

          if (updateError) {
            console.error("Error updating logo URL:", updateError);
          } else {
            fetchSavedPitches(user.id);
          }
        }
      } else {
        throw new Error("Image not found in API response");
      }
    } catch (error) {
      console.error("Logo generation error:", error);
      toast.dismiss();
      toast.error(`Failed to generate logo: ${error.message}`);
    } finally {
      setLogoGenerating(false);
    }
  };

  const handleDownloadLogo = async () => {
    if (!generatedLogoUrl) {
      toast.error("No logo to download");
      return;
    }

    try {
      toast.loading("Downloading logo...");

      // Fetch image from URL
      const response = await fetch(generatedLogoUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${responseData.name.replace(/[^a-zA-Z0-9]/g, '-')}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Logo downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      toast.error("Failed to download logo");
    }
  };

  return {
    logoGenerating,
    generatedLogoUrl,
    setGeneratedLogoUrl,
    generateLogo,
    handleDownloadLogo,
  };
};