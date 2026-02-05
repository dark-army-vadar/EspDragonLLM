# NEXUS C2 Control System

## Overview

NEXUS is a command-and-control (C2) dashboard application with a cyberpunk/terminal aesthetic. It manages remote agents across multiple operating systems (Windows, Android, Linux), enabling command execution, log analysis, and AI-powered script generation. The system provides real-time monitoring of agent status, command history, and automated security suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state with aggressive polling for real-time updates
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk theme (neon green/blue palette, terminal fonts)
- **Animations**: Framer Motion for slide-in panels and glitch effects
- **Build Tool**: Vite with custom path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Design**: REST endpoints defined in shared/routes.ts with Zod schema validation
- **Server Entry**: server/index.ts creates HTTP server, registers routes, serves static files

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations output to ./migrations
- **Connection**: Connection pool via pg library, requires DATABASE_URL environment variable

### Key Data Models
- **Agents**: Remote devices with UUID, hostname, OS type, status, metadata
- **Commands**: Instructions sent to agents with status tracking (pending/completed/failed)
- **Logs**: Activity logs per agent for monitoring and AI analysis
- **Detected Apps**: Applications discovered on agents with functionality mapping
- **Agent Suggestions**: AI-generated automation recommendations

### API Structure
Routes are defined declaratively in shared/routes.ts with:
- Path definitions with parameter placeholders
- Zod input/output schemas for type safety
- HTTP method specifications
- Endpoints organized by resource: agents, commands, logs, detections, suggestions, scripts

### Build System
- **Development**: tsx for TypeScript execution with Vite dev server and HMR
- **Production**: Custom build script (script/build.ts) using esbuild for server bundling and Vite for client
- **Output**: dist/public for client assets, dist/index.cjs for server bundle

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)
- connect-pg-simple for session storage

### AI Services (Optional)
- OpenAI API for script generation and log analysis
- Google Generative AI as alternative AI provider

### Key NPM Packages
- **drizzle-orm** + **drizzle-zod**: Database ORM with Zod schema generation
- **@tanstack/react-query**: Server state management with polling
- **framer-motion**: Animation library for cyberpunk UI effects
- **date-fns**: Timestamp formatting throughout the application
- **zod**: Runtime type validation for API contracts
- **express-session**: Session management for authentication