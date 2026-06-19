# Technology Stack

## Build System & Tooling

- **Build Tool**: Vite 7.3.1
- **Package Manager**: npm
- **Module System**: ES Modules (type: "module")

## Core Dependencies

- **React**: 19.2.0 (latest)
- **React DOM**: 19.2.0
- **Babel Standalone**: Loaded via CDN for in-browser JSX/TypeScript compilation

## Styling

- **Tailwind CSS**: 4.2.1 (utility-first CSS framework)
- **PostCSS**: 8.5.8 with Autoprefixer
- **Tailwind CDN**: Used in iframe previews for component rendering

## Development Tools

- **ESLint**: 9.39.1 with React-specific plugins
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
- **TypeScript Types**: @types/react and @types/react-dom for type checking

## Common Commands

```bash
# Start development server (port 5174)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture Notes

- Uses Vite's Fast Refresh for hot module replacement
- Babel Standalone enables client-side JSX compilation
- Iframe sandbox isolation for component execution
- CDN-based React/ReactDOM for preview rendering
