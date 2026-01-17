# Technology Stack

## Build System

- **Bundler**: Vite 5.x
- **Package Manager**: npm
- **TypeScript**: 5.3.x with strict mode

## Frontend Stack

- **Framework**: React 18.2 with TypeScript
- **Routing**: React Router DOM 7.x
- **State Management**: Zustand 5.x for global state
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **UI Components**: Custom component library using class-variance-authority
- **Icons**: Lucide React

## Backend & Services

- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password + OAuth)
- **Security**: Google reCAPTCHA v3 for bot protection

## Key Libraries

- `@supabase/supabase-js`: Database and auth client
- `react-google-recaptcha-v3`: Bot protection
- `tailwind-merge` + `clsx`: Dynamic className utilities
- `tailwindcss-animate`: Animation utilities

## Common Commands

```bash
# Development
npm run dev          # Start dev server (default: http://localhost:5174)

# Build
npm run build        # TypeScript compilation + Vite build

# Preview
npm run preview      # Preview production build locally
```

## Environment Variables

Required in `.env.local`:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_RECAPTCHA_SITE_KEY`: Google reCAPTCHA site key

## Development Notes

- Vite uses port 5174 by default
- Hot module replacement (HMR) enabled
- Path alias `@/` maps to `src/`
- All environment variables must be prefixed with `VITE_`
