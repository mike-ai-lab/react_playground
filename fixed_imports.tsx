import React, { useState, useEffect } from 'react';

// Error Boundary for runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const DEFAULT_CODE = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'lucide-react';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&h=600&fit=crop'
  ];

  const next = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="relative w-full max-w-4xl h-[400px] overflow-hidden rounded-2xl shadow-2xl bg-black">
        {images.map((image, index) => (
          <div
            key={index}
            className={\`absolute inset-0 transition-opacity duration-700 \${index === activeIndex ? 'opacity-100' : 'opacity-0'}\`}
          >
            <img src={image} className="w-full h-full object-cover" alt="Slide" />
          </div>
        ))}
        
        <div className="absolute inset-0 flex justify-between items-center px-4">
          <button onClick={prev} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all">
            <FiChevronLeft size={32} />
          </button>
          <button onClick={next} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all">
            <FiChevronRight size={32} />
          </button>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <div key={i} className={\`h-1.5 transition-all rounded-full \${i === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}\`} />
          ))}
        </div>
      </div>
      <p className="mt-6 text-gray-500 font-medium italic text-center">
        Note: framer-motion animations are simplified in this preview mock.
      </p>
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
    return () => { if (script.parentNode) document.head.removeChild(script); };
  }, []);

  const compileAndRender = (sourceCode) => {
    setError(null);
    if (!window.Babel) return;
    const timestamp = new Date().toLocaleTimeString();
    let logEntry = { time: timestamp, error: null, success: false };

    try {
      const { cleanCode, mocks } = processImports(sourceCode);
      const processedCode = processExports(cleanCode);
      // We wrap the code and explicitly return the last evaluated expression if it's not a return
      const wrappedCode = `(function() { 
        const React = window.React;
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        ${mocks}
        ${processedCode} 
      })()`;
      
      const transpiledCode = window.Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        filename: 'component.tsx'
      }).code;

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

  const handleRunClick = () => {
    if (!babelLoaded) return;
    compileAndRender(code);
  };

  const processImports = (code) => {
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
            namedImports.split(',').forEach(name => {
              const cleaned = name.trim().split(/\s+as\s+/).pop().trim();
              if (cleaned) imports.push({ name: cleaned, source });
            });
          }
        }
        if (line.includes(';') || (line.includes('from') && line.match(/['"]/) && line.match(/['"]/).length >= 2)) inImportBlock = false;
        continue;
      }
      if (inImportBlock) {
        if (line.includes(';') || line.includes('from')) inImportBlock = false;
        continue;
      }
      cleanLines.push(lines[i]);
    }

    const mocks = imports.map(imp => {
      // Specialized Mocks for Chevron Icons
      if (imp.name === 'FiChevronLeft') {
        return `const FiChevronLeft = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, React.createElement('polyline', { points: '15 18 9 12 15 6' }));`;
      }
      if (imp.name === 'FiChevronRight') {
        return `const FiChevronRight = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, React.createElement('polyline', { points: '9 18 15 12 9 6' }));`;
      }
      // General SVG mock
      if (imp.source.includes('lucide') || imp.source.includes('react-icons') || imp.source.includes('fi')) {
        return `const ${imp.name} = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, ...props }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }));`;
      } 
      if (imp.source.includes('framer-motion')) {
        return `const motion = { div: (props) => React.createElement('div', props), span: (props) => React.createElement('span', props), img: (props) => React.createElement('img', props), button: (props) => React.createElement('button', props) };`;
      }
      return '';
    }).filter(Boolean).join('\n');

    return { cleanCode: cleanLines.join('\n'), mocks };
  };

  const processExports = (code) => {
    let processed = code;
    
    // Find the name in "export default Name"
    const exportDefaultMatch = processed.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
    const componentName = exportDefaultMatch ? exportDefaultMatch[1] : null;

    // Remove the export keywords but keep the declarations
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');

    // Ensure the IIFE returns the component
    if (componentName) {
      // Clean up existing manual returns of that component name to prevent duplicates
      processed = processed.replace(new RegExp(`return\\s+${componentName};?`, 'g'), '');
      processed += `\nreturn ${componentName};`;
    }
    
    return processed;
  };

  const generatePreviewHTML = (transpiledCode) => {
    const encoded = encodeURIComponent(transpiledCode);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; background: #f8fafc; overflow-x: hidden; } #root { min-height: 100vh; }</style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      try {
        const React = window.React;
        const source = decodeURIComponent("${encoded}");
        // Execute the transpiled code which returns the Component function
        const Component = eval(source);
        
        if (typeof Component !== 'function') {
           throw new Error('Code evaluation did not return a component function.');
        }

        const root = window.ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));
      } catch (e) {
        document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace;"><h2>Preview Error</h2>' + e.message + '</div>';
      }
    })();
  </script>
</body>
</html>`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setCode(code.substring(0, start) + '  ' + code.substring(end));
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/50 text-white">
        <h1 className="font-semibold text-lg">Muhamad's Design Studio</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowConsole(!showConsole)} className="px-4 py-2 bg-slate-700 rounded-md text-sm transition-colors">
            Console ({history.length})
          </button>
          <button onClick={handleRunClick} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md font-medium transition-colors">
            Update Preview
          </button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full bg-transparent text-slate-300 font-mono text-sm p-6 outline-none resize-none"
            spellCheck="false"
          />
        </div>
        <div className="w-1/2 flex flex-col bg-white">
          <iframe key={runKey} srcDoc={previewHTML} className="w-full h-full border-none" sandbox="allow-scripts" />
        </div>
      </main>
      {showConsole && (
        <div className="h-48 border-t border-slate-700 bg-slate-800 overflow-auto p-4 font-mono text-xs text-slate-300">
          {history.length === 0 ? "No logs yet..." : history.map((entry, i) => (
            <div key={i} className="mb-1 border-b border-slate-700/50 pb-1">
              <span className={entry.success ? "text-emerald-400" : "text-red-400"}>
                [{entry.time}] {entry.success ? "Successfully Rendered" : entry.error}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}