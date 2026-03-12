
# Project Overview
================

This React application is a playground for experimenting with React and TypeScript code. It features a live preview of the code, allowing users to paste and run React and TypeScript code in real-time.

## Features

- **Live Preview**: Users can paste their React and TypeScript code in the editor and see the result in the live preview section.
- **Code Editing**: The application features a code editor where users can paste their code and make changes.
- **Compilation Error Handling**: If the code compilation fails, the application displays an error message with the compilation error details.
- **Module Support**: The application supports React and TypeScript modules, and users can use the `import` statement to import modules.
- **Babel Support**: The application uses Babel to compile the code, and it supports both React and TypeScript presets.

## Usage

1. Paste your React and TypeScript code in the editor.
2. Click the "Run Changes" button to compile and run the code.
3. View the live preview of the code in the preview section.
4. If there is a compilation error, view the error message and details.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## Contact

For any questions or feedback, please contact the maintainer at [muhamad@gmail.com](mailto:muhamad@gmail.com).

## License

This project is licensed under the MIT License.
<div style="page-break-after: always;"></div>

## Code
```
import React, { useState, useEffect, useRef, Component } from 'react';
import * as LucideIcons from 'lucide-react';
import { Play, Code, Layout, AlertCircle, RefreshCw, Copy, Check, Loader2 } from 'lucide-react';

/**
 * React Playground Component
 * Updated by Gemini for Muhamad.
 * Fix: Added TypeScript support to the Babel compiler to handle type annotations
 * like (slideIndex: number), preventing "Unexpected token" errors.
 */

const DEFAULT_CODE = `import React from 'react';
import { Heart, Star, Zap } from 'lucide-react';

// You can now use TypeScript types!
function App() {
  const [liked, setLiked] = React.useState<boolean>(false);
  
  const toggleLike = (status: boolean): void => {
    setLiked(status);
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg border border-slate-200 text-center max-w-sm">
      <div className="flex justify-center gap-2 mb-4">
        <Star className="text-yellow-400" size={24} />
        <Zap className="text-indigo-500 shadow-sm" size={24} />
      </div>
      <h1 className="text-2xl font-bold text-indigo-600 mb-2">
        TypeScript Support
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        Muhamad, I've enabled the TS preset. Type annotations like ": number" will now work.
      </p>
      
      <button 
        onClick={() => toggleLike(!liked)}
        className="group flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-all active:scale-95 border border-slate-200"
      >
        <Heart className={liked ? "fill-red-500 text-red-500" : "text-slate-400 group-hover:text-red-400"} size={20} />
        {liked ? "Liked with TS!" : "Click to Like"}
      </button>
    </div>
  );
}

export default App;`;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.code !== this.props.code) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md w-full bg-white border-l-4 border-orange-500 rounded-r-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <AlertCircle size={18} />
            <h3 className="font-bold text-sm">Runtime Error</h3>
          </div>
          <code className="text-xs text-orange-600 bg-orange-50 p-3 block rounded font-mono overflow-x-auto">
            {this.state.error?.message || "An unknown error occurred during rendering."}
          </code>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [RenderedComponent, setRenderedComponent] = useState(null);

  const compileCode = async (codeString) => {
    setIsCompiling(true);
    setError(null);
    try {
      if (!window.Babel) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      // Pre-process: Strip imports
      let processedCode = codeString.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '');

      // Handle 'export default'
      if (processedCode.includes('export default App')) {
        processedCode = processedCode.replace(/export\s+default\s+App;?/g, '');
      } else {
        processedCode = processedCode.replace(/export\s+default\s+/g, 'const App = ');
      }
      
      processedCode = processedCode.replace(/export\s+const\s+/g, 'const ').trim();

      // Transform using React AND TypeScript presets
      const transformed = window.Babel.transform(processedCode, {
        presets: ['react', 'typescript'],
        filename: 'index.tsx' // Filename hint tells Babel to use the TS parser
      }).code;

      const factory = new Function('React', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'LucideIcons', `
        const { ${Object.keys(LucideIcons).join(', ')} } = LucideIcons;
        try {
          ${transformed}
          return typeof App !== 'undefined' ? App : null;
        } catch (e) {
          throw e;
        }
      `);

      const Component = factory(
        React,
        React.useState,
        React.useEffect,
        React.useMemo,
        React.useCallback,
        React.useRef,
        LucideIcons
      );

      if (!Component) {
        throw new Error("Could not find a component named 'App'. Ensure your code defines or exports 'App'.");
      }

      setRenderedComponent(() => Component);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    compileCode(code);
  }, []);

  const handleRun = () => compileCode(code);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">M</div>
          <h1 className="font-semibold text-slate-800 tracking-tight text-sm">Muhamad's Universal Canvas</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyCode} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={handleRun} 
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-md transition-all shadow-sm active:scale-95"
          >
            {isCompiling ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Run Changes
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Code size={12} /> Editor (Paste TS/React Here)
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            className="flex-1 p-6 bg-transparent text-indigo-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
          />
        </div>

        <div className="w-1/2 flex flex-col bg-slate-100 relative">
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Layout size={12} /> Live Preview
            </span>
            <button onClick={() => { setCode(DEFAULT_CODE); compileCode(DEFAULT_CODE); }} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
            {error ? (
              <div className="max-w-md w-full bg-white border-l-4 border-red-500 rounded-r-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle size={18} />
                  <h3 className="font-bold text-sm">Compilation Error</h3>
                </div>
                <code className="text-xs text-red-500 bg-red-50 p-3 block rounded font-mono overflow-x-auto">
                  {error}
                </code>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ErrorBoundary code={code}>
                  {RenderedComponent ? <RenderedComponent /> : <Loader2 className="animate-spin text-slate-300" size={32} />}
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="h-6 bg-white border-t px-4 flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] justify-between">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
            Modules: React + TS Enabled
          </span>
          <span>Babel Standalone + TypeScript Support</span>
        </div>
        <div>Riyadh, SA | Muhamad Designer Studio</div>
      </footer>
    </div>
  );
};

export default App;

```

<div style="page-break-after: always;"></div>

