'use client';

import { CreateSessionDialog } from '@/components/create-session-dialog';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';

export interface BreakfastSessionCreateProps {
  onSuccess?: () => void;
}

export function BreakfastSessionCreate({ onSuccess }: BreakfastSessionCreateProps) {
  return (
    <CreateSessionDialog
      defaultNote="An sáng"
      trigger={<Button className="gap-2" variant="secondary"><Coffee className="w-4 h-4" />Breakfast</Button>}
      onSuccess={onSuccess}
    />
  );
}
