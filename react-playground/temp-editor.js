// Code editor functionality
import { state } from './state.js';
import { log } from './logger.js';

export function updateLineNumbers() {
  const textarea = document.getElementById('code-editor');
  const lineNumbersEl = document.getElementById('line-numbers');
  const lines = textarea.value.split('\n').length;
  lineNumbersEl.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('\n');
  
  syncLineNumbersScroll();
}

export function syncLineNumbersScroll() {
  const textarea = document.getElementById('code-editor');
  const lineNumbersEl = document.getElementById('line-numbers');
  
  if (textarea && lineNumbersEl) {
    lineNumbersEl.scrollTop = textarea.scrollTop;
  }
}

export function saveToHistory() {
  const now = Date.now();
  if (now - state.lastSaveTime < 1000) return; // Debounce 1 second
  state.lastSaveTime = now;
  
  const code = document.getElementById('code-editor').value;
  if (state.history.length === 0 || code !== state.history[state.historyIndex]) {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(code);
    state.historyIndex = state.history.length - 1;
    updateHistoryButtons();
    log('Code saved to history', 'debug', { historyLength: state.history.length });
  }
}

export function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    document.getElementById('code-editor').value = state.history[state.historyIndex];
    updateLineNumbers();
    updateHistoryButtons();
    log('Undo performed', 'info', { historyIndex: state.historyIndex });
  }
}

export function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    document.getElementById('code-editor').value = state.history[state.historyIndex];
    updateLineNumbers();
    updateHistoryButtons();
    log('Redo performed', 'info', { historyIndex: state.historyIndex });
  }
}

export function updateHistoryButtons() {
  document.getElementById('undo-btn').disabled = state.historyIndex <= 0;
  document.getElementById('redo-btn').disabled = state.historyIndex >= state.history.length - 1;
  document.getElementById('history-info').textContent = 
    state.history.length > 0 ? `${state.historyIndex + 1}/${state.history.length}` : 'No history';
}

export function copyCode() {
  const textarea = document.getElementById('code-editor');
  textarea.select();
  document.execCommand('copy');
  alert('Code copied!');
  log('Code copied to clipboard', 'success');
}

export function clearCode() {
  if (confirm('Clear all code?')) {
    document.getElementById('code-editor').value = '';
    updateLineNumbers();
    saveToHistory();
    log('Code cleared', 'info');
  }
}

export function initializeEditor() {
  const defaultCode = `import React, { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container">
      <form>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}`;
  
  document.getElementById('code-editor').value = defaultCode;
  updateLineNumbers();
  saveToHistory();
  log('Default code loaded', 'success');
}
