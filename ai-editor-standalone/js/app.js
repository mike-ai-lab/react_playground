// @ts-nocheck
// Global state
let editor
let diffEditor
let isEditing = false
let pendingCode = null
let originalCode = null
let files = {} // Now supports nested structure: { 'folder/file.js': 'content', 'file.js': 'content' }
let currentFile = null // null when no file is open
let openTabs = [] // Array of open file paths
let selectedFiles = new Set()
let draggedItem = null
let expandedFolders = new Set()
let activityLogVisible = false

// Storage keys
const STORAGE_KEY = 'aiEditorFiles'
const CURRENT_FILE_KEY = 'aiEditorCurrentFile'
const OPEN_TABS_KEY = 'aiEditorOpenTabs'
const CHAT_HISTORY_KEY = 'aiEditorChatHistory'
const EXPANDED_FOLDERS_KEY = 'aiEditorExpandedFolders'

// Activity Log Functions
function logActivity(message, type = 'info') {
  const logContent = document.getElementById('activityLogContent')
  if (!logContent) return
  
  const item = document.createElement('div')
  item.className = `activity-item ${type}`
  
  const icon = type === 'success' ? '<svg class="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : type === 'error' ? '<svg class="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>' : '<svg class="activity-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  item.innerHTML = `
    <span class="activity-icon">${icon}</span>
    <span>${message}</span>
    <span class="activity-time">${time}</span>
  `
  
  logContent.appendChild(item)
  logContent.scrollTop = logContent.scrollHeight
  
  // Keep only last 100 items
  while (logContent.children.length > 100) {
    logContent.removeChild(logContent.firstChild)
  }
}

function toggleActivityLog() {
  activityLogVisible = !activityLogVisible
  const log = document.getElementById('activityLog')
  if (log) {
    if (activityLogVisible) {
      log.classList.add('show')
    } else {
      log.classList.remove('show')
    }
  }
}

function clearActivityLog() {
  const logContent = document.getElementById('activityLogContent')
  if (logContent) {
    logContent.innerHTML = ''
  }
  logActivity('Activity log cleared', 'info')
}

// Tab Management Functions
function updateTabs() {
  const tabsContainer = document.getElementById('editorTabs')
  if (!tabsContainer) return
  
  tabsContainer.innerHTML = ''
  
  openTabs.forEach(filePath => {
    if (!files[filePath]) return // Skip if file was deleted
    
    const fileName = filePath.split('/').pop()
    const ext = fileName.split('.').pop().toLowerCase()
    const iconClass = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md'].includes(ext) ? ext : 'default'
    const iconText = getFileIconText(ext)
    
    const tab = document.createElement('div')
    tab.className = `editor-tab ${filePath === currentFile ? 'active' : ''}`
    tab.setAttribute('data-file', filePath)
    
    tab.innerHTML = `
      <div class="tab-icon ${iconClass}">${iconText}</div>
      <span class="tab-name">${fileName}</span>
      <span class="tab-close"><svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
    `
    
    tab.onclick = (e) => {
      if (e.target.classList.contains('tab-close')) {
        e.stopPropagation()
        closeTab(filePath)
      } else {
        openFile(filePath)
      }
    }
    
    tabsContainer.appendChild(tab)
  })
}

function closeTab(filePath) {
  const tabIndex = openTabs.indexOf(filePath)
  if (tabIndex === -1) return
  
  openTabs.splice(tabIndex, 1)
  
  // If closing current file, switch to another tab or show placeholder
  if (filePath === currentFile) {
    if (openTabs.length > 0) {
      // Switch to previous tab or first tab
      const newIndex = Math.max(0, tabIndex - 1)
      openFile(openTabs[newIndex])
    } else {
      currentFile = null
      showPlaceholder()
    }
  }
  
  updateTabs()
  saveFilesToStorage()
}

function showPlaceholder() {
  const placeholder = document.getElementById('editorPlaceholder')
  const editorDiv = document.getElementById('editor')
  const diffEditor = document.getElementById('diffEditor')
  
  if (placeholder) {
    placeholder.classList.remove('hidden')
    placeholder.style.display = 'flex'
  }
  if (editorDiv) {
    editorDiv.style.display = 'none'
  }
  if (diffEditor) {
    diffEditor.style.display = 'none'
  }
  
  currentFile = null
}

function hidePlaceholder() {
  const placeholder = document.getElementById('editorPlaceholder')
  const editorDiv = document.getElementById('editor')
  
  if (placeholder) {
    placeholder.classList.add('hidden')
    placeholder.style.display = 'none'
  }
  if (editorDiv) {
    editorDiv.style.display = 'block'
  }
}

// localStorage functions
function saveFilesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    localStorage.setItem(CURRENT_FILE_KEY, currentFile || '')
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(openTabs))
    localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify([...expandedFolders]))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

function loadFilesFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const storedCurrentFile = localStorage.getItem(CURRENT_FILE_KEY)
    const storedTabs = localStorage.getItem(OPEN_TABS_KEY)
    const storedExpanded = localStorage.getItem(EXPANDED_FOLDERS_KEY)
    
    if (stored) {
      files = JSON.parse(stored)
    }
    
    if (storedTabs) {
      openTabs = JSON.parse(storedTabs).filter(path => files[path]) // Only keep tabs for existing files
    }
    
    if (storedCurrentFile && files[storedCurrentFile]) {
      currentFile = storedCurrentFile
    } else if (openTabs.length > 0) {
      currentFile = openTabs[0]
    }
    
    if (storedExpanded) {
      expandedFolders = new Set(JSON.parse(storedExpanded))
    }
    
    return Object.keys(files).length > 0
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return false
  }
}

function saveChatHistory() {
  try {
    const messagesDiv = document.getElementById('chatMessages')
    if (messagesDiv) {
      const messages = []
      messagesDiv.querySelectorAll('.message').forEach(msg => {
        const type = msg.classList.contains('user') ? 'user' : 'ai'
        const text = msg.querySelector('.message-bubble').textContent
        messages.push({ type, text })
      })
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages))
    }
  } catch (error) {
    console.warn('Failed to save chat history:', error)
  }
}

function loadChatHistory() {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY)
    if (stored) {
      const messages = JSON.parse(stored)
      return messages
    }
  } catch (error) {
    console.warn('Failed to load chat history:', error)
  }
  return null
}

function newChat() {
  try {
    const messagesDiv = document.getElementById('chatMessages')
    if (messagesDiv) {
      messagesDiv.innerHTML = ''
    }
    // Remove saved chat history
    localStorage.removeItem(CHAT_HISTORY_KEY)
    addChatMessage('New chat started. Describe what you want!', 'ai')
  } catch (error) {
    console.warn('Failed to start new chat:', error)
  }
}

// Initialize app
async function initializeApp() {
  try {
    // Load and render all components
    const app = document.getElementById('app')
    
    // Get the base path for component loading
    const basePath = window.location.pathname.includes('/ai-editor') ? '/ai-editor/' : '/'
    
    const headerHTML = await fetch(basePath + 'components/header.html').then(r => {
      if (!r.ok) throw new Error(`Failed to load header: ${r.status}`)
      return r.text()
    })
    const explorerHTML = await fetch(basePath + 'components/explorer.html').then(r => {
      if (!r.ok) throw new Error(`Failed to load explorer: ${r.status}`)
      return r.text()
    })
    const editorHTML = await fetch(basePath + 'components/editor.html').then(r => {
      if (!r.ok) throw new Error(`Failed to load editor: ${r.status}`)
      return r.text()
    })
    const chatHTML = await fetch(basePath + 'components/chat.html').then(r => {
      if (!r.ok) throw new Error(`Failed to load chat: ${r.status}`)
      return r.text()
    })
    
    app.innerHTML = `
      ${headerHTML}
      <div class="container">
        ${explorerHTML}
        ${editorHTML}
        ${chatHTML}
      </div>
    `
    
    // Load saved files and chat history
    const hasStoredFiles = loadFilesFromStorage()

    // If no files are stored, seed with a default file
    if (!hasStoredFiles) {
      files['index.js'] = `function hello() {
  console.log("Hello World!")
}`
      currentFile = null // Start with no file open
      openTabs = []
      saveFilesToStorage()
    }
    
    const chatHistory = loadChatHistory()
    
    // Update file explorer and tabs
    updateExplorer()
    updateTabs()
    
    // Initialize simple textarea editor
    initializeSimpleEditor()
    
    // Open current file if exists
    if (currentFile && files[currentFile]) {
      openFile(currentFile)
    } else {
      showPlaceholder()
    }
    
    // Setup event listeners
    setupEventListeners()
    
    // Initialize preview system
    PreviewManager.init()
    console.log('Preview system initialized')
    
    // Initialize semantic patch client
    window.patchClient = new SemanticPatchClient('http://localhost:5000')
    console.log('Semantic patch client initialized')
    
    // Restore chat history if available
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        addChatMessage(msg.text, msg.type)
      })
    } else {
      // Show welcome message only if no chat history
      addChatMessage('Hi! You can edit existing code OR write new code from scratch. Just describe what you want!', 'ai')
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    document.getElementById('app').innerHTML = `<div style="color: red; padding: 20px;">Error loading app: ${error.message}</div>`
  }
}

// Initialize Monaco editors
// Simple textarea editor - no Monaco
function initializeSimpleEditor() {
  const editorElement = document.getElementById('editor')
  if (!editorElement) {
    console.error('Editor element not found')
    return
  }
  
  // Set initial content
  if (currentFile && files[currentFile]) {
    editorElement.value = files[currentFile]
  } else if (Object.keys(files).length > 0) {
    currentFile = Object.keys(files)[0]
    editorElement.value = files[currentFile]
  }
  
  // Auto-save on change
  let autoSaveTimeout
  editorElement.addEventListener('input', () => {
    clearTimeout(autoSaveTimeout)
    autoSaveTimeout = setTimeout(() => {
      saveCurrentFile()
      saveFilesToStorage()
    }, 500)
  })
  
  // Track cursor position
  editorElement.addEventListener('click', updateLineInfo)
  editorElement.addEventListener('keyup', updateLineInfo)
  
  console.log('Simple editor initialized')
}

function updateLineInfo() {
  const editor = document.getElementById('editor')
  const lineInfo = document.getElementById('lineInfo')
  if (!editor || !lineInfo) return
  
  const text = editor.value.substring(0, editor.selectionStart)
  const line = text.split('\n').length
  const col = text.split('\n').pop().length + 1
  
  lineInfo.textContent = `Line ${line}, Col ${col}`
}

// Setup event listeners
function setupEventListeners() {
  const chatInput = document.getElementById('chatInput')
  const sendBtn = document.getElementById('sendBtn')
  
  chatInput.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  })
  
  sendBtn.addEventListener('click', sendMessage)
}

// Chat message functions (only for user/AI conversation)
function addChatMessage(text, type = 'ai', isLoading = false) {
  const messagesDiv = document.getElementById('chatMessages')
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${type} ${isLoading ? 'loading' : ''}`
  
  const bubble = document.createElement('div')
  bubble.className = 'message-bubble'
  
  if (isLoading) {
    bubble.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>'
  } else {
    bubble.textContent = text
    // Save chat history when message is added (but not loading messages)
    setTimeout(() => saveChatHistory(), 100)
  }
  
  messageDiv.appendChild(bubble)
  messagesDiv.appendChild(messageDiv)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
  
  return messageDiv
}

function updateChatMessage(messageDiv, text, type = 'success') {
  messageDiv.className = `message ai ${type}`
  const bubble = messageDiv.querySelector('.message-bubble')
  bubble.textContent = text
}

// Diff functions
function showDiff(oldCode, newCode, isSelection = false, startLine = 0, endLine = 0) {
  originalCode = oldCode
  pendingCode = { 
    code: newCode,
    isSelection,
    startLine,
    endLine
  }
  
  const originalModel = monaco.editor.createModel(oldCode, 'javascript')
  const modifiedModel = monaco.editor.createModel(newCode, 'javascript')
  
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
  
  // Force layout update
  setTimeout(() => {
    diffEditor.layout()
  }, 100)
  
  document.getElementById('editor').classList.add('hide')
  document.getElementById('diffEditor').classList.add('show')
  document.getElementById('diffActions').classList.add('show')
  document.getElementById('status').textContent = 'Reviewing Changes'
  document.getElementById('status').className = 'status reviewing'
}

function acceptChanges() {
  if (pendingCode) {
    // If it was a selection edit, merge back into full file
    if (pendingCode.isSelection) {
      const fullCode = editor.getValue()
      const lines = fullCode.split('\n')
      const newLines = pendingCode.code.split('\n')
      
      // Replace only the selected lines
      lines.splice(pendingCode.startLine - 1, pendingCode.endLine - pendingCode.startLine + 1, ...newLines)
      editor.setValue(lines.join('\n'))
    } else {
      editor.setValue(pendingCode.code)
    }
    hideDiff()
    logActivity('Changes applied', 'success')
  }
}

function rejectChanges() {
  hideDiff()
  logActivity('Changes rejected', 'info')
}

function hideDiff() {
  document.getElementById('editor').classList.remove('hide')
  document.getElementById('diffEditor').classList.remove('show')
  document.getElementById('diffActions').classList.remove('show')
  document.getElementById('status').textContent = 'Ready'
  document.getElementById('status').className = 'status ready'
  pendingCode = null
  originalCode = null
}

// Message sending
async function sendMessage() {
  const input = document.getElementById('chatInput')
  const instruction = input.value.trim()
  
  if (!instruction) return
  
  saveCurrentFile()
  
  const sendBtn = document.getElementById('sendBtn')
  const status = document.getElementById('status')
  
  addChatMessage(instruction, 'user')
  input.value = ''
  
  // Check if this looks like a patch request (modifying existing code)
  // Only use patches for clear modification keywords, not creation keywords
  const isPatchRequest = /^(add|modify|update|change|fix|improve|enhance|refactor|remove|delete|replace|optimize|smooth|faster|slower|better|worse)\s+/i.test(instruction)
  
  if (isPatchRequest && Object.keys(files).length > 0) {
    // Try semantic patch approach first
    await handleSemanticPatch(instruction)
  } else {
    // Fall back to full generation
    await handleFullGeneration(instruction)
  }
}

/**
 * Handle semantic patch requests - modify existing code intelligently
 */
async function handleSemanticPatch(instruction) {
  const loadingMsg = addChatMessage('', 'ai', true)
  const sendBtn = document.getElementById('sendBtn')
  const status = document.getElementById('status')
  
  isEditing = true
  sendBtn.disabled = true
  status.textContent = 'Analyzing files...'
  status.className = 'status editing'
  
  try {
    updateChatMessage(loadingMsg, 'Searching for relevant files...', 'ai')
    
    // Request patches from semantic patch system
    const result = await window.patchClient.requestPatches(instruction, files)
    
    if (result.error) {
      updateChatMessage(loadingMsg, `Patch failed: ${result.error}\n\nTry:\n• Simpler instruction\n• More specific file names\n• Or ask to create new files`, 'ai')
      return
    }
    
    // Apply patches to local files
    Object.assign(files, result.files)
    saveFilesToStorage()
    updateExplorer()
    
    // Show summary
    const summary = window.patchClient.getSummary(result)
    updateChatMessage(loadingMsg, summary, 'ai')
    
    logActivity(`Applied patches to ${result.results.applied.length} file(s)`, 'success')
    
    // Refresh editor if current file was modified
    if (currentFile && result.results.filesModified.includes(currentFile)) {
      openFile(currentFile)
    }
  } catch (error) {
    updateChatMessage(loadingMsg, `Error: ${error.message}`, 'error')
    console.error(error)
  } finally {
    isEditing = false
    sendBtn.disabled = false
    status.textContent = 'Ready'
    status.className = 'status ready'
  }
}

/**
 * Handle full code generation requests
 */
async function handleFullGeneration(instruction) {
  const loadingMsg = addChatMessage('', 'ai', true)
  const sendBtn = document.getElementById('sendBtn')
  const status = document.getElementById('status')
  
  isEditing = true
  sendBtn.disabled = true
  status.textContent = 'Generating...'
  status.className = 'status editing'
  
  try {
    // Detect if this is a project creation request
    const isProjectCreation = /^(create|build|generate|make|setup|scaffold|init|start|new)\s+/i.test(instruction) && 
                             (instruction.toLowerCase().includes('project') || 
                              instruction.toLowerCase().includes('app') ||
                              instruction.toLowerCase().includes('dashboard') ||
                              instruction.toLowerCase().includes('website') ||
                              instruction.toLowerCase().includes('site') ||
                              instruction.toLowerCase().includes('application'))
    
    let endpoint = 'http://localhost:5000/edit'
    let payload = {
      instruction,
      files: {},
      currentFile: currentFile
    }
    
    // If creating a new project, use /create-project endpoint
    if (isProjectCreation) {
      endpoint = 'http://localhost:5000/create-project'
      // Extract project name from instruction if possible
      const nameMatch = instruction.match(/(?:create|build|generate|make)\s+(?:a\s+)?(?:new\s+)?(?:project|app|dashboard|website|site|application)?\s+(?:called|named|for)?\s+['\"]?([a-zA-Z0-9-_]+)['\"]?/i)
      const projectName = nameMatch ? nameMatch[1] : 'my-project'
      
      payload = {
        projectName,
        instruction
      }
      
      updateChatMessage(loadingMsg, 'Creating new project structure...', 'ai')
    }
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Request failed')
    }
    
    const data = await res.json()
    
    loadingMsg.remove()
    
    if (data.files) {
      // Multi-file response - preserve folder structure
      Object.entries(data.files).forEach(([filePath, content]) => {
        // Keep the full path with folders
        files[filePath] = content
        
        // Auto-expand parent folders
        const parts = filePath.split('/')
        if (parts.length > 1) {
          let path = ''
          for (let i = 0; i < parts.length - 1; i++) {
            path += (path ? '/' : '') + parts[i]
            expandedFolders.add(path)
          }
        }
      })
      
      saveFilesToStorage()
      updateExplorer()
      
      // Open first file
      const firstFile = Object.keys(data.files)[0]
      if (firstFile && files[firstFile]) {
        openFile(firstFile)
      }
      
      logActivity(`Generated ${Object.keys(data.files).length} file(s) with folder structure`, 'success')
    } else if (data.code) {
      // Single file response
      files[currentFile] = data.code
      editor.setValue(data.code)
      saveFilesToStorage()
      logActivity('Code generated', 'success')
    } else {
      logActivity('No code generated', 'info')
    }
  } catch (error) {
    updateChatMessage(loadingMsg, '❌ Error: ' + error.message, 'error')
    console.error(error)
  } finally {
    isEditing = false
    sendBtn.disabled = false
    status.textContent = 'Ready'
    status.className = 'status ready'
  }
}

function newFile() {
  saveCurrentFile()
  const filename = prompt('Enter filename (e.g., index.js, folder/file.js):')
  if (filename && filename.trim()) {
    const trimmed = filename.trim()
    files[trimmed] = ''
    
    // Auto-expand parent folders
    const parts = trimmed.split('/')
    if (parts.length > 1) {
      let path = ''
      for (let i = 0; i < parts.length - 1; i++) {
        path += (path ? '/' : '') + parts[i]
        expandedFolders.add(path)
      }
    }
    
    updateExplorer()
    saveFilesToStorage()
    
    // Open the new file
    openFile(trimmed)
    logActivity(`Created ${trimmed}`, 'success')
  }
}

function getLanguage(filename) {
  const ext = filename.split('.').pop()
  const langs = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescriptreact',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown'
  }
  return langs[ext] || 'plaintext'
}

function saveCurrentFile() {
  if (currentFile) {
    const editorElement = document.getElementById('editor')
    if (editorElement) {
      files[currentFile] = editorElement.value
    }
  }
}

function openFile(filename) {
  const editorElement = document.getElementById('editor')
  if (!editorElement) {
    console.warn('Editor element not found')
    return
  }
  
  saveCurrentFile()
  currentFile = filename

  if (!files[filename]) {
    files[filename] = ''
  }
  
  // Add to open tabs if not already there
  if (!openTabs.includes(filename)) {
    openTabs.push(filename)
  }

  editorElement.value = files[filename]
  hidePlaceholder()
  saveFilesToStorage()

  // Update explorer active state
  document.querySelectorAll('.file-item').forEach(item => {
    item.classList.remove('active')
  })
  document.querySelector(`[data-file="${filename}"]`)?.classList.add('active')

  // Update tabs
  updateTabs()
  
  // Focus editor
  editorElement.focus()
}

function closeFile(filename, e) {
  e.stopPropagation()
  
  if (!confirm(`Delete "${filename}"?`)) return
  
  delete files[filename]
  
  // Remove from open tabs
  const tabIndex = openTabs.indexOf(filename)
  if (tabIndex !== -1) {
    openTabs.splice(tabIndex, 1)
  }
  
  // If closing current file, switch to another or show placeholder
  if (currentFile === filename) {
    if (openTabs.length > 0) {
      openFile(openTabs[0])
    } else {
      currentFile = null
      showPlaceholder()
    }
  }
  
  saveFilesToStorage()
  updateExplorer()
  updateTabs()
}

function updateExplorer() {
  const explorer = document.getElementById('explorerFiles')
  explorer.innerHTML = ''
  
  // Build tree structure
  const tree = buildFileTree(files)
  
  // Render tree
  renderTree(tree, explorer, '')
  
  // Setup drag and drop on explorer
  setupExplorerDragDrop()
}

function buildFileTree(files) {
  const tree = { folders: {}, files: [] }
  
  Object.keys(files).forEach(path => {
    const parts = path.split('/')
    
    if (parts.length === 1) {
      // Root level file
      tree.files.push(path)
    } else {
      // Nested file
      let current = tree
      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i]
        if (!current.folders[folder]) {
          current.folders[folder] = { folders: {}, files: [] }
        }
        current = current.folders[folder]
      }
      current.files.push(path)
    }
  })
  
  return tree
}

function renderTree(tree, container, prefix) {
  // Render folders first
  Object.keys(tree.folders).sort().forEach(folderName => {
    const folderPath = prefix ? `${prefix}/${folderName}` : folderName
    const isExpanded = expandedFolders.has(folderPath)
    
    const folderDiv = document.createElement('div')
    folderDiv.className = 'folder-item'
    
    const folderHeader = document.createElement('div')
    folderHeader.className = 'folder-header'
    folderHeader.setAttribute('data-path', folderPath)
    folderHeader.innerHTML = `
      <svg class="folder-chevron ${isExpanded ? 'expanded' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <svg class="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="folder-name">${folderName}</span>
      <span class="file-close" onclick="deleteFolder('${folderPath}', event)"><svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
    `
    
    folderHeader.onclick = (e) => {
      if (e.target.classList.contains('file-close')) return
      toggleFolder(folderPath)
    }
    
    folderHeader.oncontextmenu = (e) => {
      e.preventDefault()
      showContextMenu(e, folderPath, true)
    }
    
    // Drag and drop for folders
    folderHeader.draggable = true
    folderHeader.ondragstart = (e) => handleDragStart(e, folderPath, true)
    folderHeader.ondragover = (e) => handleDragOver(e)
    folderHeader.ondrop = (e) => handleDrop(e, folderPath, true)
    folderHeader.ondragleave = (e) => handleDragLeave(e)
    folderHeader.ondragend = (e) => handleDragEnd(e)
    
    const folderContents = document.createElement('div')
    folderContents.className = `folder-contents ${isExpanded ? 'expanded' : ''}`
    
    folderDiv.appendChild(folderHeader)
    folderDiv.appendChild(folderContents)
    container.appendChild(folderDiv)
    
    if (isExpanded) {
      renderTree(tree.folders[folderName], folderContents, folderPath)
    }
  })
  
  // Render files
  tree.files.sort().forEach(filePath => {
    const fileName = filePath.split('/').pop()
    const item = document.createElement('div')
    item.className = `file-item ${filePath === currentFile ? 'active' : ''} ${selectedFiles.has(filePath) ? 'selected' : ''}`
    item.setAttribute('data-file', filePath)
    
    const ext = fileName.split('.').pop().toLowerCase()
    const iconClass = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md'].includes(ext) ? ext : 'default'
    const iconText = getFileIconText(ext)
    
    item.innerHTML = `
      <div class="file-icon ${iconClass}">${iconText}</div>
      <span class="file-name">${fileName}</span>
      <span class="file-close" onclick="closeFile('${filePath}', event)"><svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
    `
    
    item.onclick = (e) => {
      if (e.target.classList.contains('file-close')) return
      
      if (e.ctrlKey || e.metaKey) {
        toggleFileSelection(filePath)
      } else if (e.shiftKey && selectedFiles.size > 0) {
        selectFileRange(filePath)
      } else {
        selectedFiles.clear()
        openFile(filePath)
      }
      updateExplorer()
    }
    
    item.oncontextmenu = (e) => {
      e.preventDefault()
      if (!selectedFiles.has(filePath)) {
        selectedFiles.clear()
        selectedFiles.add(filePath)
        updateExplorer()
      }
      showContextMenu(e, filePath, false)
    }
    
    // Drag and drop
    item.draggable = true
    item.ondragstart = (e) => handleDragStart(e, filePath, false)
    item.ondragover = (e) => handleDragOver(e)
    item.ondrop = (e) => handleDrop(e, filePath, false)
    item.ondragleave = (e) => handleDragLeave(e)
    item.ondragend = (e) => handleDragEnd(e)
    
    container.appendChild(item)
  })
}

function getFileIconText(ext) {
  const icons = {
    'js': 'JS',
    'ts': 'TS',
    'jsx': '<>',
    'tsx': '<>',
    'html': '<>',
    'css': '{}',
    'json': '{}',
    'md': 'MD'
  }
  return icons[ext] || '◆'
}

function toggleFolder(folderPath) {
  if (expandedFolders.has(folderPath)) {
    expandedFolders.delete(folderPath)
  } else {
    expandedFolders.add(folderPath)
  }
  saveFilesToStorage()
  updateExplorer()
}

function toggleFileSelection(filePath) {
  if (selectedFiles.has(filePath)) {
    selectedFiles.delete(filePath)
  } else {
    selectedFiles.add(filePath)
  }
}

function selectFileRange(endPath) {
  const allFiles = Object.keys(files).sort()
  const lastSelected = [...selectedFiles][selectedFiles.size - 1]
  const startIdx = allFiles.indexOf(lastSelected)
  const endIdx = allFiles.indexOf(endPath)
  
  if (startIdx !== -1 && endIdx !== -1) {
    const [min, max] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)]
    for (let i = min; i <= max; i++) {
      selectedFiles.add(allFiles[i])
    }
  }
}

function newFolder() {
  const folderName = prompt('Enter folder name:')
  if (folderName && folderName.trim()) {
    const sanitized = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '-')
    
    // Create a placeholder file to make the folder exist
    const placeholderPath = `${sanitized}/.gitkeep`
    files[placeholderPath] = ''
    
    // Add to expanded folders so it shows open
    expandedFolders.add(sanitized)
    
    saveFilesToStorage()
    updateExplorer()
    logActivity(`Created folder: ${sanitized}`, 'success')
  }
}

function deleteFolder(folderPath, e) {
  e.stopPropagation()
  
  if (!confirm(`Delete folder "${folderPath}" and all its contents?`)) return
  
  // Delete all files in folder
  Object.keys(files).forEach(path => {
    if (path.startsWith(folderPath + '/')) {
      delete files[path]
    }
  })
  
  expandedFolders.delete(folderPath)
  saveFilesToStorage()
  updateExplorer()
  logActivity(`Deleted folder: ${folderPath}`, 'success')
}

function uploadFiles() {
  document.getElementById('fileUploadInput').click()
}

async function handleFileUpload(event) {
  const uploadedFiles = event.target.files
  if (!uploadedFiles || uploadedFiles.length === 0) return
  
  for (const file of uploadedFiles) {
    try {
      const content = await readFileContent(file)
      const fileName = file.name
      files[fileName] = content
      logActivity(`Uploaded: ${fileName}`, 'success')
    } catch (error) {
      logActivity(`Failed to upload ${file.name}: ${error.message}`, 'error')
    }
  }
  
  saveFilesToStorage()
  updateExplorer()
  
  // Reset input
  event.target.value = ''
}

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function setupExplorerDragDrop() {
  const explorerFiles = document.getElementById('explorerFiles')
  
  explorerFiles.ondragover = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  
  explorerFiles.ondrop = async (e) => {
    e.preventDefault()
    
    const items = e.dataTransfer.items
    if (!items) return
    
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          try {
            const content = await readFileContent(file)
            files[file.name] = content
            logActivity(`Dropped: ${file.name}`, 'success')
          } catch (error) {
            logActivity(`Failed to read ${file.name}`, 'error')
          }
        }
      }
    }
    
    saveFilesToStorage()
    updateExplorer()
  }
}

function handleDragStart(e, path, isFolder) {
  draggedItem = { path, isFolder }
  e.target.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', path)
}

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  e.dataTransfer.dropEffect = 'move'
  
  const target = e.currentTarget
  if (target.classList.contains('folder-header')) {
    target.classList.add('drag-over')
  }
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over')
}

function handleDrop(e, targetPath, isTargetFolder) {
  e.preventDefault()
  e.stopPropagation()
  e.currentTarget.classList.remove('drag-over')
  
  if (!draggedItem) return
  
  const sourcePath = draggedItem.path
  
  // Can't drop on itself
  if (sourcePath === targetPath) return
  
  // Move to folder
  if (isTargetFolder) {
    moveToFolder(sourcePath, targetPath, draggedItem.isFolder)
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging')
  draggedItem = null
  
  // Clean up all drag-over classes
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
}

function moveToFolder(sourcePath, targetFolder, isSourceFolder) {
  const sourceName = sourcePath.split('/').pop()
  const newPath = `${targetFolder}/${sourceName}`
  
  if (isSourceFolder) {
    // Move entire folder
    const filesToMove = Object.keys(files).filter(path => path.startsWith(sourcePath + '/'))
    filesToMove.forEach(oldPath => {
      const relativePath = oldPath.substring(sourcePath.length + 1)
      const newFullPath = `${newPath}/${relativePath}`
      files[newFullPath] = files[oldPath]
      delete files[oldPath]
    })
    
    expandedFolders.delete(sourcePath)
    expandedFolders.add(newPath)
  } else {
    // Move single file
    if (files[newPath]) {
      if (!confirm(`File ${newPath} already exists. Overwrite?`)) return
    }
    
    files[newPath] = files[sourcePath]
    delete files[sourcePath]
    
    if (currentFile === sourcePath) {
      currentFile = newPath
    }
  }
  
  saveFilesToStorage()
  updateExplorer()
  logActivity(`Moved ${sourcePath} to ${targetFolder}`, 'success')
}

function showContextMenu(e, path, isFolder) {
  e.preventDefault()
  
  // Remove existing context menu
  const existing = document.querySelector('.context-menu')
  if (existing) existing.remove()
  
  const menu = document.createElement('div')
  menu.className = 'context-menu show'
  menu.style.left = e.pageX + 'px'
  menu.style.top = e.pageY + 'px'
  
  // Check if file is renderable for preview option
  const canPreview = !isFolder && 
                     files[path] && 
                     isRenderableFile(path, files[path])
  
  const items = isFolder ? [
    { label: 'New File in Folder', action: () => newFileInFolder(path) },
    { label: 'New Subfolder', action: () => newSubfolder(path) },
    { label: 'Rename', action: () => renameItem(path, true) },
    { separator: true },
    { label: 'Delete Folder', action: () => deleteFolder(path, { stopPropagation: () => {} }) }
  ] : [
    ...(canPreview ? [
      { 
        label: 'Preview Component', 
        action: () => PreviewManager.open(path),
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
      },
      { separator: true }
    ] : []),
    { label: 'Rename', action: () => renameItem(path, false) },
    { label: 'Duplicate', action: () => duplicateFile(path) },
    { separator: true },
    { label: 'Delete', action: () => closeFile(path, { stopPropagation: () => {} }) }
  ]
  
  items.forEach(item => {
    if (item.separator) {
      const sep = document.createElement('div')
      sep.className = 'context-menu-separator'
      menu.appendChild(sep)
    } else {
      const menuItem = document.createElement('div')
      menuItem.className = 'context-menu-item'
      if (item.icon) {
        menuItem.style.fontWeight = '500'
      }
      menuItem.textContent = item.label
      menuItem.onclick = () => {
        item.action()
        menu.remove()
      }
      menu.appendChild(menuItem)
    }
  })
  
  document.body.appendChild(menu)
  
  // Close menu on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      menu.remove()
      document.removeEventListener('click', closeMenu)
    })
  }, 0)
}

function newFileInFolder(folderPath) {
  const fileName = prompt('Enter file name:')
  if (fileName && fileName.trim()) {
    const newPath = `${folderPath}/${fileName.trim()}`
    files[newPath] = ''
    expandedFolders.add(folderPath)
    saveFilesToStorage()
    updateExplorer()
    openFile(newPath)
    logActivity(`Created ${newPath}`, 'success')
  }
}

function newSubfolder(parentPath) {
  const folderName = prompt('Enter subfolder name:')
  if (folderName && folderName.trim()) {
    const sanitized = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '-')
    const newPath = `${parentPath}/${sanitized}`
    // Just add to expanded folders, no placeholder file
    expandedFolders.add(parentPath)
    expandedFolders.add(newPath)
    saveFilesToStorage()
    updateExplorer()
    logActivity(`Created folder: ${newPath}`, 'success')
  }
}

function renameItem(oldPath, isFolder) {
  const oldName = oldPath.split('/').pop()
  const newName = prompt(`Rename ${isFolder ? 'folder' : 'file'}:`, oldName)
  
  if (!newName || newName.trim() === '' || newName === oldName) return
  
  const pathParts = oldPath.split('/')
  pathParts[pathParts.length - 1] = newName.trim()
  const newPath = pathParts.join('/')
  
  if (isFolder) {
    // Rename folder and all contents
    Object.keys(files).forEach(path => {
      if (path.startsWith(oldPath + '/')) {
        const newFullPath = path.replace(oldPath, newPath)
        files[newFullPath] = files[path]
        delete files[path]
      }
    })
    
    if (expandedFolders.has(oldPath)) {
      expandedFolders.delete(oldPath)
      expandedFolders.add(newPath)
    }
  } else {
    // Rename file
    files[newPath] = files[oldPath]
    delete files[oldPath]
    
    if (currentFile === oldPath) {
      currentFile = newPath
    }
  }
  
  saveFilesToStorage()
  updateExplorer()
  logActivity(`Renamed to ${newPath}`, 'success')
}

function duplicateFile(filePath) {
  const fileName = filePath.split('/').pop()
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
  const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : ''
  
  let counter = 1
  let newPath
  do {
    const newName = `${baseName}-copy${counter}${ext}`
    newPath = filePath.replace(fileName, newName)
    counter++
  } while (files[newPath])
  
  files[newPath] = files[filePath]
  saveFilesToStorage()
  updateExplorer()
  logActivity(`Duplicated to ${newPath}`, 'success')
}

function copyCode() {
  const code = editor.getValue()
  navigator.clipboard.writeText(code).then(() => {
    logActivity('Code copied to clipboard', 'success')
  }).catch(() => {
    logActivity('Failed to copy code', 'error')
  })
}

function downloadProject() {
  if (Object.keys(files).length === 0) {
    logActivity('No files to download', 'error')
    return
  }
  
  // Extract project name from first file path or use default
  let projectName = 'my-project'
  const firstFile = Object.keys(files)[0]
  if (firstFile && firstFile.includes('/')) {
    projectName = firstFile.split('/')[0]
  }
  
  logActivity(`Downloading project: ${projectName}...`, 'info')
  
  fetch('http://localhost:5000/download-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName,
      files
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Download failed')
    return response.blob()
  })
  .then(blob => {
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    logActivity(`Downloaded: ${projectName}.zip`, 'success')
  })
  .catch(error => {
    logActivity(`Download failed: ${error.message}`, 'error')
    console.error('Download error:', error)
  })
}

// ============================================================================
// PREVIEW SYSTEM
// ============================================================================

/**
 * Check if a file is renderable (has React component with export default)
 */
function isRenderableFile(filename, content) {
  if (!filename || !content) return false
  
  if (!/\.(tsx?|jsx?)$/i.test(filename)) return false
  if (!/export\s+default\s+/m.test(content)) return false
  
  // Check for JSX syntax - more comprehensive patterns
  const hasJSX = /<[A-Z][a-zA-Z0-9]*[\s/>]/m.test(content) ||  // <Component> or <Component ...> or <Component/>
                 /<[a-z]+[\s/>]/m.test(content) ||              // <div> or <button ...> or <div/>
                 /<>/m.test(content) ||                         // Fragment <>
                 /<\//m.test(content) ||                        // Closing tag </
                 /React\.createElement/m.test(content) ||       // React.createElement
                 /jsx\s*\(/m.test(content)                      // jsx() function
  
  const hasReactImport = /import\s+.*\s+from\s+['"]react['"]/m.test(content)
  
  // If it has export default and imports other components, it's likely renderable
  const hasComponentImport = /import\s+\w+\s+from\s+['"][./]/m.test(content)
  
  return hasJSX || hasReactImport || (hasComponentImport && /return\s*\(/m.test(content))
}

/**
 * Find the entry file to render (the main component)
 */
function findEntryFile(files, currentFile) {
  if (files[currentFile] && isRenderableFile(currentFile, files[currentFile])) {
    return currentFile
  }
  
  const folderParts = currentFile.split('/')
  folderParts.pop()
  const folder = folderParts.join('/')
  
  for (const [path, content] of Object.entries(files)) {
    const pathFolder = path.split('/').slice(0, -1).join('/')
    if (pathFolder === folder && isRenderableFile(path, content)) {
      return path
    }
  }
  
  return null
}

/**
 * Get all related files from the same folder as the entry file
 */
function getRelatedFiles(files, entryFile) {
  const folderParts = entryFile.split('/')
  folderParts.pop()
  const folder = folderParts.join('/')
  
  const related = {}
  
  for (const [path, content] of Object.entries(files)) {
    const pathFolder = path.split('/').slice(0, -1).join('/')
    
    if (pathFolder === folder || path === entryFile) {
      related[path] = content
    }
  }
  
  return related
}

/**
 * Preview Manager
 */
const PreviewManager = {
  modal: null,
  iframe: null,
  isOpen: false,
  currentEntry: null,
  
  init() {
    if (this.modal) return
    
    const modal = document.createElement('div')
    modal.id = 'previewModal'
    modal.className = 'preview-modal'
    modal.style.display = 'none'
    
    modal.innerHTML = `
      <div class="preview-modal-content">
        <div class="preview-modal-header">
          <span class="preview-modal-title">Component Preview</span>
          <button class="preview-modal-close" onclick="PreviewManager.close()"><svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div class="preview-modal-body">
          <div class="preview-loading">
            <div class="preview-spinner"></div>
            <span>Loading preview...</span>
          </div>
          <div class="preview-error" style="display: none;">
            <div class="preview-error-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
            <div class="preview-error-message"></div>
          </div>
          <iframe class="preview-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    this.modal = modal
    this.iframe = modal.querySelector('.preview-iframe')
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close()
      }
    })
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  },
  
  async open(filename) {
    if (!files[filename]) {
      this.showError('File not found')
      return
    }
    
    const entryFile = findEntryFile(files, filename)
    if (!entryFile) {
      this.showError('No renderable component found. Make sure the file exports a React component.')
      return
    }
    
    this.currentEntry = entryFile
    
    this.modal.style.display = 'flex'
    this.isOpen = true
    this.showLoading()
    
    try {
      const response = await fetch('http://localhost:5000/runtime-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files,
          entry: entryFile
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to bundle component')
      }
      
      const data = await response.json()
      
      this.iframe.srcdoc = data.html
      this.hideLoading()
      
      logActivity(`Preview opened: ${entryFile}`, 'success')
      
    } catch (error) {
      console.error('Preview error:', error)
      this.showError(error.message)
      logActivity(`Preview failed: ${error.message}`, 'error')
    }
  },
  
  close() {
    if (this.modal) {
      this.modal.style.display = 'none'
    }
    this.isOpen = false
    this.currentEntry = null
    
    if (this.iframe) {
      this.iframe.srcdoc = ''
    }
  },
  
  showLoading() {
    const loading = this.modal.querySelector('.preview-loading')
    const error = this.modal.querySelector('.preview-error')
    const iframe = this.modal.querySelector('.preview-iframe')
    
    if (loading) loading.style.display = 'flex'
    if (error) error.style.display = 'none'
    if (iframe) iframe.style.display = 'none'
  },
  
  hideLoading() {
    const loading = this.modal.querySelector('.preview-loading')
    const iframe = this.modal.querySelector('.preview-iframe')
    
    if (loading) loading.style.display = 'none'
    if (iframe) iframe.style.display = 'block'
  },
  
  showError(message) {
    const loading = this.modal.querySelector('.preview-loading')
    const error = this.modal.querySelector('.preview-error')
    const errorMessage = this.modal.querySelector('.preview-error-message')
    const iframe = this.modal.querySelector('.preview-iframe')
    
    if (loading) loading.style.display = 'none'
    if (error) error.style.display = 'flex'
    if (errorMessage) errorMessage.textContent = message
    if (iframe) iframe.style.display = 'none'
    
    if (!this.isOpen) {
      this.modal.style.display = 'flex'
      this.isOpen = true
    }
  }
}

// ============================================================================
// END PREVIEW SYSTEM
// ============================================================================

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}
