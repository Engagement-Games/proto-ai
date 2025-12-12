'use client';

import Wheel from '@/components/Wheel';
import { CSSProperties, useEffect, useState, useRef } from 'react';

// The fixed styles for the wheel remain unchanged
const wheelStyle: CSSProperties = {
  position: 'absolute',
  width: '47.85%', 
  height: '47.85%',
  top: '41.02%',
  left: '50.00%',
  transform: 'translate(-50%, -50%)',
};

// ==========================================================
// ==> THE ORIGINAL, DETAILED PROMPTS HAVE BEEN RESTORED HERE <==
// ==========================================================
function getPromptForTheme(theme: string): string {
  switch (theme.toLowerCase()) {
    case 'luxury':
      return "An ornate, luxurious, highly detailed, photorealistic golden frame with intricate baroque patterns and elegant filigree details, embedded with sparkling diamonds.";
    case 'christmas':
      return "A festive Christmas-themed frame, decorated with green holly, red ribbons, and warm twinkling lights, photorealistic, highly detailed.";
    case 'steampunk':
      return "A steampunk-themed frame made of brass, copper, and bronze, with visible intricate gears, cogs, and pipes, highly detailed, photorealistic.";
    
    // Organic and Naturalistic
    case 'carved-wood':
      return "A frame made of a dark, exotic hardwood, intricately carved with flowing, interweaving branches, vines, and leaves. Incorporate smaller details like carved insects, tangled roots, or delicate blossoms.";
    case 'moss-stone':
      return "A frame that appears to be carved from ancient stone, with seams and crevices filled with hyper-realistic, lush green moss and multi-colored lichens.";
    case 'crystalline-geode':
      return "A geode split in half to create a frame, with a rough outer crust and a sparkling interior of realistic crystalline clusters. Small, naturally occurring metallic veins can run through the stone.";
    
    // Mythical and Fantastical
    case 'dragon-scale':
      return "The frame is forged from what appears to be ancient dragon hide, with each scale meticulously detailed and shimmering. The corners feature ornate, twisted horns carved to look like polished ivory or obsidian.";
    case 'elven-wood':
      return "A frame made of a light, flowing wood, like willow, that is enchanted. Intricate, leaf-like patterns are carved into the wood and softly pulse with a gentle, inner light.";
    case 'obsidian-runes':
      return "A frame of polished black obsidian, etched with glowing silver runes along its edges. The runes are filled with a liquid silver that appears to move slowly within the channels.";
    
    // Cyberpunk and Futuristic
    case 'neon-holographic':
      return "A frame made of a seamless, matte black material, from which a vibrant, glowing holographic pattern emerges. The lines can shift and change, creating an illusion of depth and movement.";
    case 'circuit-board':
      return "A frame designed to look like a hyper-realistic, complex circuit board. Exposed and glowing fiber optic cables, intricate pathways, and miniature, humming processors are all visible beneath a transparent resin coating.";
    case 'glitch-art':
      return "The frame is composed of fractured and distorted digital graphics. Lines of colorful, flowing code and static interrupt the seamless structure, giving it a chaotic, technological aesthetic.";
    
    // Biopunk
    case 'bio-luminescent':
      return "A frame that looks like it's grown in a dark, humid cave. A tangled network of vein-like filaments glows with an otherworldly light, and clusters of vibrant, realistic fungi grow from the corners.";
    case 'engineered-flora':
      return "A frame made of translucent, living material. Inside, genetically engineered plants with brightly colored and complex vascular systems are visible, with small, pulsating organs that give off a soft light.";
    
    // Art Deco
    case 'art-deco-sunburst':
      return "A frame featuring a stylized sunburst pattern radiating from the center, made of alternating panels of polished ebony and inlaid mother-of-pearl.";
    case 'art-deco-lacquer':
      return "A simple, geometric frame with a high-gloss black lacquer finish. The edges are adorned with crisp, clean gold-leaf lines and geometric patterns.";
    
    default:
      return "A simple, elegant, photorealistic wooden frame.";
  }
}

export default function Home() {
  const [inputValue, setInputValue] = useState('4');
  const [segments, setSegments] = useState(4);
  const [selectedTheme, setSelectedTheme] = useState('luxury');
  const [frameImageUrl, setFrameImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGameLaunched, setIsGameLaunched] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('https://www.google.com');

  // New state to hold the editable prompt
  const [prompt, setPrompt] = useState(getPromptForTheme('luxury'));
  
  // System prompt state
  const [systemPrompt, setSystemPrompt] = useState("Create a decorative ring frame in a perfect annulus/donut shape. The frame must be a THIN ring border that wraps around the edge only. The center must be a large, perfect circle that is completely empty and transparent for a spinning wheel. All decorative elements MUST stay within the ring border area - no elements should extend inward toward the center or outward beyond the ring. The ring should be elegant but minimal, acting only as a border decoration. Keep the frame width narrow and uniform.");
  
  // Image editing state
  const [imageScale, setImageScale] = useState(100); // Scale percentage
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 }); // Position offset in pixels
  const [imageStretch, setImageStretch] = useState({ width: 100, height: 100 }); // Stretch percentage
  const [frameOnTop, setFrameOnTop] = useState(true); // Toggle frame/wheel z-index layering
  
  // Interactive editing state
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'scale-tl' | 'scale-tr' | 'scale-bl' | 'scale-br' | 'stretch-t' | 'stretch-r' | 'stretch-b' | 'stretch-l' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState({ scale: 100, position: { x: 0, y: 0 }, stretch: { width: 100, height: 100 } });
  const [isOptionKeyPressed, setIsOptionKeyPressed] = useState(false);
  
  // Undo/Redo history
  type HistoryState = {
    scale: number;
    position: { x: number; y: number };
    stretch: { width: number; height: number };
  };
  const [history, setHistory] = useState<HistoryState[]>([{ scale: 100, position: { x: 0, y: 0 }, stretch: { width: 100, height: 100 } }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Website intelligence state
  type WebsiteData = {
    primaryColor: string;
    description: string;
    socialMedia: { platform: string; url: string }[];
    competitors: string[];
    smartPrompt: string;
  };
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [useScreenshot, setUseScreenshot] = useState(true);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'about'>('settings');

  // useEffect to update the prompt textarea when the theme dropdown changes
  useEffect(() => {
    if (selectedTheme === 'smart') {
      setPrompt(websiteData?.smartPrompt || 'Please analyze the website first to generate a smart prompt.');
    } else {
    setPrompt(getPromptForTheme(selectedTheme));
    }
  }, [selectedTheme, websiteData]);

  // useEffect to detect iframe loading failures (CSP/X-Frame-Options blocks)
  useEffect(() => {
    if (!websiteUrl || useScreenshot) return;

    // Reset error state when URL changes
    setIframeError(false);
    setScreenshotLoaded(false);
    setScreenshotError(false);
    
    // Set a timeout to check if iframe loaded successfully
    const timeoutId = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        // Try to access iframe's contentWindow - will throw error if blocked by CSP
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.log('Iframe blocked by CSP/X-Frame-Options, switching to screenshot');
          setIframeError(true);
          setUseScreenshot(true);
        }
      } catch (error) {
        // CSP/X-Frame-Options block detected
        console.log('Iframe blocked by security policy, switching to screenshot');
        setIframeError(true);
        setUseScreenshot(true);
      }
    }, 3000); // Wait 3 seconds for iframe to load

    return () => clearTimeout(timeoutId);
  }, [websiteUrl, useScreenshot]);
  
  // useEffect to restore saved game configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('wheelGame');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.segments) setSegments(config.segments);
        if (config.prompt) setPrompt(config.prompt);
        if (config.systemPrompt) setSystemPrompt(config.systemPrompt);
        if (config.selectedTheme) setSelectedTheme(config.selectedTheme);
        if (config.frameImageUrl) setFrameImageUrl(config.frameImageUrl);
        if (config.websiteUrl) setWebsiteUrl(config.websiteUrl);
        if (config.imageScale !== undefined) setImageScale(config.imageScale);
        if (config.imagePosition) setImagePosition(config.imagePosition);
        if (config.imageStretch) setImageStretch(config.imageStretch);
        if (config.frameOnTop !== undefined) setFrameOnTop(config.frameOnTop);
        if (config.websiteData) setWebsiteData(config.websiteData);
      } catch (e) {
        console.error('Failed to restore game configuration:', e);
      }
    }
  }, []);
  
  // useEffect to track Option/Alt key for symmetric transformations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.altKey) {
        setIsOptionKeyPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || !e.altKey) {
        setIsOptionKeyPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // useEffect to handle global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
      // Save to history when drag ends
      saveToHistory();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, dragStart, initialState, isOptionKeyPressed, imageScale, imagePosition, imageStretch]);
  
  // useEffect to handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z or Ctrl+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd+Shift+Z or Ctrl+Shift+Z or Ctrl+Y for redo
      if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Save current state to history
  const saveToHistory = () => {
    const currentState: HistoryState = {
      scale: imageScale,
      position: { ...imagePosition },
      stretch: { ...imageStretch },
    };
    
    // Check if state actually changed
    const lastState = history[historyIndex];
    if (
      lastState.scale === currentState.scale &&
      lastState.position.x === currentState.position.x &&
      lastState.position.y === currentState.position.y &&
      lastState.stretch.width === currentState.stretch.width &&
      lastState.stretch.height === currentState.stretch.height
    ) {
      return; // No change, don't save
    }
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };
  
  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setImageScale(state.scale);
      setImagePosition(state.position);
      setImageStretch(state.stretch);
      setHistoryIndex(newIndex);
    }
  };
  
  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setImageScale(state.scale);
      setImagePosition(state.position);
      setImageStretch(state.stretch);
      setHistoryIndex(newIndex);
    }
  };

  // Handle drag operations
  const handleDrag = (clientX: number, clientY: number) => {
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    if (dragType === 'move') {
      // Move the image
      setImagePosition({
        x: initialState.position.x + deltaX,
        y: initialState.position.y + deltaY,
      });
    } else if (dragType?.startsWith('scale-')) {
      // Scale from corner - the dragged corner moves, opposite corner stays fixed
      const corner = dragType.split('-')[1]; // tl, tr, bl, br
      
      // Calculate scale change based on drag direction
      let scaleChangeX = 0;
      let scaleChangeY = 0;
      
      if (corner.includes('r')) {
        scaleChangeX = deltaX * 0.25; // Right corners: positive deltaX increases scale
      } else {
        scaleChangeX = -deltaX * 0.25; // Left corners: negative deltaX increases scale
      }
      
      if (corner.includes('b')) {
        scaleChangeY = deltaY * 0.25; // Bottom corners: positive deltaY increases scale
      } else {
        scaleChangeY = -deltaY * 0.25; // Top corners: negative deltaY increases scale
      }
      
      // Use average of X and Y for uniform scaling
      const scaleChange = (scaleChangeX + scaleChangeY) / 2;
      const newScale = Math.max(50, Math.min(200, initialState.scale + scaleChange));
      
      setImageScale(newScale);
      
      if (!isOptionKeyPressed) {
        // Move image to keep opposite corner fixed (dragged corner moves)
        const scaleDiff = (newScale - initialState.scale) / 100;
        // Move in the direction of the corner being dragged
        const offsetX = corner.includes('r') ? scaleDiff * 200 : -scaleDiff * 200;
        const offsetY = corner.includes('b') ? scaleDiff * 200 : -scaleDiff * 200;
        setImagePosition({
          x: initialState.position.x + offsetX,
          y: initialState.position.y + offsetY,
        });
      }
    } else if (dragType?.startsWith('stretch-')) {
      // Stretch from edge - only the dragged edge moves
      const edge = dragType.split('-')[1]; // t, r, b, l
      
      if (edge === 't' || edge === 'b') {
        // Vertical stretch
        const stretchChange = (edge === 't' ? -deltaY : deltaY) * 0.2;
        const newHeight = Math.max(50, Math.min(150, initialState.stretch.height + stretchChange));
        
        if (isOptionKeyPressed) {
          // Symmetric stretch: both edges move
          setImageStretch({ ...initialState.stretch, height: newHeight });
        } else {
          // Single edge stretch: keep other edge fixed by adjusting position
          setImageStretch({ ...initialState.stretch, height: newHeight });
          const heightDiff = (newHeight - initialState.stretch.height) / 100;
          const offsetY = edge === 'b' ? heightDiff * 200 : -heightDiff * 200;
          setImagePosition({
            ...imagePosition,
            y: initialState.position.y + offsetY,
          });
        }
      } else {
        // Horizontal stretch
        const stretchChange = (edge === 'l' ? -deltaX : deltaX) * 0.2;
        const newWidth = Math.max(50, Math.min(150, initialState.stretch.width + stretchChange));
        
        if (isOptionKeyPressed) {
          // Symmetric stretch: both edges move
          setImageStretch({ ...initialState.stretch, width: newWidth });
        } else {
          // Single edge stretch: keep other edge fixed by adjusting position
          setImageStretch({ ...initialState.stretch, width: newWidth });
          const widthDiff = (newWidth - initialState.stretch.width) / 100;
          const offsetX = edge === 'r' ? widthDiff * 200 : -widthDiff * 200;
          setImagePosition({
            ...imagePosition,
            x: initialState.position.x + offsetX,
          });
        }
      }
    }
  };
  
  // Handle mouse down on image or handles
  const handleImageMouseDown = (e: React.MouseEvent, type: typeof dragType) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({
      scale: imageScale,
      position: { ...imagePosition },
      stretch: { ...imageStretch },
    });
  };
  
  // Handle image click for selection
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsImageSelected(true);
    }
  };
  
  // Handle clicks outside to deselect
  const handleOutsideClick = () => {
    setIsImageSelected(false);
  };

  const handleGenerateFrame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send both user prompt and system prompt to the API
        body: JSON.stringify({ 
          prompt: prompt,
          systemPrompt: systemPrompt 
        }),
      });
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to generate frame.');
      }
      const result = await response.json();
      setFrameImageUrl(result.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchGame = () => {
    setIsGameLaunched(true);
  };

  const handleCloseGame = () => {
    setIsGameLaunched(false);
    setShowSettings(false);
  };

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      setAnalysisError('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze website');
      }

      setWebsiteData(result.data);
      setAnalysisError(null);
      
      // If Smart theme is selected, update the prompt
      if (selectedTheme === 'smart') {
        setPrompt(result.data.smartPrompt);
      }
    } catch (error: any) {
      console.error('Error analyzing website:', error);
      setAnalysisError(error.message || 'Failed to analyze website');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveGame = () => {
    const gameConfig = {
      segments,
      prompt,
      systemPrompt,
      selectedTheme,
      frameImageUrl,
      websiteUrl,
      imageScale,
      imagePosition,
      imageStretch,
      frameOnTop,
      websiteData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('wheelGame', JSON.stringify(gameConfig));
    alert('Game saved successfully!');
    setShowSettings(false); // Close the settings modal
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    setInputValue(event.target.value); 
    const num = parseInt(event.target.value, 10); 
    if (!isNaN(num) && num >= 2 && num <= 5) setSegments(num); 
  };
  
  const handleInputBlur = () => { 
    let value = parseInt(inputValue, 10); 
    if (isNaN(value) || value < 2) value = 2; 
    else if (value > 5) value = 5; 
    setInputValue(String(value)); 
    setSegments(value); 
  };
  
  // Compute image transform style based on editing state
  const getImageTransformStyle = () => {
    const scaleX = imageStretch.width / 100;
    const scaleY = imageStretch.height / 100;
    return {
      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale / 100}) scaleX(${scaleX}) scaleY(${scaleY})`,
      transformOrigin: 'center center',
      zIndex: frameOnTop ? 20 : 10,
    };
  };
  
  // Get wheel z-index style
  const getWheelZIndex = () => {
    return { zIndex: frameOnTop ? 10 : 20 };
  };
  
  // Render interactive image with selection handles
  const renderInteractiveImage = () => {
    if (!frameImageUrl) return null;
    
    const handleSize = 12;
    const edgeHandleSize = 8;
    
    return (
      <div 
        className="absolute inset-0 select-none"
        style={{ pointerEvents: 'auto', zIndex: frameOnTop ? 20 : 10 }}
      >
        {/* Main image */}
        <img 
          src={frameImageUrl} 
          alt={`${selectedTheme} themed wheel frame`} 
          className={`absolute inset-0 h-full w-full object-contain cursor-move transition-all ${
            isImageSelected ? 'ring-4 ring-blue-600' : ''
          } ${!isImageSelected ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
          style={getImageTransformStyle()}
          onMouseDown={(e) => handleImageMouseDown(e, 'move')}
          onClick={handleImageClick}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
        />
        
        {/* Selection handles */}
        {isImageSelected && (
          <>
            {/* Corner handles for scaling */}
            {/* Top-left */}
            <div
              className="absolute bg-blue-600 border-2 border-white rounded-sm cursor-nwse-resize shadow-lg"
              style={{
                width: handleSize,
                height: handleSize,
                left: `calc(50% + ${imagePosition.x}px - ${handleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${handleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'scale-tl')}
            />
            
            {/* Top-right */}
            <div
              className="absolute bg-blue-600 border-2 border-white rounded-sm cursor-nesw-resize shadow-lg"
              style={{
                width: handleSize,
                height: handleSize,
                left: `calc(50% + ${imagePosition.x}px - ${handleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${handleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'scale-tr')}
            />
            
            {/* Bottom-left */}
            <div
              className="absolute bg-blue-600 border-2 border-white rounded-sm cursor-nesw-resize shadow-lg"
              style={{
                width: handleSize,
                height: handleSize,
                left: `calc(50% + ${imagePosition.x}px - ${handleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${handleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'scale-bl')}
            />
            
            {/* Bottom-right */}
            <div
              className="absolute bg-blue-600 border-2 border-white rounded-sm cursor-nwse-resize shadow-lg"
              style={{
                width: handleSize,
                height: handleSize,
                left: `calc(50% + ${imagePosition.x}px - ${handleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${handleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'scale-br')}
            />
            
            {/* Edge handles for stretching */}
            {/* Top edge */}
            <div
              className="absolute bg-blue-500 border border-white rounded-sm cursor-ns-resize shadow-md"
              style={{
                width: edgeHandleSize * 4,
                height: edgeHandleSize,
                left: `calc(50% + ${imagePosition.x}px - ${edgeHandleSize * 2}px)`,
                top: `calc(50% + ${imagePosition.y}px - ${edgeHandleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'stretch-t')}
            />
            
            {/* Right edge */}
            <div
              className="absolute bg-blue-500 border border-white rounded-sm cursor-ew-resize shadow-md"
              style={{
                width: edgeHandleSize,
                height: edgeHandleSize * 4,
                left: `calc(50% + ${imagePosition.x}px - ${edgeHandleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${edgeHandleSize * 2}px)`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'stretch-r')}
            />
            
            {/* Bottom edge */}
            <div
              className="absolute bg-blue-500 border border-white rounded-sm cursor-ns-resize shadow-md"
              style={{
                width: edgeHandleSize * 4,
                height: edgeHandleSize,
                left: `calc(50% + ${imagePosition.x}px - ${edgeHandleSize * 2}px)`,
                top: `calc(50% + ${imagePosition.y}px - ${edgeHandleSize / 2}px + 200px * ${imageScale / 100} * ${imageStretch.height / 100})`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'stretch-b')}
            />
            
            {/* Left edge */}
            <div
              className="absolute bg-blue-500 border border-white rounded-sm cursor-ew-resize shadow-md"
              style={{
                width: edgeHandleSize,
                height: edgeHandleSize * 4,
                left: `calc(50% + ${imagePosition.x}px - ${edgeHandleSize / 2}px - 200px * ${imageScale / 100} * ${imageStretch.width / 100})`,
                top: `calc(50% + ${imagePosition.y}px - ${edgeHandleSize * 2}px)`,
                zIndex: frameOnTop ? 30 : 30,
              }}
              onMouseDown={(e) => handleImageMouseDown(e, 'stretch-l')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Settings */}
      <div className="w-1/3 min-w-[400px] max-w-[600px] bg-[#0e0e0e] shadow-2xl overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-[white]">AI Game Generation</h1>
          
          {!isGameLaunched ? (
            // Show only launch button when game is not launched
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <button
                onClick={handleLaunchGame}
                className=" text-white px-8 py-4 rounded-lg font-semibold bg-[#1e52f1] transition-all transform hover:scale-105 shadow-lg text-xl"
              >
                🎮 Launch Game
              </button>
            </div>
          ) : (
            // Show all settings when game is launched
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-2 px-4 font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'border-b-2 border-blue-500 text-[white]'
                      : 'text-[#a1a1a5] hover:[white]'
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 py-2 px-4 font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'border-b-2 border-blue-500 text-[white]'
                      : 'text-[#a1a1a5] hover:[white]'
                  }`}
                >
                  About
                </button>
              </div>

              {activeTab === 'settings' ? (
                <>
              {/* Website URL Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Website URL (for iframe)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleAnalyzeWebsite}
                    disabled={isAnalyzing}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze'}
                  </button>
                </div>
                {analysisError && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-600 text-sm">
                    {analysisError}
                  </div>
                )}
                {websiteData && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Analysis Results</h4>
                      <button
                        onClick={handleAnalyzeWebsite}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Re-analyze
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Primary Color:</span>
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: websiteData.primaryColor }}
                        />
                        <span className="text-gray-600">{websiteData.primaryColor}</span>
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600 mt-1">{websiteData.description}</p>
                      </div>
                      {websiteData.socialMedia.length > 0 && (
                        <div>
                          <span className="font-medium">Social Media:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {websiteData.socialMedia.map((social, idx) => (
                              <a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                {social.platform}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {websiteData.competitors.length > 0 && (
                        <div>
                          <span className="font-medium">Competitors:</span>
                          <p className="text-gray-600 mt-1">{websiteData.competitors.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Segments Control */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Segments (2-5): {segments}
                </label>
                <input
                  type="number"
                  min="2"
                  max="5"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-24 p-2 text-center border border-gray-300 rounded-md"
                />
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Frame Theme</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <optgroup label="Classic">
                    <option value="luxury">Luxury</option>
                    <option value="christmas">Christmas</option>
                    <option value="steampunk">Steampunk</option>
                  </optgroup>
                  
                  <optgroup label="Organic & Naturalistic">
                    <option value="carved-wood">Intricate Carved Wood</option>
                    <option value="moss-stone">Moss & Lichen Stone</option>
                    <option value="crystalline-geode">Crystalline Geodes</option>
                  </optgroup>
                  
                  <optgroup label="Mythical & Fantastical">
                    <option value="dragon-scale">Dragon Scale & Horn</option>
                    <option value="elven-wood">Elven Glowing Wood</option>
                    <option value="obsidian-runes">Obsidian & Silver Runes</option>
                  </optgroup>
                  
                  <optgroup label="Cyberpunk & Futuristic">
                    <option value="neon-holographic">Neon Holographic Lattice</option>
                    <option value="circuit-board">Integrated Circuit Board</option>
                    <option value="glitch-art">Glitch-art with Data Streams</option>
                  </optgroup>
                  
                  <optgroup label="Biopunk">
                    <option value="bio-luminescent">Bio-luminescent Fungi</option>
                    <option value="engineered-flora">Genetically Engineered Flora</option>
                  </optgroup>
                  
                  <optgroup label="Art Deco">
                    <option value="art-deco-sunburst">Sunbursts & Exotic Wood</option>
                    <option value="art-deco-lacquer">Black Lacquer & Gold Leaf</option>
                  </optgroup>
                  
                  <optgroup label="AI-Powered">
                    <option value="smart">Smart (AI-Generated)</option>
                  </optgroup>
                </select>
                {selectedTheme === 'smart' && !websiteData && (
                  <p className="text-xs text-amber-600 mt-2">
                    ℹ️ Please analyze the website first to generate a smart prompt
                  </p>
                )}
        </div>

              {/* Prompt Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Prompt (Editable)
                </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md resize-y"
                />
              </div>

              {/* System Prompt Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  System Prompt (Editable)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md resize-y"
                  placeholder="Enter system prompt for AI guardrails..."
            />
          </div>

              {/* Image Editing Controls */}
              {frameImageUrl && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Image Editing</h3>
                    
                    {/* Undo/Redo Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="px-3 py-1 text-sm font-medium text-white bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Undo (Cmd/Ctrl+Z)"
                      >
                        ↶ Undo
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="px-3 py-1 text-sm font-medium text-white bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Redo (Cmd/Ctrl+Shift+Z)"
                      >
                        ↷ Redo
                      </button>
                    </div>
                  </div>
                  
                  {/* Layer Order Toggle */}
                  <div className="mb-4 p-3 bg-white rounded-md border border-blue-300">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-white">
                        Frame Layer
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${!frameOnTop ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                          Behind
                        </span>
                        <div className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            checked={frameOnTop}
                            onChange={(e) => setFrameOnTop(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                        <span className={`text-xs ${frameOnTop ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                          On Top
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {frameOnTop ? 'Frame is above the wheel (default)' : 'Wheel is above the frame'}
                    </p>
                  </div>
                  
                  {/* Scale Control */}
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Scale: {imageScale}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      onMouseUp={saveToHistory}
                      onTouchEnd={saveToHistory}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Position Controls */}
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">X: {imagePosition.x}px</label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={imagePosition.x}
                          onChange={(e) => setImagePosition({...imagePosition, x: Number(e.target.value)})}
                          onMouseUp={saveToHistory}
                          onTouchEnd={saveToHistory}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Y: {imagePosition.y}px</label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={imagePosition.y}
                          onChange={(e) => setImagePosition({...imagePosition, y: Number(e.target.value)})}
                          onMouseUp={saveToHistory}
                          onTouchEnd={saveToHistory}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stretch Controls */}
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Stretch / Fit
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Width: {imageStretch.width}%</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageStretch.width}
                          onChange={(e) => setImageStretch({...imageStretch, width: Number(e.target.value)})}
                          onMouseUp={saveToHistory}
                          onTouchEnd={saveToHistory}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Height: {imageStretch.height}%</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageStretch.height}
                          onChange={(e) => setImageStretch({...imageStretch, height: Number(e.target.value)})}
                          onMouseUp={saveToHistory}
                          onTouchEnd={saveToHistory}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setImageScale(100);
                      setImagePosition({ x: 0, y: 0 });
                      setImageStretch({ width: 100, height: 100 });
                      setFrameOnTop(true);
                    }}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Reset All Edits
                  </button>
                </div>
              )}

              {/* Generate Frame Button */}
              <button
                onClick={handleGenerateFrame}
                disabled={isLoading}
                className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Frame'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveGame}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all mt-6"
              >
                💾 Save Game
              </button>
                  <button
                onClick={handleCloseGame}
                className="w-full mt-6 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                ✕ Close Game
              </button>
                </>
              ) : (
                /* About Tab */
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">About This Website</h2>
                  
                  {websiteData ? (
                    <div className="space-y-6">
                      {/* Primary Color */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Primary Brand Color</h3>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: websiteData.primaryColor }}
                          />
                          <span className="text-lg font-mono text-white">{websiteData.primaryColor}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{websiteData.description}</p>
                      </div>

                      {/* Social Media Links */}
                      {websiteData.socialMedia.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-800 mb-3">Social Media</h3>
                          <div className="flex flex-wrap gap-3">
                            {websiteData.socialMedia.map((social, idx) => (
                              <a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <span className="font-medium text-gray-800">{social.platform}</span>
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Competitors */}
                      {websiteData.competitors.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-800 mb-3">Industry Competitors</h3>
                          <div className="flex flex-wrap gap-2">
                            {websiteData.competitors.map((competitor, idx) => (
                              <span
                                key={idx}
                                className="bg-white px-3 py-1 rounded-full border border-gray-300 text-white text-sm"
                              >
                                {competitor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Smart Frame Prompt */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-2">AI-Generated Frame Prompt</h3>
                        <p className="text-gray-700 leading-relaxed italic">{websiteData.smartPrompt}</p>
                        <p className="text-xs text-purple-600 mt-2">
                          💡 Select "Smart (AI-Generated)" theme to use this prompt
                        </p>
                      </div>

                      {/* Re-analyze Button */}
                      <button
                        onClick={handleAnalyzeWebsite}
                        disabled={isAnalyzing}
                        className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-all disabled:bg-gray-400"
                      >
                        {isAnalyzing ? '⏳ Re-analyzing...' : '🔄 Re-analyze Website'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Website Data Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Enter a website URL in the Settings tab and click "Analyze" to get insights about the website.
                      </p>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Go to Settings
                      </button>
                    </div>
                  )}
                </div>
              )}
                        

            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Iframe & Game */}
      <div className="flex-1 relative">
        {/* Website Iframe or Screenshot */}
        {useScreenshot || iframeError ? (
          <div className="w-full h-full overflow-auto relative">
            {!screenshotError && (
              <img
                src={`/beamlabs.png`}
                alt="Website Screenshot"
              />
            )}
            
            {screenshotError && (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-6xl">🚫</div>
                <p className="text-gray-700 font-medium">Screenshot Service Unavailable</p>
                <p className="text-gray-600 text-sm text-center max-w-md">
                  This website blocks iframe embedding and the screenshot service is currently unavailable.
                  You can still analyze the website and generate frames!
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setScreenshotError(false);
                      setScreenshotLoaded(false);
                      setUseScreenshot(true);
                      setIframeError(false);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    🔄 Try Live Iframe
                  </button>
                  <button
                    onClick={() => {
                      window.open(websiteUrl, '_blank');
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    🌐 Open in New Tab
                  </button>
                </div>
              </div>
            )}
            
            {/* <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => {
                  setScreenshotError(false);
                  setScreenshotLoaded(false);
                  setUseScreenshot(false);
                  setIframeError(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-sm"
              >
                🔄 Try Iframe
              </button>
              <button
                onClick={() => {
                  window.open(websiteUrl, '_blank');
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm"
              >
                🌐 Open
              </button>
            </div> */}
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={websiteUrl}
              className="w-full h-full border-0"
              title="Website Preview"
              onLoad={() => {
                // Iframe loaded successfully - clear any error state
                console.log('Iframe loaded successfully');
              }}
            />
            {iframeError && !useScreenshot && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setUseScreenshot(true)}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-amber-600 transition-colors text-sm"
                >
                  📸 Use Screenshot Instead
                </button>
              </div>
            )}
          </>
        )}

        {/* Game Overlay */}
        {isGameLaunched && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={handleOutsideClick}>
          {/* Game Container */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={handleCloseGame}
              className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-60"
            >
              ×
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="absolute -top-4 -right-16 bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors z-60"
            >
              ⚙️
            </button>

            {/* Game Wheel - Maintain exact same size */}
            <div className="relative w-[400px] h-[400px] mx-auto">
              {isLoading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-lg font-medium text-white">Generating your masterpiece...</div>
                </div>
              )}
          {error && <div className="text-red-500 p-4">{error}</div>}
          
          {frameImageUrl ? (
            <>
                  {renderInteractiveImage()}
                  <div style={{...wheelStyle, ...getWheelZIndex()}}>
                 <Wheel key={segments} numSegments={segments} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-3/4">
                <Wheel key={segments} numSegments={segments} />
              </div>
            </div>
          )}
            </div>        </div>
        </div>
        )}
      </div>
    </div>
  );
}
