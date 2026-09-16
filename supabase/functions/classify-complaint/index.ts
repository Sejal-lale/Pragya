// ====================================================================
// Pragya Civic AI - Supabase Edge Function: classify-complaint
// Uses @supabase/server with auth: ['publishable', 'none']
// Uses 100% Free Tier Google Gemini 2.0 Flash (1,500 RPD / 1M TPM free)
// ====================================================================

import { withSupabase } from 'npm:@supabase/server';

export default {
  fetch: withSupabase({ auth: ['publishable', 'none'] }, async (req, _ctx) => {
    try {
      const { transcript, language } = await req.json();

      if (!transcript || transcript.trim() === '') {
        return Response.json({ error: 'Missing transcript' }, { status: 400 });
      }

      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

      // Fallback if no API key is configured yet
      if (!GEMINI_API_KEY) {
        const lower = transcript.toLowerCase();
        let category = 'roads';
        let subCategory = 'Pothole Repair';
        let deptId = 'roads';
        let deptName = 'Roads & Infrastructure';
        let priority = 'high';
        let slaHours = 48;

        if (lower.includes('kachra') || lower.includes('कचरा') || lower.includes('garbage') || lower.includes('waste')) {
          category = 'sanitation';
          subCategory = 'Garbage Dumpster Clearing';
          deptId = 'sanitation';
          deptName = 'Sanitation & Solid Waste';
          priority = 'critical';
          slaHours = 24;
        } else if (lower.includes('light') || lower.includes('लाइट') || lower.includes('andhera')) {
          category = 'lighting';
          subCategory = 'Streetlight Repair';
          deptId = 'electrical';
          deptName = 'Street Lighting & Electrical';
          priority = 'medium';
          slaHours = 24;
        } else if (lower.includes('water') || lower.includes('paani') || lower.includes('पाणी') || lower.includes('leak')) {
          category = 'water';
          subCategory = 'Water Pipeline Leak';
          deptId = 'water';
          deptName = 'Water Supply & Drainage';
          priority = 'high';
          slaHours = 36;
        }

        return Response.json({
          category,
          subCategory,
          departmentId: deptId,
          departmentName: deptName,
          priority,
          slaHours,
          translatedDescription: transcript,
          source: 'local-heuristic-fallback',
        });
      }

      // Call Google Gemini 2.0 Flash with JSON response schema
      const prompt = `
You are the automated civic categorization engine for "Pragya" (Nagpur Municipal Corporation, India).
Analyze this citizen grievance spoken or typed in ${language || 'Hindi/Marathi/English'}:
"${transcript}"

Extract and classify this into:
- category: one of ["roads", "sanitation", "lighting", "water", "infrastructure"]
- subCategory: specific civic problem name in English (e.g. "Pothole Repair", "Garbage Dumpster Clearing", "Streetlight Repair", "Water Pipeline Leak")
- departmentId: one of ["roads", "sanitation", "electrical", "water"]
- departmentName: official department name in English
- priority: one of ["low", "medium", "high", "critical"]
- slaHours: resolution timeline in hours (24 for sanitation/lights, 48 for potholes, 36 for water leak)
- translatedDescription: clear English translation and summary
`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                category: { type: 'STRING' },
                subCategory: { type: 'STRING' },
                departmentId: { type: 'STRING' },
                departmentName: { type: 'STRING' },
                priority: { type: 'STRING' },
                slaHours: { type: 'INTEGER' },
                translatedDescription: { type: 'STRING' },
              },
              required: [
                'category',
                'subCategory',
                'departmentId',
                'departmentName',
                'priority',
                'slaHours',
                'translatedDescription',
              ],
            },
          },
        }),
      });

      const geminiData = await geminiRes.json();
      const parsedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      const structuredResult = JSON.parse(parsedText || '{}');

      return Response.json(structuredResult);
    } catch (err: any) {
      return Response.json(
        { error: err.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }),
};
