# Quick Start Guide - Website Intelligence Features

## 🚀 Getting Started

Your wheel game now has AI-powered website intelligence! Here's how to use the new features:

### 1. Launch the Application
```bash
# If not running, start the dev server:
pnpm dev

# Open in browser:
# http://localhost:3000
```

### 2. Basic Workflow

#### Step 1: Launch the Game
- Click the **"🎮 Launch Game"** button in the center

#### Step 2: Analyze a Website
- In the **Settings** tab (default view):
  - Enter a website URL (e.g., `https://www.apple.com`)
  - Click **"🔍 Analyze"** button
  - Wait a moment for analysis to complete
  - See results appear in a blue card below

#### Step 3: View Detailed Analysis
- Click the **"About"** tab at the top
- See comprehensive website information:
  - 🎨 Primary brand color with visual swatch
  - 📝 Website description
  - 📱 Social media links (clickable)
  - 🏢 List of competitors
  - ✨ AI-generated frame prompt

#### Step 4: Use Smart Theme
- Go back to **"Settings"** tab
- Find **"Frame Theme"** dropdown
- Select **"Smart (AI-Generated)"** under "AI-Powered"
- The prompt field will auto-fill with the AI-generated prompt
- Click **"Generate Frame"** to create a custom frame

### 3. Screenshot Fallback Feature

If a website refuses to load in the iframe (CORS restrictions):
- The system will automatically switch to screenshot mode
- You'll see a button in the top-right: **"🔄 Try Live Iframe"**
- Click to toggle between live iframe and screenshot

### 4. Iframe Troubleshooting

Some websites block iframe embedding. If you see a blank iframe:
1. Check browser console for CORS errors
2. Click the **"📸 Use Screenshot Instead"** button (if available)
3. Or wait for automatic screenshot fallback

## 🎨 Feature Highlights

### Analysis Results Include:
- **Primary Color**: Extracted brand color for design consistency
- **Description**: AI-generated summary of what the site does
- **Social Media**: Direct links to company social profiles
- **Competitors**: Industry competitors for context
- **Smart Prompt**: Custom frame generation prompt tailored to the website's style

### Persistent Storage:
- All analysis data is saved to localStorage
- Data persists across page refreshes
- Automatically restored when you return

## 🔧 Current Status

### ⚠️ Important Note on Claude API
The Claude API key provided appears to be invalid or expired. The system is currently using **mock data** for demonstrations. This means:
- ✅ All features work perfectly with sample data
- ✅ You can see the full user experience
- ⚠️ Analysis results will be the same for all websites (demo data)

To enable real AI analysis:
1. Get a valid Claude API key from: https://console.anthropic.com/
2. Update `.env.local` with your key
3. Restart the server

### 🆓 Screenshot Service
- Using thum.io free tier (no API key needed)
- Works out of the box
- May have rate limits on heavy usage

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Settings Panel (1/3)    │    Website/Game Panel (2/3) │
│  ┌──────────────────┐    │    ┌───────────────────────┐│
│  │  [Settings|About]│    │    │   Iframe or Screenshot││
│  ├──────────────────┤    │    │                       ││
│  │  Website URL     │    │    │                       ││
│  │  [Analyze]       │    │    │                       ││
│  ├──────────────────┤    │    │                       ││
│  │  Analysis Results│    │    │                       ││
│  ├──────────────────┤    │    │    (Game Overlay)    ││
│  │  Settings...     │    │    │                       ││
│  └──────────────────┘    │    └───────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🎯 Example Usage

### Scenario: Creating a Frame for Apple.com
1. Launch game
2. Enter: `https://www.apple.com`
3. Click Analyze → See blue color (#0071E3) and tech description
4. Go to About tab → See social links, competitors (Microsoft, Google, etc.)
5. Back to Settings → Select "Smart (AI-Generated)" theme
6. Generate Frame → Get a sleek, modern tech-style frame
7. Save Game → Everything is preserved

## 🐛 Troubleshooting

### "Analyze button does nothing"
- Check browser console for errors
- Verify server is running (`pnpm dev`)
- Try refreshing the page

### "Iframe shows blank"
- Normal for many sites (security restrictions)
- Wait for automatic screenshot fallback
- Or manually click "Use Screenshot"

### "Always seeing same analysis results"
- This is expected with mock data fallback
- Get a valid Claude API key for real analysis
- Mock data still demonstrates full functionality

## 📚 More Information

See `IMPLEMENTATION_SUMMARY.md` for:
- Technical architecture
- API documentation
- File structure
- Implementation details
- Future enhancements

---

Enjoy your AI-powered wheel game! 🎡✨
