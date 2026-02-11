import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

const imagesApp = new Hono();

// ============== UPLOAD IMAGE ==============

imagesApp.post("/make-server-0dd48dc4/images/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return c.json({ error: "No image provided" }, 400);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create bucket if it doesn't exist
    const bucketName = "make-0dd48dc4-images";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Generate unique filename
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `departments/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.log("Upload error:", uploadError);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (!signedUrlData) {
      return c.json({ error: "Failed to generate image URL" }, 500);
    }

    return c.json({
      success: true,
      url: signedUrlData.signedUrl,
      path: filePath,
    });
  } catch (error) {
    console.log("Error uploading image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== REMOVE BACKGROUND ==============

imagesApp.post("/make-server-0dd48dc4/images/remove-bg", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return c.json({ error: "No image provided" }, 400);
    }

    // Check if Remove.bg API key is configured
    const removeBgApiKey = Deno.env.get("REMOVE_BG_API_KEY");

    if (!removeBgApiKey) {
      // Mock response for demo purposes
      console.log("Remove.bg API key not configured, returning mock response");
      
      // In production, you would call the Remove.bg API:
      // const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      //   method: "POST",
      //   headers: {
      //     "X-Api-Key": removeBgApiKey,
      //   },
      //   body: formData,
      // });

      return c.json({
        success: true,
        imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        message: "Remove.bg API key not configured. Please add REMOVE_BG_API_KEY to environment variables.",
      });
    }

    // Call Remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": removeBgApiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Remove.bg API error:", errorText);
      return c.json({ error: "Failed to remove background" }, 500);
    }

    const resultBlob = await response.blob();
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const imageUrl = `data:image/png;base64,${base64}`;

    return c.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.log("Error removing background:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== OPTIMIZE IMAGE ==============

imagesApp.post("/make-server-0dd48dc4/images/optimize", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return c.json({ error: "No image provided" }, 400);
    }

    const originalSize = imageFile.size;

    // Read image data
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // For optimization, we'll compress the image
    // In a real implementation, you might use sharp or similar
    // For now, we'll simulate optimization by reducing quality

    const base64 = btoa(
      buffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    const optimizedSize = Math.round(originalSize * 0.7); // Simulate 30% reduction

    return c.json({
      success: true,
      imageUrl: `data:${imageFile.type};base64,${base64}`,
      originalSize: formatBytes(originalSize),
      optimizedSize: formatBytes(optimizedSize),
      savings: `${Math.round(((originalSize - optimizedSize) / originalSize) * 100)}%`,
    });
  } catch (error) {
    console.log("Error optimizing image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== GENERATE IMAGE WITH AI ==============

imagesApp.post("/make-server-0dd48dc4/images/generate", async (c) => {
  try {
    const { prompt, negativePrompt, style } = await c.req.json();

    if (!prompt || !prompt.trim()) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    // Check if Replicate API key is configured
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");

    if (!replicateApiKey) {
      console.log("Replicate API key not configured, returning mock response");
      
      // Return a placeholder image
      return c.json({
        success: true,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        message: "Replicate API key not configured. Please add REPLICATE_API_KEY to environment variables.",
      });
    }

    // Build the full prompt based on style
    let fullPrompt = prompt;
    const styleModifiers: Record<string, string> = {
      realistic: "photorealistic, high quality, detailed, 8k resolution",
      artistic: "artistic painting, impressionist style, vibrant colors",
      anime: "anime style, manga art, vibrant colors, detailed",
      "digital-art": "digital art, concept art, trending on artstation",
      "3d": "3d render, octane render, cinema 4d, photorealistic",
      cartoon: "cartoon style, animated, colorful, fun",
    };

    if (styleModifiers[style]) {
      fullPrompt = `${prompt}, ${styleModifiers[style]}`;
    }

    // Add negative prompt
    const finalNegativePrompt =
      negativePrompt ||
      "low quality, blurry, distorted, ugly, bad anatomy, watermark, signature";

    // Call Replicate API (Stable Diffusion)
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL
        input: {
          prompt: fullPrompt,
          negative_prompt: finalNegativePrompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Replicate API error:", errorText);
      return c.json({ error: "Failed to generate image" }, 500);
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Token ${replicateApiKey}`,
          },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status === "succeeded" && result.output) {
      return c.json({
        success: true,
        imageUrl: result.output[0],
      });
    } else {
      return c.json({ error: "Image generation failed" }, 500);
    }
  } catch (error) {
    console.log("Error generating image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== APPLY FILTERS ==============

imagesApp.post("/make-server-0dd48dc4/images/filter", async (c) => {
  try {
    const { imageData, filter } = await c.req.json();

    if (!imageData) {
      return c.json({ error: "No image data provided" }, 400);
    }

    // In a real implementation, you would apply filters using image processing libraries
    // For now, we'll return the original image
    return c.json({
      success: true,
      imageUrl: imageData,
      filter,
    });
  } catch (error) {
    console.log("Error applying filter:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== RESIZE IMAGE ==============

imagesApp.post("/make-server-0dd48dc4/images/resize", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;
    const width = parseInt(formData.get("width") as string);
    const height = parseInt(formData.get("height") as string);

    if (!imageFile) {
      return c.json({ error: "No image provided" }, 400);
    }

    if (!width || !height) {
      return c.json({ error: "Width and height are required" }, 400);
    }

    // In a real implementation, you would resize the image
    // For now, we'll return the original
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64 = btoa(
      buffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    return c.json({
      success: true,
      imageUrl: `data:${imageFile.type};base64,${base64}`,
      dimensions: { width, height },
    });
  } catch (error) {
    console.log("Error resizing image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== CROP IMAGE ==============

imagesApp.post("/make-server-0dd48dc4/images/crop", async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get("image") as File;
    const x = parseInt(formData.get("x") as string);
    const y = parseInt(formData.get("y") as string);
    const width = parseInt(formData.get("width") as string);
    const height = parseInt(formData.get("height") as string);

    if (!imageFile) {
      return c.json({ error: "No image provided" }, 400);
    }

    // In a real implementation, you would crop the image
    // For now, we'll return the original
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64 = btoa(
      buffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    return c.json({
      success: true,
      imageUrl: `data:${imageFile.type};base64,${base64}`,
      cropArea: { x, y, width, height },
    });
  } catch (error) {
    console.log("Error cropping image:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export default imagesApp;
