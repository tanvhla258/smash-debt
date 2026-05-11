import { supabase } from './supabase';
import type { BreakfastItem, BreakfastOrder, BreakfastOrderItem, BreakfastOrderWithItems, BreakfastOrderWithDetails } from './db-types';

// ============ BREAKFAST ITEM OPERATIONS ============

export async function getActiveBreakfastItems(): Promise<BreakfastItem[]> {
  const { data, error } = await supabase
    .from('breakfast_items')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getAllBreakfastItems(): Promise<BreakfastItem[]> {
  const { data, error } = await supabase
    .from('breakfast_items')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getBreakfastItemById(itemId: string): Promise<BreakfastItem | null> {
  const { data, error } = await supabase
    .from('breakfast_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createBreakfastItem(item: {
  name: string;
  price: number;
  image_url?: string;
  note_options?: string[];
  is_active?: boolean;
}): Promise<BreakfastItem> {
  const { data, error } = await supabase
    .from('breakfast_items')
    .insert({
      name: item.name,
      price: item.price,
      image_url: item.image_url || null,
      note_options: item.note_options || [],
      is_active: item.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBreakfastItem(
  itemId: string,
  updates: {
    name?: string;
    price?: number;
    image_url?: string;
    note_options?: string[];
    is_active?: boolean;
  }
): Promise<BreakfastItem> {
  const { data, error } = await supabase
    .from('breakfast_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBreakfastItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('breakfast_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function toggleBreakfastItemActive(itemId: string, isActive: boolean): Promise<BreakfastItem> {
  return updateBreakfastItem(itemId, { is_active: isActive });
}

// ============ BREAKFAST ORDER OPERATIONS ============

export async function getBreakfastOrders(): Promise<BreakfastOrderWithItems[]> {
  const { data, error } = await supabase
    .from('breakfast_orders')
    .select(`
      *,
      breakfast_order_items (
        *,
        item:breakfast_items (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as BreakfastOrderWithItems[]) || [];
}

export async function getBreakfastOrdersByStatus(status: 'pending' | 'fulfilled'): Promise<BreakfastOrderWithItems[]> {
  const { data, error } = await supabase
    .from('breakfast_orders')
    .select(`
      *,
      breakfast_order_items (
        *,
        item:breakfast_items (*)
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as BreakfastOrderWithItems[]) || [];
}

export async function getBreakfastOrderById(orderId: string): Promise<BreakfastOrderWithDetails | null> {
  const { data, error } = await supabase
    .from('breakfast_orders')
    .select(`
      *,
      breakfast_order_items (
        *,
        item:breakfast_items (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as BreakfastOrderWithDetails;
}

export async function createBreakfastOrder(
  customerName: string,
  items: Array<{
    item_id: string;
    quantity: number;
    custom_note?: string;
  }>
): Promise<BreakfastOrder> {
  // Calculate total amount by fetching item prices
  const itemIds = items.map(i => i.item_id);
  const { data: breakfastItems, error: itemsError } = await supabase
    .from('breakfast_items')
    .select('id, price')
    .in('id', itemIds);

  if (itemsError) throw itemsError;

  const priceMap = new Map(breakfastItems?.map(item => [item.id, item.price]) || []);
  let totalAmount = 0;

  for (const item of items) {
    const price = priceMap.get(item.item_id);
    if (!price) throw new Error(`Item ${item.item_id} not found`);
    totalAmount += price * item.quantity;
  }

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('breakfast_orders')
    .insert({
      customer_name: customerName,
      total_amount: totalAmount,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    item_id: item.item_id,
    quantity: item.quantity,
    custom_note: item.custom_note || null,
  }));

  const { error: orderItemsError } = await supabase
    .from('breakfast_order_items')
    .insert(orderItems);

  if (orderItemsError) throw orderItemsError;

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'fulfilled'
): Promise<BreakfastOrder> {
  const { data, error } = await supabase
    .from('breakfast_orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleOrderStatus(orderId: string): Promise<BreakfastOrder> {
  const order = await getBreakfastOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const newStatus = order.status === 'pending' ? 'fulfilled' : 'pending';
  return updateOrderStatus(orderId, newStatus);
}

export async function deleteBreakfastOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('breakfast_orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
}

// ============ IMAGE UPLOAD OPERATIONS ============

export async function uploadBreakfastImage(
  file: File
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `breakfast/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('breakfast_images')
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    // If bucket doesn't exist, try to create it
    if (uploadError.message.includes('bucket')) {
      throw new Error('Storage bucket "breakfast_images" does not exist. Please create it in Supabase.');
    }
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from('breakfast_images')
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

export async function deleteBreakfastImage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/breakfast_images\/(.+)$/);
    if (pathMatch) {
      const filePath = pathMatch[1];

      const { error } = await supabase.storage
        .from('breakfast_images')
        .remove([filePath]);

      if (error) throw error;
    }
  } catch {
    // If URL parsing fails, ignore the error
    // The image might be an external URL
  }
}
