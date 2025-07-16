import { useEffect, useState, useRef } from 'react';
import { getUserNameFromToken } from '../handler/tokenDecoder';

const Download = () => {
  const [username, setUserName] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Auto-refresh logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('refreshed')) {
      params.set('refreshed', 'true');
      window.location.search = params.toString();
    } else {
      setInitialLoad(false);
    }
  }, []);


  useEffect(() => {
    if (!initialLoad) {
      const userData = getUserNameFromToken();
      if (userData) setUserName(userData.name);
    }
  }, [initialLoad]);

 
  useEffect(() => {
    if (initialLoad) return;

    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
      
      if ((isIOS && isSafari && navigator.standalone) || isStandalone) {
        setIsInstalled(true);
      }
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('📦 beforeinstallprompt event captured');
      deferredPrompt.current = e;
      setIsInstalled(false);
    };

    checkInstalled();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', () => {});
    };
  }, [initialLoad]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return alert('App is already installed!');
      }
      return alert('Install prompt not available - try refreshing');
    }

    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ App installed successfully');
        setIsInstalled(true);
        trackInstall();
      }
    } catch (error) {
      console.error('Installation error:', error);
    } finally {
      deferredPrompt.current = null;
    }
  };

  const trackInstall = async () => {
    const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username }),
      });

      if (!response.ok) throw new Error('Tracking failed');
      console.log('✅ Installation tracked');
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  if (initialLoad) return null; // Prevent flash of content before refresh

  return (
    <div className="installation-container">
      <h1>Hello {username}, Welcome to Neuro-City-Apps</h1>

      <button
        className="install-button"
        onClick={handleInstall}
        disabled={!deferredPrompt || isInstalled}
      >
        {isInstalled ? 'App Installed ✓' : 'Install App Now'}
      </button>

      <div className="developer-section">
        <img src="/images/dev.png" alt="Developer" />
        <h2>Peter Mumo</h2>
        <p>CEO & Founder Welt Tallis</p>
        <p>Developer & Creator of Neuro-City-Apps</p>
        <div className="contact-info">
          <p>📧 peteritumo2030@gmail.com</p>
          <p>📱 +254740045355</p>
        </div>
      </div>

      <div className="company-section">
        <h3>Promoted by Welt Tallis Group</h3>
        <p>We Believe in the Power of Technology to Change Human Life.</p>
      </div>
    </div>
  );
};

export default Download;