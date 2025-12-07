let razorpayLoaded = false;
let loadingPromise: Promise<boolean> | null = null;

/**
 * Load Razorpay script dynamically
 * @returns Promise<boolean> - Whether Razorpay loaded successfully
 */
export const loadRazorpay = (): Promise<boolean> => {
  // Already loaded
  if (razorpayLoaded || (typeof window !== 'undefined' && (window as any).Razorpay)) {
    razorpayLoaded = true;
    return Promise.resolve(true);
  }

  // Already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      // Wait for existing script to load
      existingScript.addEventListener('load', () => {
        razorpayLoaded = true;
        loadingPromise = null;
        resolve(true);
      });

      existingScript.addEventListener('error', () => {
        console.error('Failed to load existing Razorpay script');
        loadingPromise = null;
        resolve(false);
      });

      return;
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      razorpayLoaded = true;
      loadingPromise = null;
      console.log('✅ Razorpay SDK loaded successfully');
      resolve(true);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Razorpay SDK:', error);
      razorpayLoaded = false;
      loadingPromise = null;
      resolve(false);
    };

    // Add to document head
    document.head.appendChild(script);
  });

  return loadingPromise;
};

/**
 * Check if Razorpay is ready to use
 */
export const isRazorpayReady = (): boolean => {
  if (typeof window === 'undefined') return false;
  return razorpayLoaded || !!(window as any).Razorpay;
};

/**
 * Get Razorpay constructor
 * @throws Error if Razorpay not loaded
 */
export const getRazorpay = () => {
  if (typeof window === 'undefined') {
    throw new Error('Razorpay can only be used in browser environment');
  }

  if (!(window as any).Razorpay) {
    throw new Error(
      'Razorpay not loaded. Please call loadRazorpay() first and wait for it to resolve.'
    );
  }

  return (window as any).Razorpay;
};

/**
 * Reset loading state (useful for testing)
 */
export const resetRazorpay = () => {
  razorpayLoaded = false;
  loadingPromise = null;
};