---
inclusion: always
---

# Technology Stack

## Core Technologies
- React 19.2.0 (latest)
- Vite 7.3.1 (build tool and dev server)
- Tailwind CSS 4.2.1 (utility-first styling)
- Babel Standalone (browser-based JSX compilation via CDN)

## Development Tools
- ESLint 9.39.1 with React-specific plugins
- PostCSS with Autoprefixer
- Vite React plugin for Fast Refresh

## Build System
The project uses Vite as the build tool with ES modules.

### Common Commands
```bash
# Start development server (default port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Configuration Files
- `vite.config.js` - Vite configuration with React plugin
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint flat config with React rules
- `postcss.config.js` - PostCSS configuration

## Module System
- Type: ES Modules (`"type": "module"` in package.json)
- All imports use ES6 syntax
- JSX files use `.jsx` extension
