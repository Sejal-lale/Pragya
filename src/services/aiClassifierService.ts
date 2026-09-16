import { ComplaintCategory, ComplaintPriority } from '../types';

export interface AIClassificationResult {
  category: ComplaintCategory;
  subCategory: string;
  departmentId: string;
  departmentName: string;
  priority: ComplaintPriority;
  slaHours: number;
  translatedDescription: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Classify unstructured voice transcripts or typed text
 * Uses Google Gemini 2.0 Flash (Free Tier: 15 RPM / 1,500 RPD) if key present,
 * or intelligent Indian civic keywords heuristic fallback with 0 latency.
 */
export async function classifyCivicIssue(
  transcript: string,
  language: 'en' | 'hi' | 'mr' = 'en'
): Promise<AIClassificationResult> {
  const text = transcript.trim();
  if (!text) {
    return {
      category: 'roads',
      subCategory: 'Pothole Repair',
      departmentId: 'roads',
      departmentName: 'Roads & Infrastructure',
      priority: 'high',
      slaHours: 48,
      translatedDescription: 'Civic issue reported',
    };
  }

  // 1. Try Gemini 2.0 Flash Free Tier if API key is provided
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your-gemini')) {
    try {
      const prompt = `
You are the AI classification engine for "Pragya" (Nagpur Municipal Corporation, India).
Analyze this citizen grievance spoken or typed in ${language}:
"${text}"

Return JSON matching this exact structure:
{
  "category": "roads" | "sanitation" | "electrical" | "water" | "drainage" | "other",
  "subCategory": string (e.g. "Pothole Repair", "Garbage Dumpster Clearing", "Streetlight Repair", "Water Pipeline Leak"),
  "departmentId": "roads" | "sanitation" | "electrical" | "water" | "drainage",
  "departmentName": string (e.g. "Roads & Infrastructure", "Sanitation & Solid Waste", "Street Lighting & Electrical", "Water Supply & Drainage"),
  "priority": "low" | "medium" | "high" | "critical",
  "slaHours": number (e.g. 24, 36, 48),
  "translatedDescription": string (clear English summary)
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(jsonText);
          let cat: ComplaintCategory = 'roads';
          if (parsed.category === 'sanitation') cat = 'sanitation';
          else if (parsed.category === 'lighting' || parsed.category === 'electrical') cat = 'lighting';
          else if (parsed.category === 'water') cat = 'water';
          else if (parsed.category === 'infrastructure') cat = 'infrastructure';

          return {
            category: cat,
            subCategory: parsed.subCategory || 'Pothole Repair',
            departmentId: parsed.departmentId || 'roads',
            departmentName: parsed.departmentName || 'Roads & Infrastructure',
            priority: (parsed.priority as ComplaintPriority) || 'high',
            slaHours: Number(parsed.slaHours) || 48,
            translatedDescription: parsed.translatedDescription || text,
          };
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local heuristic:', e);
    }
  }

  // 2. Ultra-fast local multilingual heuristic fallback (Hindi, Marathi, English)
  const lower = text.toLowerCase();

  // Sanitation keywords: कचरा, kachra, kachara, garbage, dustbin, waste, safai, cleanliness
  if (
    lower.includes('kachra') ||
    lower.includes('कचरा') ||
    lower.includes('garbage') ||
    lower.includes('waste') ||
    lower.includes('dustbin') ||
    lower.includes('घाण') ||
    lower.includes('दुर्गंधी') ||
    lower.includes('safai')
  ) {
    return {
      category: 'sanitation',
      subCategory: 'Garbage Dumpster Clearing',
      departmentId: 'sanitation',
      departmentName: 'Sanitation & Solid Waste',
      priority: 'critical',
      slaHours: 24,
      translatedDescription:
        'Overflowing garbage dumpster and accumulated waste in locality causing severe hygiene risk.',
    };
  }

  // Electrical & Streetlight keywords: light, लाइट, दिवा, street light, andhera, dark, wire, pole, करंट
  if (
    lower.includes('light') ||
    lower.includes('लाइट') ||
    lower.includes('दिवा') ||
    lower.includes('andhera') ||
    lower.includes('dark') ||
    lower.includes('bulb') ||
    lower.includes('pole') ||
    lower.includes('wire')
  ) {
    return {
      category: 'lighting',
      subCategory: 'Streetlight Repair',
      departmentId: 'electrical',
      departmentName: 'Street Lighting & Electrical',
      priority: 'medium',
      slaHours: 24,
      translatedDescription:
        'Streetlight malfunctioning or not turning on, causing dark road hazard at night.',
    };
  }

  // Water keywords: paani, पाणी, water, leak, pipeline, pipe, supply, ganda paani, rupture
  if (
    lower.includes('water') ||
    lower.includes('paani') ||
    lower.includes('पानी') ||
    lower.includes('पाणी') ||
    lower.includes('leak') ||
    lower.includes('pipeline') ||
    lower.includes('pipe') ||
    lower.includes('supply')
  ) {
    return {
      category: 'water',
      subCategory: 'Water Pipeline Leak',
      departmentId: 'water',
      departmentName: 'Water Supply & Drainage',
      priority: 'high',
      slaHours: 36,
      translatedDescription:
        'Municipal drinking water pipeline broken or leaking, resulting in water loss and street flooding.',
    };
  }

  // Default: Roads (Potholes, khadda, खड्डा, सड़क, rasta, crater, asphalt)
  return {
    category: 'roads',
    subCategory: 'Pothole Repair',
    departmentId: 'roads',
    departmentName: 'Roads & Infrastructure',
    priority: 'high',
    slaHours: 48,
    translatedDescription:
      'Large crater and road damage causing serious accident risk for commuters and vehicles.',
  };
}
