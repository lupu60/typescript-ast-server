# TypeScript AST MCP Server

A Model Context Protocol (MCP) server that provides TypeScript AST analysis capabilities using the TypeScript Compiler API.

## Features

- **AST Analysis**: Analyze TypeScript files for functions, objects, and other code structures
- **tsconfig.json Auto-detection**: Automatically finds and uses project TypeScript configuration
- **No Text-based Search**: Uses TypeScript Compiler API instead of grep or text parsing
- **Rich Metadata**: Returns detailed information including parameters, types, locations, and export status

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Claude Desktop/CLI

Copy the generated `claude_desktop_config.json` content to your Claude Desktop configuration:

**For Claude Desktop:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**For Claude CLI:**
Add the server configuration to your `~/.claude/config.json`:

```json
{
  "mcpServers": {
   "typescript-ast": {
      "command": "npx",
      "args": [
         "typescript-ast-server"
      ]
   },
  }
}
```

### 3. Test the Server

Run the server directly to test:

```bash
npm start
```

## Usage

### Tool: analyze-typescript-ast

Analyzes TypeScript files and extracts information about code structures.

**Parameters:**
- `filePath` (required): Path to the TypeScript file to analyze
- `queryType` (required): Type of analysis - "functions", "objects", or "all"
- `projectRoot` (optional): Project root path (defaults to current working directory)

### Sample CLI Commands

Once the MCP server is configured, you can use it from Claude CLI:

```bash
# Analyze functions in a specific file
claude --tool analyze-typescript-ast --filePath "./src/utils.ts" --queryType "functions"

# Analyze all objects in a file
claude --tool analyze-typescript-ast --filePath "./src/config.ts" --queryType "objects"

# Analyze both functions and objects
claude --tool analyze-typescript-ast --filePath "./src/app.ts" --queryType "all"

# Specify a different project root
claude --tool analyze-typescript-ast --filePath "./libs/shared/index.ts" --queryType "functions" --projectRoot "./libs/shared"
```

### Example Output

**Function Analysis:**
```json
{
  "functions": [
    {
      "name": "calculateTotal",
      "parameters": [
        {
          "name": "items",
          "type": "Item[]",
          "isOptional": false
        },
        {
          "name": "tax",
          "type": "number",
          "isOptional": true
        }
      ],
      "returnType": "number",
      "location": {
        "line": 15,
        "column": 1,
        "file": "/path/to/file.ts"
      },
      "isAsync": false,
      "isExported": true
    }
  ],
  "file": "/path/to/file.ts"
}
```

**Object Analysis:**
```json
{
  "objects": [
    {
      "name": "config",
      "properties": [
        {
          "name": "apiUrl",
          "type": "string",
          "value": "'https://api.example.com'"
        },
        {
          "name": "timeout",
          "type": "number",
          "value": "5000"
        }
      ],
      "location": {
        "line": 8,
        "column": 1,
        "file": "/path/to/file.ts"
      },
      "isExported": true
    }
  ],
  "file": "/path/to/file.ts"
}
```

## Error Handling

The server includes comprehensive error handling for:
- Missing or invalid file paths
- Missing tsconfig.json files
- TypeScript compilation errors
- Invalid query types

## Development

### Running in Development Mode

```bash
npm run dev
```

### Manual Testing

Create a test TypeScript file and run analysis:

```bash
echo "export function test(a: string, b?: number): boolean { return true; }" > test.ts
npx tsx typescript-ast-server.ts
# Then use the analyze-typescript-ast tool via Claude CLI
```

## Technical Details

- Uses TypeScript Compiler API for AST parsing
- Supports both tsconfig.json-based and standalone analysis
- Extracts detailed type information when available
- Handles various function types: declarations, expressions, arrow functions, and methods
- Analyzes object literals with property details and type information
