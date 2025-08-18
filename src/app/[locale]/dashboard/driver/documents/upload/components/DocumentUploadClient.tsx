'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  category: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number;
  status: 'pending' | 'verified' | 'processing' | 'rejected';
  expiryDate?: string;
}

interface DocumentUploadClientProps {
  documents: Document[];
}

export default function DocumentUploadClient({ documents }: DocumentUploadClientProps) {
  const [activeCategory, setActiveCategory] = useState('license');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});

  const categories = [
    { id: 'license', label: 'License', icon: '🪪' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { id: 'insurance', label: 'Insurance', icon: '🛡️' },
    { id: 'permits', label: 'Permits', icon: '🌏' },
  ];

  const handleDragOver = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDragOver(documentId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files, documentId);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files, documentId);
  }, []);

  const handleFileUpload = async (files: File[], documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    for (const file of files) {
      // Validate file
      const fileExtension = file.name.split('.').pop()?.toUpperCase();
      if (!document.acceptedFormats.includes(fileExtension || '')) {
        alert(`Invalid file format. Accepted formats: ${document.acceptedFormats.join(', ')}`);
        continue;
      }

      if (file.size > document.maxSize * 1024 * 1024) {
        alert(`File too large. Maximum size: ${document.maxSize}MB`);
        continue;
      }

      // Simulate upload progress
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      // Simulate upload process
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [uploadId]: progress }));
      }

      // Add to uploaded files
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), file],
      }));

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[uploadId];
        return newProgress;
      });
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'text-success-green bg-green-50 border-green-200';
      case 'processing':
        return 'text-electric-blue bg-blue-50 border-blue-200';
      case 'rejected':
        return 'text-error-red bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'processing':
        return '🔄';
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
  };

  const filteredDocuments = documents.filter(doc => doc.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'flex items-center space-x-2 py-3 px-4 rounded-md transition-all whitespace-nowrap',
              activeCategory === category.id
                ? 'bg-white shadow-sm text-hot-pink font-medium'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => {
          const hasUploadedFiles = uploadedFiles[document.id]?.length > 0;
          const isUploaded = document.status !== 'pending';

          return (
            <Card key={document.id} className="tesla-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-title-md font-semibold text-charcoal">
                    {document.name}
                    {document.required && (
                      <span className="text-error-red ml-1">*</span>
                    )}
                  </h3>
                  <p className="text-body-sm text-gray-600 mt-1">
                    {document.description}
                  </p>
                </div>
                {isUploaded && (
                  <div className={cn(
                    'px-2 py-1 rounded-full text-caption font-medium border',
                    getStatusColor(document.status)
                  )}>
                    {getStatusIcon(document.status)} {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </div>
                )}
              </div>

              {!isUploaded && !hasUploadedFiles ? (
                <div
                  onDragOver={(e) => handleDragOver(e, document.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, document.id)}
                  className={cn(
                    'upload-zone p-8 text-center transition-all duration-300 cursor-pointer',
                    dragOver === document.id
                      ? 'dragover'
                      : 'hover:border-hot-pink hover:bg-pink-tint'
                  )}
                >
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-title-md font-semibold text-charcoal mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-body-sm text-gray-600 mb-6">
                    Accepted formats: {document.acceptedFormats.join(', ')} • Max size: {document.maxSize}MB
                  </p>
                  <input
                    type="file"
                    id={`file-${document.id}`}
                    className="hidden"
                    accept={document.acceptedFormats.map(format => `.${format.toLowerCase()}`).join(',')}
                    multiple
                    onChange={(e) => handleFileSelect(e, document.id)}
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => window.document.getElementById(`file-${document.id}`)?.click()}
                    className="bg-hot-pink hover:bg-deep-pink"
                  >
                    Choose Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show uploaded files or status */}
                  {hasUploadedFiles && uploadedFiles[document.id]?.map((file, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {file.type.includes('pdf') ? '📄' : '🖼️'}
                          </div>
                          <div>
                            <div className="text-body-md font-medium text-charcoal">
                              {file.name}
                            </div>
                            <div className="text-body-sm text-gray-600">
                              {(file.size / (1024 * 1024)).toFixed(1)}MB • Uploaded just now
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                          <Button variant="secondary" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isUploaded && !hasUploadedFiles && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(document.status)}</span>
                        <div>
                          <div className="text-body-md font-medium text-charcoal">
                            Document {document.status}
                          </div>
                          {document.expiryDate && (
                            <div className="text-body-sm text-gray-600">
                              Expires: {new Date(document.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.document.getElementById(`file-${document.id}`)?.click()}
                  >
                    + Upload Additional Document
                  </Button>
                  <input
                    type="file"
                    id={`file-${document.id}`}
                    className="hidden"
                    accept={document.acceptedFormats.map(format => `.${format.toLowerCase()}`).join(',')}
                    multiple
                    onChange={(e) => handleFileSelect(e, document.id)}
                  />
                </div>
              )}

              {/* Document Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-body-sm">
                  <div>
                    <span className="text-gray-500">Required:</span>
                    <div className="font-medium text-charcoal">
                      {document.required ? 'Yes' : 'Optional'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Size:</span>
                    <div className="font-medium text-charcoal">{document.maxSize}MB</div>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                <div key={uploadId} className="mt-4">
                  <div className="flex justify-between text-body-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-hot-pink h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}