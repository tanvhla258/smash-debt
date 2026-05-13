'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BreakfastItemCard } from '@/components/breakfast-item-card';
import { BreakfastItemForm } from '@/components/breakfast-item-form';
import { BreakfastOrderForm } from '@/components/breakfast-order-form';
import { BreakfastOrdersList } from '@/components/breakfast-orders-list';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast';
import { Plus, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import type { BreakfastItemWithVariants, BreakfastItem } from '@/lib/db-types';
import type { BreakfastOrderWithItems } from '@/lib/db-types';
import { formatCurrency } from '@/lib/utils';

export default function BreakfastPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<BreakfastItemWithVariants[]>([]);
  const [orders, setOrders] = useState<BreakfastOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BreakfastItemWithVariants | null>(null);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  // Fetch menu items
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch orders for authenticated users
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Listen for custom events from forms
  useEffect(() => {
    const handleItemSubmit = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        data: any;
        item: BreakfastItem | null;
        isEditing: boolean;
      }>;
      const { data, item: existingItem, isEditing } = customEvent.detail;

      try {
        if (isEditing) {
          // Handle file upload if needed
          if (data.image_url?.startsWith('data:')) {
            const formData = new FormData();
            formData.append('file', dataURLtoFile(data.image_url, 'image.jpg'));

            const uploadRes = await fetch('/api/breakfast/upload', {
              method: 'POST',
              body: formData,
            });

            if (!uploadRes.ok) throw new Error('Failed to upload image');

            const uploadData = await uploadRes.json();
            data.image_url = uploadData.url;
          }

          const res = await fetch('/api/breakfast/items', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: existingItem?.id, ...data }),
          });

          if (!res.ok) throw new Error('Failed to update item');
        } else {
          // Handle file upload if needed
          if (data.image_url?.startsWith('data:')) {
            const formData = new FormData();
            formData.append('file', dataURLtoFile(data.image_url, 'image.jpg'));

            const uploadRes = await fetch('/api/breakfast/upload', {
              method: 'POST',
              body: formData,
            });

            if (!uploadRes.ok) throw new Error('Failed to upload image');

            const uploadData = await uploadRes.json();
            data.image_url = uploadData.url;
          }

          const res = await fetch('/api/breakfast/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!res.ok) throw new Error('Failed to create item');
        }

        await fetchItems();
      } catch (error) {
        console.error('Error saving item:', error);
        addToast('Failed to save item', 'error');
      }
    };

    const handleOrderSubmit = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        customerName: string;
        items: Array<{ item_id: string; quantity: number; custom_note?: string }>;
      }>;
      const { customerName, items: orderItems } = customEvent.detail;

      try {
        const res = await fetch('/api/breakfast/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName, items: orderItems }),
        });

        if (!res.ok) throw new Error('Failed to place order');

        setSelectedItems(new Map());
      } catch (error) {
        console.error('Error placing order:', error);
        addToast('Failed to place order', 'error');
      }
    };

    const handleOrderDelete = async (event: Event) => {
      const customEvent = event as CustomEvent<{ orderId: string }>;
      const { orderId } = customEvent.detail;

      try {
        const res = await fetch(`/api/breakfast/orders?id=${orderId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete order');

        await fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        addToast('Failed to delete order', 'error');
      }
    };

    const handleOrderStatusToggle = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        orderId: string;
        status: 'pending' | 'fulfilled';
      }>;
      const { orderId, status } = customEvent.detail;

      try {
        const res = await fetch('/api/breakfast/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: orderId, status }),
        });

        if (!res.ok) throw new Error('Failed to update order');

        await fetchOrders();
      } catch (error) {
        console.error('Error updating order:', error);
        addToast('Failed to update order', 'error');
      }
    };

    window.addEventListener('breakfast-item-submit', handleItemSubmit);
    window.addEventListener('breakfast-order-submit', handleOrderSubmit);
    window.addEventListener('breakfast-order-delete', handleOrderDelete);
    window.addEventListener('breakfast-order-status-toggle', handleOrderStatusToggle);

    return () => {
      window.removeEventListener('breakfast-item-submit', handleItemSubmit);
      window.removeEventListener('breakfast-order-submit', handleOrderSubmit);
      window.removeEventListener('breakfast-order-delete', handleOrderDelete);
      window.removeEventListener('breakfast-order-status-toggle', handleOrderStatusToggle);
    };
  }, [addToast, user]);

  async function fetchItems() {
    try {
      setLoading(true);
      const res = await fetch('/api/breakfast/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      addToast('Failed to load menu items', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/breakfast/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleDeleteItem(item: BreakfastItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/breakfast/items?id=${item.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete item');

      await fetchItems();
      addToast('Item deleted', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      addToast('Failed to delete item', 'error');
    }
  }

  async function handleToggleActive(item: BreakfastItem) {
    try {
      const res = await fetch('/api/breakfast/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });

      if (!res.ok) throw new Error('Failed to update item');

      await fetchItems();
      addToast(`Item ${item.is_active ? 'hidden' : 'shown'}`, 'success');
    } catch (error) {
      console.error('Error toggling active:', error);
      addToast('Failed to update item', 'error');
    }
  }

  const activeItems = items.filter(i => i.is_active);
  const totalAmount = activeItems.reduce(
    (sum, item) => {
      const qty = selectedItems.get(item.id) || 0;
      const defaultVariant = item.variants?.find(v => v.is_default);
      const price = defaultVariant?.price ?? item.variants?.[0]?.price ?? item.price;
      return sum + price * qty;
    },
    0
  );

  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  const totalSelected = Array.from(selectedItems.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6" />
              Breakfast Menu
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {user ? 'Manage the breakfast menu and view orders.' : 'Browse the menu and place your order.'}
            </p>
          </div>
          {user ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setShowItemForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowOrderForm(true)} disabled={totalSelected === 0}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Order ({totalSelected}) - {formatCurrency(totalAmount)}
            </Button>
          )}
        </div>
      </div>

      {/* Auth Users: Menu Management + Orders */}
      {user ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu Items</h2>
            </div>
            {activeItems.length === 0 && items.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No menu items yet. Add your first item!
                </p>
              </div>
            ) : activeItems.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No active items. Toggle visibility from the items list.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeItems.map((item) => (
                  <BreakfastItemCard
                    key={item.id}
                    item={item}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowItemForm(true);
                    }}
                    onDelete={handleDeleteItem}
                    showActions
                  />
                ))}
              </div>
            )}

            {/* Inactive Items */}
            {items.filter(i => !i.is_active).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                  Hidden Items ({items.filter(i => !i.is_active).length})
                </h3>
                <div className="space-y-2">
                  {items.filter(i => !i.is_active).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-zinc-500">
                          {item.variants?.map(v => `${v.name}: ${formatCurrency(v.price)}`).join(' · ') || formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item)}
                        >
                          Show
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setShowItemForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-500"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Orders</h2>
            <BreakfastOrdersList
              orders={orders}
              loading={ordersLoading}
              onRefresh={fetchOrders}
            />
          </div>
        </div>
      ) : (
        /* Guest View: Menu Browse + Order Form */
        <>
          {activeItems.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No menu items available right now.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activeItems.map((item) => (
                  <BreakfastItemCard
                    key={item.id}
                    item={item}
                    quantity={selectedItems.get(item.id) || 0}
                    onSelect={(item) => {
                      const newItems = new Map(selectedItems);
                      const current = newItems.get(item.id) || 0;
                      newItems.set(item.id, current + 1);
                      setSelectedItems(newItems);
                    }}
                  />
                ))}
              </div>

              {/* Order Floating Button */}
              {totalSelected > 0 && (
                <Button
                  size="lg"
                  className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-30 shadow-lg"
                  onClick={() => setShowOrderForm(true)}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order ({totalSelected}) - {formatCurrency(totalAmount)}
                </Button>
              )}
            </>
          )}
        </>
      )}

      {/* Dialogs */}
      {user && (
        <BreakfastItemForm
          open={showItemForm}
          onOpenChange={setShowItemForm}
          item={editingItem}
          onSuccess={fetchItems}
        />
      )}

      {!user && (
        <BreakfastOrderForm
          open={showOrderForm}
          onOpenChange={setShowOrderForm}
          items={activeItems}
          onSuccess={() => {
            setSelectedItems(new Map());
            setShowOrderForm(false);
          }}
        />
      )}
    </div>
  );
}
