// API configuration
const defaultLocalhost = 'http://localhost:5000';
const androidEmulator = 'http://10.0.2.2:5000';
const genymotionEmulator = 'http://10.0.3.2:5000';

const envUrl = import.meta.env.VITE_API_BASE_URL;

const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
const isCapacitor = typeof window !== 'undefined' && ['capacitor:', 'ionic:', 'file:'].includes(window.location.protocol);

const API_BASE_URL = (() => {
  if (typeof window === 'undefined') {
    return defaultLocalhost;
  }

  // If a specific API URL is provided via environment variable, use it
  if (envUrl) {
    return envUrl;
  }

  // For Android Capacitor apps, use emulator-specific hosts
  if (isCapacitor && isAndroid) {
    // Default to Android emulator host.
    // If you're using a real device, set VITE_API_BASE_URL to your computer's IP.
    return androidEmulator;
  }

  // For web apps, dynamically use the current hostname
  // This allows the app to work on both localhost and network IPs
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const apiUrl = `${protocol}//${hostname}:5000`;
  
  return apiUrl;
})();

if (typeof window !== 'undefined') {
  console.info('API base URL set to:', API_BASE_URL);
  if (!envUrl && isCapacitor && isAndroid) {
    console.warn('No VITE_API_BASE_URL configured. Using Android emulator host 10.0.2.2. For a real device, set VITE_API_BASE_URL=http://<your-pc-ip>:5000');
  }
}

export default API_BASE_URL;