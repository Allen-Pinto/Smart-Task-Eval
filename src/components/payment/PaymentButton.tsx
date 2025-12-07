'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadRazorpay } from '@/lib/razorpay-client'

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  timeout?: number;
  remember_customer?: boolean;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentButtonProps {
  taskId: string;
  amount?: number;
  onSuccess?: (data: {
    orderId: string;
    paymentId: string;
    taskId: string;
  }) => void;
  onError?: (error: string, errorData?: any) => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  successText?: string;
  showLoader?: boolean;
  retryCount?: number;
  // Additional customization
  companyName?: string;
  productDescription?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  themeColor?: string;
}

// Default company info
const DEFAULT_CONFIG = {
  COMPANY_NAME: 'Code Evaluator Pro',
  PRODUCT_DESCRIPTION: 'Unlock detailed AI evaluation',
  CUSTOMER_NAME: 'User',
  CUSTOMER_EMAIL: 'user@example.com',
  CUSTOMER_PHONE: '9999999999',
  THEME_COLOR: '#8B5CF6',
  SUCCESS_MESSAGE: 'Payment successful! Your evaluation has been unlocked.',
} as const;

export default function PaymentButton({
  taskId,
  amount = 10,
  onSuccess,
  onError,
  buttonText = "Pay to Unlock",
  className = "",
  disabled = false,
  loadingText = "Processing...",
  successText = DEFAULT_CONFIG.SUCCESS_MESSAGE,
  showLoader = true,
  retryCount = 3,
  companyName = DEFAULT_CONFIG.COMPANY_NAME,
  productDescription = DEFAULT_CONFIG.PRODUCT_DESCRIPTION,
  customerName = DEFAULT_CONFIG.CUSTOMER_NAME,
  customerEmail = DEFAULT_CONFIG.CUSTOMER_EMAIL,
  customerPhone = DEFAULT_CONFIG.CUSTOMER_PHONE,
  themeColor = DEFAULT_CONFIG.THEME_COLOR,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Preload Razorpay script on component mount
  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        const loaded = await loadRazorpay();
        setRazorpayLoaded(loaded);
        
        if (!loaded) {
          console.warn('Razorpay failed to load');
          onError?.('Payment gateway initialization failed');
        }
      } catch (error) {
        console.error('Error loading Razorpay:', error);
        onError?.('Failed to initialize payment system');
      }
    };

    initializeRazorpay();
  }, [onError]);

  const createOrder = useCallback(async (taskId: string, amount: number) => {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create order (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }, []);

  const verifyPayment = useCallback(async (
    orderId: string,
    paymentId: string,
    signature: string,
    taskId: string
  ) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature,
          taskId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Verification failed (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }, []);

  const openRazorpayModal = useCallback((orderData: any) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error('Razorpay not available');
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: companyName,
      description: productDescription,
      order_id: orderData.orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        taskId,
        amount: amount,
      },
      theme: {
        color: themeColor,
        backdrop_color: '#f3f4f6',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed by user');
          setLoading(false);
          setPaymentStatus('idle');
        },
        escape: true,
        backdropclose: false,
      },
      retry: {
        enabled: true,
        max_count: retryCount,
      },
      timeout: 900,
      remember_customer: true,
      handler: async (response: RazorpayResponse) => {
        try {
          setPaymentStatus('processing');
          
          const verifyData = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            taskId
          );

          if (verifyData.success) {
            setPaymentStatus('success');
            
            // Call success callback
            onSuccess?.({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              taskId,
            });

            // Show success message if no callback provided
            if (!onSuccess) {
              alert(successText);
              // Auto-refresh after 2 seconds
              setTimeout(() => window.location.reload(), 2000);
            }
          } else {
            throw new Error(verifyData.error || 'Payment verification failed');
          }
        } catch (error: any) {
          setPaymentStatus('error');
          console.error('Payment handler error:', error);
          
          if (onError) {
            onError(error.message, { taskId, orderId: orderData.orderId });
          } else {
            alert(`Payment failed: ${error.message}`);
          }
        } finally {
          setLoading(false);
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    // Add event listeners
    razorpay.on('payment.failed', (response: any) => {
      setPaymentStatus('error');
      setLoading(false);
      console.error('Payment failed:', response.error);
      
      const errorMessage = response.error?.description || 'Payment was declined';
      
      if (onError) {
        onError(errorMessage, { 
          error: response.error,
          taskId,
          orderId: orderData.orderId 
        });
      } else {
        alert(`Payment failed: ${errorMessage}`);
      }
    });

    razorpay.on('payment.authorized', (response: any) => {
      console.log('Payment authorized:', response);
    });

    razorpay.on('modal.ondismiss', () => {
      console.log('Modal dismissed by user');
      setLoading(false);
    });

    razorpay.open();
  }, [
    taskId,
    amount,
    companyName,
    productDescription,
    customerName,
    customerEmail,
    customerPhone,
    themeColor,
    retryCount,
    verifyPayment,
    onSuccess,
    onError,
    successText,
  ]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      const errorMsg = 'Payment system is still loading. Please try again.';
      onError?.(errorMsg);
      alert(errorMsg);
      return;
    }

    if (disabled || loading) {
      return;
    }

    if (retryAttempts >= retryCount) {
      const errorMsg = 'Maximum retry attempts reached. Please refresh the page.';
      onError?.(errorMsg);
      alert(errorMsg);
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Create order
      const orderData = await createOrder(taskId, amount);

      // Validate order data
      if (!orderData.orderId || !orderData.amount) {
        throw new Error('Invalid order response from server');
      }

      // Open Razorpay modal
      openRazorpayModal(orderData);
      
      // Reset retry attempts on successful order creation
      setRetryAttempts(0);
    } catch (error: any) {
      setPaymentStatus('error');
      setLoading(false);
      setRetryAttempts(prev => prev + 1);
      
      const errorMsg = error.message || 'Failed to initialize payment';
      console.error('Payment initialization error:', error);

      if (onError) {
        onError(errorMsg, { taskId, retryAttempts: retryAttempts + 1 });
      } else {
        alert(`Payment error: ${errorMsg}`);
      }
    }
  };

  const handleRetry = () => {
    if (retryAttempts < retryCount) {
      handlePayment();
    }
  };

  // Determine button state and content
  const isButtonDisabled = disabled || loading || !razorpayLoaded || retryAttempts >= retryCount;
  
  let buttonContent = '';
  let showSpinner = false;

  if (paymentStatus === 'success') {
    buttonContent = 'Payment Successful!';
  } else if (loading) {
    buttonContent = loadingText;
    showSpinner = showLoader;
  } else if (!razorpayLoaded) {
    buttonContent = 'Loading Payment...';
    showSpinner = true;
  } else if (retryAttempts > 0) {
    buttonContent = `Try Again (${retryAttempts}/${retryCount})`;
  } else {
    buttonContent = `${buttonText} - ₹${amount}`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handlePayment}
        disabled={isButtonDisabled}
        className={`
          relative px-6 py-3 rounded-lg font-semibold transition-all duration-200
          min-w-[200px]
          ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : paymentStatus === 'success'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : paymentStatus === 'error'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
          }
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
          disabled:transform-none disabled:shadow-none
          disabled:hover:transform-none
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
          ${className}
        `}
        aria-busy={loading}
        aria-label={`${buttonText} for ₹${amount}`}
      >
        <span className="flex items-center justify-center gap-2">
          {showSpinner && (
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {buttonContent}
        </span>
        
        {paymentStatus === 'processing' && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
      </button>

      {/* Status indicators */}
      <div className="h-6 text-sm text-center">
        {paymentStatus === 'error' && retryAttempts < retryCount && (
          <button
            onClick={handleRetry}
            className="text-red-600 hover:text-red-700 underline transition-colors"
          >
            Click to retry payment
          </button>
        )}
        
        {!razorpayLoaded && (
          <p className="text-amber-600">Initializing payment gateway...</p>
        )}
        
        {retryAttempts >= retryCount && (
          <p className="text-red-600">Maximum retries reached. Please refresh.</p>
        )}
      </div>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <p>Status: {paymentStatus}</p>
          <p>Razorpay Loaded: {razorpayLoaded ? 'Yes' : 'No'}</p>
          <p>Retry Attempts: {retryAttempts}/{retryCount}</p>
          <p>Task ID: {taskId}</p>
          <p>Amount: ₹{amount}</p>
        </div>
      )}
    </div>
  );
}

// Optional: Add CSS for shimmer animation
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'payment-button-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = shimmerStyles;
    document.head.appendChild(styleElement);
  }
}