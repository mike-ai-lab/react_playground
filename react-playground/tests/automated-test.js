// Automated test script for React Playground
// Run this in browser console at http://localhost:5174/

const tests = [
  {
    name: 'Counter Component',
    code: `function Counter() {
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

return Counter;`
  },
  {
    name: 'TypeScript Component',
    code: `function TypeScriptDemo() {
  const [count, setCount] = React.useState(0);
  
  const increment = (amount) => {
    setCount(count + amount);
  };
  
  return (
    <div className="p-8 bg-gradient-to-br from-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">TypeScript Works!</h1>
        <p className="text-gray-600 mb-6">Type annotations are fully supported</p>
        <div className="text-6xl font-bold text-center mb-6 text-purple-600">{count}</div>
        <div className="flex gap-2">
          <button 
            onClick={() => increment(1)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            +1
          </button>
          <button 
            onClick={() => increment(5)}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold"
          >
            +5
          </button>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    name: 'Carousel with Motion',
    code: `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'lucide-react';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'
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

export default Carousel;`
  }
];

async function runTests() {
  console.log('Starting automated tests...');
  const results = [];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(\`\nRunning test \${i + 1}: \${test.name}\`);
    
    // Set the code in the editor
    const editor = document.querySelector('textarea');
    if (!editor) {
      console.error('Editor not found!');
      return;
    }
    
    editor.value = test.code;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Click the Run button
    const runButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Run Code'));
    if (!runButton) {
      console.error('Run button not found!');
      return;
    }
    
    runButton.click();
    
    // Wait for compilation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for errors
    const errorElement = document.querySelector('.bg-red-50');
    const hasError = errorElement && errorElement.textContent.length > 0;
    
    // Check if iframe has content
    const iframe = document.querySelector('iframe');
    const hasContent = iframe && iframe.contentDocument && iframe.contentDocument.body.children.length > 0;
    
    const result = {
      name: test.name,
      passed: !hasError && hasContent,
      error: hasError ? errorElement.textContent : null
    };
    
    results.push(result);
    console.log(\`Test \${i + 1} \${result.passed ? 'PASSED' : 'FAILED'}\`);
    if (result.error) {
      console.error('Error:', result.error);
    }
  }
  
  console.log('\n========== TEST RESULTS ==========');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(\`Total: \${results.length}\`);
  console.log(\`Passed: \${passed}\`);
  console.log(\`Failed: \${failed}\`);
  
  results.forEach((r, i) => {
    console.log(\`\${i + 1}. \${r.name}: \${r.passed ? 'PASS' : 'FAIL'}\`);
  });
  
  return results;
}

// Run the tests
runTests();
