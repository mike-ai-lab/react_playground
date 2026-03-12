I have prepared the code playground. It includes a dynamic JSX compiler, an isolated runtime environment, and a safety boundary to catch errors gracefully without breaking the layout. The default template features an interactive interior design configurator tailored to Najdi and Modern architectural styles.

### Execution Instructions

To run this code:

1. Ensure you have a standard React setup (like Next.js or Vite) with Tailwind CSS installed and configured.
2. Replace your main `App.jsx` or `App.tsx` file with the code provided above.
3. Start your local development server. The application will automatically fetch the Babel compiler in the background and render the default Najdi architectural preview on the right canvas.

import React, { useState, useEffect, useRef } from 'react';

// Error Boundary to catch runtime errors within the dynamically generated component
// This prevents the entire application from crashing if the user writes faulty code.
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
      return null; // The error is displayed via the parent component's alert box
    }
    return this.props.children;
  }
}

// Default architectural playground code
const DEFAULT_CODE = `function InteriorConfigurator() {
  const [theme, setTheme] = React.useState('Najdi');

  const themes = {
    Najdi: { 
      bg: 'bg-[#f4e8d3]', 
      text: 'text-[#5a3e2b]', 
      desc: 'Earthy tones, traditional geometric patterns, and natural materials inspired by central Saudi architecture.' 
    },
    Modern: { 
      bg: 'bg-slate-100', 
      text: 'text-slate-800', 
      desc: 'Sleek lines, minimalist furniture, and expansive use of glass and steel optimized for the local climate.' 
    }
  };

  return (
    <div className={\`min-h-full p-8 transition-colors duration-500 \${themes[theme].bg}\`}>
      <div className={\`max-w-xl mx-auto bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40 \${themes[theme].text}\`}>
        <h2 className="text-3xl font-bold mb-6">Design Studio Preview</h2>
        <p className="mb-8 text-lg leading-relaxed">{themes[theme].desc}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setTheme('Najdi')}
            className={\`px-6 py-3 rounded-lg font-medium transition-all shadow-sm \${theme === 'Najdi' ? 'bg-[#5a3e2b] text-white' : 'bg-white border border-[#5a3e2b]/30'}\`}
          >
            Najdi Heritage
          </button>
          <button 
            onClick={() => setTheme('Modern')}
            className={\`px-6 py-3 rounded-lg font-medium transition-all shadow-sm \${theme === 'Modern' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300'}\`}
          >
            Modern Oasis
          </button>
        </div>
      </div>
    </div>
  );
}

// The code must return the component function so the playground can render it.
return InteriorConfigurator;`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [PreviewComponent, setPreviewComponent] = useState(null);
  const [error, setError] = useState(null);
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [runKey, setRunKey] = useState(0);

  // Dynamically load Babel standalone to transpile JSX in the browser
  useEffect(() => {
    if (window.Babel) {
      setBabelLoaded(true);
      compileAndRender(DEFAULT_CODE);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://unpkg.com/@babel/standalone/babel.min.js";
    script.async = true;
    script.onload = () => {
      setBabelLoaded(true);
      compileAndRender(DEFAULT_CODE); // Compile the initial template once Babel is ready
    };
    script.onerror = () => setError("Failed to load the JSX compiler. Please check your network.");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Core compilation function evaluating the raw string into a React Component
  const compileAndRender = (sourceCode) => {
    setError(null);
    if (!window.Babel) return;

    try {
      // Transpile JSX syntax into standard JavaScript
      const transpiledCode = window.Babel.transform(sourceCode, {
        presets: ['react']
      }).code;

      // Safely evaluate the transpiled code. 
      // We pass 'React' as an argument so the evaluated code has access to it.
      const createComponent = new Function('React', transpiledCode);
      const GeneratedComponent = createComponent(React);

      if (typeof GeneratedComponent !== 'function') {
        throw new Error("Execution Error: Your code must return a valid React component function at the end (e.g., 'return MyComponent;').");
      }

      // Update the canvas and reset the Error Boundary key to clear previous runtime errors
      setPreviewComponent(() => GeneratedComponent);
      setRunKey(prev => prev + 1);
    } catch (err) {
      // Catch compilation and syntax errors
      setError(err.message);
    }
  };

  const handleRunClick = () => {
    if (!babelLoaded) {
      setError("Compiler is still loading, please wait a moment.");
      return;
    }
    compileAndRender(code);
  };

  // Allow using the 'Tab' key inside the textarea without leaving focus
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      
      // Reset cursor position slightly after render
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700/50">
        <h1 className="font-semibold text-lg text-slate-200 tracking-wide">
          React Design Playground
        </h1>
        <div className="flex items-center gap-4">
          {!babelLoaded && <span className="text-sm text-slate-400">Loading Compiler...</span>}
          <button 
            onClick={handleRunClick}
            disabled={!babelLoaded}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Run Code
          </button>
        </div>
      </header>

      {/* Split View Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Code Editor (Dark Mode) */}
        <div className="w-1/2 flex flex-col border-r border-slate-700/50 bg-[#1e1e1e]">
          <div className="text-xs text-slate-400 uppercase tracking-wider px-4 py-2 border-b border-slate-800 bg-[#1e1e1e]">
            Live Editor (.jsx)
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

        {/* Right: Dynamic Renderer Canvas (Light Mode) */}
        <div className="w-1/2 relative bg-slate-50 flex flex-col">
          <div className="text-xs text-slate-500 uppercase tracking-wider px-4 py-2 border-b border-slate-200 bg-white z-10 shadow-sm">
            Canvas Preview
          </div>
          
          <div className="flex-1 relative overflow-auto">
            {/* User-Friendly Error Message Box */}
            {error && (
              <div className="absolute top-6 left-6 right-6 z-20 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-red-500 mt-0.5">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Compilation / Runtime Error</h3>
                    <div className="mt-1 text-sm text-red-700 whitespace-pre-wrap font-mono">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* The dynamically evaluated React component runs securely within this boundary */}
            <div className="h-full w-full">
              <ErrorBoundary key={runKey} onError={setError}>
                {PreviewComponent ? <PreviewComponent /> : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Initializing rendering environment...
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}