import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Helper function to convert local image to base64 data URI
function imageToDataUri(imagePath: string): string {
  const fullPath = path.join(process.cwd(), imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
  return `data:${mimeType};base64,${base64}`;
}

// Helper function to remove background from an image
async function removeBackground(imageUrl: string, apiKey: string): Promise<string> {
  console.log("--- [Backend Log] Starting background removal ---");
  console.log(`Image URL: ${imageUrl}`);
  console.log("-------------------------------------------------");

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: 'auto',
      format: 'png',
      type: 'auto'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Background removal failed: ${errorText}`);
  }

  // Convert the response to base64
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  
  // For now, we'll return the base64 data URL
  // In a production app, you'd want to upload this to a CDN
  const dataUrl = `data:image/png;base64,${base64}`;
  
  console.log("--- [Backend Log] Background removal completed ---");
  return dataUrl;
}

export async function POST(request: Request) {
  // 1. Read API keys from environment variables
  const apiKey = process.env.RUNWARE_API_KEY;
  const backgroundRemoverApiKey = process.env.BACKGROUND_REMOVER_API_KEY;

  if (!apiKey || !backgroundRemoverApiKey) {
    const missing = [!apiKey && "RUNWARE_API_KEY", !backgroundRemoverApiKey && "BACKGROUND_REMOVER_API_KEY"].filter(Boolean).join(', ');
    return NextResponse.json({ error: `Server configuration error: Missing ${missing}` }, { status: 500 });
  }

  try {
    // 2. Convert local images to base64 data URIs
    console.log("--- [Backend Log] Converting local images to data URIs ---");
    const seedImageDataUri = imageToDataUri('wheel-frame.png');
    const maskImageDataUri = imageToDataUri('wheel-frame-mask.png');
    console.log("Seed image size:", Math.round(seedImageDataUri.length / 1024), "KB");
    console.log("Mask image size:", Math.round(maskImageDataUri.length / 1024), "KB");
    console.log("-------------------------------------------------");

    // 3. Get the user-provided prompt and system prompt from the request body
    const { prompt, systemPrompt: customSystemPrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }

    const negativePrompt = "blurry, smudged, text, words, signature, watermark, cartoon, painting, drawing, flat, black background, ugly, deformed";
    const inpaintTaskUUID = uuidv4();

    // Use custom system prompt if provided, otherwise use default
    const systemPrompt = customSystemPrompt || "Create a decorative ring frame in a perfect annulus/donut shape. The frame must be a THIN ring border that wraps around the edge only. The center must be a large, perfect circle that is completely empty and transparent for a spinning wheel. All decorative elements MUST stay within the ring border area - no elements should extend inward toward the center or outward beyond the ring. The ring should be elegant but minimal, acting only as a border decoration. Keep the frame width narrow and uniform.";
    
    // Combine user prompt with system prompt
    const combinedPrompt = `${systemPrompt} ${prompt}`;
    
    console.log("--- [Backend Log] Received prompt from frontend ---");
    console.log("User prompt:", prompt);
    console.log("System prompt:", systemPrompt);
    console.log("Combined prompt:", combinedPrompt);
    console.log("-------------------------------------------------");

    // 4. Construct the payload using the general SDXL model and the strength parameter
    const payload = [{
      taskType: "imageInference",
      taskUUID: inpaintTaskUUID,
      positivePrompt: combinedPrompt,
      negativePrompt,
      seedImage: seedImageDataUri,  // Using base64 data URI instead of UUID
      maskImage: maskImageDataUri,  // Using base64 data URI instead of UUID
      model: "runware:101@1", // Using the general SDXL model
      width: 1024,
      height: 1024,
      strength: 0.9,          // Adding the strength parameter
      steps: 40,
      CFGScale: 7.0
    }];
    
    console.log("--- [Backend Log] Sending request to Runware API ---");
    console.log("Payload preview (base64 images truncated for readability):");
    console.log({
      taskType: payload[0].taskType,
      taskUUID: payload[0].taskUUID,
      model: payload[0].model,
      width: payload[0].width,
      height: payload[0].height,
      strength: payload[0].strength,
      steps: payload[0].steps,
      seedImage: `[base64 data URI, ${Math.round(seedImageDataUri.length / 1024)}KB]`,
      maskImage: `[base64 data URI, ${Math.round(maskImageDataUri.length / 1024)}KB]`,
      positivePrompt: payload[0].positivePrompt.substring(0, 100) + '...'
    });
    console.log("------------------------------------------------------");

    // 5. Call the Runware API
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Runware API Error: ${errorText}`);
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.imageURL;

    if (!imageUrl) {
      throw new Error("Image URL not found in Runware API response.");
    }

    console.log("--- [Backend Log] Generated image URL from Runware ---");
    console.log(imageUrl);
    console.log("------------------------------------------------------");

    // 6. Remove background from the generated image
    const imageWithRemovedBackground = await removeBackground(imageUrl, backgroundRemoverApiKey);

    // 7. Return the image with removed background to the frontend
    return NextResponse.json({ imageUrl: imageWithRemovedBackground });

  } catch (error: any) {
    console.error('--- FATAL ERROR in API Route ---', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
