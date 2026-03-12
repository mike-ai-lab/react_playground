import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import { applyPatch } from "diff"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// Load from parent directory .env.local
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env.local') })
}

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

if (!GROQ_API_KEY) {
  console.error("ERROR: VITE_GROQ_API_KEY not found in .env.local")
  console.error("Checked path:", envPath)
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('GROQ')))
  process.exit(1)
}

console.log("✓ Groq API Key loaded successfully")

// ============================================================================
// SEMANTIC PATCH EDITING SYSTEM
// ============================================================================

/**
 * Debug logger for semantic patch workflow
 */
const debugLogger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    console.log(`[${timestamp}] [AI-EDITOR] ${message}`, data ? data : '')
  },
  error: (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    console.error(`[${timestamp}] [AI-EDITOR] ❌ ${message}`, data ? data : '')
  },
  success: (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    console.log(`[${timestamp}] [AI-EDITOR] ✓ ${message}`, data ? data : '')
  }
}

/**
 * Semantic file finder - searches for relevant files based on user instruction
 * @param {string} instruction - User's natural language instruction
 * @param {Object} files - All available files in the project
 * @returns {Array} - Ranked list of matching files
 */
function semanticFileFinder(instruction, files) {
  debugLogger.log(`Searching semantic matches for: "${instruction}"`)
  
  const keywords = instruction
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
  
  const matches = []
  
  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue
    
    let score = 0
    const fileName = filePath.toLowerCase()
    
    // Score based on filename matches
    for (const keyword of keywords) {
      if (fileName.includes(keyword)) score += 10
    }
    
    // Score based on exported component names
    const componentMatch = content.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/m)
    if (componentMatch) {
      const componentName = componentMatch[1].toLowerCase()
      for (const keyword of keywords) {
        if (componentName.includes(keyword)) score += 8
      }
    }
    
    // Score based on content keywords
    for (const keyword of keywords) {
      const occurrences = (content.match(new RegExp(keyword, 'gi')) || []).length
      score += occurrences * 0.5
    }
    
    if (score > 0) {
      matches.push({ filePath, score, content })
    }
  }
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)
  
  // Filter to only high-relevance matches (score > 5)
  const relevantMatches = matches.filter(m => m.score > 5)
  
  debugLogger.log(`Matched files:`, relevantMatches.map(m => `${m.filePath} (score: ${m.score})`).join(', '))
  
  return relevantMatches
}

/**
 * Extract imports from code to build dependency graph
 * @param {string} code - Source code
 * @param {string} filePath - Current file path
 * @returns {Array} - List of imported file paths
 */
function extractImports(code, filePath) {
  const imports = []
  const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/gm
  
  let match
  while ((match = importRegex.exec(code)) !== null) {
    let importPath = match[1]
    
    // Skip external packages
    if (importPath.startsWith('.')) {
      // Resolve relative path
      const dir = filePath.split('/').slice(0, -1).join('/')
      const resolved = importPath.startsWith('./') 
        ? `${dir}/${importPath.substring(2)}`
        : `${dir}/${importPath}`
      
      imports.push(resolved)
    }
  }
  
  return imports
}

/**
 * Build minimal dependency graph (1 level deep)
 * @param {Array} matchedFiles - Files matched by semantic search
 * @param {Object} allFiles - All available files
 * @returns {Object} - Dependency graph with files to send to AI
 */
function dependencyExtractor(matchedFiles, allFiles) {
  debugLogger.log(`Parsing imports for ${matchedFiles.length} matched files`)
  
  const graph = {}
  const filesToSend = new Set()
  
  // Add matched files
  for (const match of matchedFiles) {
    filesToSend.add(match.filePath)
    graph[match.filePath] = {
      imports: [],
      size: match.content.length
    }
  }
  
  // Extract direct dependencies (1 level only)
  for (const match of matchedFiles) {
    const imports = extractImports(match.content, match.filePath)
    
    for (let importPath of imports) {
      // Try different extensions
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.css']
      let found = false
      
      for (const ext of extensions) {
        const testPath = importPath + ext
        if (allFiles[testPath]) {
          filesToSend.add(testPath)
          graph[match.filePath].imports.push(testPath)
          found = true
          break
        }
      }
      
      if (!found) {
        // Try as directory with index file
        for (const ext of extensions) {
          const testPath = importPath + '/index' + ext
          if (allFiles[testPath]) {
            filesToSend.add(testPath)
            graph[match.filePath].imports.push(testPath)
            found = true
            break
          }
        }
      }
    }
  }
  
  debugLogger.log(`Dependency graph built`, `${filesToSend.size} files to send`)
  
  return {
    graph,
    filesToSend: Array.from(filesToSend)
  }
}

/**
 * Build context payload for AI model
 * @param {Array} filesToSend - Files to include in context
 * @param {Object} allFiles - All available files
 * @param {string} instruction - User instruction
 * @returns {string} - Formatted context for AI
 */
function contextBuilder(filesToSend, allFiles, instruction) {
  debugLogger.log(`Building context payload`)
  
  let context = `# Modify Code
Goal: ${instruction}

Files:
`
  
  for (const filePath of filesToSend) {
    const content = allFiles[filePath]
    if (!content) continue
    
    context += `\n## ${filePath}\n\`\`\`\n${content}\n\`\`\`\n`
  }
  
  context += `\n# Return patches in this format:
PATCH filename @@ line_number @@
old line
new line

Do not return full files.`
  
  debugLogger.log(`Context payload built`, `${filesToSend.length} files, ${context.length} chars`)
  
  return context
}

/**
 * Validate that generated code follows all constraints
 * Returns { valid: boolean, errors: string[] }
 */
function validateGeneratedCode(code, filePath) {
  const errors = [];
  
  // Check 1: Must have export default function
  if (!code.includes('export default function') && !code.includes('export default class')) {
    errors.push('Missing "export default function" - component must export a function');
  }
  
  // Check 2: Must NOT have "default export function" (wrong syntax)
  if (code.includes('default export function')) {
    errors.push('Invalid syntax: use "export default function" not "default export function"');
  }
  
  // Check 3: Must NOT have CSS imports
  if (/import\s+['"][^'"]*\.css['"]/m.test(code)) {
    errors.push('CSS imports not allowed - use inline styles only');
  }
  
  // Check 4: Must NOT have external library imports (except React)
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const moduleName = match[1];
    if (!moduleName.startsWith('.') && moduleName !== 'react') {
      errors.push(`External library import not allowed: "${moduleName}" - only React is supported`);
    }
  }
  
  // Check 5: Must return JSX (not string, object, etc)
  // Look for return statements that return non-JSX
  const returnRegex = /return\s+([^;]+);/gm;
  while ((match = returnRegex.exec(code)) !== null) {
    const returnValue = match[1].trim();
    // Check for string returns
    if (returnValue.startsWith('"') || returnValue.startsWith("'") || returnValue.startsWith('`')) {
      errors.push('Cannot return string - must return JSX element');
    }
    // Check for object returns
    if (returnValue.startsWith('{') && !returnValue.startsWith('<')) {
      errors.push('Cannot return object - must return JSX element');
    }
    // Check for null/undefined
    if (returnValue === 'null' || returnValue === 'undefined') {
      errors.push('Cannot return null or undefined - must return JSX element');
    }
  }
  
  // Check 6: State must be initialized
  const stateRegex = /useState\(\s*\)/gm;
  if (stateRegex.test(code)) {
    errors.push('State must be initialized with a value - useState() is invalid');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitize AI response to fix common issues
 */
function sanitizeAIResponse(code) {
  let sanitized = code;
  
  // Fix: "default export function" -> "export default function"
  sanitized = sanitized.replace(/default\s+export\s+function/g, 'export default function');
  sanitized = sanitized.replace(/default\s+export\s+class/g, 'export default class');
  
  // Fix: Remove duplicate React imports
  sanitized = sanitized.replace(/import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"]\s*;?\n?/gm, 'import React, { useState, useEffect } from \'react\';\n');
  
  // Ensure only one React import at the top
  const hasReactImport = /import\s+React/m.test(sanitized);
  if (!hasReactImport && /export\s+default\s+function/m.test(sanitized)) {
    sanitized = "import React, { useState, useEffect } from 'react';\n\n" + sanitized;
  }
  
  return sanitized;
}

/**
 * System prompt for AI code generation
 * Ensures all generated code is valid React and works in the preview environment
 * CRITICAL: This prompt prevents all common errors that break the preview system
 */
const SYSTEM_PROMPT = `You are a React component code generator for a browser-based code editor with live preview.

ABSOLUTE RULES (NEVER BREAK THESE):

1. EXPORT FORMAT - MUST use this exact pattern:
   ✅ export default function ComponentName() { ... }
   ✅ export default function ComponentName() { return <div>...</div>; }
   ❌ export default { render: () => ... }
   ❌ default export function ComponentName() { ... }
   ❌ export { ComponentName as default }

2. RETURN VALUE - MUST return JSX element:
   ✅ return <div>Content</div>;
   ✅ return <Component />;
   ❌ return "string";
   ❌ return { content: "..." };
   ❌ return null;
   ❌ return undefined;

3. IMPORTS - ONLY React allowed:
   ✅ import React, { useState, useEffect } from 'react';
   ❌ import './styles.css';
   ❌ import { motion } from 'framer-motion';
   ❌ import styled from 'styled-components';

4. STATE - ALWAYS initialize with value:
   ✅ const [count, setCount] = useState(0);
   ✅ const [text, setText] = useState('');
   ❌ const [count, setCount] = useState();
   ❌ const [data, setData] = useState(undefined);

5. STYLES - ONLY inline objects:
   ✅ const styles = { button: { padding: '10px', color: 'blue' } };
   ✅ <div style={{ padding: '10px' }}>Content</div>
   ❌ import './Button.css';
   ❌ className="btn-primary"

6. IMAGES - ONLY CORS-enabled URLs:
   ✅ https://images.unsplash.com/photo-ID?w=800&h=400&fit=crop
   ✅ https://via.placeholder.com/800x400/cccccc/999999?text=Image
   ❌ https://via.placeholder.com/300x600?text=Image+1
   ❌ https://picsum.photos/1200/600

7. ASYNC - NEVER in render:
   ✅ useEffect(() => { fetch(...).then(...) }, [])
   ❌ async function Component() { ... }
   ❌ const data = await fetch(...);

COMPONENT TEMPLATE (COPY THIS):
\`\`\`javascript
import React, { useState, useEffect } from 'react';

export default function ComponentName() {
  const [state, setState] = useState(initialValue);
  
  const styles = {
    container: { padding: '20px', backgroundColor: '#f5f5f5' },
    title: { fontSize: '24px', fontWeight: 'bold' }
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Content</h1>
    </div>
  );
}
\`\`\`

PATCH FORMAT (for modifications):
\`\`\`
PATCH filename @@ line_number @@
old line content
new line content
\`\`\`

VALIDATION BEFORE RETURNING:
- [ ] export default function (not "default export")
- [ ] returns JSX element (not string/object/null)
- [ ] all state initialized with values
- [ ] no CSS imports
- [ ] no external libraries
- [ ] all styles inline
- [ ] image URLs are CORS-enabled
- [ ] no async in render

GENERATE ONLY VALID, WORKING CODE. EVERY COMPONENT MUST RENDER WITHOUT ERRORS.`;

/**
 * Request patches from AI model
 * @param {string} context - Context payload
 * @returns {Promise<string>} - AI response with patches
 */
async function aiPatchRequester(context) {
  debugLogger.log(`Awaiting AI patch response...`)
  
  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`
      throw new Error(`API error: ${errorMsg}`)
    }
    
    const data = await response.json()
    const patchResponse = data.choices[0].message.content
    
    debugLogger.success(`AI response received`)
    
    return patchResponse
  } catch (error) {
    debugLogger.error(`AI request failed`, error.message)
    throw error
  }
}

/**
 * Parse patches from AI response
 * @param {string} patchResponse - Raw patch response from AI
 * @returns {Array} - Parsed patches
 */
function parsePatches(patchResponse) {
  const patches = []
  const patchRegex = /PATCH\s+(\S+)\s+@@\s+line\s+(\d+)\s+@@\n([\s\S]*?)(?=PATCH|$)/gm
  
  let match
  while ((match = patchRegex.exec(patchResponse)) !== null) {
    const [, filePath, lineNum, changes] = match
    const lines = changes.trim().split('\n')
    
    const oldLines = []
    const newLines = []
    let mode = null
    
    for (const line of lines) {
      if (line.startsWith('- ')) {
        oldLines.push(line.substring(2))
      } else if (line.startsWith('+ ')) {
        newLines.push(line.substring(2))
      } else if (line.startsWith('old ')) {
        mode = 'old'
      } else if (line.startsWith('new ')) {
        mode = 'new'
      } else if (mode === 'old') {
        oldLines.push(line)
      } else if (mode === 'new') {
        newLines.push(line)
      }
    }
    
    patches.push({
      filePath,
      lineNum: parseInt(lineNum),
      oldLines,
      newLines
    })
  }
  
  debugLogger.log(`Patches parsed`, `${patches.length} patches found`)
  
  return patches
}

/**
 * Apply patches to files
 * @param {Array} patches - Parsed patches
 * @param {Object} files - File system
 * @returns {Object} - Result with applied patches and errors
 */
function patchApplier(patches, files) {
  debugLogger.log(`Applying patches...`)
  
  const results = {
    success: [],
    failed: []
  }
  
  for (const patch of patches) {
    try {
      debugLogger.log(`Applying patch to ${patch.filePath}`)
      
      const fileContent = files[patch.filePath]
      if (!fileContent) {
        throw new Error(`File not found: ${patch.filePath}`)
      }
      
      const lines = fileContent.split('\n')
      const lineNum = patch.lineNum - 1 // Convert to 0-indexed
      
      // Verify context - check if old lines match
      let contextMatches = true
      for (let i = 0; i < patch.oldLines.length; i++) {
        if (lines[lineNum + i] !== patch.oldLines[i]) {
          contextMatches = false
          break
        }
      }
      
      if (!contextMatches) {
        debugLogger.error(`Patch failed – context mismatch at line ${patch.lineNum}`)
        results.failed.push({
          filePath: patch.filePath,
          lineNum: patch.lineNum,
          reason: 'Context mismatch',
          suggestion: 'Request full file replacement'
        })
        continue
      }
      
      // Apply patch - remove old lines and insert new ones
      lines.splice(lineNum, patch.oldLines.length, ...patch.newLines)
      
      files[patch.filePath] = lines.join('\n')
      
      debugLogger.success(`Patch applied to ${patch.filePath}`)
      results.success.push({
        filePath: patch.filePath,
        changes: patch.newLines.length
      })
    } catch (error) {
      debugLogger.error(`Patch failed for ${patch.filePath}`, error.message)
      results.failed.push({
        filePath: patch.filePath,
        reason: error.message
      })
    }
  }
  
  return results
}

let fileCode = `function hello(){
console.log("hello")
}`

app.post("/edit", async (req, res) => {
  try {
    const { instruction, files, currentFile } = req.body

    if (!instruction) {
      return res.status(400).json({ error: "Missing instruction" })
    }

    // Build working set context from all files
    let filesContext = ''
    if (files && Object.keys(files).length > 0) {
      filesContext = '\n\nWorking Set Files:\n'
      Object.entries(files).forEach(([filename, content]) => {
        filesContext += `\n--- ${filename} ---\n${content}\n`
      })
    }

    const prompt = `Instruction: ${instruction}
${filesContext}

Generate complete, working code for all required files. Return in this format:

FILE: filename1.ext
<code content>

FILE: filename2.ext
<code content>`

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 8192
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Groq API error:", response.status, error)
      return res.status(response.status).json({ error: "Groq API error", status: response.status })
    }

    const data = await response.json()
    let responseText = data.choices[0].message.content.trim()
    
    // Parse multi-file response
    const fileRegex = /FILE:\s*([^\n]+)\n([\s\S]*?)(?=FILE:|$)/g
    const parsedFiles = {}
    let match
    
    while ((match = fileRegex.exec(responseText)) !== null) {
      const filename = match[1].trim()
      let content = match[2].trim()
      
      // Remove markdown code blocks if present
      if (content.startsWith('```')) {
        content = content.replace(/^```(?:javascript|jsx|typescript|tsx|html|css|json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      parsedFiles[filename] = content.trim()
    }
    
    // If no multi-file format detected, treat as single file
    if (Object.keys(parsedFiles).length === 0) {
      let code = responseText
      if (code.startsWith('```')) {
        code = code.replace(/^```(?:javascript|jsx|typescript|tsx|html|css|json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      res.json({ 
        code: code.trim(),
        message: `✓ Generated code`
      })
    } else {
      console.log(`Generated ${Object.keys(parsedFiles).length} files`)
      res.json({ 
        files: parsedFiles,
        message: `✓ Generated ${Object.keys(parsedFiles).length} files`
      })
    }
  } catch (error) {
    console.error("Server error:", error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * Semantic patch endpoint - intelligent code modification without full file context
 * POST /semantic-patch
 * Body: { instruction: string, files: Object }
 */
app.post("/semantic-patch", async (req, res) => {
  try {
    const { instruction, files } = req.body
    
    if (!instruction || !files) {
      return res.status(400).json({ error: "Missing instruction or files" })
    }
    
    debugLogger.log(`User instruction received: "${instruction}"`)
    
    // Step 1: Semantic file finding
    const matchedFiles = semanticFileFinder(instruction, files)
    
    if (matchedFiles.length === 0) {
      debugLogger.error(`No matching files found`)
      return res.status(400).json({ 
        error: "No matching files found for instruction",
        suggestion: "Try being more specific about the component or feature name"
      })
    }
    
    // Step 2: Dependency extraction
    const { filesToSend } = dependencyExtractor(matchedFiles, files)
    
    // Step 3: Context building
    const context = contextBuilder(filesToSend, files, instruction)
    
    // Step 4: AI patch request
    let patchResponse
    try {
      patchResponse = await aiPatchRequester(context)
    } catch (error) {
      return res.status(500).json({ 
        error: "AI request failed",
        details: error.message
      })
    }
    
    // Step 5: Parse patches
    const patches = parsePatches(patchResponse)
    
    if (patches.length === 0) {
      debugLogger.error(`No patches found in AI response`)
      return res.status(400).json({ 
        error: "AI did not return valid patches",
        response: patchResponse.substring(0, 200)
      })
    }
    
    // Step 6: Apply patches
    const applyResults = patchApplier(patches, files)
    
    // Return results
    res.json({
      success: true,
      message: `Applied ${applyResults.success.length} patches`,
      results: {
        applied: applyResults.success,
        failed: applyResults.failed,
        filesModified: filesToSend
      },
      files: files
    })
    
  } catch (error) {
    debugLogger.error(`Semantic patch endpoint error`, error.message)
    res.status(500).json({ error: error.message })
  }
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", groqConfigured: !!GROQ_API_KEY })
})

// ============================================================================
// OLLAMA CLOUD PROXY - Bypass CORS restrictions
// ============================================================================

/**
 * Proxy endpoint for Ollama Cloud API
 * Forwards requests from browser to Ollama Cloud, bypassing CORS
 * POST /api/ollama-proxy
 * Body: { model, messages, stream, temperature, apiKey }
 */
app.post("/api/ollama-proxy", async (req, res) => {
  try {
    const { model, messages, stream, temperature, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "Missing Ollama Cloud API key" });
    }

    if (!model || !messages) {
      return res.status(400).json({ error: "Missing model or messages" });
    }

    console.log(`[OLLAMA-PROXY] Forwarding request to Ollama Cloud for model: ${model}`);

    const response = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: stream !== false,
        temperature: temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OLLAMA-PROXY] Error from Ollama Cloud:`, response.status, errorText);
      return res.status(response.status).json({
        error: `Ollama Cloud API error: ${response.statusText}`,
        details: errorText
      });
    }

    // Handle streaming response
    if (stream !== false) {
      res.setHeader("Content-Type", "application/x-ndjson");
      res.setHeader("Transfer-Encoding", "chunked");

      const reader = response.body;
      reader.on("data", (chunk) => {
        res.write(chunk);
      });

      reader.on("end", () => {
        res.end();
      });

      reader.on("error", (error) => {
        console.error(`[OLLAMA-PROXY] Stream error:`, error);
        res.status(500).json({ error: "Stream error" });
      });
    } else {
      // Non-streaming response
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error(`[OLLAMA-PROXY] Proxy error:`, error.message);
    res.status(500).json({
      error: "Proxy error",
      details: error.message
    });
  }
});

// ============================================================================
// ENHANCED RUNTIME BUNDLER - Multi-file component support
// ============================================================================

/**
 * Parse imports from code
 */
function parseImports(code) {
  const imports = []
  const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/gm
  
  let match
  while ((match = importRegex.exec(code)) !== null) {
    imports.push({
      path: match[1],
      statement: match[0]
    })
  }
  
  return imports
}

/**
 * Resolve relative import to actual file path
 */
function resolveImportPath(importPath, fromFile, files) {
  if (!importPath.startsWith('.')) return null
  
  const fromParts = fromFile.split('/')
  fromParts.pop()
  const fromDir = fromParts
  
  const importParts = importPath.split('/')
  const resolved = [...fromDir]
  
  for (const part of importParts) {
    if (part === '..') {
      resolved.pop()
    } else if (part !== '.') {
      resolved.push(part)
    }
  }
  
  let resolvedPath = resolved.join('/')
  
  const extensions = ['', '.tsx', '.ts', '.jsx', '.js']
  for (const ext of extensions) {
    const testPath = resolvedPath + ext
    if (files[testPath]) return testPath
  }
  
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
    const testPath = resolvedPath + '/index' + ext
    if (files[testPath]) return testPath
  }
  
  return null
}

/**
 * Build dependency graph
 */
function buildDependencyGraph(files, entryFile) {
  const graph = {}
  const visited = new Set()
  
  function traverse(filePath) {
    if (visited.has(filePath)) return
    visited.add(filePath)
    
    const code = files[filePath]
    if (!code) return
    
    const imports = parseImports(code)
    graph[filePath] = {
      code,
      imports: [],
      dependencies: []
    }
    
    for (const imp of imports) {
      const resolvedPath = resolveImportPath(imp.path, filePath, files)
      
      if (resolvedPath) {
        graph[filePath].imports.push({
          original: imp.path,
          resolved: resolvedPath,
          statement: imp.statement
        })
        graph[filePath].dependencies.push(resolvedPath)
        traverse(resolvedPath)
      } else {
        graph[filePath].imports.push({
          original: imp.path,
          resolved: null,
          statement: imp.statement,
          external: true
        })
      }
    }
  }
  
  traverse(entryFile)
  return graph
}

/**
 * Generate bundled HTML with virtual module system
 */
function generateBundledHTML(files, entryFile) {
  const graph = buildDependencyGraph(files, entryFile)
  
  // Extract CSS files to inject into iframe
  const cssFiles = []
  const cssImportRegex = /import\s+['"]([^'"]+\.css)['"]/gm
  
  for (const [filePath, info] of Object.entries(graph)) {
    let match
    while ((match = cssImportRegex.exec(info.code)) !== null) {
      const cssPath = match[1]
      const resolvedCssPath = resolveImportPath(cssPath, filePath, files)
      
      if (resolvedCssPath && files[resolvedCssPath]) {
        cssFiles.push({
          path: resolvedCssPath,
          content: files[resolvedCssPath]
        })
      }
    }
  }
  
  // Encode all files as base64 for Babel transpilation
  const fileDefinitions = []
  
  for (const [filePath, info] of Object.entries(graph)) {
    let transformedCode = info.code
    
    // Remove CSS imports only (don't touch other imports - let Babel handle them)
    transformedCode = transformedCode.replace(/import\s+['"][^'"]+\.css['"];?\n?/gm, '')
    
    // Encode for safe embedding (Babel will handle import transformation)
    const encoded = Buffer.from(transformedCode, 'utf8').toString('base64')
    fileDefinitions.push(`  '${filePath}': '${encoded}'`)
  }
  
  const filesObject = '{\n' + fileDefinitions.join(',\n') + '\n  }'
  
  // Build CSS injection
  const cssInjection = cssFiles.map(css => `<style>\n${css.content}\n</style>`).join('\n  ')
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #000000;
    }
    #root { 
      min-height: 100vh;
      padding: 20px;
    }
    .error-display {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      padding: 16px;
      margin: 20px;
      color: #856404;
      font-family: monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
  ${cssInjection}
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      try {
        // Decode base64 to UTF-8
        function b64ToUtf8(b64) {
          return decodeURIComponent(Array.prototype.map.call(atob(b64), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        }
        
        // Encoded files
        const encodedFiles = ${filesObject};
        
        // Virtual module system
        const __modules = {};
        
        // Custom require function
        function __require(path) {
          if (__modules[path]) {
            return __modules[path];
          }
          
          if (!encodedFiles[path]) {
            throw new Error('Module not found: ' + path);
          }
          
          try {
            const sourceCode = b64ToUtf8(encodedFiles[path]);
            
            // CRITICAL FIX: Remove duplicate React imports before Babel transformation
            // This prevents "Identifier 'React' has already been declared" errors
            let cleanedCode = sourceCode;
            
            // Remove all React imports - we'll provide React globally
            cleanedCode = cleanedCode.replace(/import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"]\s*;?\n?/gm, '');
            cleanedCode = cleanedCode.replace(/import\s+\{[^}]*React[^}]*\}\s+from\s+['"]react['"]\s*;?\n?/gm, '');
            
            // Remove duplicate imports of the same module
            const importedModules = new Set();
            cleanedCode = cleanedCode.replace(/^import\s+.*?from\s+['"]([^'"]+)['"]\s*;?$/gm, (match, moduleName) => {
              if (importedModules.has(moduleName)) {
                return ''; // Remove duplicate
              }
              importedModules.add(moduleName);
              return match;
            });
            
            // Transform with Babel using env preset for module transformation
            const result = Babel.transform(cleanedCode, { 
              presets: [
                ['env', { modules: 'commonjs' }],
                'react',
                'typescript'
              ],
              filename: path 
            });
            
            let compiled = result.code;
            
            // Replace relative imports with __require calls
            // Match: import X from './path' or import { X } from './path'
            compiled = compiled.replace(/require\(['"]([./][^'"]*)['"]\)/g, function(match, importPath) {
              // Check if this is a relative import (starts with . or ..)
              if (importPath.startsWith('.')) {
                return "__require('" + importPath + "')"
              }
              return match
            })
            
            // If Babel didn't convert exports, do it manually
            if (compiled.includes('export default')) {
              // Replace export default with module.exports
              compiled = compiled.replace(/export\s+default\s+/g, 'module.exports = ');
            }
            
            if (compiled.includes('export ')) {
              // Replace other exports
              compiled = compiled.replace(/export\s+\{([^}]+)\}/g, function(match, exports) {
                const items = exports.split(',').map(e => e.trim());
                return items.map(item => {
                  const parts = item.split(' as ');
                  const name = parts[0].trim();
                  const alias = parts[1] ? parts[1].trim() : name;
                  return 'exports.' + alias + ' = ' + name + ';';
                }).join(' ');
              });
              
              compiled = compiled.replace(/export\s+(const|let|var|function|class)\s+(\w+)/g, '$1 $2; exports.$2 = $2;');
            }
            
            // Execute in module context
            const exports = {};
            const module = { exports };
            
            // Provide React with named exports for destructuring
            const React = window.React;
            React.useState = window.React.useState;
            React.useEffect = window.React.useEffect;
            React.useContext = window.React.useContext;
            React.useReducer = window.React.useReducer;
            React.useCallback = window.React.useCallback;
            React.useMemo = window.React.useMemo;
            React.useRef = window.React.useRef;
            React.useImperativeHandle = window.React.useImperativeHandle;
            React.useLayoutEffect = window.React.useLayoutEffect;
            React.useDebugValue = window.React.useDebugValue;
            
            // Create a custom require function for this module
            const moduleRequire = function(moduleName) {
              if (moduleName === 'react') {
                return React;
              }
              if (moduleName === 'react-dom') {
                return window.ReactDOM;
              }
              if (moduleName === 'lucide-react') {
                // Mock lucide-react icons with simple SVG components
                const mockIcon = (name) => function MockIcon({ size = 24, className = '', ...props }) {
                  return React.createElement('svg', {
                    width: size,
                    height: size,
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    className: className,
                    ...props
                  }, React.createElement('title', null, name));
                };
                
                return {
                  Heart: mockIcon('Heart'),
                  Star: mockIcon('Star'),
                  Zap: mockIcon('Zap'),
                  Mail: mockIcon('Mail'),
                  Lock: mockIcon('Lock'),
                  User: mockIcon('User'),
                  Menu: mockIcon('Menu'),
                  X: mockIcon('X'),
                  ChevronRight: mockIcon('ChevronRight'),
                  ChevronLeft: mockIcon('ChevronLeft'),
                  Check: mockIcon('Check'),
                  AlertCircle: mockIcon('AlertCircle')
                };
              }
              if (moduleName === 'wouter') {
                // Mock wouter with simple components
                return {
                  Link: function Link({ to, children, className, ...props }) {
                    return React.createElement('a', {
                      href: to,
                      className: className,
                      onClick: (e) => { e.preventDefault(); console.log('Navigate to:', to); },
                      ...props
                    }, children);
                  },
                  Route: function Route({ path, children }) {
                    return React.createElement('div', null, children);
                  },
                  useLocation: function useLocation() {
                    return ['/', () => {}];
                  }
                };
              }
              if (moduleName === 'framer-motion') {
                // Mock framer-motion with basic components
                const motionProxy = new Proxy({}, {
                  get: (target, prop) => {
                    // Return a component for any HTML element (motion.div, motion.img, etc.)
                    return React.forwardRef(function MotionComponent({ 
                      children, 
                      initial, 
                      animate, 
                      exit, 
                      transition, 
                      variants,
                      custom,
                      whileHover,
                      whileTap,
                      ...props 
                    }, ref) {
                      // Filter out animation props that aren't valid HTML attributes
                      const htmlProps = { ...props, ref };
                      
                      // Remove animation-specific props
                      delete htmlProps.initial;
                      delete htmlProps.animate;
                      delete htmlProps.exit;
                      delete htmlProps.transition;
                      delete htmlProps.variants;
                      delete htmlProps.custom;
                      delete htmlProps.whileHover;
                      delete htmlProps.whileTap;
                      
                      // Render as regular HTML element, ignoring animations
                      try {
                        return React.createElement(String(prop), htmlProps, children);
                      } catch (e) {
                        console.error('Error rendering motion.' + prop, e);
                        return React.createElement('div', htmlProps, children);
                      }
                    });
                  }
                });
                
                return {
                  motion: motionProxy,
                  AnimatePresence: function AnimatePresence({ children, initial, custom, mode }) {
                    // Just render children without animation
                    // AnimatePresence is a wrapper that doesn't render anything itself
                    return children;
                  },
                  useAnimation: function useAnimation() {
                    return { 
                      start: () => Promise.resolve(), 
                      stop: () => {} 
                    };
                  },
                  useMotionValue: function useMotionValue(initial) {
                    return { 
                      get: () => initial, 
                      set: () => {},
                      on: () => () => {}
                    };
                  },
                  useTransform: function useTransform(value, input, output) {
                    return value;
                  },
                  useViewportScroll: function useViewportScroll() {
                    return { scrollX: { get: () => 0 }, scrollY: { get: () => 0 } };
                  }
                };
              }
              // For relative imports, use __require
              return __require(moduleName);
            };
            
            const moduleFunc = new Function('module', 'exports', 'require', '__require', 'React', 'ReactDOM', compiled);
            moduleFunc(module, exports, moduleRequire, __require, React, window.ReactDOM);
            
            // Cache the module
            const moduleResult = module.exports || exports.default || exports;
            
            // Debug: log what we're returning
            console.log('Module loaded:', path, 'Type:', typeof moduleResult, 'Keys:', Object.keys(moduleResult || {}));
            
            __modules[path] = moduleResult;
            return __modules[path];
            
          } catch (err) {
            console.error('Error in ' + path + ':', err);
            console.error('Source:', b64ToUtf8(encodedFiles[path]));
            throw new Error('Runtime error in ' + path + ': ' + err.message);
          }
        }
        
        // Load entry module
        let Component = __require('${entryFile}');
        
        // Handle different export patterns
        if (Component && typeof Component === 'object' && Component.default) {
          Component = Component.default;
        }
        
        console.log('Final component:', typeof Component, Component);
        
        if (!Component) {
          document.getElementById('root').innerHTML = '<div class="error-display">⚠ No component found to render.<br><br>Make sure your file exports a default component.</div>';
        } else if (typeof Component !== 'function') {
          document.getElementById('root').innerHTML = '<div class="error-display">⚠ Invalid component.<br><br>Expected a function or class component, got: ' + typeof Component + '<br><br>Value: ' + JSON.stringify(Object.keys(Component || {})) + '</div>';
        } else {
          try {
            const root = window.ReactDOM.createRoot(document.getElementById('root'));
            const element = window.React.createElement(Component);
            console.log('Created element:', element);
            root.render(element);
          } catch (renderErr) {
            console.error('Render error:', renderErr);
            document.getElementById('root').innerHTML = '<div class="error-display">⚠ Render Error<br><br>' + String(renderErr.message || renderErr) + '<br><br>' + String(renderErr.stack || '') + '</div>';
          }
        }
        
      } catch (err) {
        console.error('Preview error:', err);
        document.getElementById('root').innerHTML = 
          '<div class="error-display">' +
          '<strong>⚠ Preview Error</strong><br><br>' +
          String(err.message || err) + 
          (err.stack ? '<br><br>' + String(err.stack) : '') +
          '</div>';
      }
    })();
  </script>
</body>
</html>`
  
  return html
}

// Enhanced runtime bundler endpoint
app.post('/runtime-bundle', (req, res) => {
  try {
    const { files: postedFiles, entry, code } = req.body || {}
    
    // Single file mode (backwards compatible)
    if (code && typeof code === 'string' && !postedFiles) {
      const tempFiles = { 'component.tsx': code }
      const html = generateBundledHTML(tempFiles, 'component.tsx')
      return res.json({ html })
    }
    
    // Multi-file mode
    if (!postedFiles || typeof postedFiles !== 'object') {
      return res.status(400).json({ error: 'No files provided' })
    }
    
    let entryFile = entry
    
    if (!entryFile) {
      const fileKeys = Object.keys(postedFiles)
      if (fileKeys.length === 0) {
        return res.status(400).json({ error: 'No files provided' })
      }
      
      entryFile = fileKeys.find(key => {
        const content = postedFiles[key]
        return /export\s+default\s+/m.test(content)
      })
      
      if (!entryFile) {
        entryFile = fileKeys[0]
      }
    }
    
    if (!postedFiles[entryFile]) {
      return res.status(400).json({ error: `Entry file not found: ${entryFile}` })
    }
    
    const html = generateBundledHTML(postedFiles, entryFile)
    
    return res.json({ html })
    
  } catch (error) {
    console.error('runtime-bundle error:', error)
    return res.status(500).json({ 
      error: error.message || String(error),
      stack: error.stack
    })
  }
})

// Backwards-compatible alias
app.post('/bundle', (req, res) => {
  try {
    const { files: postedFiles, entry, code } = req.body || {}
    let entryCode = ''

    if (code && typeof code === 'string') {
      entryCode = code
    } else if (postedFiles && entry && postedFiles[entry]) {
      entryCode = postedFiles[entry]
    } else if (postedFiles && Object.keys(postedFiles).length > 0) {
      const firstKey = Object.keys(postedFiles)[0]
      entryCode = postedFiles[firstKey]
    } else {
      return res.status(400).json({ error: 'No code or files provided' })
    }

    const safeCode = String(entryCode).replace(/<\/script>/gi, '<\\/script>')
    const encoded = Buffer.from(safeCode, 'utf8').toString('base64')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>body{margin:0;font-family:Inter,system-ui,Arial,sans-serif}#root{padding:20px}</style></head><body><div id="root"></div><script>(function(){try;function b64ToUtf8(b64){return decodeURIComponent(Array.prototype.map.call(atob(b64),function(c){return'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)}).join(''))}const sourceCode=b64ToUtf8('${encoded}');const compiled=Babel.transform(sourceCode,{presets:['react','typescript'],filename:'component.tsx'}).code;const execute=new Function('React','ReactDOM',compiled+'\nreturn typeof Component !== "undefined" ? Component : null;');const Component=execute(window.React,window.ReactDOM);if(!Component){document.getElementById('root').innerHTML='<div style="color:orange">No component found to render</div>'}else{const root=window.ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(Component))}}catch(err){document.getElementById('root').innerHTML='<pre style="color:red">'+String(err.message||err)+'\n'+String(err.stack||'')+'</pre>';console.error('Bundler exec error',err)}})();</script></body></html>`
    return res.json({ html })
  } catch (error) {
    console.error('bundle alias error', error)
    return res.status(500).json({ error: error.message || String(error) })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✓ AI Code Editor running on http://localhost:${PORT}`)
  console.log(`✓ Groq API configured: ${GROQ_API_KEY ? 'Yes' : 'No'}`)
})
