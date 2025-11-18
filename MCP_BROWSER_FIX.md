# Fixing MCP Browser Configuration and Authentication Errors

## Issue
The MCP browser server is returning 403 Forbidden errors with the message: "Invalid or missing authentication token"

## Current Status
- ✅ Cursor settings file found at: `%APPDATA%\Cursor\User\settings.json`
- ✅ Browser beta setting is enabled: `cursor.agent_layout_browser_beta_setting: true`
- ❌ MCP browser server authentication is failing
- ❌ No MCP configuration files found in Cursor's directories

## Solution Steps

### Option 1: Enable MCP Browser Server in Cursor Settings (Recommended)

1. **Open Cursor Settings**:
   - Press `Ctrl+,` (Windows) or `Cmd+,` (Mac)
   - Or go to `File > Preferences > Settings`

2. **Search for MCP Settings**:
   - In the settings search bar, type: `MCP` or `Model Context Protocol`
   - Look for settings related to:
     - "MCP Servers"
     - "Browser MCP"
     - "Model Context Protocol"

3. **Check for Browser MCP Server**:
   - Look for a browser-related MCP server option
   - Ensure it's enabled/toggled on
   - If there's an authentication or token field, check if it needs configuration

4. **Restart Cursor**:
   - Fully close and restart Cursor after making changes
   - This ensures MCP servers are properly initialized

### Option 2: Configure MCP Server via Settings JSON

1. **Open Cursor Settings JSON**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Preferences: Open User Settings (JSON)"
   - Press Enter

2. **Add MCP Browser Configuration**:
   Add the following configuration to your settings.json:

```json
{
  "mcp.servers": {
    "browser": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-browser"
      ],
      "env": {}
    }
  }
}
```

### Option 3: Install and Configure Browser MCP Server Manually

1. **Install the Browser MCP Server**:
   ```bash
   npm install -g @modelcontextprotocol/server-browser
   ```

2. **Verify Installation**:
   ```bash
   npx @modelcontextprotocol/server-browser --version
   ```

3. **Configure in Cursor**:
   - Follow Option 1 or Option 2 above to add the server configuration

### Option 4: Check Cursor MCP Configuration File

The MCP configuration might be in:
- Windows: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
- Or: `%APPDATA%\Cursor\User\settings.json`

Check if there's an MCP section that needs the browser server added.

### Troubleshooting

1. **Restart Cursor**: After making configuration changes, fully restart Cursor
2. **Check MCP Server Status**: Look for MCP server status indicators in Cursor's status bar
3. **Verify Node.js**: Ensure Node.js is installed and accessible from the command line
4. **Check Permissions**: Ensure Cursor has necessary permissions to run MCP servers

### Option 5: Update Cursor

The MCP browser server might require a specific Cursor version:

1. **Check Cursor Version**:
   - Go to `Help > About` to see your current version
   - Ensure you're on the latest version or a version that supports MCP browser

2. **Update Cursor**:
   - Go to `Help > Check for Updates`
   - Install any available updates
   - Restart Cursor after updating

### Option 6: Check Cursor Command Palette

1. **Open Command Palette**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)

2. **Search for MCP**:
   - Type "MCP" and see if there are any MCP-related commands
   - Look for commands like:
     - "MCP: Restart Servers"
     - "MCP: Enable Browser"
     - "MCP: Configure"

### Alternative: Use System Browser

If the MCP browser tool continues to have issues, you can use the system browser commands which are working:
- The dev servers are accessible at http://localhost:3200 and http://localhost:3201
- These can be opened using PowerShell's `Start-Process` command

## Current Status

- ✅ Dev servers are running on ports 3200 and 3201
- ✅ Browser beta setting is enabled in Cursor
- ❌ MCP browser tool has authentication errors (403 Forbidden)
- ✅ System browser commands are working
- ✅ Cursor settings file exists but has no MCP configuration

## Diagnosis

The error "Invalid or missing authentication token" suggests:
1. The MCP browser server is a built-in Cursor feature
2. It may require explicit enablement in Cursor's settings
3. There might be a version compatibility issue
4. The feature might need additional permissions

## Next Steps (In Order)

1. **First**: Try Option 1 - Check Cursor Settings UI for MCP options
2. **Second**: Try Option 6 - Check Command Palette for MCP commands
3. **Third**: Try Option 5 - Update Cursor to the latest version
4. **Fourth**: If all else fails, use the system browser commands (which are working)

## Contact Support

If none of these solutions work, this might be a known issue with Cursor's MCP browser server. Consider:
- Checking Cursor's GitHub issues
- Contacting Cursor support
- Using the system browser as a workaround

