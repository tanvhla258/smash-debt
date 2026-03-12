'use client';

import { useState, useEffect, useRef } from 'react';
import {
  getActiveUsers,
  createUser,
  updateUserActive,
  uploadUserAvatar,
  deleteUserAvatar,
} from '@/lib/db';
import type { User } from '@/lib/db-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Search, Check, Upload, X, Camera } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { useToast } from '@/components/toast';

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to generate a consistent color from name
function getNameColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Avatar upload state
  const [avatarUploadUser, setAvatarUploadUser] = useState<User | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await createUser(newUserName.trim());
      setNewUserName('');
      setIsDialogOpen(false);
      await loadUsers();
      addToast(`User "${newUserName.trim()}" created successfully`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      addToast('Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      setError(null);
      await updateUserActive(user.id, !user.is_active);
      await loadUsers();
      addToast(
        !user.is_active ? `${user.name} activated` : `${user.name} deactivated`,
        'info'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      addToast('Failed to update user status', 'error');
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !avatarUploadUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);
      await uploadUserAvatar(avatarUploadUser.id, file);
      await loadUsers();
      addToast('Avatar updated successfully', 'success');
      setAvatarUploadUser(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);

      // Check if it's a storage bucket error
      if (errorMessage.includes('bucket not found') || errorMessage.includes('The resource was not found')) {
        addToast(
          'Storage bucket not found. Please create an "avatars" bucket in Supabase Storage.',
          'error'
        );
      } else {
        addToast('Failed to upload avatar', 'error');
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleDeleteAvatar(user: User) {
    if (!user.avatar_url) return;

    try {
      setError(null);
      await deleteUserAvatar(user.id);
      await loadUsers();
      addToast('Avatar removed', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
      addToast('Failed to delete avatar', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Users</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage badminton participants
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddUser}>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Enter the name of the new badminton participant.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter name"
                    className="mt-2"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !newUserName.trim()}>
                    {isSubmitting ? 'Adding...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Search className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">No users yet</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Add your first participant to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add First User
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                            <AvatarFallback className={getNameColor(user.name)}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <button
                            onClick={() => setAvatarUploadUser(user)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Change avatar"
                          >
                            <Camera className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.avatar_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvatar(user)}
                            className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                            title="Remove avatar"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                        >
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={!!avatarUploadUser} onOpenChange={(open) => !open && setAvatarUploadUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
            <DialogDescription>
              Upload a new profile picture for {avatarUploadUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={avatarUploadUser?.avatar_url || undefined}
                  alt={avatarUploadUser?.name}
                />
                <AvatarFallback className={avatarUploadUser ? getNameColor(avatarUploadUser.name) : ''}>
                  {avatarUploadUser ? getInitials(avatarUploadUser.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploadingAvatar}
                />
                <Label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingAvatar ? 'Uploading...' : 'Choose an image'}
                </Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                  JPG, PNG, or GIF
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvatarUploadUser(null)}
              disabled={isUploadingAvatar}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
