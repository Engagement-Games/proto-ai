import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log('Analyzing website with Gemini:', url);
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    // Use Gemini 2.0 Flash for fast, accurate analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a web design expert with access to current information about websites and brands. Analyze the website at ${url}

Provide ACCURATE brand-specific information in JSON format:

1. primaryColor: The PRIMARY brand color (hex code with #) - the most distinctive color that defines this brand's identity.
   - For navigation/headers: What color dominates? (e.g., navy, white, black, yellow)
   - For CTAs/buttons: What color are the main action buttons?
   - For accents: What unique color stands out?
   - DO NOT default to red/blue - research the ACTUAL brand colors
   - Examples of what to look for:
     * Allen Solly → Navy blue header with yellow accents
     * Diesel → Bold red CTAs and header
     * Apple → White/silver minimalist
     * Spotify → Green brand color
   - Choose the MOST DISTINCTIVE color for this specific brand

2. description: A 2-3 sentence description of what this website/company does.

3. socialMedia: Array of ACTUAL social media accounts for this brand.
   Format: [{"platform": "Instagram", "url": "https://instagram.com/brandname"}]

4. competitors: Array of 3-5 direct competitor brands in the same industry.

5. smartPrompt: A creative frame generation prompt (2-3 sentences) matching this brand's visual identity.

IMPORTANT:
- Every brand has DIFFERENT colors - don't assume!
- If the brand uses navy/dark blue → return that
- If the brand uses yellow accents → consider that
- If the brand uses unique colors → capture those
- Research what THIS specific brand is known for

Return ONLY valid JSON, no markdown:
{
  "primaryColor": "#123456",
  "description": "...",
  "socialMedia": [{"platform": "Instagram", "url": "..."}],
  "competitors": ["..."],
  "smartPrompt": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response received:', text.substring(0, 150) + '...');

    // Parse the JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(cleanedText);
      }
      
      // Validate required fields
      if (!analysisData.primaryColor || !analysisData.description || !analysisData.smartPrompt) {
        throw new Error('Missing required fields in response');
      }
      
      // Ensure arrays exist
      analysisData.socialMedia = analysisData.socialMedia || [];
      analysisData.competitors = analysisData.competitors || [];
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      console.error('Parse error:', parseError);
      
      // Return default data if parsing fails
      analysisData = {
        primaryColor: '#3B82F6',
        description: 'Unable to analyze website automatically. Please try again or enter details manually.',
        socialMedia: [],
        competitors: [],
        smartPrompt: 'A modern, elegant frame with clean lines and professional styling that complements any website design.'
      };
    }

    console.log('Analysis complete:', analysisData);

    return NextResponse.json({
      success: true,
      data: analysisData,
      provider: 'Google Gemini (gemini-2.0-flash)'
    });

  } catch (error: any) {
    console.error('Error analyzing website with Gemini:', error);
    
    // Return mock data as fallback
    const mockData = {
      primaryColor: '#0071E3',
      description: 'A technology company website showcasing innovative products and services. The design features clean lines, modern aesthetics, and premium quality.',
      socialMedia: [
        { platform: 'Twitter', url: 'https://twitter.com' },
        { platform: 'Facebook', url: 'https://facebook.com' },
        { platform: 'Instagram', url: 'https://instagram.com' }
      ],
      competitors: ['Microsoft', 'Google', 'Samsung', 'Amazon'],
      smartPrompt: 'A sleek, modern frame with minimalist design elements featuring clean geometric lines and premium materials. The frame combines brushed metal accents with subtle lighting effects, creating a sophisticated and tech-forward aesthetic that embodies innovation and elegance.'
    };
    
    console.log('Returning mock data due to error:', error.message);
    return NextResponse.json({
      success: true,
      data: mockData,
      note: `Mock data - Gemini API error: ${error.message}`,
      provider: 'Mock (Fallback)'
    });
  }
}
