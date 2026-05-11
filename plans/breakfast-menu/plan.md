# Breakfast Menu - Implementation Plan

## Overview

Add a standalone breakfast menu and ordering system to the Smash Debt application. Authenticated users can manage the menu (CRUD operations on food items) and view orders. Non-authenticated users can browse the menu and place orders by entering their name only. The feature is completely separate from the existing badminton debt tracking system.

**Why:** To provide an additional utility for the badminton group beyond debt tracking, allowing members to order breakfast before/after sessions.

## Architecture

### Data Model

```
breakfast_items
├── id (UUID)
├── name (TEXT)
├── price (DECIMAL)
├── image_url (TEXT, nullable)
├── note_options (TEXT[]) - prebuilt notes like ["no onion", "no spicy"]
├── is_active (BOOLEAN, default true)
└── created_at (TIMESTAMP)

breakfast_orders
├── id (UUID)
├── customer_name (TEXT)
├── total_amount (DECIMAL)
├── status (ENUM: 'pending' | 'fulfilled')
└── created_at (TIMESTAMP)

breakfast_order_items
├── id (UUID)
├── order_id (UUID, FK → breakfast_orders)
├── item_id (UUID, FK → breakfast_items)
├── quantity (INTEGER)
├── custom_note (TEXT, nullable)
└── created_at (TIMESTAMP)
```

### Component Structure

```
app/breakfast/page.tsx (main page)
├── Server Component (fetches data)
├── Auth View:
│   ├── BreakfastOrdersList (admin orders view)
│   └── BreakfastItemForm (add/edit modal)
└── Guest View:
    └── BreakfastOrderForm (place order)
```

### Storage

- **Database**: Supabase PostgreSQL (new tables)
- **Images**: Supabase Storage bucket `breakfast_images`

## Technical Decisions

### Decision 1: Separate database tables vs. integrating with existing system

**Rationale:** Keep breakfast menu as a completely separate feature. This avoids coupling between unrelated domains (badminton sessions vs. breakfast orders) and makes the codebase more maintainable.

**How to apply:** Create new tables (`breakfast_items`, `breakfast_orders`, `breakfast_order_items`) without any foreign keys to existing tables.

### Decision 2: Non-auth users identify by name only

**Rationale:** Simplicity for users. The group already knows each other, so a simple name is sufficient identification. No need for complex account creation or email verification.

**How to apply:** `breakfast_orders.customer_name` stores just the name field, no user relationship.

### Decision 3: Two navigation implementations (desktop sidebar + mobile bottom nav)

**Rationale:** The app already has this pattern for other features (Calendar, Sessions, Users, Debt). Maintain consistency.

**How to apply:** Add Breakfast link to `components/navigation.tsx` and item to `components/mobile-bottom-nav.tsx` with `Utensils` icon from lucide-react.

### Decision 4: Server Component for main page, API routes for mutations

**Rationale:** Leverage Next.js 16 App Router's Server Components by default for data fetching. Use API routes for write operations to handle file uploads and keep client code minimal.

**How to apply:** `app/breakfast/page.tsx` is a Server Component that fetches menu items. Client components for forms use API routes (`/api/breakfast/*`) for CRUD operations.

### Decision 5: Image handling with both upload and URL options

**Rationale:** Flexibility for admins. Some prefer using external URLs (Unsplash, etc.), others want to upload directly. Support both.

**How to apply:** `BreakfastItemForm` has two tabs/sections: one for file upload to Supabase Storage, another for URL input.

## Implementation Strategy

### Step 1: Database Schema (Prerequisite)
1. Create migration file with new tables
2. Add RLS policies for development (public access, tighten for production)
3. Create Supabase Storage bucket for images
4. Run migration to apply schema changes

### Step 2: TypeScript Types
1. Define interfaces for all breakfast-related entities
2. Add join types for queries with relations
3. Export from `lib/db-types.ts`

### Step 3: Database Operations Layer
1. Create `lib/breakfast-db.ts` with all CRUD functions
2. Implement image upload/delete helpers using Supabase Storage SDK
3. Follow pattern established in `lib/db.ts`

### Step 4: API Routes
1. Create `/api/breakfast/items/route.ts` for item CRUD
2. Create `/api/breakfast/orders/route.ts` for order management
3. Create `/api/breakfast/upload/route.ts` for image uploads
4. Add auth checks where required (item operations, order viewing)

### Step 5: UI Components
1. Build reusable components: `BreakfastItemCard`, `BreakfastItemForm`, `BreakfastOrderForm`, `BreakfastOrdersList`
2. Use existing shadcn/ui components for consistency
3. Implement prebuilt note options as selectable tags
4. Add toast notifications for user feedback

### Step 6: Page Implementation
1. Create `app/breakfast/page.tsx` as Server Component
2. Fetch menu items server-side
3. Render different views based on auth status
4. Integrate all UI components

### Step 7: Navigation Integration
1. Add Breakfast link to desktop navigation
2. Add Breakfast item to mobile bottom navigation
3. Test responsive behavior

## Risks & Mitigations

### Risk 1: Image upload size/format issues

**Mitigation:** Add client-side validation for file size (e.g., max 5MB) and allowed formats (jpg, png, webp). Server-side should also validate before uploading to Supabase Storage.

### Risk 2: Concurrent order modifications

**Mitigation:** Use optimistic updates with toast notifications. If server operation fails, revert UI state. Consider adding row-level locking if ordering becomes high-volume.

### Risk 3: RLS policies too permissive for production

**Mitigation:** Current migration uses public access for development. Add production-ready policies: non-auth users can only read active items and create orders; auth users can manage items and view orders.

### Risk 4: State management for order form

**Mitigation:** Use React state with a simple reducer to manage order items array. Each order item has its own quantity and note state. Keep it local to the form component.

### Risk 5: Mobile UX for complex order forms

**Mitigation:** Design with mobile-first approach. Use collapsible sections, larger touch targets, and step-by-step flow if needed. Test on actual mobile devices.
