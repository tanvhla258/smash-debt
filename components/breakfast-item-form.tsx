'use client';

import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Plus, X, Image as ImageIcon, Link } from 'lucide-react';
import { useToast } from '@/components/toast';
import type { BreakfastItem } from '@/lib/db-types';
import { cn } from '@/lib/utils';

interface BreakfastItemFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  item?: BreakfastItem | null;
  onSuccess?: () => void;
}

const PREBUILT_NOTES = [
  'No onion',
  'No spicy',
  'Extra hot',
  'No garlic',
  'Vegetarian',
  'No msg',
  'Extra sauce',
];

export function BreakfastItemForm({
  open,
  onOpenChange,
  item,
  onSuccess,
}: BreakfastItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    noteOptions: [] as string[],
  });
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        imageUrl: item.image_url || '',
        noteOptions: item.note_options,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        imageUrl: '',
        noteOptions: [],
      });
    }
    setFile(null);
    setCustomNote('');
    setUploadMode('url');
  }, [item, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Please enter a name', 'error');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      addToast('Please enter a valid price', 'error');
      return;
    }

    const data = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      image_url: formData.imageUrl || null,
      note_options: formData.noteOptions,
    };

    // Emit the data via a custom event
    const event = new CustomEvent('breakfast-item-submit', {
      detail: { data, item, isEditing },
    });
    window.dispatchEvent(event);

    // Reset and close
    setFormData({
      name: '',
      price: '',
      imageUrl: '',
      noteOptions: [],
    });
    setFile(null);
    onOpenChange?.(false);
    onSuccess?.();
    addToast(isEditing ? 'Item updated' : 'Item added', 'success');
  }

  function togglePrebuiltNote(note: string) {
    setFormData(prev => ({
      ...prev,
      noteOptions: prev.noteOptions.includes(note)
        ? prev.noteOptions.filter(n => n !== note)
        : [...prev.noteOptions, note],
    }));
  }

  function addCustomNote() {
    if (customNote.trim() && !formData.noteOptions.includes(customNote.trim())) {
      setFormData(prev => ({
        ...prev,
        noteOptions: [...prev.noteOptions, customNote.trim()],
      }));
      setCustomNote('');
    }
  }

  function removeNote(note: string) {
    setFormData(prev => ({
      ...prev,
      noteOptions: prev.noteOptions.filter(n => n !== note),
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Breakfast Item' : 'Add Breakfast Item'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the breakfast item details.'
                : 'Add a new item to the breakfast menu.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Banh Mi"
                className="mt-2"
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="mt-2"
                required
              />
            </div>

            {/* Image */}
            <div>
              <Label>Image</Label>
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={uploadMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('url')}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('file')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>

                {uploadMode === 'url' ? (
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size > 5 * 1024 * 1024) {
                          addToast('Image must be less than 5MB', 'error');
                          return;
                        }
                        setFile(selectedFile);
                        setFormData({ ...formData, imageUrl: '' });
                      }
                    }}
                  />
                )}
              </div>

              {file && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Selected: {file.name}
                </p>
              )}
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Prebuilt Note Options */}
            <div>
              <Label>Note Options</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                Select prebuilt notes or add custom ones
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {PREBUILT_NOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => togglePrebuiltNote(note)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full transition-colors',
                      formData.noteOptions.includes(note)
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Note Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom note..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomNote())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={addCustomNote}
                disabled={!customNote.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Notes */}
            {formData.noteOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.noteOptions.map((note) => (
                  <div
                    key={note}
                    className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center gap-1"
                  >
                    {note}
                    <button
                      type="button"
                      onClick={() => removeNote(note)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
