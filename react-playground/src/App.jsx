import React, { useState, useEffect } from 'react';

const DEFAULT_CODE = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop'
  ];

  return (
    <div className="w-full h-screen flex overflow-hidden relative bg-gray-900">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ x: index === activeIndex ? 0 : '100%' }}
          animate={{ x: index === activeIndex ? 0 : '100%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-full h-full"
          style={{ display: index === activeIndex ? 'block' : 'none' }}
        >
          <img
            src={image}
            alt={\`Image \${index + 1}\`}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      ))}
      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-8">
        <button
          className="bg-white/80 p-4 rounded-full hover:bg-white transition-colors duration-200"
          onClick={() => setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
        >
          <FiChevronLeft size={32} />
        </button>
        <button
          className="bg-white/80 p-4 rounded-full hover:bg-white transition-colors duration-200"
          onClick={() => setActiveIndex((prevIndex) => (prevIndex + 1) % images.length)}
        >
          <FiChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;`;

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
    const loadBabel = async () => {
      if (window.Babel) {
        setBabelLoaded(true);
        await compileAndRender(DEFAULT_CODE);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      script.async = true;
      script.onload = async () => {
        setBabelLoaded(true);
        await compileAndRender(DEFAULT_CODE);
      };
      script.onerror = () => setError('Failed to load Babel compiler');
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    };
    
    loadBabel();
  }, []);

  const compileAndRender = async (sourceCode) => {
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
      // Parse imports and generate mocks
      const { cleanCode, mocks } = parseImports(sourceCode);
      
      // Process exports
      const processedCode = processExports(cleanCode);
      
      // Wrap code with React and mocks INSIDE the IIFE
      const wrappedCode = `(function() { 
        const React = window.React;
        const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext } = React;
        ${mocks}
        ${processedCode}
      })()`;
      
      // Transpile
      const transpiledCode = window.Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        filename: 'component.tsx'
      }).code;

      // Generate preview HTML
      const html = generatePreviewHTML(transpiledCode);
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
        
        const match = line.match(/import\s+(?:(\w+)|(?:\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const defaultImport = match[1];
          const namedImports = match[2];
          const source = match[3];
          
          if (defaultImport) imports.push({ name: defaultImport, source });
          if (namedImports) {
            namedImports.split(',').forEach(spec => {
              const cleaned = spec.trim().split(/\s+as\s+/).pop().trim();
              if (cleaned) imports.push({ name: cleaned, source });
            });
          }
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

    // Generate mocks
    const mocks = imports.map(imp => {
      if (imp.name === 'FiChevronLeft') {
        return `const FiChevronLeft = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, React.createElement('polyline', { points: '15 18 9 12 15 6' }));`;
      }
      if (imp.name === 'FiChevronRight') {
        return `const FiChevronRight = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, React.createElement('polyline', { points: '9 18 15 12 9 6' }));`;
      }
      if (imp.source.includes('lucide') || imp.source.includes('react-icons') || imp.source.includes('fi')) {
        return `const ${imp.name} = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }));`;
      }
      if (imp.source.includes('framer-motion')) {
        return `const motion = { div: (props) => React.createElement('div', props), span: (props) => React.createElement('span', props), img: (props) => React.createElement('img', props), button: (props) => React.createElement('button', props) };`;
      }
      return '';
    }).filter(Boolean).join('\n        ');

    return { cleanCode: cleanLines.join('\n'), mocks };
  };

  const processExports = (code) => {
    let processed = code;
    
    // Find component name in "export default Name"
    const exportDefaultMatch = processed.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
    const componentName = exportDefaultMatch ? exportDefaultMatch[1] : null;
    
    // Remove export keywords
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');
    
    // Ensure IIFE returns the component
    if (componentName) {
      processed = processed.replace(new RegExp(`return\\s+${componentName};?`, 'g'), '');
      processed += `\nreturn ${componentName};`;
    }
    
    return processed.trim();
  };

  const generatePreviewHTML = (transpiledCode) => {
    const encoded = encodeURIComponent(transpiledCode);
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; }
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
  <script>
    (function() {
      try {
        const React = window.React;
        const source = decodeURIComponent("${encoded}");
        
        // Execute the transpiled IIFE which returns the Component
        const Component = eval(source);
        
        if (typeof Component !== 'function') {
          throw new Error('Code evaluation did not return a component function.');
        }

        const root = window.ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));
      } catch (e) {
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';
        overlay.innerHTML = '<div class="error-title">Preview Error</div><div class="error-content">' + e.message + '</div>';
        document.body.appendChild(overlay);
      }
    })();
  </script>
</body>
</html>`;
  };

  const handleRunClick = async () => {
    if (!babelLoaded) {
      setError('Compiler still loading');
      return;
    }
    await compileAndRender(code);
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
