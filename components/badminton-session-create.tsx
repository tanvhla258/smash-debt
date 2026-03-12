'use client';

import { CreateSessionDialog } from '@/components/create-session-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export interface BadmintonSessionCreateProps {
  onSuccess?: () => void;
}

export function BadmintonSessionCreate({ onSuccess }: BadmintonSessionCreateProps) {
  return (
    <CreateSessionDialog
      defaultNote="Cau long"
      defaultParticipants="all"
      trigger={<Button className="gap-2"><PlusCircle className="w-4 h-4" />Badminton</Button>}
      onSuccess={onSuccess}
    />
  );
}
