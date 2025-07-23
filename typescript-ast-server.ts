#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { createLogger, transports, format } from 'winston';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger({
  level: 'debug',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: path.join(__dirname, 'typescript-ast-server.log') }),
    new transports.Console(),
  ],
});

const server = new McpServer({ name: 'typescript-ast-server', version: '1.0.0' });

server.tool(
  'analyze-typescript-ast',
  {
    title: 'Analyze TypeScript AST',
    description: 'Analyzes TypeScript AST for functions or objects in a file',
    inputSchema: {
      projectPath: z.string().describe('Path to the project directory containing tsconfig.json'),
      filePath: z.string().describe('Path to the TypeScript file'),
      queryType: z.enum(['functions', 'objects']).describe('Type of AST nodes to analyze'),
    },
  },
  async ({ projectPath, filePath, queryType }) => {
    try {
      logger.info('Received request', { projectPath, filePath, queryType });

      const tsConfigPath = path.join(projectPath, 'tsconfig.json');
      logger.debug('Checking tsconfig.json', { tsConfigPath });
      if (!fs.existsSync(tsConfigPath)) {
        logger.error('tsconfig.json not found', { tsConfigPath });
        return { content: [{ type: 'text', text: 'Error: tsconfig.json not found in project directory' }] };
      }

      logger.debug('Checking file path', { filePath });
      if (!fs.existsSync(filePath)) {
        logger.error('File not found', { filePath });
        return { content: [{ type: 'text', text: `Error: File ${filePath} not found` }] };
      }

      logger.debug('Reading and parsing file', { filePath });
      const sourceFile = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf-8'),
        ts.ScriptTarget.Latest,
        true
      );

      const results: string[] = [];
      logger.debug('Starting AST traversal', { queryType });
      function visit(node: ts.Node) {
        if (queryType === 'functions' && ts.isFunctionDeclaration(node) && node.name) {
          const result = `Function: ${node.name.text}, Parameters: ${node.parameters.map(p => p.name.getText()).join(', ')}`;
          logger.info('Found function', { result });
          results.push(result);
        } else if (queryType === 'objects' && ts.isObjectLiteralExpression(node)) {
          const result = `Object Literal at line ${sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1}`;
          logger.info('Found object', { result });
          results.push(result);
        }
        ts.forEachChild(node, visit);
      }
      ts.forEachChild(sourceFile, visit);

      logger.info('AST analysis completed', { resultCount: results.length });
      return {
        content: [{ type: 'text', text: results.length ? results.join('\n') : 'No matches found' }],
      };
    } catch (error) {
      logger.error('Error in AST analysis', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
      return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
  }
);

logger.info('Starting TypeScript AST MCP server');

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
