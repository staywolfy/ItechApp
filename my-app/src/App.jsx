import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import Course from "./components/Course";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [debugInfo, setDebugInfo] = useState("Checking PWA status...");

  useEffect(() => {
    console.log("🔍 Starting PWA installability check...");

    // Comprehensive PWA requirements check
    const checkPWARequirements = async () => {
      const requirements = {
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasServiceWorker: 'serviceWorker' in navigator,
        isHTTPS: window.location.protocol === 'https:',
        isLocalhost: window.location.hostname === 'studentinfoapp.i-tech.net.in',
        isSecure: window.location.protocol === 'https:' || window.location.hostname === 'studentinfoapp.i-tech.net.in',
        hasIcons: false,
        hasStartUrl: false,
        hasDisplayMode: false
      };

      // Check manifest content
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink && manifestLink.href) {
        try {
          const response = await fetch(manifestLink.href);
          const manifest = await response.json();
          
          requirements.hasIcons = manifest.icons && manifest.icons.length > 0;
          requirements.hasStartUrl = !!manifest.start_url;
          requirements.hasDisplayMode = ['standalone', 'fullscreen'].includes(manifest.display);
          
          console.log("📋 Manifest check completed:", requirements);
          
          // CORRECTED: Only check the actual requirements, not all properties
          const criticalRequirements = [
            requirements.hasManifest,
            requirements.hasServiceWorker,
            requirements.isSecure,
            requirements.hasIcons,
            requirements.hasStartUrl,
            requirements.hasDisplayMode
          ];
          
          const allRequirementsMet = criticalRequirements.every(req => req);
          console.log(allRequirementsMet ? "✅ All PWA requirements met" : "❌ Some requirements missing");
          
          if (allRequirementsMet) {
            setDebugInfo("✅ All PWA requirements met - waiting for install prompt");
          } else {
            setDebugInfo("❌ Missing requirements - check console");
          }
          
          return allRequirementsMet;
        } catch (err) {
          console.error("❌ Error loading manifest:", err);
          setDebugInfo("❌ Manifest file cannot be loaded");
          return false;
        }
      } else {
        console.log("❌ No manifest link found");
        setDebugInfo("❌ No manifest link in HTML");
        return false;
      }
    };

    // Detect if the app is installable
    const handleBeforeInstallPrompt = (e) => {
      console.log('🚀 beforeinstallprompt event fired - PWA is installable!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowInstallButton(true);
      setDebugInfo("🎉 PWA is installable - button visible!");
    };

    // Check if app is already installed
    const checkIfAppIsInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 App is running in standalone mode');
        setIsInstallable(false);
        setShowInstallButton(false);
        setDebugInfo("📱 App is already installed");
        return true;
      }
      return false;
    };

    // Check service worker registration
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log('✅ Service Worker is active:', registration);
        } catch (error) {
          console.log('❌ Service Worker not ready:', error);
        }
      }
    };

    // Initialize PWA checks
    const initializePWA = async () => {
      const isInstalled = checkIfAppIsInstalled();
      
      if (!isInstalled) {
        await checkServiceWorker();
        const requirementsMet = await checkPWARequirements();
        
        if (requirementsMet) {
          console.log("✅ All PWA requirements confirmed - app should be installable");
          // Even if no automatic prompt, we can show the button after engagement
          setTimeout(() => {
            // Show install button after user has interacted with the site
            console.log("🔄 Showing install button based on met requirements");
            setIsInstallable(true);
            setShowInstallButton(true);
            setDebugInfo("✅ PWA ready - Install button enabled");
          }, 5000); // Show after 5 seconds of site usage
        }
      }
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', (evt) => {
      console.log('🎉 PWA was installed successfully!');
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallButton(false);
      setDebugInfo("🎉 App installed successfully!");
    });

    // Start the initialization
    initializePWA();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🖱️ Install button clicked');
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available, showing manual instructions');
      
      // Show platform-specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('To install this app on iOS:\n\n1. Tap the Share button (📤)\n2. Scroll down\n3. Tap "Add to Home Screen"\n4. Tap "Add"');
      } else if (isAndroid) {
        alert('To install this app on Android:\n\n1. Tap the menu (⋮) in Chrome\n2. Tap "Install app" or "Add to Home screen"\n3. Tap "Install"');
      } else {
        alert('To install this app:\n\nLook for the install icon in your browser\'s address bar or menu.');
      }
      return;
    }
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response: ${outcome}`);
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const handleDismissInstall = () => {
    console.log('Dismissing install prompt');
    setShowInstallButton(false);
    setTimeout(() => {
      if (isInstallable) {
        setShowInstallButton(true);
      }
    }, 30000);
  };

  // Manual trigger for testing
  const handleManualTrigger = () => {
    console.log('Manual trigger - forcing install button to show');
    setIsInstallable(true);
    setShowInstallButton(true);
    setDebugInfo("🔧 Manual override - Install button shown");
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="course" element={<Course />} />
          </Route>
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>

      {/* Install button */}
      {showInstallButton && (
        <div className="install-prompt">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstallClick}
              className="install-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              📱 Install App
            </button>
            <button 
              onClick={handleDismissInstall}
              className="dismiss-button bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              title="Dismiss for 30 seconds"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-sm max-w-md z-50 shadow-lg">
          <div className="font-bold mb-1">PWA Debug Info:</div>
          <div className="text-xs">{debugInfo}</div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleManualTrigger}
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
            >
              Show Install
            </button>
            <button 
              onClick={() => {
                setShowInstallButton(false);
                setDebugInfo("Install button hidden");
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
            >
              Hide Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;