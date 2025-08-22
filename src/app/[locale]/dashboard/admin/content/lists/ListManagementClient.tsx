'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ListItem {
  id: string;
  listType: string;
  key: string;
  label: string;
  value?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  locale: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  parent?: ListItem;
  children?: ListItem[];
}

interface ListType {
  key: string;
  label: string;
  description: string;
  icon: string;
  count: number;
}

interface ListManagementClientProps {
  listType: string;
  locale: string;
  initialSearch: string;
  availableListTypes: ListType[];
}

export default function ListManagementClient({
  listType,
  locale,
  initialSearch,
  availableListTypes
}: ListManagementClientProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentListType = availableListTypes.find(t => t.key === listType);

  // Load list items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        listType,
        locale,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/lists?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      } else {
        setError(data.error || 'Failed to load list items');
      }
    } catch (err) {
      console.error('Error loading list items:', err);
      setError('Failed to load list items');
    } finally {
      setLoading(false);
    }
  }, [listType, locale, search]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSaveItem = async (itemData: Partial<ListItem>) => {
    try {
      setLoading(true);
      setError(null);

      const isEditing = !!editingItem;
      const url = '/api/admin/lists';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemData,
          listType,
          locale,
          ...(isEditing && { id: editingItem.id })
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadItems(); // Reload the list
        setIsAddModalOpen(false);
        setEditingItem(null);
      } else {
        setError(data.error || 'Failed to save item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/lists?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadItems(); // Reload the list
      } else {
        setError(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item: ListItem) => {
    await handleSaveItem({
      id: item.id,
      isActive: !item.isActive
    });
  };

  return (
    <div>
      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentListType?.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentListType?.label}</h2>
              <p className="text-sm text-gray-600">{currentListType?.description}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<PlusIcon />}
          >
            Add Item
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Items List */}
      <Card>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search terms.' : 'Add your first item to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-colors',
                    item.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                  )}
                >
                  <div className="flex items-center space-x-4">
                    {item.icon && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                    )}
                    {item.color && (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          'font-medium',
                          item.isActive ? 'text-gray-900' : 'text-gray-500'
                        )}>
                          {item.label}
                        </h3>
                        {item.isDefault && (
                          <span className="px-2 py-1 text-xs bg-[#FF69B4] text-white rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Key: {item.key} | Order: {item.sortOrder}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(item)}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <ItemModal
        isOpen={isAddModalOpen || !!editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        listType={listType}
        existingItems={items}
      />
    </div>
  );
}

// Add/Edit Item Modal Component
interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ListItem>) => void;
  item?: ListItem | null;
  listType: string;
  existingItems: ListItem[];
}

function ItemModal({ isOpen, onClose, onSave, item, listType, existingItems }: ItemModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    value: '',
    description: '',
    icon: '',
    color: '',
    sortOrder: 0,
    isActive: true,
    isDefault: false,
    parentId: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        key: item.key,
        label: item.label,
        value: item.value || '',
        description: item.description || '',
        icon: item.icon || '',
        color: item.color || '',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isDefault: item.isDefault,
        parentId: item.parentId || '',
      });
    } else {
      setFormData({
        key: '',
        label: '',
        value: '',
        description: '',
        icon: '',
        color: '',
        sortOrder: existingItems.length,
        isActive: true,
        isDefault: false,
        parentId: '',
      });
    }
  }, [item, existingItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const parentItems = existingItems.filter(i => !i.parentId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Item' : 'Add New Item'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Key *"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
            placeholder="unique_key"
            required
          />
          <Input
            label="Label *"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            placeholder="Display Label"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Optional value"
          />
          <Input
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
          />
        </div>

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Icon"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="🚗 or icon-name"
          />
          <Input
            label="Color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>

        {parentItems.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Item</label>
            <Select value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Parent</SelectItem>
                {parentItems.map(parent => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            Active
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="mr-2"
            />
            Default
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);