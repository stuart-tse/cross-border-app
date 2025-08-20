'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { 
  requestWithdrawal, 
  exportStatement, 
  downloadTaxSummary,
  type DriverActionState 
} from '@/app/actions/driver';

interface PaymentActionsProps {
  availableBalance: number;
  currency?: string;
}

export default function PaymentActions({ availableBalance, currency = 'HKD' }: PaymentActionsProps) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [exportPeriod, setExportPeriod] = useState('monthly');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Server action states
  const [withdrawalState, withdrawalAction] = useActionState(
    requestWithdrawal,
    undefined
  );
  const [exportState, exportAction] = useActionState(
    exportStatement,
    undefined
  );
  const [taxState, taxAction] = useActionState(
    downloadTaxSummary,
    undefined
  );

  const handleWithdrawalRequest = () => {
    const formData = new FormData();
    formData.append('amount', withdrawalAmount);
    formData.append('bankAccount', bankAccount);
    formData.append('reason', 'Driver earnings withdrawal');
    
    withdrawalAction(formData);
    setShowWithdrawalModal(false);
    setWithdrawalAmount('');
    setBankAccount('');
  };

  const handleExportStatement = () => {
    const formData = new FormData();
    formData.append('period', exportPeriod);
    formData.append('format', exportFormat);
    
    exportAction(formData);
    setShowExportModal(false);
  };

  const handleTaxSummaryDownload = () => {
    const formData = new FormData();
    formData.append('year', new Date().getFullYear().toString());
    taxAction(formData);
  };

  const isWithdrawalValid = () => {
    const amount = parseFloat(withdrawalAmount);
    return (
      !isNaN(amount) &&
      amount > 0 &&
      amount <= availableBalance &&
      bankAccount.length >= 4
    );
  };

  return (
    <>
      <div className="flex space-x-3">
        <Button 
          onClick={() => setShowWithdrawalModal(true)}
          className="bg-hot-pink hover:bg-deep-pink"
          isLoading={withdrawalState?.success === undefined && withdrawalState !== undefined}
        >
          Request Withdrawal
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setShowExportModal(true)}
          isLoading={exportState?.success === undefined && exportState !== undefined}
        >
          Export Statement
        </Button>
      </div>

      {/* Withdrawal Modal */}
      <Modal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)}
        title="Request Withdrawal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Available Balance
            </label>
            <div className="text-2xl font-bold text-hot-pink">
              {currency}${availableBalance.toLocaleString()}
            </div>
          </div>

          <div>
            <label htmlFor="withdrawal-amount" className="block text-sm font-medium text-charcoal mb-2">
              Withdrawal Amount *
            </label>
            <Input
              id="withdrawal-amount"
              type="number"
              placeholder="Enter amount"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              min="1"
              max={availableBalance.toString()}
              className="w-full"
            />
            {withdrawalAmount && parseFloat(withdrawalAmount) > availableBalance && (
              <p className="text-sm text-red-600 mt-1">
                Amount cannot exceed available balance
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bank-account" className="block text-sm font-medium text-charcoal mb-2">
              Bank Account (Last 4 digits) *
            </label>
            <Input
              id="bank-account"
              type="text"
              placeholder="e.g., 1234"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              maxLength={4}
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Processing Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Processing time: 1-3 business days</li>
              <li>• No fees for withdrawals above {currency}$100</li>
              <li>• Withdrawals under {currency}$100 incur a {currency}$5 processing fee</li>
              <li>• Funds will be transferred to your registered bank account</li>
            </ul>
          </div>

          <div className="flex space-x-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawalModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawalRequest}
              disabled={!isWithdrawalValid()}
              isLoading={withdrawalState?.success === undefined && withdrawalState !== undefined}
            >
              Request Withdrawal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Statement Modal */}
      <Modal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)}
        title="Export Statement"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Time Period
            </label>
            <select 
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Format
            </label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="pdf">PDF Document</option>
              <option value="csv">CSV Spreadsheet</option>
              <option value="xlsx">Excel Spreadsheet</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-charcoal mb-2">Statement Contents</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Trip earnings and fees</li>
              <li>• Payment transactions</li>
              <li>• Tax-related information</li>
              <li>• Balance changes</li>
            </ul>
          </div>

          <div className="flex space-x-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportStatement}
              isLoading={exportState?.success === undefined && exportState !== undefined}
            >
              Export Statement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tax Summary Download */}
      <div className="mt-6">
        <Button 
          variant="secondary" 
          onClick={handleTaxSummaryDownload}
          isLoading={taxState?.success === undefined && taxState !== undefined}
        >
          Download Tax Summary
        </Button>
      </div>

      {/* Status Messages */}
      {withdrawalState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          withdrawalState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {withdrawalState.message}
        </div>
      )}
      
      {exportState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          exportState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {exportState.message}
        </div>
      )}
      
      {taxState?.message && (
        <div className={cn(
          'mt-4 p-4 rounded-lg',
          taxState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {taxState.message}
        </div>
      )}
    </>
  );
}