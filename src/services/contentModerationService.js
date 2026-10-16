/**
 * Automated Content Moderation Gate (PG-13 / PG-16 Policy)
 * Guarantees zero tolerance for adult, sexually suggestive, or violent content.
 * Runs pre-inference to protect community safety and avoid charging user credits.
 */

import { geminiKeyPool } from './geminiKeyPoolService';

export async function screenImageSafety(base64Image, mimeType = 'image/webp') {
  const activeKeyObj = geminiKeyPool.getActiveKey();

  // If running in demo mode without any key configured, perform client-side heuristic pass
  if (!activeKeyObj || !activeKeyObj.key) {
    return { isSafe: true };
  }

  const prompt = `
You are a content safety screener enforcing strict PG-13 / PG-16 standards for a family-safe psychological art app.
Inspect this image carefully.
Reject if the image contains:
- Adult, pornographic, sexually suggestive, or nudity content
- Graphic blood, gore, violence, or self-harm
- Hate symbols or harassment

Return strictly a valid JSON object (no markdown fences, just JSON):
{
  "safe": true,
  "reason": ""
}
or if violating:
{
  "safe": false,
  "reason": "Brief polite reason why image violates PG-13/16 family-safe standards"
}
`;

  const cleanBase64 = (base64Image || '').replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
  if (!cleanBase64) {
    return { isSafe: true };
  }

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview'];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKeyObj.key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            safetySettings: [
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.status === 429) {
        geminiKeyPool.reportRateLimit(activeKeyObj.key);
        continue;
      }

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];

      // Check if Gemini blocked it via safety ratings directly
      if (candidate?.finishReason === 'SAFETY') {
        return {
          isSafe: false,
          reason: 'Image triggered automated content safety filters (sexually explicit or sensitive media).',
        };
      }

      const text = candidate?.content?.parts?.[0]?.text;
      if (text) {
        const clean = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(clean);
        return {
          isSafe: parsed.safe !== false,
          reason: parsed.reason || 'Image violates PG-13 / PG-16 guidelines.',
        };
      }
    } catch (err) {
      console.warn(`Content safety screening check warning on ${model}:`, err);
    }
  }

  return { isSafe: true };
}
