// Node.js script to verify the processExports fix
// This simulates what the app does

const testCases = [
  {
    name: 'Simple function with return',
    input: `function Counter() {
  const [count, setCount] = React.useState(0);
  return <div>{count}</div>;
}

return Counter;`,
    shouldContainIIFE: true
  },
  {
    name: 'Export default function',
    input: `export default function App() {
  return <div>Hello</div>;
}`,
    shouldContainIIFE: true
  },
  {
    name: 'Const component with export',
    input: `import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Carousel = () => {
  return <div>Carousel</div>;
};

export default Carousel;`,
    shouldContainIIFE: true
  }
];

function processExports(code) {
  let processed = code;
  
  // Remove all export statements first
  processed = processed.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
  processed = processed.replace(/export\s+default\s+/g, '');
  processed = processed.replace(/export\s+/g, '');
  
  // Remove any standalone component name at the end
  processed = processed.replace(/\n\s*([A-Z][a-zA-Z0-9]*)\s*;\s*$/g, '');
  
  // Remove any standalone return statements at the end
  processed = processed.replace(/\n\s*return\s+([A-Z][a-zA-Z0-9]*)\s*;\s*$/g, '');
  
  // Find the main component function or const name
  const functionMatch = processed.match(/function\s+([A-Z][a-zA-Z0-9]*)/);
  const constMatch = processed.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*[:=]/);
  const componentName = functionMatch?.[1] || constMatch?.[1];
  
  // Wrap everything in an IIFE that returns the component
  if (componentName) {
    processed = `(function() {\n${processed.trim()}\nreturn ${componentName};\n})()`;
  }
  
  return processed;
}

console.log('Testing processExports function...\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  const result = processExports(test.input);
  
  const hasIIFE = result.startsWith('(function()');
  const hasReturn = result.includes('return ');
  const noStandaloneReturn = !result.match(/^return\s+/m);
  
  const passed = hasIIFE && hasReturn && noStandaloneReturn;
  
  console.log(`  Has IIFE wrapper: ${hasIIFE ? 'YES' : 'NO'}`);
  console.log(`  Has return statement: ${hasReturn ? 'YES' : 'NO'}`);
  console.log(`  No standalone return: ${noStandaloneReturn ? 'YES' : 'NO'}`);
  console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  
  if (!passed) {
    console.log('  Output preview:');
    console.log('  ' + result.substring(0, 200).replace(/\n/g, '\n  '));
  }
  console.log('');
});

console.log('Verification complete.');
