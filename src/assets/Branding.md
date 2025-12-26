# Branding & Customization

This project demonstrates how a missions-focused platform can be completely white-labeled. The current "Give Hope" styling is a demo implementation showing how organizations can tailor the portal to their own identity using a modern, professional, and accessible design system.

## Branding Configuration

Branding is primarily controlled through several key locations:

### 1. Global site config
`src/config/site.ts` defines the site name, description, and metadata used throughout the application.

### 2. Layouts & Context
- `src/app/layout.tsx`: Root metadata and SEO configuration.
- `src/app/(admin)/mc/layout.tsx`: Mission Control (Admin) specific branding, including the "Mission Control" logo and footer. It uses `zinc-900` (Black) for primary branding accents.
- `src/app/(donor)/layout.tsx` & `src/app/(missionary)/layout.tsx`: Pass the `tenantName` (e.g., "Give Hope") down to the shells.

### 3. Application Components
- `src/components/app-sidebar.tsx`: Dynamic logo rendering based on the `tenantName`. It uses a split-text approach for a modern, vertical branding look. Primary accents use `zinc-900` and `white`.
- `src/components/public/footer.tsx`: Public-facing branding for the donor checkout and informational pages.
- `src/app/(public)/page.tsx`: The landing page uses a high-impact black/white aesthetic to emphasize clarity and professionalism.

### 4. Tenant Redirection
- **Missionary & Mission Control Dashboards**: Within the settings pages (`/settings`), a dedicated "Identity" or "Module Info" section provides a direct link to the organization's public home page (defined by `siteConfig.url`).
- **Purpose**: This ensures that missionaries and administrators can easily navigate back to their public ministry presence to verify the donor experience or access public-facing tools.

## Customization Best Practices

- **Shadcn UI**: The project uses Shadcn components as the foundation. Styling should follow the existing utility-first Tailwind approach for consistency.
- **Color Scheme**: 
    - The platform has been transitioned away from emerald/green to a **high-contrast black/zinc** palette.
    - To change the primary branding color:
        1. Search for `bg-zinc-900`, `text-zinc-900`, and `border-zinc-900`.
        2. Replace with your brand's primary color class (e.g., `bg-blue-600`).
        3. Ensure secondary text uses muted scales like `zinc-400` or `zinc-500`.
- **Iconography**: Use Lucide icons to maintain a cohesive visual language.
- **Typography**: The platform combines `Inter` for functional UI and `Syne` for headlines to achieve a professional yet high-impact feel.

To switch branding text, simply update the `tenantName` in the layouts and the site configuration in `src/config/site.ts`.
