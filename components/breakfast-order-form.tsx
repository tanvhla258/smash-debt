'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/toast';
import { formatCurrency, cn } from '@/lib/utils';
import type { BreakfastItemWithVariants } from '@/lib/db-types';

interface OrderItem {
  item: BreakfastItemWithVariants;
  quantity: number;
  variantId: string | null;
  customNote?: string;
}

interface BreakfastOrderFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items: BreakfastItemWithVariants[];
  onSuccess?: () => void;
}

export function BreakfastOrderForm({
  open,
  onOpenChange,
  items,
  onSuccess,
}: BreakfastOrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const total = orderItems.reduce((sum, oi) => {
    const variant = oi.item.variants.find(v => v.id === oi.variantId);
    const price = variant ? variant.price : oi.item.price;
    return sum + price * oi.quantity;
  }, 0);

  useEffect(() => {
    if (!open) {
      setCustomerName('');
      setOrderItems([]);
      setSelectedItemId(null);
      setSelectedVariantId(null);
    }
  }, [open]);

  const selectedItem = items.find(i => i.id === selectedItemId);

  function handleAddItem() {
    if (!selectedItem) return;

    // If item has variants, require variant selection
    const hasVariants = selectedItem.variants && selectedItem.variants.length > 0;
    const variantId = hasVariants ? selectedVariantId : null;

    if (hasVariants && !variantId) {
      addToast('Please select a variant', 'error');
      return;
    }

    const existing = orderItems.find(oi => oi.item.id === selectedItem.id && oi.variantId === variantId);
    if (existing) {
      setOrderItems(oi =>
        oi.map(item =>
          item.item.id === selectedItem.id && item.variantId === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(oi => [...oi, { item: selectedItem, quantity: 1, variantId }]);
    }
    setSelectedItemId(null);
    setSelectedVariantId(null);
  }

  function handleUpdateQuantity(itemId: string, delta: number) {
    setOrderItems(oi =>
      oi
        .map(item => {
          if (item.item.id === itemId) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  }

  function handleRemoveItem(itemId: string) {
    setOrderItems(oi => oi.filter(item => item.item.id !== itemId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim()) {
      addToast('Please enter your name', 'error');
      return;
    }

    if (orderItems.length === 0) {
      addToast('Please add at least one item', 'error');
      return;
    }

    const data = {
      customerName: customerName.trim(),
      items: orderItems.map(oi => ({
        item_id: oi.item.id,
        variant_id: oi.variantId,
        quantity: oi.quantity,
        custom_note: oi.customNote,
      })),
    };

    // Emit the data via a custom event
    const event = new CustomEvent('breakfast-order-submit', { detail: data });
    window.dispatchEvent(event);

    // Reset and close
    setCustomerName('');
    setOrderItems([]);
    setSelectedItemId(null);
    onOpenChange?.(false);
    onSuccess?.();
    addToast('Order placed successfully', 'success');
  }

  function handleNoteUpdate(itemId: string, note: string) {
    setOrderItems(oi =>
      oi.map(item =>
        item.item.id === itemId ? { ...item, customNote: note } : item
      )
    );
  }

  function toggleNoteOption(itemId: string, note: string) {
    const orderItem = orderItems.find(oi => oi.item.id === itemId);
    if (!orderItem) return;

    const currentNotes = orderItem.customNote?.split(',').map(n => n.trim()) || [];
    const newNotes = currentNotes.includes(note)
      ? currentNotes.filter(n => n !== note)
      : [...currentNotes, note];

    handleNoteUpdate(itemId, newNotes.filter(Boolean).join(', '));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Place Breakfast Order</DialogTitle>
            <DialogDescription>
              Select items from the menu and add your name to place an order.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Customer Name */}
            <div>
              <Label htmlFor="customerName">Your Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2"
                required
              />
            </div>

            {/* Item Selection */}
            <div>
              <Label>Select Items</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg p-2">
                {items.map((item) => {
                  const hasVariants = item.variants && item.variants.length > 0;
                  const displayPrice = hasVariants
                    ? `${formatCurrency(Math.min(...item.variants.map(v => v.price)))}+`
                    : formatCurrency(item.price);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        if (!hasVariants) setSelectedVariantId(null);
                      }}
                      className={cn(
                        'text-left p-2 rounded-lg border transition-all hover:border-zinc-400 dark:hover:border-zinc-600',
                        selectedItemId === item.id
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                          : 'border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {displayPrice}
                        </span>
                      </div>
                      {hasVariants && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {item.variants.length} size{item.variants.length > 1 ? 's' : ''} available
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedItem && selectedItem.variants && selectedItem.variants.length > 0 && (
                <div className="mt-2 space-y-2">
                  <Label>Select Size</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedItem.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          'p-2 rounded-lg border text-center transition-all',
                          selectedVariantId === variant.id
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        )}
                      >
                        <div className="text-sm font-medium">{variant.name}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {formatCurrency(variant.price)}
                        </div>
                        {variant.is_default && (
                          <div className="text-xs text-zinc-500 mt-0.5">Default</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem && (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add {selectedItem.name}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedItemId(null);
                      setSelectedVariantId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <Label>Order Items</Label>
                {orderItems.map((orderItem) => {
                  const variant = orderItem.item.variants?.find(v => v.id === orderItem.variantId);
                  const price = variant ? variant.price : orderItem.item.price;
                  const displayName = variant ? `${orderItem.item.name} (${variant.name})` : orderItem.item.name;

                  return (
                    <Card key={`${orderItem.item.id}-${orderItem.variantId}`}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{displayName}</p>
                            <p className="text-xs text-zinc-500">
                              {formatCurrency(price)} x {orderItem.quantity}
                            </p>
                          </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleUpdateQuantity(orderItem.item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">
                            {orderItem.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleUpdateQuantity(orderItem.item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveItem(orderItem.item.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Note Options */}
                      {orderItem.item.note_options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {orderItem.item.note_options.map((note) => (
                            <button
                              key={note}
                              type="button"
                              onClick={() => toggleNoteOption(orderItem.item.id, note)}
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full transition-colors',
                                orderItem.customNote?.includes(note)
                                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              )}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Custom Note */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Custom note..."
                          value={orderItem.customNote || ''}
                          onChange={(e) => handleNoteUpdate(orderItem.item.id, e.target.value)}
                          className="text-sm"
                        />
                        {orderItem.customNote && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleNoteUpdate(orderItem.item.id, '')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}

            {/* Total */}
            {orderItems.length > 0 && (
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || orderItems.length === 0}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order ${total > 0 ? `- ${formatCurrency(total)}` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
