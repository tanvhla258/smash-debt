# Breakfast Menu - Task Breakdown

## Overview

Add a breakfast menu feature allowing authenticated users to manage food items and view orders, while non-authenticated users can browse the menu and place orders (entering their name only). This is a separate feature from the existing badminton debt tracking system.

## Phase 1: Database Schema & Types

### 1.1 Create database tables

**File:** `supabase/migrations/20260511_add_breakfast_menu.sql`

- [ ] Create `breakfast_items` table (id, name, price, image_url, note_options, is_active, created_at)
- [ ] Create `breakfast_orders` table (id, customer_name, total_amount, status, created_at)
- [ ] Create `breakfast_order_items` table (id, order_id, item_id, quantity, custom_note, created_at)
- [ ] Add appropriate indexes for performance
- [ ] Configure RLS policies
- [ ] Add `breakfast_images` storage bucket policy

### 1.2 Update TypeScript types

**File:** `lib/db-types.ts`

- [ ] Add `BreakfastItem` interface
- [ ] Add `BreakfastOrder` interface
- [ ] Add `BreakfastOrderItem` interface
- [ ] Add join types (`BreakfastOrderWithItems`, `BreakfastOrderWithDetails`)

## Phase 2: Database Operations

### 2.1 Implement breakfast item operations

**File:** `lib/breakfast-db.ts`

- [ ] `getActiveBreakfastItems()` - fetch all active menu items
- [ ] `getAllBreakfastItems()` - fetch all items (for admin)
- [ ] `createBreakfastItem()` - add new menu item
- [ ] `updateBreakfastItem()` - update existing item
- [ ] `deleteBreakfastItem()` - remove item
- [ ] `uploadBreakfastImage()` - upload image to Supabase Storage
- [ ] `deleteBreakfastImage()` - remove image from storage

### 2.2 Implement breakfast order operations

**File:** `lib/breakfast-db.ts`

- [ ] `createBreakfastOrder()` - create order with items
- [ ] `getBreakfastOrders()` - fetch all orders (admin only)
- [ ] `getBreakfastOrderById()` - fetch single order
- [ ] `updateOrderStatus()` - mark as pending/fulfilled
- [ ] `deleteBreakfastOrder()` - remove order

## Phase 3: UI Components

### 3.1 Create breakfast menu components

**File:** `components/breakfast-item-card.tsx`

- [ ] Display food item with image, name, price
- [ ] Show note options as selectable tags
- [ ] Admin controls: edit/delete buttons

**File:** `components/breakfast-item-form.tsx`

- [ ] Form to add/edit breakfast item
- [ ] Image upload with URL fallback
- [ ] Prebuilt note options (no onion, no spicy, extra hot, etc.)
- [ ] Custom note input field

**File:** `components/breakfast-order-form.tsx`

- [ ] Order placement form for non-auth users
- [ ] Customer name input
- [ ] Item selection with quantity
- [ ] Note options per item
- [ ] Order summary and submit

**File:** `components/breakfast-orders-list.tsx`

- [ ] Display all orders (admin only)
- [ ] Order status toggle (pending/fulfilled)
- [ ] Order details with items and notes
- [ ] Delete order button

## Phase 4: Page Implementation

### 4.1 Create breakfast menu page

**File:** `app/breakfast/page.tsx`

- [ ] Server component to fetch menu items
- [ ] Two view modes based on auth status:
  - Auth users: menu management + orders view
  - Non-auth users: menu browse + order form
- [ ] Responsive grid layout for menu items
- [ ] Toast notifications for actions

### 4.2 Create API routes for client-side operations

**File:** `app/api/breakfast/items/route.ts`

- [ ] GET - fetch all items
- [ ] POST - create new item (auth required)
- [ ] PUT - update item (auth required)
- [ ] DELETE - delete item (auth required)

**File:** `app/api/breakfast/orders/route.ts`

- [ ] GET - fetch all orders (auth required)
- [ ] POST - create new order (public)
- [ ] PATCH - update order status (auth required)
- [ ] DELETE - delete order (auth required)

**File:** `app/api/breakfast/upload/route.ts`

- [ ] POST - upload image to Supabase Storage (auth required)

## Phase 5: Navigation Integration

### 5.1 Update desktop navigation

**File:** `components/navigation.tsx`

- [ ] Add "Breakfast" link with Utensils icon

### 5.2 Update mobile bottom navigation

**File:** `components/mobile-bottom-nav.tsx`

- [ ] Add Breakfast nav item with Utensils icon

## Files to Create

1. `supabase/migrations/20260511_add_breakfast_menu.sql`
2. `lib/breakfast-db.ts`
3. `components/breakfast-item-card.tsx`
4. `components/breakfast-item-form.tsx`
5. `components/breakfast-order-form.tsx`
6. `components/breakfast-orders-list.tsx`
7. `app/breakfast/page.tsx`
8. `app/api/breakfast/items/route.ts`
9. `app/api/breakfast/orders/route.ts`
10. `app/api/breakfast/upload/route.ts`

## Files to Modify

1. `lib/db-types.ts` - Add breakfast-related types
2. `components/navigation.tsx` - Add Breakfast link
3. `components/mobile-bottom-nav.tsx` - Add Breakfast item

## Success Criteria

- [ ] Auth users can view all breakfast items and add/edit/delete them
- [ ] Non-auth users can browse menu and place orders with their name
- [ ] Orders are stored and only visible to authenticated users
- [ ] Food items display with image (URL or uploaded), name, price, and note options
- [ ] Prebuilt notes (no onion, no spicy, extra hot, etc.) are available for selection
- [ ] Order status can be toggled between pending and fulfilled
- [ ] Navigation includes breakfast menu access on both desktop and mobile
- [ ] Images can be uploaded to Supabase Storage or entered as URL
- [ ] Toast notifications provide feedback for all user actions
- [ ] Responsive design works on mobile and desktop
