# AGENTS.md

## Build & Development Commands

### Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (runs tsc + vite build)
- `npm run preview` - Preview production build locally

### Type Checking
- `npx tsc` - Run TypeScript compiler for type checking (no output, strict mode)
- No test framework configured - tests not implemented in this codebase

## Code Style Guidelines

### Project Overview
This is a React 18 + TypeScript + Vite application using:
- Tailwind CSS for styling with custom design tokens
- Supabase for authentication and database
- React Router v7 for routing
- Lucide React for icons
- Zustand for state management
- Custom UI component library with variants

### Import Conventions
- Use `@/*` path alias for all src imports (configured in vite.config.ts)
- Import order: React → third-party libraries → local components → local utilities → types
- Named exports preferred for components and utilities
- Default imports from React and most third-party libs
- Example:
  ```typescript
  import * as React from "react";
  import { Button } from "@/components/ui/button";
  import { cn, formatFileSize } from "@/lib/utils";
  import { useAuth } from "@/contexts/AuthContext";
  ```

### TypeScript & Types
- Strict mode enabled in tsconfig.json
- Type definitions in `src/types/` directory
- Interface exports for component props extending React.HTMLAttributes
- Type unions for enums (e.g., `'free' | 'premium' | 'enterprise'`)
- Use `React.forwardRef` with typed refs when needed
- Avoid `any` - use proper typing or `unknown` with type guards

### Naming Conventions
- Components: PascalCase (`VideoProcessor`, `Button`)
- Functions/Variables: camelCase (`handleFileSelect`, `setProcessing`)
- Types/Interfaces: PascalCase (`UserProfile`, `AuthContextType`)
- Constants: camelCase (descriptive arrays: `videoFormats`, `resolutions`)
- State setters: camelCase with `set` prefix (`setVideoUrl`, `setProgress`)
- Files: PascalCase for components, camelCase for utilities (`VideoProcessor.tsx`, `utils.ts`)

### Error Handling
- Wrap async operations in try-catch blocks
- Use `console.error` for debugging errors
- Display user-facing errors via Toast notifications (`addToast('error', 'message')`)
- Error messages are in Chinese for this application
- Validate user inputs and handle edge cases
- Check for null/undefined before operations
- Example:
  ```typescript
  try {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    addToast('success', '操作成功');
  } catch (error) {
    console.error('Error:', error);
    addToast('error', '操作失败，请重试');
  }
  ```

### React Patterns
- Use function components exclusively
- Use `React.useState` for component state
- Use `React.useEffect` for side effects with proper cleanup
- Custom hooks for reusable logic (`useAuth`, `useToast`)
- React Context for global state (auth, toast notifications)
- React.forwardRef for components needing ref forwarding
- Memoization with `React.useCallback` for event handlers
- Prop drilling avoided via Context

### Styling with Tailwind CSS
- Use `cn()` utility from `@/lib/utils` to merge Tailwind classes
- Design tokens defined in tailwind.config.js (colors, animations, borders)
- Custom variants defined via `class-variance-authority` for components
- Responsive design: mobile-first with `md:` breakpoints
- Theme colors use HSL variables (e.g., `bg-primary`, `text-muted-foreground`)
- Animations from config: `animate-fade-in`, `animate-slide-up`, etc.

### Component Architecture
- UI components in `src/components/ui/` (reusable building blocks)
- Pages in `src/pages/` (route-level components)
- Contexts in `src/contexts/` (global state providers)
- Utilities in `src/lib/utils.ts` and `src/utils/`
- Types in `src/types/`
- Component props: Interface extending React.HTMLAttributes when appropriate
- Use VariantProps for styled component variants

### File Structure
```
src/
  components/ui/     - Reusable UI components (Button, Card, etc.)
  components/       - Feature components (UserMenu, UpgradeModal, etc.)
  contexts/         - React Context providers
  pages/            - Page components for routes
  lib/              - Core utilities (supabase client, cn helper)
  utils/            - Helper functions
  types/            - TypeScript type definitions
```

### Best Practices
- Clean up useEffect subscriptions to prevent memory leaks
- Use nullish coalescing (`??`) for null checks
- Optional chaining (`?.`) for safe property access
- Validate environment variables before use
- Use descriptive variable and function names
- Keep components focused and single-purpose
- Extract repeated logic into custom hooks
- Use loading states during async operations
- Handle all Supabase query errors explicitly
