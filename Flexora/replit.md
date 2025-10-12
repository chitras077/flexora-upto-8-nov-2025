# Flexora - All-in-One Multi-Tool Platform

## Overview

Flexora is a comprehensive web-based multi-tool platform that provides professional-grade tools across seven main categories: Image Processing, Video Processing, Document Editing, Universal Converters, AI Writing & Productivity, Modern Utilities, and File Conversion. The platform operates entirely client-side in the browser, ensuring user privacy and fast performance without requiring server-side processing for most operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack**
- **React 18** with TypeScript for type-safe component development and modern React features
- **Vite** as the build tool providing fast HMR (Hot Module Replacement) and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **Tailwind CSS** for utility-first styling with extensive customization through CSS variables
- **shadcn/ui + Radix UI** component library providing 40+ accessible, pre-built components

**Rationale**: This stack was chosen for maximum performance and developer experience. Vite offers significantly faster build times than webpack-based solutions. Wouter provides routing with a smaller bundle size than React Router. The shadcn/ui + Radix combination ensures accessibility compliance while maintaining full customization control.

**State Management Strategy**
- **TanStack Query (React Query)** for server state, caching, and data synchronization
- **Local React state** (useState, useRef) for component-level UI state
- **react-hook-form** with @hookform/resolvers for performant form state management and validation

**Rationale**: TanStack Query eliminates the need for global state management libraries (Redux, Zustand) for server data, automatically handling caching, refetching, and synchronization. Forms use react-hook-form to minimize re-renders and improve performance on complex forms.

**Design System**
- HSL-based color system defined in CSS variables for consistent theming
- Light/Dark mode support through CSS class toggling on document root
- Custom CSS variables for gradients (`--gradient-hero`, `--gradient-card`), shadows, and transitions
- Mobile-first responsive design with Tailwind breakpoints
- Design tokens centralized in `src/index.css` and `tailwind.config.ts`

**Rationale**: HSL color space allows easier color manipulation (lightness/darkness adjustments) compared to RGB/HEX. CSS variables enable runtime theme switching without JavaScript recalculation. Mobile-first approach ensures optimal performance on constrained devices.

### Application Structure

**Routing Architecture**
The application uses a flat route structure with dedicated pages:
- `/` - Landing page with category overview and smart search functionality
- `/image-tools` - Image processing suite with filters, adjustments, and AI features
- `/video-tools` - Video editing tools for trimming, merging, and effects
- `/document-editor` - Document creation and editing suite
- `/converters` - Unit and currency conversion tools
- `/ai-writing` - AI-powered writing assistance tools
- `/utilities` - Text tools, hash generators, color converters, etc.
- `/file-converter` - Multi-format file conversion (images, videos, documents)
- `/roadmap` - Public product roadmap
- `/health` - System status endpoint
- `/all-tools` - Comprehensive tool directory
- `*` (404) - Custom error page with navigation options

**Rationale**: Flat routing structure improves discoverability and SEO. Each category has a dedicated page to allow focused loading of category-specific assets, reducing initial bundle size.

**Component Architecture**
- **Modular component structure**: Each UI component is self-contained with its own logic and styles
- **Composition pattern**: Complex components built from smaller, reusable primitives
- **Path aliases** configured for clean imports (`@/components`, `@/lib`, `@/hooks`, `@shared`, `@assets`)
- **Shared components**: Navbar, Footer, CategoryCard extracted as reusable components

**Client-Side Processing Approach**
- Image processing uses Canvas API and File API for browser-based manipulation
- Video processing leverages MediaSource API and Web Codecs where available
- File conversion handled through browser APIs (FileReader, Blob, Canvas)
- All processing happens client-side to ensure privacy and reduce server load

**Rationale**: Client-side processing eliminates server costs for computational tasks, ensures user privacy (files never leave the browser), and provides instant results without network latency.

### Backend Architecture

**Server Structure**
- **Express.js** server for API endpoints and static file serving
- **Development mode**: Vite middleware integration for HMR
- **Production mode**: Serves pre-built static files from `dist/public`
- **Request logging**: Custom middleware for API request/response logging with duration tracking

**Data Layer**
- **Drizzle ORM** configured for database operations with type-safe queries
- **Zod schemas** for runtime validation integrated with Drizzle
- **In-memory storage** (MemStorage class) used as fallback/development storage
- Schema defined in `shared/schema.ts` with example User model

**Rationale**: Drizzle ORM provides excellent TypeScript integration and performance. The abstracted storage interface (IStorage) allows swapping between in-memory, PostgreSQL, or other databases without changing application code. Zod integration ensures data validation at runtime matches TypeScript types at compile time.

**API Structure**
- RESTful API endpoints under `/api` prefix
- Example endpoints: `/api/users` (GET, POST)
- Centralized error handling with descriptive error messages
- JSON-only API responses

**Build and Deployment**
- **Development**: `tsx watch` for auto-reloading server + Vite dev server for client
- **Production**: Vite builds client to `dist/public`, Express serves static files
- **Scripts**: Separate dev/build/start scripts in package.json

## External Dependencies

### UI and Component Libraries
- **@radix-ui/react-*** (25+ packages): Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Component collection built on Radix UI with Tailwind styling
- **lucide-react**: Icon library with 1000+ SVG icons
- **embla-carousel-react**: Carousel/slider component
- **cmdk**: Command palette component for keyboard-driven navigation
- **vaul**: Drawer component for mobile interfaces

### Form and Validation
- **react-hook-form**: Performant form state management
- **@hookform/resolvers**: Validation resolver integration
- **zod**: Schema validation library
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management, caching, and synchronization

### Utilities
- **class-variance-authority**: Type-safe CSS class composition
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging without conflicts
- **date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Type safety across the entire codebase
- **ESLint**: Code linting with TypeScript support
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for server
- **PostCSS + Autoprefixer**: CSS processing

### Database and ORM
- **drizzle-orm**: TypeScript ORM (currently configured but Postgres not actively used)
- Note: Application may add PostgreSQL integration in the future

### Potential External Services
Based on the project requirements document, the following external services are planned but not yet implemented:
- **Payment Gateways**: Razorpay, Stripe for premium subscriptions (PhonePe, GPay, PayTM, UPI support planned)
- **Google AdSense**: Ad monetization (ad slot placement designed, integration pending)
- **AI Services**: For image upscaling, background removal, content generation (providers TBD)
- **Authentication**: OAuth providers for social login (implementation pending)

### Known Issues and Planned Improvements
Per the attached review notes, the following features need implementation:
- Sign-in functionality (placeholder exists, needs OAuth integration)
- Premium subscription system (UI present, payment integration needed)
- Smart search functionality (search bar exists, tool search logic needed)
- "View All Tools" page functionality (route exists at `/all-tools`, needs full implementation)
- Image tool integration (separate tool buttons should be integrated into main editor)
- Filter intensity adjustments (Sepia and Cool filters too intense, need parameter tuning)
- Image upscaling with user-selectable factors (2x, 3x, 4x options needed)