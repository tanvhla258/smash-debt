'use client';

import * as React from 'react';
import { Menu } from '@base-ui/react/menu';
import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof Menu.Trigger>) {
  return <Menu.Trigger {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof Menu.Portal>) {
  return <Menu.Portal {...props} />;
}

function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Popup>) {
  return (
    <DropdownMenuPortal>
      <Menu.Positioner sideOffset={8} align="end">
        <Menu.Popup
          className={cn(
            'min-w-32 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 z-50',
            className
          )}
          {...props}
        />
      </Menu.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
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
