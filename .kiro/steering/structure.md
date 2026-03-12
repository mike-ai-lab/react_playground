---
inclusion: always
---

# Project Structure

## Directory Layout
```
react-playground/
├── src/
│   ├── App.jsx          # Main application component (playground UI)
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles with Tailwind directives
│   ├── App.css          # Component-specific styles (if needed)
│   └── assets/          # Static assets (images, icons)
├── public/              # Public static files served as-is
├── node_modules/        # Dependencies (not committed)
├── index.html           # HTML entry point
├── package.json         # Project metadata and dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── eslint.config.js     # ESLint configuration
└── postcss.config.js    # PostCSS configuration
```

## Code Organization

### Main Application (App.jsx)
The core playground is a single-file application with:
- ErrorBoundary class component for error handling
- Main App functional component with state management
- Split-pane layout (editor + preview)
- Execution history console (collapsible)

### Component Patterns
- Functional components with hooks (useState, useEffect)
- Class components only for Error Boundaries
- Inline event handlers for UI interactions
- Dynamic component rendering via state

### Styling Approach
- Tailwind utility classes for all styling
- Dark theme for editor pane (slate colors)
- Light theme for preview canvas
- Responsive layouts using Flexbox
- Custom color values using bracket notation (e.g., `bg-[#1e1e1e]`)

### State Management
- Local component state using useState
- No external state management library
- Props passed directly between components

## File Naming Conventions
- React components: PascalCase with `.jsx` extension
- Configuration files: kebab-case with appropriate extension
- CSS files: kebab-case with `.css` extension
