# AI Code Editor - Standalone Version

A clean, standalone version of the AI Code Editor with only the essential files needed to run the application.

## Features

- AI-powered code editing with natural language instructions
- Multi-file project support with folder structure
- Live React component preview
- Semantic patch system for intelligent code modifications
- File explorer with drag-and-drop
- Activity logging
- Project download as ZIP

## Requirements

- Node.js 18+ 
- Groq API key (free at https://console.groq.com)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Or copy the example file:

```bash
copy .env.example .env.local
```

Then edit `.env.local` and add your Groq API key.

### 3. Start the Server

```bash
npm start
```

The server will start on http://localhost:5000

### 4. Open in Browser

Navigate to http://localhost:5000 in your web browser.

## Project Structure

```
ai-editor-standalone/
├── components/          # HTML component templates
│   ├── header.html     # Top navigation bar
│   ├── explorer.html   # File explorer sidebar
│   ├── editor.html     # Code editor area
│   └── chat.html       # AI chat interface
├── css/
│   └── styles.css      # All application styles
├── js/
│   ├── app.js          # Main application logic
│   └── semanticPatchClient.js  # Patch system client
├── server.js           # Express backend server
├── index.html          # Main HTML entry point
├── package.json        # Node.js dependencies
└── .env.local          # API keys (create this)
```

## Usage

### Creating Files

1. Click "New File" button in the header
2. Enter filename (e.g., `App.js` or `components/Button.js`)
3. Start coding!

### AI Code Generation

1. Type your instruction in the chat (e.g., "create a login form")
2. Press Ctrl+Enter or click Send
3. Review the generated code
4. Files are automatically created/updated

### Previewing React Components

1. Right-click on a `.tsx` or `.jsx` file
2. Select "Preview Component"
3. View live rendering in modal

### Project Management

- **Download**: Click "Download" to export project as ZIP
- **Demo**: Click "Demo" to load example project
- **New Chat**: Start fresh conversation with AI

## API Endpoints

The server provides these endpoints:

- `POST /edit` - Generate/edit code
- `POST /create-project` - Create multi-file projects
- `POST /semantic-patch` - Apply intelligent patches
- `POST /runtime-bundle` - Bundle React components for preview

## Troubleshooting

### Server won't start

- Check that port 5000 is not in use
- Verify `.env.local` exists with valid API key
- Run `npm install` to ensure dependencies are installed

### API key errors

- Ensure `VITE_GROQ_API_KEY` is set in `.env.local`
- Get a free key at https://console.groq.com
- Restart the server after adding the key

### Preview not working

- Ensure the file exports a React component with `export default`
- Check browser console for errors
- Verify the component has JSX syntax

## Development

To modify the application:

1. Edit files in `js/`, `css/`, or `components/`
2. Refresh browser to see changes (no build step needed)
3. Server auto-serves static files

## License

MIT

## Credits

Built with:
- Express.js - Web server
- Groq API - AI code generation
- Monaco Editor concepts - Code editing
- React - Component preview
