import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Helper function to upload an image and return its UUID
async function uploadImage(filePath: string, apiKey: string): Promise<string> {
  // Read file from the project's root directory
  const imageBuffer = await fs.readFile(path.join(process.cwd(), filePath));
  const imageBase64 = imageBuffer.toString('base64');
  
  const taskUUID = uuidv4();
  const payload = [{
    taskType: "imageUpload",
    taskUUID: taskUUID,
    image: `data:image/png;base64,${imageBase64}`
  }];

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
    throw new Error(`Failed to upload ${filePath}: ${errorText}`);
  }

  const data = await response.json();
  const imageUUID = data?.data?.[0]?.imageUUID;

  if (!imageUUID) {
    throw new Error(`Could not find imageUUID for ${filePath} in response.`);
  }

  return imageUUID;
}


// This is a GET endpoint. You run it by visiting the URL in your browser.
export async function GET() {
  const apiKey = process.env.RUNWARE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RUNWARE_API_KEY is not set in .env.local" }, { status: 500 });
  }

  try {
    console.log("Attempting to upload assets...");
    const seedImageUUID = await uploadImage('wheel-frame.png', apiKey);
    console.log(`Successfully uploaded seed image: ${seedImageUUID}`);
    
    const maskImageUUID = await uploadImage('wheel-frame-mask.png', apiKey);
    console.log(`Successfully uploaded mask image: ${maskImageUUID}`);

    return NextResponse.json({
      message: "Assets uploaded successfully! Copy these UUIDs into your .env.local file and restart the server.",
      SEED_IMAGE_UUID: seedImageUUID,
      MASK_IMAGE_UUID: maskImageUUID,
    });

  } catch (error: any) {
    console.error("Asset upload failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
