import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import DocumentUploadClient from './components/DocumentUploadClient';

// Server Component for fetching document requirements and status
async function getDocumentRequirements() {
  // This would typically fetch from your database
  return [
    {
      id: 'drivers-license',
      category: 'license',
      name: "Driver's License",
      description: 'Valid Hong Kong or International driving license',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: 5,
      status: 'verified' as const,
      expiryDate: '2026-06-15',
    },
    {
      id: 'commercial-license',
      category: 'license',
      name: 'Commercial Driving License',
      description: 'Commercial passenger transport license',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: 5,
      status: 'pending' as const,
    },
    {
      id: 'vehicle-registration',
      category: 'vehicle',
      name: 'Vehicle Registration',
      description: 'Official vehicle registration certificate',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: 5,
      status: 'verified' as const,
    },
    {
      id: 'vehicle-inspection',
      category: 'vehicle',
      name: 'Vehicle Inspection Certificate',
      description: 'Annual safety and emissions inspection',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: 5,
      status: 'pending' as const,
    },
    {
      id: 'comprehensive-insurance',
      category: 'insurance',
      name: 'Comprehensive Insurance',
      description: 'Full coverage insurance policy',
      required: true,
      acceptedFormats: ['PDF'],
      maxSize: 5,
      status: 'verified' as const,
      expiryDate: '2024-12-31',
    },
    {
      id: 'mainland-permit',
      category: 'permits',
      name: 'Mainland China Entry Permit',
      description: 'Vehicle permit for entering mainland China',
      required: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSize: 5,
      status: 'processing' as const,
      expiryDate: '2025-11-30',
    },
  ];
}

function DocumentUploadLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="space-y-6">
          <Card className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DocumentUploadPage() {
  const documents = await getDocumentRequirements();

  // Calculate completion stats
  const requiredDocs = documents.filter(d => d.required);
  const uploadedDocs = documents.filter(d => d.status !== 'pending');
  const verifiedDocs = documents.filter(d => d.status === 'verified');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/driver"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Document Upload</h1>
              <p className="text-gray-600">Upload and manage your driving documents, permits, and certificates with drag-and-drop functionality</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="tesla-card bg-gradient-to-br from-hot-pink/10 to-deep-pink/10 border-hot-pink/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-display-sm font-bold text-hot-pink">{uploadedDocs.length}</div>
              <div className="text-body-sm text-gray-600">Documents Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-display-sm font-bold text-electric-blue">
                {uploadedDocs.filter(d => d.required).length}/{requiredDocs.length}
              </div>
              <div className="text-body-sm text-gray-600">Required Documents</div>
            </div>
            <div className="text-center">
              <div className="text-display-sm font-bold text-success-green">{verifiedDocs.length}</div>
              <div className="text-body-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-display-sm font-bold text-warning-amber">
                {Math.round((uploadedDocs.filter(d => d.required).length / requiredDocs.length) * 100)}%
              </div>
              <div className="text-body-sm text-gray-600">Completion</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-body-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{uploadedDocs.filter(d => d.required).length}/{requiredDocs.length} required documents</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="progress-bar"
                style={{ width: `${(uploadedDocs.filter(d => d.required).length / requiredDocs.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Document Upload Interface - Client Component for drag-and-drop */}
        <Suspense fallback={<DocumentUploadLoading />}>
          <DocumentUploadClient documents={documents} />
        </Suspense>

        {/* Help & Tips */}
        <Card className="tesla-card mt-8">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Upload Tips & Guidelines</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-title-md font-semibold text-charcoal mb-4 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                Document Quality
              </h4>
              <ul className="text-body-md text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Ensure documents are clear and readable
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Take photos in good lighting conditions
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Include all pages for multi-page documents
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Use high resolution (at least 300 DPI)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-title-md font-semibold text-charcoal mb-4 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Processing Information
              </h4>
              <ul className="text-body-md text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  Documents verified within 24-48 hours
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  Real-time notifications for status updates
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  Rejected documents can be re-uploaded
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  Automatic renewal reminders
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-warning-amber/10 border border-warning-amber/30 rounded-lg">
            <h4 className="text-body-md font-semibold text-charcoal mb-2 flex items-center">
              <span className="text-warning-amber mr-2">⚠️</span>
              Important Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm text-gray-700">
              <div>
                <p>• All documents must be current and valid</p>
                <p>• Cross-border operations require additional permits</p>
              </div>
              <div>
                <p>• Some documents may require physical verification</p>
                <p>• Keep digital copies accessible for quick renewal</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}