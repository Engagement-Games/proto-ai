#!/usr/bin/env python3
import re

# Read the file
with open('app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find key sections
return_idx = next(i for i, line in enumerate(lines) if i >= 600 and 'return (' in line.strip())
settings_modal_start = next(i for i, line in enumerate(lines) if '{/* Settings Modal */}' in line)
save_button_idx = next(i for i, line in enumerate(lines) if i > settings_modal_start and 'Save Game' in line)

# Find where settings content starts (after the left panel div and h2)
settings_content_start = None
for i in range(settings_modal_start, settings_modal_start + 20):
    if 'Website URL' in lines[i]:
        settings_content_start = i - 2  # Back up to the comment
        break

# Find where settings content ends (before the preview panel)
settings_content_end = None
for i in range(settings_content_start, save_button_idx):
    if 'Right Panel - Preview' in lines[i] or 'Preview' in lines[i] and 'Panel' in lines[i-1:i+2]:
        settings_content_end = i - 3
        break

if not settings_content_end:
    # Find by looking for the closing div before preview
    for i in range(settings_content_start + 100, save_button_idx):
        if '</div>' in lines[i] and 'Right Panel' in ''.join(lines[i:i+5]):
            settings_content_end = i
            break

print(f"Return line: {return_idx + 1}")
print(f"Settings modal start: {settings_modal_start + 1}")
print(f"Settings content: {settings_content_start + 1} to {settings_content_end + 1}")
print(f"Save button around: {save_button_idx + 1}")

# Extract settings content
settings_content = lines[settings_content_start:settings_content_end]

# Build new structure
new_lines = lines[:return_idx + 2]  # Up to and including the opening div

# Add left panel
new_lines.append('      {/* Left Panel - Settings */}\n')
new_lines.append('      <div className="w-1/3 min-w-[400px] max-w-[600px] bg-white shadow-2xl overflow-y-auto">\n')
new_lines.append('        <div className="p-6">\n')
new_lines.append('          <h1 className="text-3xl font-bold mb-6 text-gray-800">Game Settings</h1>\n')
new_lines.append('          \n')
new_lines.append('          {!isGameLaunched ? (\n')
new_lines.append('            // Show only launch button when game is not launched\n')
new_lines.append('            <div className="flex items-center justify-center h-[calc(100vh-200px)]">\n')
new_lines.append('              <button\n')
new_lines.append('                onClick={handleLaunchGame}\n')
new_lines.append('                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-xl"\n')
new_lines.append('              >\n')
new_lines.append('                🎮 Launch Game\n')
new_lines.append('              </button>\n')
new_lines.append('            </div>\n')
new_lines.append('          ) : (\n')
new_lines.append('            // Show all settings when game is launched\n')
new_lines.append('            <div>\n')
new_lines.append('              {/* Close Game Button */}\n')
new_lines.append('              <button\n')
new_lines.append('                onClick={handleCloseGame}\n')
new_lines.append('                className="w-full mb-6 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"\n')
new_lines.append('              >\n')
new_lines.append('                ✕ Close Game\n')
new_lines.append('              </button>\n')
new_lines.append('              \n')

# Add settings content
new_lines.extend(settings_content)

# Close the settings div
new_lines.append('              \n')
new_lines.append('              {/* Save Button */}\n')
new_lines.append('              <button\n')
new_lines.append('                onClick={handleSaveGame}\n')
new_lines.append('                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all mt-6"\n')
new_lines.append('              >\n')
new_lines.append('                💾 Save Game\n')
new_lines.append('              </button>\n')
new_lines.append('            </div>\n')
new_lines.append('          )}\n')
new_lines.append('        </div>\n')
new_lines.append('      </div>\n')
new_lines.append('\n')

# Add right panel with iframe and game overlay
new_lines.append('      {/* Right Panel - Iframe & Game */}\n')
new_lines.append('      <div className="flex-1 relative">\n')
new_lines.append('        {/* Website Iframe */}\n')
new_lines.append('        <iframe\n')
new_lines.append('          src={websiteUrl}\n')
new_lines.append('          className="w-full h-full border-0"\n')
new_lines.append('          title="Website Preview"\n')
new_lines.append('        />\n')
new_lines.append('\n')

# Find the game overlay section
game_overlay_start = next(i for i, line in enumerate(lines) if '{/* Game Overlay */}' in line)
game_overlay_end = next(i for i, line in enumerate(lines) if i > game_overlay_start and '{/* Settings Modal */}' in line)

# Add game overlay (modified to not be fixed full screen)
new_lines.append('        {/* Game Overlay */}\n')
new_lines.append('        {isGameLaunched && (\n')
new_lines.append('          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={handleOutsideClick}>\n')

# Find and add the game container content
game_container_start = game_overlay_start + 3  # Skip overlay div and comment
game_container_end = game_overlay_end - 2

new_lines.extend(lines[game_container_start:game_container_end])

new_lines.append('          </div>\n')
new_lines.append('        )}\n')
new_lines.append('      </div>\n')

# Close main div and component
new_lines.append('    </div>\n')
new_lines.append('  );\n')
new_lines.append('}\n')

# Write the new file
with open('app/page.tsx', 'w') as f:
    f.writelines(new_lines)

print("\nFile restructured successfully!")
print(f"New file has {len(new_lines)} lines")

