// Default sample code
const defaultCode = `import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(\`Login with: \${email}\`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Sign In</button>
        </form>
      </div>
    </div>
  );
}`;

document.getElementById('codeEditor').value = defaultCode;

function parseImports(code) {
  const imports = [];
  const importRegex = /import\s+(?:(\w+)|(?:\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const specifiers = [];
    if (match[1]) specifiers.push(match[1]);
    if (match[2]) {
      match[2].split(',').forEach((name) => {
        const cleaned = name.trim().split(/\s+as\s+/).pop();
        if (cleaned && cleaned.trim().length > 0) specifiers.push(cleaned.trim());
      });
    }
    imports.push({ source: match[3], specifiers: Array.from(new Set(specifiers)) });
  }
  return imports;
}

function transformCode(code, imports) {
  const lines = code.split('\n');
  const cleanedLines = [];
  let inImportBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ')) {
      inImportBlock = true;
      if (line.includes(';') || (line.includes('from') && line.match(/"/g) && line.match(/"/g).length === 2)) {
        inImportBlock = false;
        continue;
      }
      continue;
    }
    if (inImportBlock) {
      if (line.includes(';') || line.includes('from')) inImportBlock = false;
      continue;
    }
    cleanedLines.push(lines[i]);
  }
  
  let transformed = cleanedLines.join('\n');
  const injections = [];
  const injectedNames = new Set();
  
  imports.forEach(function(imp) {
    imp.specifiers.forEach(function(spec) {
      if (injectedNames.has(spec) || !spec || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(spec)) return;
      injectedNames.add(spec);
      
      if (imp.source.includes('lucide-react') || imp.source.includes('lucide')) {
        injections.push("const " + spec + " = (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }));");
      } else if (spec === 'Link') {
        injections.push("const Link = ({ to, href, children, ...props }) => React.createElement('a', { href: to || href || '#', ...props }, children);");
      } else if (!['react', 'react-dom'].includes(imp.source)) {
        injections.push("const " + spec + " = ({ children, ...props }) => React.createElement('div', props, children);");
      }
    });
  });
  
  transformed = injections.join('\n') + '\n\n' + transformed;
  transformed = transformed.replace(/export\s+default\s+function\s+(\w+)/, 'function $1').replace(/export\s+default\s+/, 'const Component = ');
  return transformed.trim();
}

function generateBundledPreview(code) {
  try {
    const imports = parseImports(code);
    const transformedCode = transformCode(code, imports);
    const encoded = encodeURIComponent(transformedCode);
    
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script><script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script><script src="https://cdn.tailwindcss.com"><\/script><style>body{margin:0;padding:0}#root{min-height:100vh}.error-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.95);color:white;padding:30px;font-family:monospace;font-size:14px;overflow:auto;z-index:9999}.error-title{color:#ef4444;font-size:20px;font-weight:bold;margin-bottom:20px}.error-content{background:#1f2937;padding:20px;border-left:4px solid #ef4444;white-space:pre-wrap}<\/style><\/head><body><div id="root"><\/div><script>(function(){let hasError=false;let loadAttempts=0;const maxLoadAttempts=50;function showError(title,message){if(hasError)return;hasError=true;console.error("[Canvas]",title,message);const overlay=document.createElement("div");overlay.className="error-overlay";overlay.innerHTML="<div class=\\"error-title\\">"+title+"<\/div><div class=\\"error-content\\">"+String(message).replace(/</g,"&lt;").replace(/>/g,"&gt;")+"<\/div>";document.body.appendChild(overlay)}function checkLibrariesLoaded(){loadAttempts++;if(window.React&&window.ReactDOM&&window.Babel){console.log("[Canvas] Libraries loaded");initComponent()}else if(loadAttempts>=maxLoadAttempts){showError("Library Loading Timeout","Failed to load React, ReactDOM, or Babel from CDN")}else{setTimeout(checkLibrariesLoaded,100)}}function initComponent(){try{const rootElement=document.getElementById("root");if(!rootElement)throw new Error("Root element not found");const{useState,useEffect,useRef,useCallback,useMemo,useContext,useReducer,createElement,Fragment}=window.React;const sourceCode=decodeURIComponent("' + encoded + '");const compiled=window.Babel.transform(sourceCode,{presets:["react","typescript"],filename:"component.tsx"});const executeCode=new Function("React","ReactDOM","createElement","Fragment","useState","useEffect","useRef","useCallback","useMemo","useContext","useReducer",compiled.code+"\\nreturn typeof Component!==\\"undefined\\"?Component:null;");const Component=executeCode(window.React,window.ReactDOM,createElement,Fragment,useState,useEffect,useRef,useCallback,useMemo,useContext,useReducer);if(!Component||typeof Component!=="function"){throw new Error("No valid component found")}const root=window.ReactDOM.createRoot(rootElement);root.render(createElement(Component));console.log("[Canvas] Render complete")}catch(error){console.error("[Canvas] Error:",error);showError("Component Error",error.message+"\\n\\n"+(error.stack||""))}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",checkLibrariesLoaded)}else{checkLibrariesLoaded()}window.addEventListener("error",function(event){if(event.message==="Script error.")return;console.error("[Canvas] Global error:",event.error);if(!hasError){showError("Runtime Error",event.message)}})})()<\/script><\/body><\/html>';
  } catch (error) {
    return '<!DOCTYPE html><html><body><div style="padding:20px;color:red">Error: ' + error.message + '<\/div><\/body><\/html>';
  }
}

function runCode() {
  const code = document.getElementById('codeEditor').value;
  const errorMessage = document.getElementById('errorMessage');
  const previewFrame = document.getElementById('previewFrame');
  errorMessage.classList.remove('show');
  try {
    const html = generateBundledPreview(code);
    previewFrame.srcdoc = html;
  } catch (error) {
    errorMessage.textContent = 'Error: ' + error.message;
    errorMessage.classList.add('show');
  }
}

window.addEventListener('load', function() { runCode(); });

document.getElementById('codeEditor').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 2;
  }
});