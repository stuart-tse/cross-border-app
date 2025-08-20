'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  url: string;
  thumbnailUrl?: string;
  dimensions?: string;
  description?: string;
  alt?: string;
  folder?: string;
  tags?: string[];
  usage: number; // Number of times used in posts
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'size' | 'type' | 'usage';

interface FilterState {
  search: string;
  type: 'all' | MediaItem['type'];
  folder: string;
  dateRange: string;
}

const MediaLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    folder: 'all',
    dateRange: 'all'
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      name: 'hong-kong-skyline.jpg',
      type: 'image',
      size: '2.4 MB',
      sizeBytes: 2400000,
      uploadedAt: '2 days ago',
      url: '/images/hong-kong-skyline.jpg',
      thumbnailUrl: '/images/hong-kong-skyline-thumb.jpg',
      dimensions: '1920x1080',
      description: 'Beautiful Hong Kong skyline at sunset',
      alt: 'Hong Kong skyline with illuminated skyscrapers at sunset',
      folder: 'Travel Photos',
      tags: ['hong-kong', 'skyline', 'sunset', 'travel'],
      usage: 3
    },
    {
      id: '2',
      name: 'business-travel-video.mp4',
      type: 'video',
      size: '15.7 MB',
      sizeBytes: 15700000,
      uploadedAt: '1 week ago',
      url: '/videos/business-travel.mp4',
      thumbnailUrl: '/videos/business-travel-thumb.jpg',
      dimensions: '1280x720',
      description: 'Corporate travel promotional video',
      folder: 'Marketing Videos',
      tags: ['business', 'travel', 'corporate', 'promotional'],
      usage: 1
    },
    {
      id: '3',
      name: 'route-map-diagram.png',
      type: 'image',
      size: '890 KB',
      sizeBytes: 890000,
      uploadedAt: '3 days ago',
      url: '/images/route-map.png',
      thumbnailUrl: '/images/route-map-thumb.png',
      dimensions: '1600x900',
      description: 'Cross-border route map infographic',
      alt: 'Detailed map showing cross-border travel routes',
      folder: 'Infographics',
      tags: ['map', 'routes', 'infographic', 'cross-border'],
      usage: 5
    },
    {
      id: '4',
      name: 'tesla-model-s.jpg',
      type: 'image',
      size: '1.8 MB',
      sizeBytes: 1800000,
      uploadedAt: '1 day ago',
      url: '/images/tesla-model-s.jpg',
      thumbnailUrl: '/images/tesla-model-s-thumb.jpg',
      dimensions: '1600x1200',
      description: 'Tesla Model S luxury vehicle',
      alt: 'White Tesla Model S parked in modern setting',
      folder: 'Vehicle Photos',
      tags: ['tesla', 'luxury', 'vehicle', 'electric'],
      usage: 2
    },
    {
      id: '5',
      name: 'travel-guide-pdf.pdf',
      type: 'document',
      size: '3.2 MB',
      sizeBytes: 3200000,
      uploadedAt: '5 days ago',
      url: '/documents/travel-guide.pdf',
      description: 'Comprehensive cross-border travel guide',
      folder: 'Documents',
      tags: ['guide', 'travel', 'cross-border', 'pdf'],
      usage: 8
    },
    {
      id: '6',
      name: 'ambient-music.mp3',
      type: 'audio',
      size: '4.1 MB',
      sizeBytes: 4100000,
      uploadedAt: '1 week ago',
      url: '/audio/ambient-music.mp3',
      description: 'Relaxing ambient music for videos',
      folder: 'Audio',
      tags: ['ambient', 'music', 'relaxing', 'background'],
      usage: 0
    }
  ]);

  // Filter and sort media items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = mediaItems.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesType = filters.type === 'all' || item.type === filters.type;
      const matchesFolder = filters.folder === 'all' || item.folder === filters.folder;
      
      return matchesSearch && matchesType && matchesFolder;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.sizeBytes - a.sizeBytes;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'usage':
          return b.usage - a.usage;
        default:
          return 0;
      }
    });

    return filtered;
  }, [mediaItems, filters, sortBy]);

  const folders = useMemo(() => {
    return Array.from(new Set(mediaItems.map(item => item.folder).filter(Boolean)));
  }, [mediaItems]);

  const totalSize = useMemo(() => {
    return mediaItems.reduce((total, item) => total + item.sizeBytes, 0);
  }, [mediaItems]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'audio':
        return '🎧';
      default:
        return '📁';
    }
  };

  const getTypeColor = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return 'text-success-green';
      case 'video':
        return 'text-hot-pink';
      case 'document':
        return 'text-electric-blue';
      case 'audio':
        return 'text-warning-amber';
      default:
        return 'text-gray-500';
    }
  };

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    const allVisible = filteredAndSortedItems.map(item => item.id);
    setSelectedItems(prev => 
      prev.length === allVisible.length ? [] : allVisible
    );
  }, [filteredAndSortedItems]);

  const handleBulkDelete = useCallback(() => {
    setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  }, [selectedItems]);

  const handleUpload = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    // In production, show a toast notification
    console.log('Copied to clipboard:', text);
  }, []);

  const handleItemClick = useCallback((item: MediaItem) => {
    setSelectedItem(item);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-headline-lg font-bold text-charcoal dark:text-white">
            Media Library
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Manage your images, videos, and documents
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md">
            <span className="mr-2">📁</span>
            New Folder
          </Button>
          <Button variant="primary" size="md" onClick={handleUpload}>
            <span className="mr-2">+</span>
            Upload Media
          </Button>
        </div>
      </motion.header>

      {/* Storage Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {
          [
            { label: 'Total Files', value: mediaItems.length, color: 'text-electric-blue', icon: '📁' },
            { label: 'Storage Used', value: formatBytes(totalSize), color: 'text-hot-pink', icon: '💾' },
            { label: 'Images', value: mediaItems.filter(i => i.type === 'image').length, color: 'text-success-green', icon: '🖼️' },
            { label: 'Videos', value: mediaItems.filter(i => i.type === 'video').length, color: 'text-warning-amber', icon: '🎥' }
          ].map((stat, index) => (
            <Card key={stat.label} className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={cn('text-2xl font-bold mb-1', stat.color)}>{stat.value}</div>
              <div className="text-body-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </Card>
          ))
        }
      </motion.section>

      {/* Filters and Controls */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Search files, descriptions, or tags..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="audio">Audio</option>
              </select>

              <select
                value={filters.folder}
                onChange={(e) => handleFilterChange('folder', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="size">Size (Largest)</option>
                <option value="type">Type</option>
                <option value="usage">Most Used</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Bulk Actions */}
              <AnimatePresence>
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-3 py-2 bg-hot-pink/10 rounded-lg border border-hot-pink/20"
                  >
                    <span className="text-sm text-hot-pink font-medium">
                      {selectedItems.length} selected
                    </span>
                    <Button size="sm" variant="ghost" onClick={handleBulkDelete} className="text-error-red">
                      Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md text-sm transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-hot-pink shadow-sm'
                      : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                  )}
                  title="Grid view"
                >
                  ⊙
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md text-sm transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-hot-pink shadow-sm'
                      : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                  )}
                  title="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Media Display */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredAndSortedItems.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-title-lg font-semibold text-charcoal dark:text-white mb-2">
              No media found
            </h3>
            <p className="text-body-md text-gray-600 dark:text-gray-400 mb-6">
              Upload some files or adjust your filters to see content.
            </p>
            <Button variant="primary" onClick={handleUpload}>
              Upload Your First File
            </Button>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAndSortedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MediaGridItem
                      item={item}
                      isSelected={selectedItems.includes(item.id)}
                      onToggleSelect={() => toggleItemSelection(item.id)}
                      onClick={() => handleItemClick(item)}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left p-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                              onChange={selectAllItems}
                              className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                            />
                          </th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Size</th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Usage</th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Uploaded</th>
                          <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedItems.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                            onClick={() => handleItemClick(item)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                  {item.thumbnailUrl ? (
                                    <img 
                                      src={item.thumbnailUrl}
                                      alt={item.alt || item.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-charcoal dark:text-white truncate">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <div className="text-body-sm text-gray-600 dark:text-gray-400 truncate">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={cn('text-lg', getTypeColor(item.type))}>
                                  {getTypeIcon(item.type)}
                                </span>
                                <span className="text-body-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {item.type}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-body-sm text-gray-600 dark:text-gray-400">
                              {item.size}
                            </td>
                            <td className="p-4">
                              <span className={cn(
                                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                item.usage > 5 ? 'bg-success-green/10 text-success-green' :
                                item.usage > 0 ? 'bg-warning-amber/10 text-warning-amber' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              )}>
                                {item.usage} uses
                              </span>
                            </td>
                            <td className="p-4 text-body-sm text-gray-600 dark:text-gray-400">
                              {item.uploadedAt}
                            </td>
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyToClipboard(item.url)}
                                  title="Copy URL"
                                >
                                  🔗
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleItemClick(item)}
                                  title="Details"
                                >
                                  👀
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </motion.section>

      {/* Media Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MediaDetailModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onCopyUrl={() => copyToClipboard(selectedItem.url)}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Media Grid Item Component
interface MediaGridItemProps {
  item: MediaItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  getTypeIcon: (type: MediaItem['type']) => string;
  getTypeColor: (type: MediaItem['type']) => string;
}

const MediaGridItem: React.FC<MediaGridItemProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onClick,
  getTypeIcon,
  getTypeColor
}) => {
  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-200 hover:shadow-lg",
      isSelected && "ring-2 ring-hot-pink border-hot-pink"
    )}>
      {/* Preview */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden" onClick={onClick}>
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.alt || item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={cn('text-4xl', getTypeColor(item.type))}>
              {getTypeIcon(item.type)}
            </span>
          </div>
        )}

        {/* Selection overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
        
        {/* Selection checkbox */}
        <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-hot-pink border-white rounded focus:ring-hot-pink focus:ring-2"
          />
        </div>

        {/* Usage indicator */}
        {item.usage > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-success-green text-white text-xs px-2 py-1 rounded-full font-medium">
              {item.usage}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-sm', getTypeColor(item.type))}>
            {getTypeIcon(item.type)}
          </span>
          <span className="text-body-sm font-medium text-charcoal dark:text-white truncate flex-1">
            {item.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-body-sm text-gray-500 dark:text-gray-400">
          <span>{item.size}</span>
          <span>{item.uploadedAt}</span>
        </div>
        {item.folder && (
          <div className="mt-1">
            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
              {item.folder}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Media Detail Modal Component
interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onCopyUrl: () => void;
  getTypeIcon: (type: MediaItem['type']) => string;
  getTypeColor: (type: MediaItem['type']) => string;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onCopyUrl,
  getTypeIcon,
  getTypeColor
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-title-lg font-semibold text-charcoal dark:text-white">
          Media Details
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.alt || item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className={cn('text-6xl', getTypeColor(item.type))}>
                    {getTypeIcon(item.type)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCopyUrl} fullWidth>
                🔗 Copy URL
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                📥 Download
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                File Name
              </label>
              <div className="text-body-md text-charcoal dark:text-white">{item.name}</div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Type
              </label>
              <div className="flex items-center gap-2">
                <span className={cn('text-lg', getTypeColor(item.type))}>
                  {getTypeIcon(item.type)}
                </span>
                <span className="text-body-md text-charcoal dark:text-white capitalize">
                  {item.type}
                </span>
              </div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Size
              </label>
              <div className="text-body-md text-charcoal dark:text-white">{item.size}</div>
            </div>

            {item.dimensions && (
              <div>
                <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Dimensions
                </label>
                <div className="text-body-md text-charcoal dark:text-white">{item.dimensions}</div>
              </div>
            )}

            <div>
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Usage Count
              </label>
              <div className="text-body-md text-charcoal dark:text-white">{item.usage} posts</div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Uploaded
              </label>
              <div className="text-body-md text-charcoal dark:text-white">{item.uploadedAt}</div>
            </div>

            {item.folder && (
              <div>
                <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Folder
                </label>
                <div className="text-body-md text-charcoal dark:text-white">{item.folder}</div>
              </div>
            )}

            {item.description && (
              <div>
                <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Description
                </label>
                <div className="text-body-md text-charcoal dark:text-white">{item.description}</div>
              </div>
            )}

            {item.alt && (
              <div>
                <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Alt Text
                </label>
                <div className="text-body-md text-charcoal dark:text-white">{item.alt}</div>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div>
                <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-hot-pink/10 text-hot-pink text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-body-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                File URL
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={item.url}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button size="sm" variant="outline" onClick={onCopyUrl}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="danger">
          Delete File
        </Button>
      </div>
    </div>
  );
};

export default withAuth(MediaLibraryPage, [UserType.BLOG_EDITOR]);