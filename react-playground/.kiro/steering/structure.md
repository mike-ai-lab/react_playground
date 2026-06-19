# Project Structure

## Root Configuration Files

- `vite.config.js` - Vite configuration (dev server on port 5174)
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint rules and plugins
- `package.json` - Dependencies and scripts
- `index.html` - Entry HTML file

## Source Directory (`src/`)

### Core Application Files

- `main.jsx` - Application entry point, renders root App component
- `App.jsx` - Main playground UI with code editor, preview, and template management
- `index.css` - Global styles and Tailwind directives
- `App.css` - Component-specific styles

### Key Module

- `ReactComponentRenderer.js` - Standalone renderer class for compiling and executing React components
  - Import parsing and mock generation
  - Babel compilation wrapper
  - Export statement processing
  - Icon library mocking (lucide-react, react-icons)
  - Framer Motion support
  - HTML generation for iframe rendering

### Assets

- `assets/` - Static assets (SVG icons, images)

## Test Directory (`tests/`)

Contains test files, verification scripts, and test results:
- `automated-test.js` - Automated testing script
- `verify-all-templates.js` - Template validation
- `results/` - Test execution logs and status reports

## Documentation Files

- `README.md` - Project overview and setup instructions
- `request.md` - Feature request for dynamic CDN dependency loading
- `console.txt` - Console output logs
- `test-components.txt` - Component test cases

## Kiro Configuration

- `.kiro/steering/` - AI assistant steering rules and guidelines

## Key Patterns

- Component renderer is framework-agnostic and can be used standalone
- Iframe sandboxing prevents code execution from affecting main app
- Mock generation allows components with external dependencies to render
- Template system uses localStorage for persistence
- Error overlay provides clear feedback on compilation failures
