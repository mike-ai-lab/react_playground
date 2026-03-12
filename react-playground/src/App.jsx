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

const ARCHITECTURAL_CODE = `import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Layers, 
  Compass, 
  Home, 
  ArrowUpRight 
} from 'lucide-react';

const PROJECTS = [
  {
    id: 1,
    title: "Najd Modern Villa",
    location: "Riyadh, KSA",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600",
    description: "Integrating traditional Salmani architecture with contemporary glass-and-steel minimalism."
  },
  {
    id: 2,
    title: "Luxe Majlis Suite",
    location: "Jeddah, KSA",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600",
    description: "A reimagined hospitality space blending cultural seating heritage with premium marble finishes."
  },
  {
    id: 3,
    title: "Corporate Oasis Hub",
    location: "NEOM, KSA",
    category: "Design",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600",
    description: "Biophilic office design focused on sustainability and productivity in extreme climates."
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === PROJECTS.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? PROJECTS.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div 
      className="relative h-[70vh] w-full overflow-hidden bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {PROJECTS.map((project, idx) => (
        <div
          key={project.id}
          className={\`absolute inset-0 transition-opacity duration-1000 ease-in-out \${
            idx === current ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          } transform duration-[2000ms]\`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 lg:p-24">
        <div className="max-w-3xl overflow-hidden">
          <p className="text-amber-400 font-medium tracking-[0.2em] uppercase mb-4 translate-y-0 animate-pulse">
            {PROJECTS[current].category}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {PROJECTS[current].title}
          </h2>
          <div className="flex items-center gap-4 text-slate-300 mb-8">
            <Compass size={20} className="text-amber-400" />
            <span className="text-lg">{PROJECTS[current].location}</span>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-white text-slate-950 font-bold rounded-sm hover:bg-amber-400 transition-colors duration-300">
            View Project <ArrowUpRight size={20} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-30 flex gap-4">
        <button 
          onClick={prevSlide}
          className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-30 flex">
        {PROJECTS.map((_, idx) => (
          <div 
            key={idx} 
            className="h-1 flex-1 bg-white/20 cursor-pointer"
            onClick={() => setCurrent(idx)}
          >
            <div 
              className={\`h-full bg-amber-400 transition-all duration-300 \${
                idx === current ? 'w-full' : 'w-0'
              }\`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const services = [
    { title: "Architectural Design", icon: <Home />, desc: "Complete structural concepts from permit to completion." },
    { title: "Interior Mastery", icon: <Layers />, desc: "Tailored luxury interiors for residential and commercial spaces." },
    { title: "Smart Solutions", icon: <Maximize2 />, desc: "Integrating AI and smart tech into modern Middle Eastern living." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 md:p-16 bg-slate-950">
      {services.map((s, i) => (
        <div 
          key={i} 
          className="group p-8 border border-slate-800 rounded-xl hover:border-amber-400/50 transition-all duration-500 bg-slate-900/50"
        >
          <div className="w-14 h-14 flex items-center justify-center bg-slate-800 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors duration-500 mb-6">
            {React.cloneElement(s.icon, { size: 28 })}
          </div>
          <h3 className="text-xl font-bold text-white mb-4">{s.title}</h3>
          <p className="text-slate-400 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-amber-400 selection:text-slate-900">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-900 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 rounded-sm" />
          MUHAMAD <span className="text-amber-400 text-sm font-normal tracking-widest ml-1">STUDIO</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
          <a href="#" className="hover:text-amber-400 transition-colors">Portfolios</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Philosophy</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Riyadh Office</a>
        </div>
        <button className="px-6 py-2 border border-amber-400 text-amber-400 rounded-sm hover:bg-amber-400 hover:text-slate-950 transition-all font-bold text-sm">
          CONSULTATION
        </button>
      </nav>

      <main>
        <HeroSlider />
        
        <div className="max-w-7xl mx-auto py-20 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-amber-400 text-sm font-bold tracking-[0.3em] uppercase mb-4">Our Services</h2>
              <p className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Crafting the future of Arabian living through innovation.
              </p>
            </div>
            <p className="text-slate-400 max-w-sm">
              From the heart of Riyadh, we deliver architectural excellence that honors tradition while embracing the cutting edge.
            </p>
          </div>
          
          <ServicesSection />
        </div>

        <footer className="bg-slate-900 border-t border-slate-800 p-12 text-center">
          <p className="text-slate-500 text-sm mb-4">2024 Muhamad Architectural Business. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;`;

export default function App() {
  const [code, setCode] = useState(ARCHITECTURAL_CODE);
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
        await compileAndRender(ARCHITECTURAL_CODE);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      script.async = true;
      script.onload = async () => {
        setBabelLoaded(true);
        await compileAndRender(ARCHITECTURAL_CODE);
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
    let currentImport = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import ')) {
        inImportBlock = true;
        currentImport = line;
        
        // Check if import is complete on this line
        if (line.includes(';') || (line.includes('from') && line.match(/['"]/) && line.match(/['"]/).length >= 2)) {
          inImportBlock = false;
          parseImportLine(currentImport, imports);
          currentImport = '';
        }
        continue;
      }
      
      if (inImportBlock) {
        currentImport += ' ' + line;
        if (line.includes(';') || line.includes('from')) {
          inImportBlock = false;
          parseImportLine(currentImport, imports);
          currentImport = '';
        }
        continue;
      }
      
      cleanLines.push(lines[i]);
    }

    function parseImportLine(importStr, importsArray) {
      const match = importStr.match(/import\s+(?:(\w+)|(?:\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/);
      if (match) {
        const defaultImport = match[1];
        const namedImports = match[2];
        const source = match[3];
        
        if (defaultImport) importsArray.push({ name: defaultImport, source });
        if (namedImports) {
          namedImports.split(',').forEach(spec => {
            const cleaned = spec.trim().split(/\s+as\s+/).pop().trim();
            if (cleaned) importsArray.push({ name: cleaned, source });
          });
        }
      }
    }

    // Generate mocks
    const mockSet = new Set();
    const mocks = imports.map(imp => {
      // Skip if already mocked
      if (mockSet.has(imp.name)) return '';
      mockSet.add(imp.name);
      
      // Framer Motion - special handling for motion object
      if (imp.source.includes('framer-motion')) {
        if (imp.name === 'motion') {
          return `const motion = { div: (props) => React.createElement('div', props), span: (props) => React.createElement('span', props), img: (props) => React.createElement('img', props), button: (props) => React.createElement('button', props), section: (props) => React.createElement('section', props), article: (props) => React.createElement('article', props), h1: (props) => React.createElement('h1', props), h2: (props) => React.createElement('h2', props), p: (props) => React.createElement('p', props) };`;
        }
        return '';
      }
      
      // Icon libraries - create generic SVG mock for ANY icon
      if (imp.source.includes('lucide') || imp.source.includes('react-icons') || imp.source.includes('fi') || imp.source.includes('fa') || imp.source.includes('md') || imp.source.includes('ai') || imp.source.includes('bi') || imp.source.includes('bs') || imp.source.includes('cg') || imp.source.includes('di') || imp.source.includes('gi') || imp.source.includes('go') || imp.source.includes('gr') || imp.source.includes('hi') || imp.source.includes('im') || imp.source.includes('io') || imp.source.includes('ri') || imp.source.includes('si') || imp.source.includes('tb') || imp.source.includes('ti') || imp.source.includes('vsc') || imp.source.includes('wi')) {
        return `const ${imp.name} = (props) => React.createElement('svg', { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: props.className, ...props }, React.createElement('circle', { cx: 12, cy: 12, r: 10 }));`;
      }
      
      return '';
    }).filter(Boolean).join('\n        ');

    return { cleanCode: cleanLines.join('\n'), mocks };
  };

  const processExports = (code) => {
    let processed = code;
    
    // Find component name in "export default Name"
    let exportDefaultMatch = processed.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
    let componentName = exportDefaultMatch ? exportDefaultMatch[1] : null;
    
    // Remove export keywords
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');
    
    // If no component name found from export, try to find the last component declaration
    if (!componentName) {
      // Look for function declarations: function ComponentName() or const ComponentName = 
      const functionMatches = processed.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g);
      if (functionMatches && functionMatches.length > 0) {
        const lastMatch = functionMatches[functionMatches.length - 1];
        const nameMatch = lastMatch.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
        if (nameMatch) {
          componentName = nameMatch[1];
        }
      }
    }
    
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

  const loadTemplate = (template) => {
    setCode(template);
    if (babelLoaded) {
      compileAndRender(template);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/50">
        <h1 className="font-semibold text-lg text-slate-200 tracking-wide">
          React Playground
        </h1>
        <div className="flex items-center gap-4">
          {!babelLoaded && <span className="text-sm text-slate-400">Loading Compiler...</span>}
          <div className="flex gap-2">
            <button 
              onClick={() => loadTemplate(ARCHITECTURAL_CODE)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
              title="Load Architectural Business Template"
            >
              Architecture
            </button>
            <button 
              onClick={() => loadTemplate(DEFAULT_CODE)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
              title="Load Carousel Template"
            >
              Carousel
            </button>
          </div>
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
