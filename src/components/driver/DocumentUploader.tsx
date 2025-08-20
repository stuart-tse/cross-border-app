'use client';

import React, { useState, useRef } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { 
  uploadDocument, 
  replaceDocument,
  type DocumentUploadState 
} from '@/app/actions/driver';
import { Upload, X, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  size?: number;
}

interface DocumentUploaderProps {
  documentType: 'driversLicense' | 'vehicleRegistration' | 'insurance' | 'backgroundCheck';
  title: string;
  description: string;
  requirements: string[];
  existingDocument?: Document;
  onUploadComplete?: (document: Document) => void;
}

export default function DocumentUploader({
  documentType,
  title,
  description,
  requirements,
  existingDocument,
  onUploadComplete
}: DocumentUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Server action states
  const [uploadState, uploadAction] = useActionState(
    uploadDocument,
    undefined
  );
  const [replaceState, replaceAction] = useActionState(
    replaceDocument,
    undefined
  );

  const activeState = existingDocument ? replaceState : uploadState;
  const activeAction = existingDocument ? replaceAction : uploadAction;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPEG, and PNG files are allowed');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', selectedFile);
    
    if (existingDocument) {
      formData.append('documentId', existingDocument.id);
      replaceAction(formData);
    } else {
      uploadAction(formData);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-md font-semibold text-charcoal">{title}</h3>
        {existingDocument && (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
            getStatusColor(existingDocument.status)
          )}>
            {getStatusIcon(existingDocument.status)}
            <span>{existingDocument.status === 'verified' ? 'Verified' : existingDocument.status === 'pending' ? 'Under Review' : 'Needs Attention'}</span>
          </span>
        )}
      </div>

      {/* Existing Document Display */}
      {existingDocument && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-body-md font-medium">{existingDocument.name}</div>
                <div className="text-body-sm text-gray-600">
                  Uploaded {new Date(existingDocument.uploadedAt).toLocaleDateString()}
                  {existingDocument.size && ` • ${(existingDocument.size / 1024).toFixed(1)} KB`}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {(!existingDocument || selectedFile) && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer',
            dragOver
              ? 'border-deep-pink bg-pink-tint'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-hot-pink hover:bg-pink-tint'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileInputClick}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-title-md font-semibold text-charcoal">{selectedFile.name}</h4>
                <p className="text-body-sm text-gray-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                </p>
              </div>
              {previewUrl && (
                <div className="max-w-xs mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  isLoading={activeState?.success === undefined && activeState !== undefined}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {existingDocument ? 'Replace Document' : 'Upload Document'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-hot-pink bg-opacity-10 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-hot-pink" />
              </div>
              <div>
                <h4 className="text-title-md font-semibold text-charcoal mb-2">
                  {existingDocument ? 'Upload New Document' : `Upload ${title}`}
                </h4>
                <p className="text-body-sm text-gray-600 mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <Button className="bg-hot-pink hover:bg-deep-pink">
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* File Specs */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Supported formats: PDF, JPG, PNG</div>
        <div>Maximum file size: 10MB</div>
        <div>Processing time: 24-48 hours</div>
      </div>

      {/* Status Messages */}
      {activeState?.message && (
        <div className={cn(
          'p-4 rounded-lg',
          activeState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {activeState.message}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInputChange}
      />
    </div>
  );
}