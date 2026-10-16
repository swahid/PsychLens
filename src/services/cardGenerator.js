/**
 * Social Infographic Card Generator
 * Uses HTML5 Canvas to render a high-aesthetic branded card
 * containing the user's photo and its psychological interpretation.
 * Fully localized across Bengali, Hindi, Spanish, French, German, Arabic, and English.
 */

const LOCALIZED_CARD_TEXTS = {
  English: {
    subtitle: 'EMOTIONAL & PSYCHOLOGICAL VISUAL INTELLIGENCE',
    moodLabel: 'Mood',
    tensionLabel: 'Tension Index',
    subjectTitle: 'Person & Subject Demeanor',
    behaviorTitle: 'Behavioral & Psychological Subtext',
    artisticTitle: 'Artistic & Color Atmosphere',
    footer: 'Decoded with PsychLens AI • For educational & self-reflection purposes only',
  },
  Bengali: {
    subtitle: 'আবেগ ও মনস্তাত্ত্বিক ভিজ্যুয়াল বুদ্ধিমত্তা',
    moodLabel: 'মনোভাব',
    tensionLabel: 'টানাপোড়েন সূচক',
    subjectTitle: 'ব্যক্তি সনাক্তকরণ ও শারীরিক ভাবভঙ্গি',
    behaviorTitle: 'আচরণগত সংকেত ও শরীরী ভাষা',
    artisticTitle: 'শিল্পকলা ও রঙের মনস্তত্ত্ব',
    footer: 'PsychLens AI দ্বারা বিশ্লেষিত • আত্মচিন্তা ও শিক্ষামূলক উদ্দেশ্যে',
  },
  Hindi: {
    subtitle: 'भावनात्मक एवं मनोवैज्ञानिक दृश्य बुद्धिमत्ता',
    moodLabel: 'मनोदशा',
    tensionLabel: 'तनाव सूचकांक',
    subjectTitle: 'व्यक्ति की पहचान एवं शारीरिक मुद्रा',
    behaviorTitle: 'शारीरिक भाषा एवं अवचेतन संकेत',
    artisticTitle: 'कला एवं रंग मनोविज्ञान',
    footer: 'PsychLens AI द्वारा विश्लेषित • केवल आत्म-चिंतन एवं शैक्षिक उद्देश्य हेतु',
  },
  Spanish: {
    subtitle: 'INTELIGENCIA VISUAL EMOCIONAL Y PSICOLÓGICA',
    moodLabel: 'Estado de ánimo',
    tensionLabel: 'Índice de tensión',
    subjectTitle: 'Identificación de la Persona y Porte',
    behaviorTitle: 'Lenguaje Corporal y Señales Subconscientes',
    artisticTitle: 'Psicología del Color y Composición',
    footer: 'Decodificado con PsychLens AI • Solo para fines educativos y de autorreflexión',
  },
  French: {
    subtitle: 'INTELLIGENCE VISUELLE ÉMOTIONNELLE ET PSYCHOLOGIQUE',
    moodLabel: 'Humeur',
    tensionLabel: 'Indice de tension',
    subjectTitle: 'Identification de la Personne et Posture',
    behaviorTitle: 'Langage Corporel et Signaux Subconscients',
    artisticTitle: 'Psychologie des Couleurs et de la Composition',
    footer: "Décodé avec PsychLens AI • À des fins éducatives et d'autoréflexion uniquement",
  },
  German: {
    subtitle: 'EMOTIONALE UND PSYCHOLOGISCHE VISUELLE INTELLIGENZ',
    moodLabel: 'Stimmung',
    tensionLabel: 'Spannungsindex',
    subjectTitle: 'Personenerkennung & Auftreten',
    behaviorTitle: 'Körpersprache und Unterbewusste Signale',
    artisticTitle: 'Farb- und Kompositionspsychologie',
    footer: 'Entschlüsselt mit PsychLens AI • Nur für Bildungs- und Selbstreflexionszwecke',
  },
  Arabic: {
    subtitle: 'الذكاء البصري العاطفي والنفسي',
    moodLabel: 'المزاج',
    tensionLabel: 'مؤشر التوتر',
    subjectTitle: 'تحديد الشخص والهيئة البصرية',
    behaviorTitle: 'لغة الجسد والإشارات اللاواعية',
    artisticTitle: 'سيكولوجية الألوان والتكوين الفني',
    footer: 'تم التحليل بواسطة PsychLens AI • لأغراض التأمل الذاتي والتعليم فقط',
  },
};

const FONT_SANS = '"Plus Jakarta Sans", "Noto Sans Bengali", "SolaimanLipi", "Kalpurush", "Hind Siliguri", "Bangla", "Noto Sans Devanagari", system-ui, sans-serif';
const FONT_DISPLAY = '"Outfit", "Plus Jakarta Sans", "Noto Sans Bengali", "Kalpurush", system-ui, sans-serif';

export async function generateAndDownloadCard(imageUrl, analysis, optionsOrTitle = 'Psychological Interpretation') {
  const options = typeof optionsOrTitle === 'object' && optionsOrTitle !== null
    ? optionsOrTitle
    : { title: optionsOrTitle, language: 'English' };

  const langKey = options.language || 'English';
  const i18n = LOCALIZED_CARD_TEXTS[langKey] || LOCALIZED_CARD_TEXTS.English;

  return new Promise((resolve, reject) => {
    const hasSubject = Boolean(analysis?.subjectIdentification && analysis.subjectIdentification.trim() !== '');
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = hasSubject ? 1540 : 1420;
    const ctx = canvas.getContext('2d');

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, canvas.height);
    bgGradient.addColorStop(0, '#090a13');
    bgGradient.addColorStop(0.4, '#121422');
    bgGradient.addColorStop(1, '#080910');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, canvas.height);

    // Decorative glow orbs
    drawGlowOrb(ctx, 150, 150, 250, 'rgba(139, 92, 246, 0.18)');
    drawGlowOrb(ctx, 1050, 300, 280, 'rgba(236, 72, 153, 0.14)');
    drawGlowOrb(ctx, 600, canvas.height - 200, 320, 'rgba(6, 182, 212, 0.12)');

    // 2. Header / Branding
    ctx.font = `bold 36px ${FONT_DISPLAY}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🔮 PsychLens', 70, 85);

    ctx.font = `500 18px ${FONT_SANS}`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(i18n.subtitle, 70, 118);

    // Load user image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Draw image in a rounded rectangular card
        const imgX = 70;
        const imgY = 145;
        const imgW = 1060;
        const imgH = 500;

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
        const badgeY = 670;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.22)';
        roundedRect(ctx, 70, badgeY, 480, 52, 26);
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.55)';
        ctx.stroke();

        ctx.font = `bold 21px ${FONT_SANS}`;
        ctx.fillStyle = '#c4b5fd';
        ctx.fillText(`✨ ${i18n.moodLabel}: ${moodText}`, 95, badgeY + 34);

        // Tension score pill
        ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
        roundedRect(ctx, 570, badgeY, 320, 52, 26);
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.stroke();

        ctx.font = `bold 20px ${FONT_SANS}`;
        ctx.fillStyle = '#f472b6';
        ctx.fillText(`⚡ ${i18n.tensionLabel}: ${tension}/10`, 595, badgeY + 34);

        // 4. Psychological Subtext Box
        const cardY = 745;
        const cardH = hasSubject ? 690 : 570;
        ctx.fillStyle = 'rgba(23, 26, 41, 0.85)';
        roundedRect(ctx, 70, cardY, 1060, cardH, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        let curY = cardY + 45;

        // Optional Subject Identification section
        if (hasSubject) {
          ctx.font = `bold 22px ${FONT_DISPLAY}`;
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(i18n.subjectTitle, 110, curY);
          curY += 32;

          ctx.font = `400 19px ${FONT_SANS}`;
          ctx.fillStyle = '#e2e8f0';
          curY = wrapText(ctx, analysis.subjectIdentification, 110, curY, 980, 28, 3);
          curY += 15;
        }

        // Subtext Title
        ctx.font = `bold 23px ${FONT_DISPLAY}`;
        ctx.fillStyle = '#818cf8';
        ctx.fillText(i18n.behaviorTitle, 110, curY);
        curY += 32;

        // Subtext Paragraph
        ctx.font = `400 19px ${FONT_SANS}`;
        ctx.fillStyle = '#cbd5e1';
        curY = wrapText(ctx, analysis?.psychologicalSubtext || '', 110, curY, 980, 28, 4);
        curY += 18;

        // Artistic & Color Psychology Title
        ctx.font = `bold 23px ${FONT_DISPLAY}`;
        ctx.fillStyle = '#ec4899';
        ctx.fillText(i18n.artisticTitle, 110, curY);
        curY += 32;

        // Artistic Paragraph
        ctx.font = `400 19px ${FONT_SANS}`;
        ctx.fillStyle = '#cbd5e1';
        curY = wrapText(ctx, analysis?.artisticPsychology || '', 110, curY, 980, 28, 4);
        curY += 20;

        // Reflection Quote at bottom of box
        if (analysis?.reflectionPrompt) {
          const quoteY = cardY + cardH - 100;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
          roundedRect(ctx, 100, quoteY, 1000, 75, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.stroke();

          ctx.font = `italic 500 19px ${FONT_SANS}`;
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText(`💭 "${analysis.reflectionPrompt}"`, 130, quoteY + 44);
        }

        // 5. Footer watermark
        ctx.font = `500 17px ${FONT_SANS}`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(i18n.footer, 70, canvas.height - 35);

        // Export and trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `PsychLens-${langKey.toLowerCase()}-${Date.now()}.png`;
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 10) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      linesCount++;
      if (maxLines && linesCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}
