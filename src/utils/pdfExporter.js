import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

export const handleExportPDF = async (responseData, generatedLogoUrl, formatLandingPage) => {
  if (!responseData) {
    toast.error("No content to export.");
    return;
  }

  toast.loading("Generating PDF...");

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = 20;

    // ========== HEADER ==========
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PitchCraft", margin, 18);

    yPos = 45;

    // ========== STARTUP NAME ==========
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(responseData.name || "Untitled", maxWidth);
    doc.text(nameLines, margin, yPos);
    yPos += nameLines.length * 10 + 5;

    // ========== TAGLINE ==========
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const taglineLines = doc.splitTextToSize(responseData.tagline || "", maxWidth);
    doc.text(taglineLines, margin, yPos);
    yPos += taglineLines.length * 7 + 15;

    // ========== ELEVATOR PITCH ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("Elevator Pitch", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const pitchLines = doc.splitTextToSize(responseData.pitch || "", maxWidth);
    doc.text(pitchLines, margin, yPos);
    yPos += pitchLines.length * 6 + 12;

    // ========== TARGET AUDIENCE ==========
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("Target Audience", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const audienceLines = doc.splitTextToSize(responseData.audience || "", maxWidth);
    doc.text(audienceLines, margin, yPos);
    yPos += audienceLines.length * 6 + 12;

    // ========== LANDING PAGE PREVIEW ==========
    if (responseData.landing) {
      doc.addPage();
      yPos = 20;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(16);
      doc.text("Landing Page Preview", margin, yPos);
      yPos += 15;

      // Create temporary container for landing page
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "1200px";
      tempContainer.style.background = "white";
      document.body.appendChild(tempContainer);

      const sections = formatLandingPage(responseData.landing);
      const colors = responseData.colors || ["#06b6d4", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];

      // Generate landing page HTML
      tempContainer.innerHTML = `
        <div style="width: 1200px; background: white; font-family: Arial, sans-serif;">
          <!-- Hero Section -->
          <div style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]}); color: white; padding: 60px; text-align: center;">
            <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">${responseData.name}</h1>
            <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">${sections?.hero || ''}</p>
            <button style="background: white; color: ${colors[0]}; padding: 15px 40px; border-radius: 25px; border: none; font-weight: bold; font-size: 16px;">
              ${sections?.cta || 'Get Started'}
            </button>
          </div>

          <!-- Problem Section -->
          <div style="padding: 50px; background: #f9fafb;">
            <h2 style="font-size: 32px; font-weight: bold; color: #111; margin-bottom: 15px;">The Problem</h2>
            <p style="font-size: 18px; color: #374151; line-height: 1.6;">${sections?.problem || ''}</p>
          </div>

          <!-- Solution Section -->
          <div style="padding: 50px; background: white;">
            <h2 style="font-size: 32px; font-weight: bold; color: #111; margin-bottom: 15px;">Our Solution</h2>
            <p style="font-size: 18px; color: #374151; line-height: 1.6;">${sections?.solution || ''}</p>
          </div>

          <!-- Features Section -->
          <div style="padding: 50px; background: #f9fafb;">
            <h2 style="font-size: 32px; font-weight: bold; color: #111; margin-bottom: 30px; text-align: center;">Key Features</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              ${sections?.features?.map((feature, idx) => `
                <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: ${colors[idx % colors.length]}20; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                    <span style="color: ${colors[idx % colors.length]}; font-size: 24px;">✓</span>
                  </div>
                  <p style="font-size: 16px; color: #374151; line-height: 1.5;">${feature}</p>
                </div>
              `).join('') || ''}
            </div>
          </div>

          <!-- CTA Section -->
          <div style="background: linear-gradient(135deg, ${colors[3]}, ${colors[4]}); color: white; padding: 60px; text-align: center;">
            <h2 style="font-size: 40px; font-weight: bold; margin-bottom: 20px;">Ready to Get Started?</h2>
            <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">${sections?.cta || ''}</p>
            <button style="background: white; color: ${colors[3]}; padding: 15px 40px; border-radius: 25px; border: none; font-weight: bold; font-size: 16px;">
              Sign Up Now
            </button>
          </div>
        </div>
      `;

      // Capture as image
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempContainer);

      // Add to PDF
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxPageHeight = pageHeight - 40;

      let heightLeft = imgHeight;
      let position = yPos;

      doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= maxPageHeight;

      while (heightLeft > 0) {
        doc.addPage();
        position = heightLeft - imgHeight + 20;
        doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= maxPageHeight;
      }
    }

    // ========== BRAND COLORS ==========
    doc.addPage();
    yPos = 20;

    if (responseData.colors && responseData.colors.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(14);
      doc.text("Brand Colors", margin, yPos);
      yPos += 10;

      responseData.colors.forEach((color, idx) => {
        const x = margin + (idx * 35);
        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 0, g: 0, b: 0 };
        };
        const rgb = hexToRgb(color);
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(x, yPos, 25, 25, "F");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(color, x, yPos + 32);
      });
      yPos += 40;
    }

    // ========== LOGO CONCEPT ==========
    if (responseData.logoIdea) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(14);
      doc.text("Logo Concept", margin, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      const logoLines = doc.splitTextToSize(responseData.logoIdea, maxWidth - 10);
      doc.text(logoLines, margin, yPos);
      yPos += logoLines.length * 6 + 15;

      // Add generated logo if exists
      if (generatedLogoUrl) {
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(6, 182, 212);
        doc.text("Generated Logo", margin, yPos);
        yPos += 10;

        try {
          const logoImg = await loadImageAsBase64(generatedLogoUrl);
          const logoSize = 60;
          doc.addImage(logoImg, "PNG", margin, yPos, logoSize, logoSize);
        } catch (err) {
          console.error("Error adding logo to PDF:", err);
        }
      }
    }

    // ========== FOOTER ==========
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by PitchCraft • ${new Date().toLocaleDateString()} • Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    doc.save(`PitchCraft-${responseData.name || "Pitch"}.pdf`);
    toast.dismiss();
    toast.success("PDF downloaded successfully!");

  } catch (error) {
    console.error("PDF generation error:", error);
    toast.dismiss();
    toast.error("Failed to generate PDF");
  }
};

// Helper function
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};