#!/usr/bin/env python3
"""
Complete restructuring of page.tsx to split-panel layout
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Split into lines for easier manipulation
lines = content.split('\n')

# Find the main return statement
return_line_idx = None
for i, line in enumerate(lines):
    if i > 500 and 'return (' in line and line.strip().startswith('return'):
        return_line_idx = i
        break

if return_line_idx is None:
    print("ERROR: Could not find return statement")
    exit(1)
    
print(f"Found return at line {return_line_idx + 1}")

# Find the settings modal section
modal_start_idx = None
modal_end_idx = None
for i, line in enumerate(lines):
    if '{/* Settings Modal */}' in line:
        modal_start_idx = i
    if modal_start_idx and i > modal_start_idx + 10 and '</div>' in line and i > 980:
        # Look for the end of settings modal (after Save Game button)
        if any('Save Game' in lines[j] for j in range(max(0, i-20), i)):
            modal_end_idx = i + 3  # Include closing tags
            break

print(f"Settings modal: lines {modal_start_idx + 1} to {modal_end_idx + 1}")

# Extract settings content (the actual form fields, not the modal wrapper)
# Find where the actual settings content starts
settings_start = None
for i in range(modal_start_idx, modal_start_idx + 30):
    if 'Website URL' in lines[i]:
        # Back up to find the container div
        for j in range(i, max(modal_start_idx, i-10), -1):
            if '<div' in lines[j] and ('mb-6' in lines[j] or 'className' in lines[j]):
                settings_start = j
                break
        break

# Find where settings content ends (before the Preview panel)
settings_end = None
for i in range(settings_start + 50, modal_end_idx):
    if 'Right Panel' in lines[i] or ('Preview' in lines[i] and 'Panel' in ''.join(lines[max(0,i-2):i+2])):
        # Back up to find the closing div
        for j in range(i, max(settings_start, i-10), -1):
            if '</div>' in lines[j]:
                settings_end = j
                break
        break

if not settings_end:
    # Alternative: find by looking for the preview div opening
    for i in range(settings_start + 50, modal_end_idx):
        if 'w-1/2 p-6 bg-gray-50' in lines[i] or 'Right Panel' in lines[i]:
            settings_end = i - 1
            break

print(f"Settings content: lines {settings_start + 1} to {settings_end + 1}")

# Extract the settings content
settings_content = '\n'.join(lines[settings_start:settings_end])

# Find the game overlay section
game_overlay_start = None
game_overlay_end = None
for i, line in enumerate(lines):
    if '{/* Game Overlay */}' in line:
        game_overlay_start = i
        # Find the end (before Settings Modal)
        for j in range(i + 1, len(lines)):
            if '{/* Settings Modal */}' in lines[j]:
                game_overlay_end = j - 2  # Before the closing div
                break
        break

if game_overlay_start is None:
    print("ERROR: Could not find game overlay")
    exit(1)
if game_overlay_end is None:
    print("ERROR: Could not find end of game overlay")
    exit(1)
    
print(f"Game overlay: lines {game_overlay_start + 1} to {game_overlay_end + 1}")

# Extract game content (the actual game container, not the overlay wrapper)
game_content_start = game_overlay_start + 3  # Skip comment and overlay div
game_content_end = game_overlay_end - 1  # Before the closing div

game_content = '\n'.join(lines[game_content_start:game_content_end])

# Now build the new file structure
new_content = []

# Keep everything before the return statement
new_content.extend(lines[:return_line_idx + 1])

# Add the new return structure
new_content.append('    <div className="flex h-screen bg-gray-100">')
new_content.append('      {/* Left Panel - Settings */}')
new_content.append('      <div className="w-1/3 min-w-[400px] max-w-[600px] bg-white shadow-2xl overflow-y-auto">')
new_content.append('        <div className="p-6">')
new_content.append('          <h1 className="text-3xl font-bold mb-6 text-gray-800">Game Settings</h1>')
new_content.append('          ')
new_content.append('          {!isGameLaunched ? (')
new_content.append('            // Show only launch button when game is not launched')
new_content.append('            <div className="flex items-center justify-center h-[calc(100vh-200px)]">')
new_content.append('              <button')
new_content.append('                onClick={handleLaunchGame}')
new_content.append('                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-xl"')
new_content.append('              >')
new_content.append('                🎮 Launch Game')
new_content.append('              </button>')
new_content.append('            </div>')
new_content.append('          ) : (')
new_content.append('            // Show all settings when game is launched')
new_content.append('            <div>')
new_content.append('              {/* Close Game Button */}')
new_content.append('              <button')
new_content.append('                onClick={handleCloseGame}')
new_content.append('                className="w-full mb-6 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"')
new_content.append('              >')
new_content.append('                ✕ Close Game')
new_content.append('              </button>')
new_content.append('')

# Add settings content
new_content.append(settings_content)

# Add save button
new_content.append('')
new_content.append('              {/* Save Button */}')
new_content.append('              <button')
new_content.append('                onClick={handleSaveGame}')
new_content.append('                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all mt-6"')
new_content.append('              >')
new_content.append('                💾 Save Game')
new_content.append('              </button>')
new_content.append('            </div>')
new_content.append('          )}')
new_content.append('        </div>')
new_content.append('      </div>')
new_content.append('')

# Add right panel with iframe and game
new_content.append('      {/* Right Panel - Iframe & Game */}')
new_content.append('      <div className="flex-1 relative">')
new_content.append('        {/* Website Iframe */}')
new_content.append('        <iframe')
new_content.append('          src={websiteUrl}')
new_content.append('          className="w-full h-full border-0"')
new_content.append('          title="Website Preview"')
new_content.append('        />')
new_content.append('')
new_content.append('        {/* Game Overlay */}')
new_content.append('        {isGameLaunched && (')
new_content.append('          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={handleOutsideClick}>')

# Add game content
new_content.append(game_content)

new_content.append('          </div>')
new_content.append('        )}')
new_content.append('      </div>')
new_content.append('    </div>')
new_content.append('  );')
new_content.append('}')

# Write the new file
output = '\n'.join(new_content)
with open('app/page.tsx', 'w') as f:
    f.write(output)

print(f"\n✅ File restructured successfully!")
print(f"New file has {len(new_content)} lines")
print(f"\nKey changes:")
print(f"  - Converted to split-panel layout")
print(f"  - Left panel shows Launch button or Settings")
print(f"  - Right panel shows iframe + game overlay")
print(f"  - Removed floating Launch button")
print(f"  - Removed Settings modal")

