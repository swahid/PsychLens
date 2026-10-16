/**
 * Social Infographic Card Generator
 * Uses HTML5 Canvas to render a high-aesthetic branded card
 * containing the user's photo and its psychological interpretation.
 */

export async function generateAndDownloadCard(imageUrl, analysis, title = 'Psychological Interpretation') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 1400);
    bgGradient.addColorStop(0, '#090a13');
    bgGradient.addColorStop(0.5, '#121422');
    bgGradient.addColorStop(1, '#080910');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 1400);

    // Decorative glow orbs
    drawGlowOrb(ctx, 150, 150, 250, 'rgba(139, 92, 246, 0.18)');
    drawGlowOrb(ctx, 1050, 300, 280, 'rgba(236, 72, 153, 0.14)');
    drawGlowOrb(ctx, 600, 1200, 320, 'rgba(6, 182, 212, 0.12)');

    // 2. Header / Branding
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🔮 PsychLens', 70, 90);

    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('EMOTIONAL & PSYCHOLOGICAL VISUAL INTELLIGENCE', 70, 125);

    // Load user image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Draw image in a rounded rectangular card
        const imgX = 70;
        const imgY = 160;
        const imgW = 1060;
        const imgH = 540;

        ctx.save();
        roundedRect(ctx, imgX, imgY, imgW, imgH, 20);
        ctx.clip();

        // Cover fill aspect ratio
        const imgAspect = img.width / img.height;
        const boxAspect = imgW / imgH;
        let renderW, renderH, offsetX, offsetY;

        if (imgAspect > boxAspect) {
          renderH = imgH;
          renderW = imgH * imgAspect;
          offsetX = imgX - (renderW - imgW) / 2;
          offsetY = imgY;
        } else {
          renderW = imgW;
          renderH = imgW / imgAspect;
          offsetX = imgX;
          offsetY = imgY - (renderH - imgH) / 2;
        }
        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        ctx.restore();

        // Border around image
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        roundedRect(ctx, imgX, imgY, imgW, imgH, 20);
        ctx.stroke();

        // 3. Mood Badge & Tension Meter
        const moodText = analysis?.mood?.primary || 'Deep Emotional Resonance';
        const tension = analysis?.mood?.tensionScore || 5;

        // Glass badge for mood
        const badgeY = 740;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
        roundedRect(ctx, 70, badgeY, 380, 50, 25);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.stroke();

        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#c4b5fd';
        ctx.fillText(`✨ Mood: ${moodText}`, 95, badgeY + 33);

        // Tension score pill
        ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
        roundedRect(ctx, 470, badgeY, 300, 50, 25);
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.stroke();

        ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f472b6';
        ctx.fillText(`⚡ Tension Index: ${tension}/10`, 495, badgeY + 33);

        // 4. Psychological Subtext Box
        const cardY = 820;
        ctx.fillStyle = 'rgba(23, 26, 41, 0.75)';
        roundedRect(ctx, 70, cardY, 1060, 480, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();

        // Subtext Title
        ctx.font = 'bold 26px "Outfit", sans-serif';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('Behavioral & Psychological Subtext', 110, cardY + 60);

        // Subtext Paragraph
        ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        wrapText(ctx, analysis?.psychologicalSubtext || '', 110, cardY + 105, 980, 34);

        // Artistic & Color Psychology Title
        ctx.font = 'bold 26px "Outfit", sans-serif';
        ctx.fillStyle = '#ec4899';
        ctx.fillText('Artistic & Color Atmosphere', 110, cardY + 240);

        // Artistic Paragraph
        ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        wrapText(ctx, analysis?.artisticPsychology || '', 110, cardY + 285, 980, 34);

        // Reflection Quote at bottom of box
        if (analysis?.reflectionPrompt) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
          roundedRect(ctx, 100, cardY + 375, 1000, 75, 16);
          ctx.fill();
          ctx.font = 'italic 500 20px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText(`💭 "${analysis.reflectionPrompt}"`, 130, cardY + 420);
        }

        // 5. Footer watermark
        ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Decoded with PsychLens AI • For educational & self-reflection purposes only', 70, 1345);

        // Export and trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `PsychLens-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(new Error('Failed to load image for card canvas: ' + e));
    img.src = imageUrl;
  });
}

function drawGlowOrb(ctx, x, y, radius, color) {
  const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  radGrad.addColorStop(0, color);
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
