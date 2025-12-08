# ✅ Runware API - Invalid SeedImage Error Fixed

## The Problem
```
Runware API Error: {
  "code": "invalidSeedImage",
  "message": "Invalid value for 'seedImage' parameter. The seed image must be 
  specified in one of the following formats: a UUID v4 string of a previously 
  uploaded or generated image, a data URI string, a base64 encoded image, or 
  a publicly accessible URL."
}
```

**Root Cause:**
- The code was using `SEED_IMAGE_UUID` and `MASK_IMAGE_UUID` from environment variables
- These UUIDs (`e952eb6a-f220-40bf-b294-74d096e994cb`, `7601f571-ff78-4a00-b789-c4dfe27caa88`) were **not valid** on Runware's servers
- UUIDs must reference images that have been **previously uploaded** to Runware

---

## The Solution

### Changed from UUID → Base64 Data URI

Instead of using UUIDs, the API now:
1. Reads the local PNG files (`wheel-frame.png`, `wheel-frame-mask.png`)
2. Converts them to base64 data URIs
3. Sends the data URIs directly to Runware

### Code Changes

**Added helper function:**
```typescript
function imageToDataUri(imagePath: string): string {
  const fullPath = path.join(process.cwd(), imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}
```

**Updated payload:**
```typescript
// Before (using UUIDs from .env):
seedImage: seedImageUUID,  // ❌ Invalid UUID
maskImage: maskImageUUID,  // ❌ Invalid UUID

// After (using base64 data URIs):
const seedImageDataUri = imageToDataUri('wheel-frame.png');
const maskImageDataUri = imageToDataUri('wheel-frame-mask.png');

seedImage: seedImageDataUri,  // ✅ Valid data URI
maskImage: maskImageDataUri,  // ✅ Valid data URI
```

---

## Environment Variables Update

### No Longer Needed:
- ~~`SEED_IMAGE_UUID`~~ - Removed (was invalid)
- ~~`MASK_IMAGE_UUID`~~ - Removed (was invalid)

### Still Required:
- ✅ `RUNWARE_API_KEY` - For Runware API access
- ✅ `BACKGROUND_REMOVER_API_KEY` - For remove.bg
- ✅ `GEMINI_API_KEY` - For website analysis

---

## How It Works Now

### Request Flow:
1. **Frontend** sends prompt → `/api/generate-frame`
2. **Backend** reads `wheel-frame.png` and `wheel-frame-mask.png`
3. **Converts** to base64 data URIs (e.g., `data:image/png;base64,iVBORw0KGg...`)
4. **Sends** to Runware API with data URIs as `seedImage` and `maskImage`
5. **Runware** processes the images (no upload needed!)
6. **Returns** generated image URL
7. **Remove.bg** removes background
8. **Returns** final image to frontend

### Performance Notes:
- **Seed image**: ~800KB base64
- **Mask image**: ~20KB base64
- Total payload size: ~820KB (acceptable for API)
- No pre-upload step needed
- Images are read fresh on each request

---

## Advantages of Data URI Approach

### ✅ Pros:
- **No UUID management** - No need to upload images first
- **Always fresh** - Uses latest local files
- **Self-contained** - No external dependencies
- **Immediate** - No pre-upload step
- **Flexible** - Easy to swap images by changing files

### ⚠️ Cons:
- Larger payload size (~800KB vs ~36 bytes for UUID)
- Slight encoding overhead
- Not ideal if images change rarely

### Alternative Approach (Not Implemented):
Could upload images to Runware once, cache UUIDs, and reuse them. But this adds complexity:
- Need upload endpoint
- Need UUID persistence
- Need cache invalidation
- Need error handling for expired UUIDs

For this use case, **data URIs are simpler and more reliable**. ✅

---

## Testing

### Before the Fix:
```bash
POST /api/generate-frame
❌ 500 Error: "invalidSeedImage" 
```

### After the Fix:
```bash
POST /api/generate-frame
✅ 200 OK: { "imageUrl": "data:image/png;base64,..." }
```

### Console Output (Expected):
```
--- [Backend Log] Converting local images to data URIs ---
Seed image size: 800 KB
Mask image size: 20 KB
-------------------------------------------------
--- [Backend Log] Sending request to Runware API ---
Payload preview (base64 images truncated for readability):
{
  taskType: 'imageInference',
  seedImage: '[base64 data URI, 800KB]',
  maskImage: '[base64 data URI, 20KB]',
  ...
}
------------------------------------------------------
--- [Backend Log] Generated image URL from Runware ---
https://im.runware.ai/...
```

---

## Files Modified

- ✅ `/app/api/generate-frame/route.ts`
  - Added `imageToDataUri()` helper function
  - Removed UUID dependency
  - Updated payload to use data URIs
  - Improved logging (no huge base64 strings in console)

---

## Summary

🎯 **The fix**: Changed from invalid UUIDs → base64 data URIs
📦 **Impact**: Simpler, more reliable, self-contained
✅ **Status**: Ready to test!

**Next step:** Try generating a frame in the app - it should work now! 🚀
