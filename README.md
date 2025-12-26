# Asymmetric.al - Kingdom Impact Platform

A high-performance, enterprise-grade Next.js 16.1 application for mission-focused organizations. Built for effortless impact with a sophisticated Zinc/Vega aesthetic.

## Architecture & Tech Stack

- **Framework**: Next.js 16.1 (App Router, Turbopack) - *Optimized for Performance*
- **UI System**: Tailwind CSS 4 + shadcn/ui (Vega Style) + Radix UI
- **Theme**: Forced Light Zinc Aesthetic (Zinc/Zinc)
- **Database**: Supabase (PostgreSQL) + Prisma
- **Authentication**: Supabase Auth (Unified across platforms)
- **Payments**: Stripe (Advanced integration)
- **State Management**: React 19 + TanStack Query v5
- **Animations**: Framer Motion + Tailwind Motion

## UX/UI Standards (December 2025)

The platform follows a standardized **Zinc Light** theme, optimized for both desktop and mobile viewports with a seamless, responsive transition.

### Typography
- **Primary**: Inter (`tracking-tight`)
- **Mono**: Geist Mono
- **Headings**: Refined tracking and bold weight for clarity

### Design Tokens
- **Padding**: Standardized `px-4 py-6 sm:px-6` for main content areas.
- **Borders**: Subtle `zinc-200/60` borders with refined border-radius.
- **Motion**: Staggered reveals and smooth transitions using `MotionPreset`.
- **Responsive**: Mobile-first navigation with robust drawers (Sheet) for sidebar access on smaller screens.

### Chart Standards
- **Aesthetic**: Data-dense, high-contrast using `Zinc` and `oklch` color tokens.
- **Bar Charts**: 
  - **Radius**: Uniform corner radius of `[4, 4, 0, 0]` on the top segment of stacked bars or all segments of non-stacked bars. Avoid fully rounded "domed" tops.
  - **Density**: Use `maxBarSize={52}` for bold, wide bars that scale responsibly.
  - **Axes**: Ensure Y-Axis labels have sufficient width (min `40px`) and margin (`tickMargin={8}`) to prevent numerical cutoff.
  - **Labels**: Use `month` only for X-Axis time series (e.g., "Nov", "Dec") to maintain high density without clutter.

## Multi-Tenant Architecture & Routing

This platform is architected for a multi-tenant environment, allowing a single deployment to serve multiple organizations with isolated data and customized subdomains.

### Production Routing Model
In a live production environment, the platform uses dynamic routing based on host headers (subdomains):

| User Role | Production URL | Routing Logic |
| :--- | :--- | :--- |
| **Public Site** | `tenanturl.org/` | Root application serving public content and giving pages. |
| **Organization Admin** | `tenanturl.org/admin` | Administrative interface for the organization (Mission Control). |
| **Missionaries/Workers** | `my.tenanturl.org` | Dedicated subdomain for field workers to manage their support and donors. |
| **Donors/Partners** | `tenanturl.org/dashboard` | Portal for donors to manage their contributions and pledges. |

### Demo Site Accessibility
For this demonstration and development environment, we have implemented aliases to allow easy access to all modules from a single domain:

- **Mission Control (Admin)**: Accessible via [/admin](/admin) (mapped to `/mc`)
- **Missionary Dashboard**: Accessible via [/my](/my) (mapped to `/missionary-dashboard`)
- **Donor Portal**: Accessible via [/dashboard](/dashboard) (mapped to `/donor-dashboard`)

### Implementation Details
- **Routing**: All routing logic, including demo aliases and production subdomains, is centralized in `src/proxy.ts` (Next.js 16 convention).
- **Proxy/Middleware**: The `src/proxy.ts` file uses the `updateSession` utility from `src/lib/supabase/proxy.ts` to manage authentication, session updates, and internal rewrites.
- **Conceptualization**: This architecture demonstrates how host-based routing isolates tenant context in production while providing path-based aliases for the demo environment.

## Project Modules

### Mission Control (MC)
The administrative headquarters for organization leaders. Manage CRM, Contributions, Member Care, and Mobilization with advanced reporting and automation tools.
- Route: `/mc`

### Missionary Dashboard
Empowering field missionaries with donor engagement tools, task management, and impact feeds.
- **My Feed**: A high-fidelity social engagement platform for missionaries to share updates directly with their support base.
  - **Functionality**: Supports rich text (HTML), multi-media carousels (images/videos), and real-time interaction (Likes, Prayers, Comments).
  - **Animations**: Reimagined reaction system using Framer Motion. Clicking reactions triggers custom micro-interactions: pulsing hearts, glowing prayer hands, and delightful emoji particle bursts for visceral feedback.
  - **UX/UI**: Built with shadcn/ui `Card` and `Carousel` components, featuring a refined Zinc aesthetic and responsive design optimized for field use.
- Route: `/missionary-dashboard`

### Donor Portal
A seamless experience for kingdom partners to manage their giving and follow mission progress.
- **Personalized Feed**: A unified view of updates from all followed or supported missionaries.
- **Connection Concept**: The platform automatically bridges the gap between giving and impact. If a donor gives to a specific missionary or "follows" their profile, that missionary's posts are instantly promoted to the donor's portal feed. This ensures donors stay connected to the stories and breakthroughs their generosity enables.
- Route: `/donor-dashboard`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint & Typecheck (Recommended before commit)
npm run lint && npm run typecheck
```

## Key Conventions

1. **RSC First**: Keep components as React Server Components unless interactivity is required.
2. **Next.js 16.1 Compliance**: Always `await` dynamic `params` and `searchParams` in routes and layouts.
3. **Zinc Aesthetic**: Use `zinc-900` for primary actions and `zinc-500` for secondary text.
4. **Responsive Integrity**: Test all UI changes on both 375px (Mobile) and 1440px (Desktop) viewports.

---

Built with ❤️ for the Kingdom.
