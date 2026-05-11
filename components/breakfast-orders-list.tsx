'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/toast';
import { formatCurrency, cn } from '@/lib/utils';
import type { BreakfastOrderWithItems } from '@/lib/db-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BreakfastOrdersListProps {
  orders: BreakfastOrderWithItems[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function BreakfastOrdersList({ orders, loading, onRefresh }: BreakfastOrdersListProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const fulfilledOrders = orders.filter(o => o.status === 'fulfilled');

  function toggleOrderExpanded(orderId: string) {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  function handleDeleteOrder(orderId: string, customerName: string) {
    const event = new CustomEvent('breakfast-order-delete', { detail: { orderId } });
    window.dispatchEvent(event);
    addToast(`Order for ${customerName} deleted`, 'info');
  }

  function handleToggleStatus(order: BreakfastOrderWithItems) {
    const newStatus = order.status === 'pending' ? 'fulfilled' : 'pending';
    const event = new CustomEvent('breakfast-order-status-toggle', { detail: { orderId: order.id, status: newStatus } });
    window.dispatchEvent(event);
    addToast(`Order marked as ${newStatus}`, 'success');
  }

  function OrdersByStatus({
    title,
    orders: statusOrders,
    emptyMessage,
    icon: Icon,
  }: {
    title: string;
    orders: BreakfastOrderWithItems[];
    emptyMessage: string;
    icon: React.ComponentType<{ className?: string }>;
  }) {
    if (statusOrders.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          {title} ({statusOrders.length})
        </h3>
        {statusOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "p-1.5 rounded-full",
                    order.status === 'pending'
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-green-100 dark:bg-green-900/30"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      order.status === 'pending'
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    )} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{order.customer_name}</CardTitle>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon-sm">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleToggleStatus(order)}>
                        {order.status === 'pending' ? 'Mark as fulfilled' : 'Mark as pending'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteOrder(order.id, order.customer_name)}
                        className="text-red-600"
                      >
                        Delete order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleOrderExpanded(order.id)}
                className="mb-2 w-full justify-start text-xs"
              >
                {expandedOrders.has(order.id) ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-2" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-2" />
                    Show details
                  </>
                )}
              </Button>

              {expandedOrders.has(order.id) && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  {order.order_items.map((orderItem) => (
                    <div
                      key={orderItem.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {orderItem.quantity}x {orderItem.item.name}
                        </p>
                        {orderItem.custom_note && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Note: {orderItem.custom_note}
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(orderItem.item.price * orderItem.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 dark:text-zinc-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No orders yet. Orders will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <OrdersByStatus
            title="Pending Orders"
            orders={pendingOrders}
            emptyMessage="No pending orders"
            icon={Clock}
          />
          <OrdersByStatus
            title="Fulfilled Orders"
            orders={fulfilledOrders}
            emptyMessage="No fulfilled orders"
            icon={CheckCircle2}
          />
        </>
      )}
    </div>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx={8} cy={21} r={1} />
      <circle cx={19} cy={21} r={1} />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
