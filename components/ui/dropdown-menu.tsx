'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@base-ui/react/dropdown-menu';
import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: DropdownMenuPrimitive.Root.Props) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: DropdownMenuPrimitive.Trigger.Props) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

function DropdownMenuPortal({
  ...props
}: DropdownMenuPrimitive.Portal.Props) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

function DropdownMenuContent({
  align = 'end',
  className,
  ...props
}: DropdownMenuPrimitive.Popup.Props) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Popup
        className={cn(
          'min-w-[8rem] overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 z-50',
          className
        )}
        align={align}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: DropdownMenuPrimitive.Item.Props) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.Separator.Props) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
