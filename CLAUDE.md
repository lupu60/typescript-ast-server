# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides TypeScript AST analysis capabilities using the TypeScript Compiler API. The server analyzes TypeScript files to extract information about functions and objects without relying on text-based parsing.

## Development Commands

### Running the Server
- `npm start` - Start the TypeScript AST MCP server
- `npm run dev` - Start the server in development mode with file watching

### Node.js Version
The project uses Node.js 20.19.4 (managed via Volta). Ensure this version is installed.

## Architecture

### Core Components
- **typescript-ast-server.ts**: Main MCP server implementation that handles AST analysis requests
- **MCP Tool**: `analyze-typescript-ast` - Primary tool for analyzing TypeScript files

### Key Dependencies
- `@modelcontextprotocol/sdk`: Core MCP framework for server implementation
- `typescript`: TypeScript Compiler API for AST parsing
- `winston`: Structured logging with file and console outputs
- `zod`: Schema validation for input parameters
- `tsx`: TypeScript execution for development

### Server Architecture
The server implements a single MCP tool with the following flow:
1. Validates input parameters (projectPath, filePath, queryType)
2. Locates and validates tsconfig.json in the project directory
3. Creates TypeScript source file using Compiler API
4. Traverses AST nodes based on query type ('functions' or 'objects')
5. Returns structured results or error messages

### Logging
All operations are logged to both console and `typescript-ast-server.log` file with structured JSON format including timestamps.

## MCP Server Configuration

The server is configured as an MCP server that communicates via stdio transport. Configuration is provided in `claude_desktop_config.json` for integration with Claude Desktop/CLI.

### Tool Parameters
- `projectPath`: Path to project directory containing tsconfig.json
- `filePath`: Path to the TypeScript file to analyze
- `queryType`: Either 'functions' or 'objects'

## File Structure

This is a single-file MCP server project with minimal structure:
- Main server logic in `typescript-ast-server.ts`
- Package configuration in `package.json` 
- TypeScript configuration in `tsconfig.json`
- MCP server config in `claude_desktop_config.json`

## TypeScript Configuration

The project uses modern TypeScript settings:
- Target: ES2020
- Module: ESNext with bundler resolution
- Strict type checking enabled
- ES modules with top-level await support