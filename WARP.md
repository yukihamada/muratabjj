# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Murata BJJ is a Brazilian Jiu-Jitsu learning platform that combines video instruction with flow-based technique visualization, adaptive review systems, and comprehensive progress tracking. The platform is supervised by Ryozo Murata (SJJIF World Champion).

## Core Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with Next.js optimization
npm run start        # Start production server
npm test             # Run Jest test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Code Quality
```bash
npm run lint         # ESLint checks for Next.js + TypeScript
npm run typecheck    # TypeScript strict mode validation
npm run pre-deploy   # Complete pre-deployment validation
```

### Database & Setup
```bash
npm run seed         # Seed database with techniques/categories/belt requirements
npm run seed:users   # Create test user accounts with different roles
npm run setup:database # Initialize database schema
npm run add:sample-videos # Add sample video content
```

### Testing Individual Features
```bash
# Run specific test files
npm test -- --testNamePattern="FlowEditor"
npm test -- src/components/__tests__/VideoPlayer.test.tsx

# Run tests for specific directories
npm test -- src/lib/
npm test -- src/hooks/
```

## Architecture Overview

### Core Learning System
The platform implements a sophisticated learning progression system:
- **5-Stage Mastery Model**: 理解 (Understanding) → 手順 (Process) → 再現 (Reproduction) → 連携 (Connection) → 実戦 (Application)
- **Adaptive Review System**: Uses SM-2 algorithm with forgetting curve calculations for optimal learning intervals
- **Flow-Based Technique Mapping**: Visual representation of technique sequences using React Flow

### Authentication & Authorization
- **Supabase Auth**: Email/password + Google OAuth integration
- **Row-Level Security (RLS)**: Database-level access control for all tables
- **Role-Based Access**: Admin, Coach, Pro User, Free User with tiered feature access
- **Subscription Management**: Stripe integration with Pro (¥1,200/month) and Dojo (¥6,000+/month) plans

### Data Architecture
**Primary Entities:**
- `videos`: Multilingual video content with AI transcription and chapter segmentation
- `flows`: User-created technique sequences stored as React Flow graphs
- `progress_tracking`: Individual learning progress with mastery levels
- `sparring_logs` & `sparring_events`: Training session data with timestamped events
- `review_schedule`: Adaptive spaced repetition scheduling

**Key Relationships:**
- Videos can have multiple chapters and keypoints for granular navigation
- Flows reference multiple videos and can be shared publicly or within dojos
- Progress tracking links users to both videos and flows with mastery scoring
- Review scheduling uses adaptive algorithms based on user performance

### Frontend Architecture
- **Next.js 14 App Router**: File-based routing with server/client component separation
- **TypeScript Strict Mode**: Full type safety with custom database types
- **Context-Based State**: Auth, Language, and Theme contexts for global state
- **Component Architecture**: Separation of concerns with hooks, contexts, and utilities

**Critical Components:**
- `FlowEditor`: React Flow-based visual technique sequence editor
- `VideoPlayer`: Video.js integration with chapter navigation and variable speed
- `AdaptiveReviewSystem`: Spaced repetition algorithm implementation
- `SparringEventLogger`: Real-time training session event capture

### API Design
All API routes follow RESTful patterns with:
- Zod validation for request/response schemas
- Supabase RLS for data access control
- Error handling with standardized responses
- Rate limiting for security

**Key API Endpoints:**
- `/api/transcribe`: OpenAI Whisper integration for video transcription
- `/api/dojos`: Dojo management with member role hierarchies  
- `/api/sparring-logs`: Training session data capture and analysis
- `/api/search`: Full-text search across videos, techniques, and flows

### Internationalization
Multi-language support (Japanese, English, Portuguese) with:
- Context-based language switching
- Database-stored multilingual content
- Locale-specific routing patterns

### AI Integration
- **OpenAI Whisper**: Automatic video transcription in multiple languages
- **GPT-4 Vision**: Video content analysis for technique identification
- **Custom Analysis Pipeline**: AI-powered technique categorization and difficulty assessment

## Development Patterns

### Database Migrations
All schema changes must be applied through Supabase migrations in order:
```bash
# Apply migrations in sequence
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_stripe_integration.sql
supabase/migrations/003_dojo_features.sql
# ... etc
```

### Component Development
- Use TypeScript strict mode for all components
- Implement proper error boundaries for production stability
- Follow mobile-first responsive design patterns
- Integrate proper accessibility (WCAG 2.1 AA compliance)

### Testing Strategy
- Unit tests for all utility functions and hooks
- Component tests for user interaction flows
- Integration tests for API endpoints
- Database tests for RLS policies

### Security Considerations
- Never expose `SUPABASE_SERVICE_ROLE_KEY` on client side
- All API routes must validate user permissions
- Sensitive data (sparring logs, personal info) requires explicit consent
- Rate limiting on all public endpoints

## Deployment

### Environment Variables (Production)
Required for Vercel deployment:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

### Pre-deployment Checklist
```bash
npm run pre-deploy   # Comprehensive validation
# Verifies: TypeScript, ESLint, tests, build, and environment variables
```

## Test Accounts
Development environment includes pre-configured test users:
- **Admin**: admin@test.muratabjj.com / Admin123!@#
- **Coach**: coach@test.muratabjj.com / Coach123!@#  
- **Pro User**: pro@test.muratabjj.com / Pro123!@#
- **Free User**: user@test.muratabjj.com / User123!@#

## Key Files to Understand

### Core Architecture
- `src/types/database.ts`: Complete database schema types
- `src/types/flow.ts`: Flow editor and technique mapping types
- `src/lib/adaptive-review.ts`: Spaced repetition learning algorithm
- `src/hooks/useAuth.tsx`: Authentication and user profile management

### Business Logic
- `src/components/FlowEditor.tsx`: Visual technique sequence editor
- `src/components/VideoPlayer.tsx`: Enhanced video playback with chapters
- `src/components/ProgressTracker.tsx`: Learning progress visualization
- `src/components/SparringEventLogger.tsx`: Training session recording

### Database Schema
- `supabase/migrations/001_initial_schema.sql`: Core table definitions
- Database enforces strict RLS policies for multi-tenant security

This platform combines educational technology with domain-specific BJJ knowledge, requiring understanding of both the technical implementation and the martial arts learning methodology.
