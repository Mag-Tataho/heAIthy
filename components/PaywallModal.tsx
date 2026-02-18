import React, { useState } from 'react';
import { CheckCircle2, X, Star, Zap, Shield, Sparkles, Copy, CreditCard, Clock, Crown, ArrowRight, Key } from 'lucide-react';
import { PaymentStatus } from '../types';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (transactionId: string) => void;
  onRedeem: (code: string) => boolean;
  paymentStatus?: PaymentStatus;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onSubmitPayment, onRedeem, paymentStatus = 'none' }) => {
  const [step, setStep] = useState<'info' | 'payment' | 'redeem'>('info');
  const [transactionId, setTransactionId] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Wallet Info
  const WALLET_INFO = {
    method: "USDT (TRC20)",
    address: "T9yD14Nj9...5k3j", // Replace with your actual wallet address
    amount: "$4.99",
    note: "Include your email in remarks"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    onSubmitPayment(transactionId);
    setStep('info'); 
    setTransactionId('');
  };

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError('');
    
    if (onRedeem(redeemCode)) {
      setStep('info');
      setRedeemCode('');
      onClose();
    } else {
      setRedeemError('Invalid activation code. Please check and try again.');
    }
  };

  const renderPendingState = () => (
    <div className="p-8 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Pending</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        We have received your payment details. Access will be unlocked as soon as we verify the transaction.
      </p>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 w-full mb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Status</p>
        <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold">
           <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
           Awaiting Approval
        </div>
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={() => setStep('redeem')}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4" />
          I have a Code
        </button>
        <button 
          onClick={onClose}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderRedeem = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-3">
          <Key className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Activation Code</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter the code sent to your email.</p>
      </div>

      <form onSubmit={handleRedeemSubmit} className="flex-1 flex flex-col">
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">License Key / Code</label>
          <input 
            type="text" 
            required
            placeholder="e.g. HEALTHY-PRO-2024"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm dark:text-white transition-all font-mono tracking-wider text-center uppercase"
          />
          {redeemError && (
             <p className="text-xs text-red-500 mt-2 font-medium text-center">{redeemError}</p>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Activate Premium
          </button>

          <button 
            type="button" 
            onClick={() => setStep('info')}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );

  const renderInfo = () => (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div className="relative h-48 bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-900 opacity-90"></div>
         {/* Abstract Shapes */}
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
         
         <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4 text-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-3 shadow-xl ring-1 ring-white/30">
               <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">heAIthy Premium</h2>
            <p className="text-green-100 font-medium text-sm mt-1">Unlock your full potential</p>
         </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4 mb-8">
          <FeatureRow text="Personalized AI Meal Plans" icon={Star} />
          <FeatureRow text="Unlimited Nutrition Chat" icon={Zap} />
          <FeatureRow text="Advanced Macro Analytics" icon={Shield} />
          <FeatureRow text="No Ads & Offline Access" icon={CheckCircle2} />
        </div>

        <div className="mt-auto">
          {/* Pricing Card */}
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 border border-green-200 dark:border-green-900 rounded-2xl p-4 mb-4 ring-2 ring-transparent hover:ring-green-500/30 transition-all cursor-pointer">
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                BEST VALUE
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="block font-bold text-gray-900 dark:text-white text-lg">Monthly Plan</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cancel anytime</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-2xl text-green-600 dark:text-green-400">{WALLET_INFO.amount}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Per Month</span>
                </div>
              </div>
          </div>

          <button 
            onClick={() => setStep('payment')}
            className="w-full group bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => setStep('redeem')}
            className="w-full text-center text-xs text-gray-400 hover:text-green-600 dark:hover:text-green-400 mt-4 transition-colors font-medium flex items-center justify-center gap-1"
          >
            <Key className="w-3 h-3" />
            Have a license key? Redeem here
          </button>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Payment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send <b>{WALLET_INFO.amount}</b> to the address below.</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 mb-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
           <span className="text-xs text-gray-500 uppercase font-semibold">Method</span>
           <span className="text-sm font-bold text-gray-800 dark:text-white">{WALLET_INFO.method}</span>
        </div>
        
        <div>
          <span className="text-xs text-gray-500 uppercase font-semibold">Wallet Address</span>
          <div className="flex items-center gap-2 mt-1.5">
            <code className="bg-white dark:bg-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 break-all flex-1">
              {WALLET_INFO.address}
            </code>
            <button 
              onClick={handleCopy} 
              className="p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Transaction ID / Reference</label>
          <input 
            type="text" 
            required
            placeholder="Paste your transaction hash or ID here"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm dark:text-white transition-all"
          />
        </div>

        <div className="mt-auto space-y-3">
          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Verify Payment
          </button>

          <button 
            type="button" 
            onClick={() => setStep('info')}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full sm:rounded-3xl rounded-t-3xl sm:max-w-md overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'redeem' ? renderRedeem() : (paymentStatus === 'pending' ? renderPendingState() : (step === 'info' ? renderInfo() : renderPayment()))}
      </div>
    </div>
  );
};

const FeatureRow = ({ text, icon: Icon }: { text: string, icon: any }) => (
  <div className="flex items-center gap-3.5">
    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0 text-green-600 dark:text-green-400">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{text}</span>
  </div>
);