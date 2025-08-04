# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview capabilities. It allows users to describe components in natural language and generates functional React components with real-time preview.

## Development Commands

- **Start development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build for production**: `npm run build`
- **Run tests**: `npm run test` (Vitest with jsdom environment)
- **Lint code**: `npm run lint` (ESLut with Next.js config)
- **Setup project**: `npm run setup` (installs deps, generates Prisma client, runs migrations)
- **Reset database**: `npm run db:reset` (force resets Prisma migrations)

## Architecture

### Core Structure
- **Next.js 15 App Router** with React 19 and TypeScript
- **Virtual File System**: Components exist in memory, not on disk (see `src/lib/file-system.ts`)
- **Real-time AI Chat**: Claude integration via Anthropic SDK and Vercel AI SDK
- **Live Preview**: Components render in iframe with hot reload
- **Database**: SQLite with Prisma ORM for user/project persistence

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/components/`: Reusable UI components organized by feature
- `src/lib/`: Core utilities, contexts, and business logic
- `src/actions/`: Server actions for database operations
- `prisma/`: Database schema and migrations

### Authentication & State
- Custom JWT-based auth system (see `src/lib/auth.ts`)
- Anonymous user support with work tracking (`src/lib/anon-work-tracker.ts`)
- React Context for file system and chat state management

### AI Integration
- Chat interface communicates with `/api/chat` route
- Uses tool calling for file operations (create, edit, delete files)
- JSX transformer handles component compilation (`src/lib/transform/jsx-transformer.ts`)

### File System
The virtual file system (`src/lib/file-system.ts`) manages in-memory files with:
- File CRUD operations
- Directory traversal
- Change detection for hot reload
- Persistence to database for registered users

### Testing
- Vitest for unit tests with React Testing Library
- Test files located in `__tests__` directories alongside source
- jsdom environment configured for DOM testing

## Common Patterns

### Adding New Components
1. Create component in appropriate `src/components/` subdirectory
2. Use existing UI components from `src/components/ui/`
3. Follow TypeScript conventions with proper prop types
4. Add tests in adjacent `__tests__` directory

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Regenerate client with `npx prisma generate`

### File System Operations
Use the FileSystemContext and provided tools:
- `file-manager.ts` for CRUD operations
- `str-replace.ts` for content transformations
- Context provides reactive state updates

## Dependencies

### Key Production Dependencies
- `@ai-sdk/anthropic` + `ai`: Claude AI integration
- `@monaco-editor/react`: Code editor component
- `@prisma/client`: Database ORM
- `@radix-ui/react-*`: UI component primitives
- `react-markdown`: Markdown rendering in chat

### Development Tools
- `vitest`: Test runner with React Testing Library
- `tailwindcss`: Utility-first CSS framework
- `eslint`: Code linting with Next.js configuration
- `typescript`: Type checking and development experience