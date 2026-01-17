# Project Structure

## Directory Organization

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components (button, card, dialog, etc.)
│   ├── MembershipBadge.tsx
│   ├── ProtectedRoute.tsx
│   ├── ReCaptchaProvider.tsx
│   ├── UpgradeModal.tsx
│   ├── UsageIndicator.tsx
│   └── UserMenu.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication and user state
├── lib/                # Core utilities and clients
│   ├── supabase.ts    # Supabase client configuration
│   └── utils.ts       # Helper functions (cn, etc.)
├── pages/              # Route-level page components
│   ├── AudioProcessor.tsx
│   ├── ImageProcessor.tsx
│   ├── VideoProcessor.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   └── Membership.tsx
├── types/              # TypeScript type definitions
│   └── auth.ts        # Auth-related types
├── utils/              # Business logic utilities
│   └── membershipLimits.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # React entry point
└── index.css           # Global styles and Tailwind directives

supabase/
└── schema.sql          # Database schema with RLS policies
```

## Architecture Patterns

### Component Structure

- **UI Components** (`src/components/ui/`): Atomic, reusable components using class-variance-authority for variants
- **Feature Components** (`src/components/`): Composed components with business logic
- **Pages** (`src/pages/`): Route-level components that compose features

### State Management

- **Global Auth State**: AuthContext provides user, membership, and auth methods
- **Local State**: React hooks (useState, useEffect) for component-level state
- **Zustand**: Available for additional global state needs

### Styling Conventions

- Tailwind utility classes with custom design tokens
- CSS variables for theming (defined in `index.css`)
- Custom color palette: primary, image, audio, video, document, archive
- Gradient utilities: `bg-gradient-primary`, `text-gradient`
- Glass morphism: `glass` utility class

### Routing

- React Router DOM with nested routes
- Protected routes use `<ProtectedRoute>` wrapper
- Route structure:
  - `/` - Home page
  - `/image`, `/audio`, `/video` - Processor pages
  - `/login`, `/register` - Auth pages
  - `/profile`, `/membership` - Protected user pages

### Authentication Flow

1. AuthContext initializes on mount
2. Checks Supabase session
3. Loads user profile and membership from database
4. Listens for auth state changes
5. Provides auth methods (signIn, signUp, signOut, OAuth)

### Database Integration

- Supabase client configured in `src/lib/supabase.ts`
- Row Level Security (RLS) policies enforce data access
- Triggers auto-create profiles and free memberships
- Usage tracking via `usage_logs` table

## File Naming Conventions

- React components: PascalCase (e.g., `UserMenu.tsx`)
- Utilities/libs: camelCase (e.g., `supabase.ts`)
- Types: camelCase (e.g., `auth.ts`)
- CSS: kebab-case (e.g., `index.css`)

## Import Alias

- `@/` resolves to `src/` directory
- Example: `import { Button } from '@/components/ui/button'`
