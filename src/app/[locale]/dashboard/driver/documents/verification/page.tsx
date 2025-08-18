'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface VerificationStep {
  id: string;
  category: 'identity' | 'vehicle' | 'insurance' | 'permits' | 'compliance';
  title: string;
  description: string;
  requirements: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  lastUpdated?: string;
  completedDate?: string;
  failureReason?: string;
  documents: {
    id: string;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
  }[];
}

interface ComplianceChecklist {
  id: string;
  category: 'legal' | 'safety' | 'operational' | 'cross_border';
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'attention_required';
  lastChecked: string;
  validUntil?: string;
  actionRequired?: string;
  regulationReference?: string;
}

const DocumentVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'progress' | 'compliance' | 'history'>('progress');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'identity' | 'vehicle' | 'insurance' | 'permits' | 'compliance'>('all');

  const verificationSteps: VerificationStep[] = [
    {
      id: 'identity-verification',
      category: 'identity',
      title: 'Identity Verification',
      description: 'Verify driver identity and personal information',
      requirements: [
        'Valid government-issued photo ID',
        'Proof of address (utility bill or bank statement)',
        'Background check clearance',
        'Criminal record check (if applicable)'
      ],
      status: 'completed',
      priority: 'critical',
      estimatedTime: '2-3 business days',
      completedDate: '2024-01-12',
      lastUpdated: '2024-01-12',
      documents: [
        { id: 'id-card', name: 'Hong Kong ID Card', status: 'verified' },
        { id: 'address-proof', name: 'Utility Bill', status: 'verified' },
        { id: 'background-check', name: 'Background Check Report', status: 'verified' }
      ]
    },
    {
      id: 'driving-license-verification',
      category: 'identity',
      title: 'Driving License Verification',
      description: 'Verify all driving licenses and permits',
      requirements: [
        'Valid Hong Kong driving license',
        'Commercial driving license',
        'International driving permit (if applicable)',
        'License history verification'
      ],
      status: 'completed',
      priority: 'critical',
      estimatedTime: '1-2 business days',
      completedDate: '2024-01-11',
      lastUpdated: '2024-01-11',
      documents: [
        { id: 'hk-license', name: 'HK Driving License', status: 'verified' },
        { id: 'commercial-license', name: 'Commercial License', status: 'verified' },
        { id: 'international-permit', name: 'International Permit', status: 'verified' }
      ]
    },
    {
      id: 'vehicle-verification',
      category: 'vehicle',
      title: 'Vehicle Documentation',
      description: 'Verify vehicle registration and inspection certificates',
      requirements: [
        'Vehicle registration certificate',
        'Current inspection certificate',
        'Vehicle ownership documents',
        'Technical specifications verification'
      ],
      status: 'completed',
      priority: 'critical',
      estimatedTime: '2-3 business days',
      completedDate: '2024-01-10',
      lastUpdated: '2024-01-10',
      documents: [
        { id: 'vehicle-reg', name: 'Vehicle Registration', status: 'verified' },
        { id: 'inspection-cert', name: 'Inspection Certificate', status: 'verified' },
        { id: 'ownership-docs', name: 'Ownership Documents', status: 'verified' }
      ]
    },
    {
      id: 'insurance-verification',
      category: 'insurance',
      title: 'Insurance Coverage',
      description: 'Verify comprehensive insurance and cross-border coverage',
      requirements: [
        'Comprehensive vehicle insurance',
        'Third-party liability coverage',
        'Cross-border insurance extension',
        'Policy validity confirmation'
      ],
      status: 'completed',
      priority: 'critical',
      estimatedTime: '1-2 business days',
      completedDate: '2024-01-09',
      lastUpdated: '2024-01-09',
      documents: [
        { id: 'comprehensive-insurance', name: 'Comprehensive Policy', status: 'verified' },
        { id: 'liability-insurance', name: 'Liability Coverage', status: 'verified' },
        { id: 'cross-border-insurance', name: 'Cross-Border Extension', status: 'verified' }
      ]
    },
    {
      id: 'cross-border-permits',
      category: 'permits',
      title: 'Cross-Border Permits',
      description: 'Verify all cross-border operation permits and documentation',
      requirements: [
        'Mainland China entry permit',
        'Customs declaration documents',
        'Border crossing authorization',
        'Route-specific permits'
      ],
      status: 'in_progress',
      priority: 'high',
      estimatedTime: '3-5 business days',
      lastUpdated: '2024-01-14',
      documents: [
        { id: 'mainland-permit', name: 'Mainland Entry Permit', status: 'pending' },
        { id: 'customs-docs', name: 'Customs Declaration', status: 'verified' },
        { id: 'border-auth', name: 'Border Authorization', status: 'verified' }
      ]
    },
    {
      id: 'safety-compliance',
      category: 'compliance',
      title: 'Safety & Compliance Training',
      description: 'Complete mandatory safety training and compliance certifications',
      requirements: [
        'Defensive driving course completion',
        'First aid certification',
        'Cross-border safety briefing',
        'Emergency procedures training'
      ],
      status: 'pending',
      priority: 'medium',
      estimatedTime: '1-2 weeks',
      lastUpdated: '2024-01-08',
      documents: [
        { id: 'defensive-driving', name: 'Defensive Driving Certificate', status: 'pending' },
        { id: 'first-aid', name: 'First Aid Certification', status: 'rejected', rejectionReason: 'Certificate expired' },
        { id: 'safety-briefing', name: 'Safety Briefing Completion', status: 'pending' }
      ]
    }
  ];

  const complianceChecklist: ComplianceChecklist[] = [
    {
      id: 'legal-compliance',
      category: 'legal',
      title: 'Legal Requirements Compliance',
      description: 'All legal documents and registrations are current and valid',
      status: 'compliant',
      lastChecked: '2024-01-14',
      validUntil: '2024-12-31',
      regulationReference: 'HK Transport Ordinance Cap. 374'
    },
    {
      id: 'safety-standards',
      category: 'safety',
      title: 'Safety Standards Compliance',
      description: 'Vehicle and driver meet all safety requirements',
      status: 'compliant',
      lastChecked: '2024-01-12',
      validUntil: '2024-10-15',
      regulationReference: 'Road Traffic (Safety Equipment) Regulations'
    },
    {
      id: 'operational-readiness',
      category: 'operational',
      title: 'Operational Readiness',
      description: 'Ready for passenger transport operations',
      status: 'attention_required',
      lastChecked: '2024-01-14',
      actionRequired: 'Complete first aid certification renewal',
      regulationReference: 'Public Service Vehicle Regulations'
    },
    {
      id: 'cross-border-clearance',
      category: 'cross_border',
      title: 'Cross-Border Operation Clearance',
      description: 'Authorized for Hong Kong-Mainland China operations',
      status: 'pending',
      lastChecked: '2024-01-14',
      actionRequired: 'Awaiting mainland permit verification',
      regulationReference: 'Cross-boundary Private Car Policy'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
      case 'compliant':
        return 'text-success-green bg-green-50 border-green-200';
      case 'in_progress':
      case 'pending':
        return 'text-electric-blue bg-blue-50 border-blue-200';
      case 'failed':
      case 'rejected':
      case 'non_compliant':
        return 'text-error-red bg-red-50 border-red-200';
      case 'attention_required':
        return 'text-warning-amber bg-yellow-50 border-yellow-200';
      case 'expired':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
      case 'compliant':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'failed':
      case 'rejected':
      case 'non_compliant':
        return '❌';
      case 'attention_required':
        return '⚠️';
      case 'expired':
        return '⏰';
      default:
        return '❓';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-error-red bg-red-50 border-error-red';
      case 'high':
        return 'text-warning-amber bg-yellow-50 border-warning-amber';
      case 'medium':
        return 'text-electric-blue bg-blue-50 border-electric-blue';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const filteredSteps = selectedCategory === 'all' 
    ? verificationSteps 
    : verificationSteps.filter(step => step.category === selectedCategory);

  const getOverallProgress = () => {
    const totalSteps = verificationSteps.length;
    const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
    const inProgressSteps = verificationSteps.filter(step => step.status === 'in_progress').length;
    const failedSteps = verificationSteps.filter(step => step.status === 'failed').length;
    const pendingSteps = verificationSteps.filter(step => step.status === 'pending').length;

    return {
      total: totalSteps,
      completed: completedSteps,
      inProgress: inProgressSteps,
      failed: failedSteps,
      pending: pendingSteps,
      completionPercentage: Math.round((completedSteps / totalSteps) * 100)
    };
  };

  const progress = getOverallProgress();

  const getComplianceOverview = () => {
    const compliant = complianceChecklist.filter(item => item.status === 'compliant').length;
    const needsAttention = complianceChecklist.filter(item => item.status === 'attention_required').length;
    const pending = complianceChecklist.filter(item => item.status === 'pending').length;
    const nonCompliant = complianceChecklist.filter(item => item.status === 'non_compliant').length;

    return { compliant, needsAttention, pending, nonCompliant, total: complianceChecklist.length };
  };

  const complianceOverview = getComplianceOverview();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
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
              <h1 className="text-3xl font-bold text-charcoal">Document Verification</h1>
              <p className="text-gray-600">Track verification progress and compliance status for cross-border operations</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
        {/* Overall Progress Card */}
        <Card className="bg-gradient-to-br from-hot-pink/10 to-deep-pink/10 border-hot-pink/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-title-lg font-semibold text-charcoal">Verification Progress</h2>
              <p className="text-body-md text-gray-600">Overall completion status</p>
            </div>
            <div className="text-right">
              <div className="text-display-sm font-bold text-hot-pink">
                {progress.completionPercentage}%
              </div>
              <div className="text-body-sm text-gray-600">Complete</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-success-green/10 rounded-lg border border-success-green/20">
              <div className="text-title-lg font-bold text-success-green">{progress.completed}</div>
              <div className="text-body-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-electric-blue/10 rounded-lg border border-electric-blue/20">
              <div className="text-title-lg font-bold text-electric-blue">{progress.inProgress}</div>
              <div className="text-body-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-3 bg-warning-amber/10 rounded-lg border border-warning-amber/20">
              <div className="text-title-lg font-bold text-warning-amber">{progress.pending}</div>
              <div className="text-body-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-error-red/10 rounded-lg border border-error-red/20">
              <div className="text-title-lg font-bold text-error-red">{progress.failed}</div>
              <div className="text-body-sm text-gray-600">Failed</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-hot-pink to-deep-pink h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress.completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-body-sm text-gray-600">
            <span>{progress.completed} of {progress.total} steps completed</span>
            <span>Ready for operations: {progress.completionPercentage >= 80 ? 'Yes' : 'No'}</span>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'progress', label: 'Verification Progress', icon: '📋' },
            { id: 'compliance', label: 'Compliance Status', icon: '✅' },
            { id: 'history', label: 'Verification History', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-hot-pink font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Verification Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'identity', label: 'Identity' },
                { id: 'vehicle', label: 'Vehicle' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'permits', label: 'Permits' },
                { id: 'compliance', label: 'Compliance' },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-body-sm font-medium transition-colors',
                    selectedCategory === category.id
                      ? 'bg-hot-pink text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Verification Steps */}
            <div className="space-y-4">
              {filteredSteps.map((step, index) => (
                <Card key={step.id} className="relative overflow-hidden">
                  {/* Priority Indicator */}
                  <div className={cn(
                    'absolute top-0 left-0 w-1 h-full',
                    step.priority === 'critical' ? 'bg-error-red' :
                    step.priority === 'high' ? 'bg-warning-amber' :
                    step.priority === 'medium' ? 'bg-electric-blue' : 'bg-gray-300'
                  )}></div>

                  <div className="pl-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-title-md font-semibold text-charcoal">
                            {step.title}
                          </h3>
                          <div className={cn(
                            'px-2 py-1 rounded-full text-caption font-medium border',
                            getStatusColor(step.status)
                          )}>
                            {getStatusIcon(step.status)} {step.status.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className={cn(
                            'px-2 py-1 rounded-full text-caption font-medium border',
                            getPriorityColor(step.priority)
                          )}>
                            {step.priority.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-body-md text-gray-600 mb-3">{step.description}</p>
                        <div className="text-body-sm text-gray-500">
                          Estimated time: {step.estimatedTime}
                          {step.lastUpdated && (
                            <span className="ml-4">
                              Last updated: {new Date(step.lastUpdated).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="mb-4">
                      <h4 className="text-body-md font-semibold text-charcoal mb-3">Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.requirements.map((requirement, reqIndex) => (
                          <div key={reqIndex} className="flex items-center space-x-2">
                            <span className="text-success-green">✓</span>
                            <span className="text-body-sm text-charcoal">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents Status */}
                    <div className="mb-4">
                      <h4 className="text-body-md font-semibold text-charcoal mb-3">Documents</h4>
                      <div className="space-y-2">
                        {step.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className={
                                doc.status === 'verified' ? 'text-success-green' :
                                doc.status === 'rejected' ? 'text-error-red' : 'text-warning-amber'
                              }>
                                {getStatusIcon(doc.status)}
                              </span>
                              <span className="text-body-sm text-charcoal">{doc.name}</span>
                            </div>
                            <div className={cn(
                              'px-2 py-1 rounded-full text-caption font-medium',
                              getStatusColor(doc.status)
                            )}>
                              {doc.status.toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Failure Reason */}
                    {step.status === 'failed' && step.failureReason && (
                      <div className="p-3 bg-error-red/10 border border-error-red/20 rounded-lg mb-4">
                        <h4 className="text-body-md font-semibold text-error-red mb-2">Verification Failed</h4>
                        <p className="text-body-sm text-gray-700">{step.failureReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {step.status === 'pending' && (
                        <Button variant="primary" size="sm">
                          Start Verification
                        </Button>
                      )}
                      {(step.status === 'failed' || step.status === 'in_progress') && (
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      )}
                      {step.status === 'completed' && (
                        <Button variant="secondary" size="sm">
                          View Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Compliance Status Tab */}
        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Compliance Overview */}
            <Card>
              <h3 className="text-title-lg font-semibold text-charcoal mb-6">Compliance Overview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success-green/10 rounded-lg border border-success-green/20">
                  <div className="text-headline-md font-bold text-success-green">{complianceOverview.compliant}</div>
                  <div className="text-body-sm text-gray-600">Compliant</div>
                </div>
                <div className="text-center p-4 bg-warning-amber/10 rounded-lg border border-warning-amber/20">
                  <div className="text-headline-md font-bold text-warning-amber">{complianceOverview.needsAttention}</div>
                  <div className="text-body-sm text-gray-600">Needs Attention</div>
                </div>
                <div className="text-center p-4 bg-electric-blue/10 rounded-lg border border-electric-blue/20">
                  <div className="text-headline-md font-bold text-electric-blue">{complianceOverview.pending}</div>
                  <div className="text-body-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-error-red/10 rounded-lg border border-error-red/20">
                  <div className="text-headline-md font-bold text-error-red">{complianceOverview.nonCompliant}</div>
                  <div className="text-body-sm text-gray-600">Non-Compliant</div>
                </div>
              </div>
            </Card>

            {/* Compliance Items */}
            <div className="space-y-4">
              {complianceChecklist.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-title-md font-semibold text-charcoal">{item.title}</h3>
                        <div className={cn(
                          'px-3 py-1 rounded-full text-body-sm font-medium border',
                          getStatusColor(item.status)
                        )}>
                          {getStatusIcon(item.status)} {item.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <p className="text-body-md text-gray-600 mb-3">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-1">Last Checked</label>
                      <p className="text-body-sm text-charcoal">
                        {new Date(item.lastChecked).toLocaleDateString()}
                      </p>
                    </div>
                    {item.validUntil && (
                      <div>
                        <label className="block text-body-sm font-medium text-gray-700 mb-1">Valid Until</label>
                        <p className="text-body-sm text-charcoal">
                          {new Date(item.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {item.regulationReference && (
                      <div>
                        <label className="block text-body-sm font-medium text-gray-700 mb-1">Regulation</label>
                        <p className="text-body-sm text-charcoal">{item.regulationReference}</p>
                      </div>
                    )}
                  </div>

                  {item.actionRequired && (
                    <div className="p-3 bg-warning-amber/10 border border-warning-amber/20 rounded-lg mb-4">
                      <h4 className="text-body-md font-semibold text-warning-amber mb-1">Action Required</h4>
                      <p className="text-body-sm text-gray-700">{item.actionRequired}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                    {item.status === 'attention_required' && (
                      <Button variant="primary" size="sm">
                        Take Action
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Verification History Tab */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="text-title-lg font-semibold text-charcoal mb-6">Verification Timeline</h3>
              
              <div className="space-y-4">
                {[
                  {
                    date: '2024-01-14',
                    title: 'Cross-Border Permit Verification Started',
                    description: 'Mainland China entry permit submitted for verification',
                    status: 'in_progress',
                    type: 'verification'
                  },
                  {
                    date: '2024-01-12',
                    title: 'Identity Verification Completed',
                    description: 'All identity documents successfully verified',
                    status: 'completed',
                    type: 'verification'
                  },
                  {
                    date: '2024-01-11',
                    title: 'Driving License Verification Completed',
                    description: 'All driving licenses and permits verified',
                    status: 'completed',
                    type: 'verification'
                  },
                  {
                    date: '2024-01-10',
                    title: 'Vehicle Documentation Verified',
                    description: 'Vehicle registration and inspection certificates approved',
                    status: 'completed',
                    type: 'verification'
                  },
                  {
                    date: '2024-01-09',
                    title: 'Insurance Coverage Verified',
                    description: 'Comprehensive and cross-border insurance confirmed',
                    status: 'completed',
                    type: 'verification'
                  },
                  {
                    date: '2024-01-08',
                    title: 'Verification Process Initiated',
                    description: 'Driver verification process started',
                    status: 'completed',
                    type: 'system'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2',
                      event.status === 'completed' ? 'bg-success-green border-success-green text-white' :
                      event.status === 'in_progress' ? 'bg-electric-blue border-electric-blue text-white' :
                      'bg-gray-300 border-gray-300 text-gray-600'
                    )}>
                      {event.status === 'completed' ? '✓' : 
                       event.status === 'in_progress' ? '⏳' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-body-md font-semibold text-charcoal">{event.title}</h4>
                        <span className="text-body-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-body-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Export & Download */}
            <Card>
              <h3 className="text-title-lg font-semibold text-charcoal mb-6">Documentation & Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="secondary" className="justify-start">
                  📄 Download Verification Certificate
                </Button>
                <Button variant="secondary" className="justify-start">
                  📊 Export Compliance Report
                </Button>
                <Button variant="secondary" className="justify-start">
                  📋 Print Verification Summary
                </Button>
                <Button variant="secondary" className="justify-start">
                  📧 Email Verification Status
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(DocumentVerificationPage, [UserType.DRIVER]);