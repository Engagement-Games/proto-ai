# Screenshot Service Options

## Current Issue
thum.io is triggering onError in browser, causing console errors

## Tested Services

### 1. thum.io (Current)
- URL: `https://image.thum.io/get/width/800/crop/1200/URL`
- Status: ✅ Returns 200 OK
- Issue: May take time to generate, causing browser onError

### 2. Alternative: screenshotapi.net
- URL: `https://shot.screenshotapi.net/screenshot?url=URL&width=800&height=1200`
- Free tier: 100 screenshots/month

### 3. Alternative: api.screenshotmachine.com
- URL: `https://api.screenshotmachine.com/?key=demo&url=URL&dimension=800x1200`
- Has demo mode

### 4. Alternative: Google PageSpeed Insights API
- More reliable but requires API key

## Current Fix Applied
- Removed console.error that was showing in browser
- Added user-friendly message about screenshot loading
- Hide image if it fails to load (silently)
- Keep retry button to try iframe again

## Recommendation
Keep current thum.io but handle errors gracefully (already implemented)
