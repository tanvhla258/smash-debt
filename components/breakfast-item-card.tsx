'use client';

import Image from 'next/image';
import { UtensilsCrossed, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardAction } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { BreakfastItem } from '@/lib/db-types';

interface BreakfastItemCardProps {
  item: BreakfastItem;
  onSelect?: (item: BreakfastItem) => void;
  onEdit?: (item: BreakfastItem) => void;
  onDelete?: (item: BreakfastItem) => void;
  showActions?: boolean;
  quantity?: number;
}

export function BreakfastItemCard({
  item,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
  quantity = 0,
}: BreakfastItemCardProps) {
  const imageUrl = item.image_url;

  return (
    <Card
      size="sm"
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onSelect && quantity > 0 && "ring-2 ring-green-500"
      )}
      onClick={() => onSelect?.(item)}
    >
      {imageUrl ? (
        <div className="relative w-full h-40 sm:h-48">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 flex items-center justify-center">
          <UtensilsCrossed className="w-16 h-16 text-orange-400 dark:text-orange-500/50" />
        </div>
      )}

      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{item.name}</h3>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(item.price)}
            </p>
          </div>
          {quantity > 0 && (
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {quantity}
            </div>
          )}
        </div>

        {item.note_options.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.note_options.slice(0, 3).map((note, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full"
              >
                {note}
              </span>
            ))}
            {item.note_options.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-zinc-500">
                +{item.note_options.length - 3} more
              </span>
            )}
          </div>
        )}

        {showActions && (
          <CardAction className="flex gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(item);
              }}
            >
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(item);
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </CardAction>
        )}
      </CardContent>
    </Card>
  );
}
