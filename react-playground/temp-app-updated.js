// Main application entry point
import { state, loadAPIKey } from './state.js';
import { log, logToConsole, toggleConsolePanel, toggleDebugWindow, clearDebugLog, clearConsole, clearConsoleErrors, copyDebugLog } from './logger.js';
import { 
  updateLineNumbers, 
  syncLineNumbersScroll, 
  saveToHistory, 
  undo, 
  redo, 
  copyCode, 
  clearCode,
  initializeEditor 
} from './editor.js';
import { detectAllErrors, displayErrors } from './errorDetector.js';
import { addChatMessage, toggleChatPanel, clearChat } from './chat.js';
import { startAIFix, updateStatus } from './aiService.js';
import { acceptFix, rejectFix } from './diff.js';
import { renderPreview, togglePreviewPanel, clearPreview, initializePreview } from './preview.js';

// Main error detection function
function detectErrors() {
  log('=== DETECT ERRORS STARTED ===', 'info');
  
  const code = document.getElementById('code-editor').value;
  state.originalCode = code;
  
  log('Code analysis', 'debug', { 
    chars: code.length, 
    lines: code.split('\n').length 
  });
  
  // Log the actual code being analyzed
  log('Code being analyzed:', 'info', code);
  
  updateStatus('Analyzing...', 'processing');
  
  // Clear console
  document.getElementById('console-log').innerHTML = '';
  
  const errors = detectAllErrors(code);
  state.errors = errors;
  
  log('Analysis complete', 'success', { errorsFound: errors.length });
  
  if (errors.length === 0) {
    updateStatus('Valid', 'success');
    logToConsole('✓ No syntax errors found', 'success');
    displayErrors([]);
    document.getElementById('fix-btn').disabled = true;
    log('Code is valid', 'success');
  } else {
    updateStatus(`${errors.length} Error(s)`, 'error');
    
    log('Errors detected', 'error', errors.map(e => ({
      line: e.line,
      column: e.column,
      message: e.message.split('\n')[0]
    })));
    
    // Log errors to console
    errors.forEach((err, i) => {
      logToConsole(`Error ${i + 1} (Line ${err.line}:${err.column})`, 'error', err.message.split('\n')[0], err.line);
    });
    
    displayErrors(errors);
    document.getElementById('fix-btn').disabled = false;
  }
  
  log('=== DETECT ERRORS COMPLETED ===', 'info');
}

// Main AI fix function
async function handleAIFix() {
  const fixBtn = document.getElementById('fix-btn');
  fixBtn.disabled = true;
  
  // Ensure API key is loaded
  if (!state.apiKey) {
    await loadAPIKey();
  }
  
  await startAIFix(state.errors, state.originalCode);
  
  fixBtn.disabled = false;
}

// Attach event listeners
function attachEventListeners() {
  // Header buttons
  document.getElementById('detect-errors-btn').addEventListener('click', detectErrors);
  document.getElementById('fix-btn').addEventListener('click', handleAIFix);
  document.getElementById('toggle-chat').addEventListener('click', toggleChatPanel);
  const togglePreviewBtn = document.getElementById('toggle-preview');
  if (togglePreviewBtn) togglePreviewBtn.addEventListener('click', togglePreviewPanel);
  const renderPreviewBtn = document.getElementById('render-preview-btn');
  if (renderPreviewBtn) renderPreviewBtn.addEventListener('click', renderPreview);
  const clearPreviewBtn = document.getElementById('clear-preview-btn');
  if (clearPreviewBtn) clearPreviewBtn.addEventListener('click', clearPreview);
  document.getElementById('debug-log-btn').addEventListener('click', toggleDebugWindow);
  
  // Editor toolbar
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('redo-btn').addEventListener('click', redo);
  document.getElementById('copy-code-btn').addEventListener('click', copyCode);
  document.getElementById('clear-code-btn').addEventListener('click', clearCode);
  
  // Code editor events
  const codeEditor = document.getElementById('code-editor');
  codeEditor.addEventListener('input', () => {
    updateLineNumbers();
    saveToHistory();
  });
  codeEditor.addEventListener('scroll', syncLineNumbersScroll);
  
  // Diff overlay buttons
  document.getElementById('accept-fix-btn').addEventListener('click', acceptFix);
  document.getElementById('reject-fix-btn').addEventListener('click', rejectFix);
  
  // Chat panel
  document.getElementById('clear-chat-btn').addEventListener('click', clearChat);
  
  // Console panel
  document.getElementById('debug-header').addEventListener('click', toggleConsolePanel);
  document.getElementById('clear-console-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    clearConsole();
  });
  
  // Debug window
  document.getElementById('copy-debug-btn').addEventListener('click', copyDebugLog);
  document.getElementById('clear-debug-btn').addEventListener('click', clearDebugLog);
  document.getElementById('close-debug-btn').addEventListener('click', toggleDebugWindow);
}

// Initialize application
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize React renderer
  await initializePreview();
  log('=== AI Code Fix Pro V3 Initialized ===', 'info');
  
  // Load API key from server
  await loadAPIKey();
  
  // Initialize editor with default code
  initializeEditor();
  
  // Attach all event listeners
  attachEventListeners();
  
  log('Application ready', 'success');
});






