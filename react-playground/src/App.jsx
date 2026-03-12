import React, { useState, useEffect } from 'react';

const DEFAULT_CODE = `function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-sm mx-auto mt-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Counter</h1>
      <div className="text-6xl font-bold text-center mb-6">{count}</div>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
        >
          -
        </button>
        <button 
          onClick={() => setCount(0)}
          className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
        >
          +
        </button>
      </div>
    </div>
  );
}

return Counter;`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewHTML, setPreviewHTML] = useState('');
  const [error, setError] = useState(null);
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [showConsole, setShowConsole] = useState(false);

  // Load Babel on mount
  useEffect(() => {
    if (window.Babel) {
      setBabelLoaded(true);
      compileAndRender(DEFAULT_CODE);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
    script.async = true;
    script.onload = () => {
      setBabelLoaded(true);
      compileAndRender(DEFAULT_CODE);
    };
    script.onerror = () => setError('Failed to load Babel compiler');
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const compileAndRender = (sourceCode) => {
    setError(null);
    if (!window.Babel) return;

    const timestamp = new Date().toLocaleTimeString();
    let logEntry = {
      time: timestamp,
      code: sourceCode,
      error: null,
      success: false
    };

    try {
      // Step 1: Parse imports and extract dependencies
      const { cleanCode, imports } = parseImports(sourceCode);
      console.log('Parsed imports:', JSON.stringify(imports, null, 2));
      
      // Step 2: Handle exports
      const processedCode = processExports(cleanCode);
      
      // Step 3: Wrap in IIFE before transpilation
      const wrappedCode = `(function() {\n${processedCode}\n})()`;
      
      // Step 4: Transpile with TypeScript support
      const transpiledCode = window.Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        filename: 'component.tsx'
      }).code;

      // Step 5: Generate bundled HTML with dynamic imports
      const html = generatePreviewHTML(transpiledCode, imports);
      setPreviewHTML(html);
      setRunKey(prev => prev + 1);
      logEntry.success = true;
    } catch (err) {
      setError(err.message);
      logEntry.error = err.message;
    }

    setHistory(prev => [...prev, logEntry]);
  };

  const parseImports = (code) => {
    const lines = code.split('\n');
    const cleanLines = [];
    const imports = [];
    let inImportBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import ')) {
        inImportBlock = true;
        
        // Parse import statement
        const match = line.match(/import\s+(?:(\w+)|(?:\{([^}]+)\})|(\*\s+as\s+\w+))\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const defaultImport = match[1];
          const namedImports = match[2];
          const namespaceImport = match[3];
          let source = match[4];
          
          // Fix common mismatches: FiXxx icons are from react-icons/fi, not lucide-react
          if (namedImports && (namedImports.includes('Fi') || namedImports.startsWith('Fi')) && source === 'lucide-react') {
            source = 'react-icons/fi';
          }
          
          const importInfo = { source, specifiers: [] };
          
          if (defaultImport) {
            importInfo.specifiers.push({ type: 'default', name: defaultImport });
          }
          if (namedImports) {
            namedImports.split(',').forEach(spec => {
              const parts = spec.trim().split(/\s+as\s+/);
              const imported = parts[0].trim();
              const local = parts[1] ? parts[1].trim() : imported;
              importInfo.specifiers.push({ type: 'named', imported, local });
            });
          }
          if (namespaceImport) {
            const nsMatch = namespaceImport.match(/\*\s+as\s+(\w+)/);
            if (nsMatch) {
              importInfo.specifiers.push({ type: 'namespace', name: nsMatch[1] });
            }
          }
          
          imports.push(importInfo);
        }
        
        if (line.includes(';') || (line.includes('from') && line.match(/['"]/) && line.match(/['"]/).length >= 2)) {
          inImportBlock = false;
        }
        continue;
      }
      
      if (inImportBlock) {
        if (line.includes(';') || line.includes('from')) inImportBlock = false;
        continue;
      }
      
      cleanLines.push(lines[i]);
    }

    return { cleanCode: cleanLines.join('\n'), imports };
  };

  const processExports = (code) => {
    let processed = code;
    
    // Remove all export statements first
    processed = processed.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');
    
    // Remove any standalone component name at the end (like "App;" or "Component;")
    processed = processed.replace(/\n\s*([A-Z][a-zA-Z0-9]*)\s*;\s*$/g, '');
    
    // Find the main component function or const name
    const functionMatch = processed.match(/function\s+([A-Z][a-zA-Z0-9]*)/);
    const constMatch = processed.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*[:=]/);
    const componentName = functionMatch?.[1] || constMatch?.[1];
    
    // Always add return statement if we found a component
    if (componentName) {
      const returnStatement = `return ${componentName};`;
      // Only add if not already present
      if (!processed.includes(returnStatement)) {
        processed = processed.trim() + `\n\n${returnStatement}`;
      }
    }
    
    return processed;
  };

  const generatePreviewHTML = (transpiledCode, imports) => {
    const externalImports = imports.filter(imp => 
      imp.source !== 'react' && 
      imp.source !== 'react-dom' &&
      !imp.source.startsWith('.') &&
      !imp.source.startsWith('/')
    );

    const allImportedNames = externalImports.flatMap(imp => 
      imp.specifiers.map(spec => spec.local || spec.name)
    );

    const hasFramerMotion = externalImports.some(imp => imp.source.includes('framer-motion'));
    const hasIcons = externalImports.some(imp => imp.source.includes('icon') || imp.source.includes('lucide'));

    const iconMappings = externalImports
      .filter(imp => imp.source.includes('icon') || imp.source.includes('lucide'))
      .flatMap(imp => imp.specifiers.map(spec => {
        const iconName = spec.local || spec.name;
        const lucideName = iconName.replace(/^Fi/, '').replace(/^Lu/, '').replace(/^Hi/, '').replace(/^Bi/, '');
        return `const ${iconName} = (props) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }));`;
      }))
      .join('\n          ');

    const motionMappings = hasFramerMotion ? `
          const motion = new Proxy({}, {
            get: () => ({ children, ...props }) => React.createElement('div', props, children)
          });
          const AnimatePresence = ({ children }) => children;` : '';

    const encoded = encodeURIComponent(transpiledCode);
    const importNamesParam = allImportedNames.length > 0 ? ', ' + allImportedNames.map(n => `'${n}'`).join(', ') : '';
    const importNamesArgs = allImportedNames.length > 0 ? ', ' + allImportedNames.join(', ') : '';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; }
    #root { min-height: 100vh; }
    .error-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      color: white;
      padding: 30px;
      font-family: monospace;
      font-size: 14px;
      overflow: auto;
      z-index: 9999;
    }
    .error-title {
      color: #ef4444;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .error-content {
      background: #1f2937;
      padding: 20px;
      border-left: 4px solid #ef4444;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    (function() {
      let hasError = false;
      
      function showError(title, message) {
        if (hasError) return;
        hasError = true;
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';
        overlay.innerHTML = '<div class="error-title">' + title + '</div><div class="error-content">' + String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
        document.body.appendChild(overlay);
      }
      
      function init() {
        try {
          if (!window.React || !window.ReactDOM) {
            throw new Error('React libraries not loaded');
          }
          
          const React = window.React;
          const ReactDOM = window.ReactDOM;
          const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, memo, createElement, Fragment } = React;
          
          ${iconMappings}
          ${motionMappings}
          
          console.log('Loaded imports:', {${allImportedNames.join(', ')}});
          console.log('About to decode source code...');
          
          const sourceCode = decodeURIComponent("${encoded}");
          console.log('Source code decoded, length:', sourceCode.length);
          
          let Component;
          try {
            console.log('Creating function...');
            const evalFunc = new Function('React', 'ReactDOM', 'createElement', 'Fragment', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer', 'useContext', 'createContext', 'memo'${importNamesParam}, 'return ' + sourceCode);
            console.log('Executing function...');
            Component = evalFunc(React, ReactDOM, createElement, Fragment, useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, memo${importNamesArgs});
            console.log('Component created:', typeof Component);
          } catch (e) {
            console.error('Function execution error:', e);
            throw new Error('Execution failed: ' + e.message);
          }
          
          if (!Component || typeof Component !== 'function') {
            throw new Error('No valid component found. Code returned: ' + typeof Component);
          }
          
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(createElement(Component));
        } catch (error) {
          console.error('Init error:', error);
          showError('Component Error', error.message + '\\n\\n' + (error.stack || ''));
        }
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
      
      window.addEventListener('error', function(event) {
        if (!hasError) {
          showError('Runtime Error', event.message);
        }
      });
    })();
  </script>
</body>
</html>`;
  };

  const handleRunClick = () => {
    if (!babelLoaded) {
      setError('Compiler still loading');
      return;
    }
    compileAndRender(code);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const copyHistoryToClipboard = () => {
    const passed = history.filter(h => h.success).length;
    const failed = history.filter(h => !h.success).length;
    const total = history.length;
    
    let summaryText = '========================================\n';
    summaryText += 'EXECUTION SUMMARY\n';
    summaryText += '========================================\n';
    summaryText += `Total Tests: ${total}\n`;
    summaryText += `Passed: ${passed}\n`;
    summaryText += `Failed: ${failed}\n`;
    summaryText += '========================================\n\n\n';
    
    const historyText = history.map((entry, index) => {
      let text = `========== Test ${index + 1} - ${entry.time} ==========\n\n`;
      text += `CODE:\n${entry.code}\n\n`;
      if (entry.error) {
        text += `ERROR:\n${entry.error}\n`;
      } else {
        text += 'STATUS: Success\n';
      }
      text += '\n' + '='.repeat(50) + '\n\n';
      return text;
    }).join('');
    
    navigator.clipboard.writeText(summaryText + historyText);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/50">
        <h1 className="font-semibold text-lg text-slate-200 tracking-wide">
          React Playground
        </h1>
        <div className="flex items-center gap-4">
          {!babelLoaded && <span className="text-sm text-slate-400">Loading Compiler...</span>}
          <button 
            onClick={() => setShowConsole(!showConsole)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition-colors"
          >
            {showConsole ? 'Hide' : 'Show'} Console ({history.length})
          </button>
          <button 
            onClick={handleRunClick}
            disabled={!babelLoaded}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors shadow-sm"
          >
            Run Code
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-slate-700/50 bg-[#1e1e1e]">
          <div className="text-xs text-slate-400 uppercase tracking-wider px-4 py-2 border-b border-slate-800 bg-[#1e1e1e]">
            Editor
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="flex-1 w-full bg-transparent text-slate-300 font-mono text-[14px] p-6 outline-none resize-none leading-relaxed"
            placeholder="Write your React component here..."
          />
        </div>

        <div className="w-1/2 relative bg-slate-50 flex flex-col">
          <div className="text-xs text-slate-500 uppercase tracking-wider px-4 py-2 border-b border-slate-200 bg-white z-10 shadow-sm">
            Preview
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {error && (
              <div className="absolute top-6 left-6 right-6 z-20 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500 mt-0.5">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Compilation Error</h3>
                    <div className="mt-1 text-sm text-red-700 whitespace-pre-wrap font-mono">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <iframe
              key={runKey}
              srcDoc={previewHTML}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts"
              title="Preview"
            />
          </div>
        </div>
      </main>

      {showConsole && (
        <div className="h-64 border-t border-slate-700 bg-slate-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
            <span className="text-sm text-slate-300 font-medium">Execution History</span>
            <div className="flex gap-2">
              <button 
                onClick={copyHistoryToClipboard}
                disabled={history.length === 0}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Copy All
              </button>
              <button 
                onClick={clearHistory}
                disabled={history.length === 0}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300">
            {history.length === 0 ? (
              <div className="text-slate-500 text-center py-8">No execution history yet</div>
            ) : (
              history.map((entry, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-slate-700 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Test {index + 1}</span>
                    <span className="text-slate-500">{entry.time}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded mb-2">
                    <div className="text-slate-500 text-xs mb-1">CODE:</div>
                    <pre className="text-slate-300 whitespace-pre-wrap">{entry.code}</pre>
                  </div>
                  {entry.error ? (
                    <div className="bg-red-900/30 border border-red-700 p-3 rounded">
                      <div className="text-red-400 text-xs mb-1">ERROR:</div>
                      <pre className="text-red-300 whitespace-pre-wrap">{entry.error}</pre>
                    </div>
                  ) : (
                    <div className="bg-green-900/30 border border-green-700 p-2 rounded">
                      <span className="text-green-400 text-xs">SUCCESS</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
