import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Import Icons
import {
  FaMobileAlt,      
  FaApple,         
  FaGooglePlay,     
  FaCheckCircle,    
  FaRocket,         
  FaMapMarkerAlt,  
  FaCrown,        
  FaCopyright ,
   
  FaCreditCard,   
  FaGift,           
  FaEnvelope,       
  FaPhoneAlt,       
} from 'react-icons/fa';

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532',         // Jikoni Red
  secondary: '#00C853',       // Jikoni Green (used for success messages)
  darkText: '#1A202C',        // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF',  // White for the form card
  borderColor: '#D1D9E6',     // Light border for inputs
  errorText: '#EF4444',       // Red for errors (unused in this component directly but good to have)
  placeholderText: '#A0AEC0', // Muted text for placeholders (unused here, for inputs usually)
  buttonHover: '#E6392B',     // Darker red on button hover
  disabledButton: '#CBD5E1',  // Gray for disabled buttons
  shadow: 'rgba(0,0,0,0.1)',  // General shadow color
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseEffect = keyframes`
  0% { transform: scale(1); box-shadow: 0 4px 12px ${colors.shadow}; }
  50% { transform: scale(1.01); box-shadow: 0 8px 20px ${colors.shadow}; }
  100% { transform: scale(1); box-shadow: 0 4px 12px ${colors.shadow}; }
`;

// --- Styled Components ---

const DownloadContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${colors.lightBackground}; /* Applied new light background */
  padding: 30px;
  font-family: 'Poppins', sans-serif; /* Keep Poppins for modern look */
  animation: ${fadeIn} 0.6s ease-out;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
  }
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const DownloadCard = styled.div`
  background-color: ${colors.cardBackground}; /* Applied new card background */
  border-radius: 16px;
  box-shadow: 0 12px 30px ${colors.shadow};
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.borderColor}; /* Applied new border color */
  animation: ${slideUp} 0.7s ease-out forwards;

  @media (max-width: 480px) {
    border-radius: 12px;
    box-shadow: 0 6px 20px ${colors.shadow};
  }
`;

const HeaderSection = styled.div`
  background-color: ${colors.primary}; /* Jikoni Red */
  color: white;
  padding: 35px 25px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid ${colors.secondary}; /* Jikoni Green accent */

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const AppIcon = styled.div`
  background-color: rgba(255,255,255,0.2);
  color: white;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
`;

const Title = styled.h1`
  margin: 0;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 32px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 16px;
  opacity: 0.95;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ContentSection = styled.div`
  padding: 30px;
  text-align: center;
  background-color: ${colors.cardBackground}; /* New card background */

  @media (max-width: 480px) {
    padding: 25px;
  }
`;

const Greeting = styled.h2`
  font-size: 24px;
  color: ${colors.darkText}; /* New dark text */
  margin: 0 0 15px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Instruction = styled.p`
  font-size: 15px;
  color: ${colors.darkText}; /* Using darkText for readability on white background */
  margin-bottom: 30px;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 25px;
  }
`;

const InstallButton = styled.button`
  background-color: ${props => props.disabled ? colors.disabledButton : colors.primary};
  color: ${props => props.disabled ? colors.darkText : 'white'}; /* Adjusted disabled text color */
  border: none;
  padding: 14px 30px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  margin: 15px auto;
  width: 100%;
  max-width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 15px ${colors.shadow};

  &:not(:disabled):hover {
    background-color: ${colors.buttonHover};
    transform: translateY(-3px);
    box-shadow: 0 10px 25px ${colors.shadow};
  }

  ${props => !props.disabled && css`
    animation: ${pulseEffect} 2s infinite ease-in-out;
  `}

  @media (max-width: 480px) {
    padding: 12px 25px;
    font-size: 16px;
    max-width: 240px;
  }
`;

const FallbackInstruction = styled.p`
  font-size: 14px;
  color: ${colors.darkText}; /* Using darkText for readability */
  margin-top: 20px;
  line-height: 1.6;
  padding: 0 20px;
  
  strong {
    color: ${colors.primary}; /* Highlight strong text with Jikoni Red */
    font-weight: 700;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 0 15px;
  }
`;

const FeaturesSection = styled.div`
  margin-top: 40px;
  text-align: left;
  border-top: 1px solid ${colors.borderColor}; /* New border color */
  padding-top: 30px;

  @media (max-width: 480px) {
    margin-top: 30px;
    padding-top: 20px;
  }
`;

const FeaturesTitle = styled.h3`
  color: ${colors.darkText}; /* New dark text */
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 15px;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding-left: 0;
  color: ${colors.darkText}; /* New dark text */
  line-height: 1.8;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: 500;
  animation: ${fadeIn} 0.5s ease-out forwards;

  svg {
    font-size: 20px;
    margin-right: 12px;
    flex-shrink: 0;
    /* Use primary and secondary for features for consistency */
    &:nth-of-type(odd) { color: ${colors.primary}; } 
    &:nth-of-type(even) { color: ${colors.secondary}; } 
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
    svg {
      font-size: 18px;
    }
  }
`;

const DeveloperSection = styled.footer`
  background-color: ${colors.darkText}; /* Using darkText for the footer background */
  color: ${colors.cardBackground}; /* White text on dark footer */
  padding: 30px;
  text-align: center;
  border-top: 4px solid ${colors.primary}; /* Jikoni Red accent for footer */
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  @media (max-width: 480px) {
    padding: 25px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const DeveloperTitle = styled.h3`
  color: ${colors.secondary}; /* Jikoni Green accent for footer title */
  font-size: 17px;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 12px;
  }
`;

const DeveloperCard = styled.div`
  background-color: rgba(255,255,255,0.1); /* Slight white overlay on dark background */
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const CompanyName = styled.h4`
  color: ${colors.primary}; /* Jikoni Red for company name in footer */
  font-size: 22px;
  margin: 0 0 10px;
  font-weight: 700;
  letter-spacing: 1px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Tagline = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 15px;
  }
`;

const ContactInfo = styled.div`
  font-size: 14px;
  line-height: 1.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    
    svg {
      color: ${colors.secondary}; /* Jikoni Green for contact icons */
      font-size: 18px;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;
    gap: 8px;
    p {
      svg {
        font-size: 16px;
      }
    }
  }
`;

const CopyrightText = styled.p`
  margin-top: 25px;
  font-size: 12px;
  color: ${colors.cardBackground}; /* White text for copyright */
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  svg {
    font-size: 14px;
    color: ${colors.secondary}; /* Jikoni Green for copyright icon */
  }

  @media (max-width: 480px) {
    margin-top: 20px;
    font-size: 11px;
  }
`;


const Download = () => {
  const [username, setUserName] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const deferredPrompt = useRef(null);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const userData = getUserNameFromToken();
    if (userData) {
      setUserName(userData.name);
    }

    const checkPWAStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = window.navigator.standalone === true;

      if (standalone || iosStandalone) {
        setIsInstalled(true);
        console.log('App detected as installed (standalone mode).');
      } else {
        setIsInstalled(false);
        console.log('App not detected as installed.');
      }
    };

    checkPWAStatus();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('📦 beforeinstallprompt event captured.');
      deferredPrompt.current = e;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      deferredPrompt.current = null;
      console.log('✅ App installed successfully (appinstalled event).');
      trackInstall();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      console.log('App is already installed.');
      return;
    }

    if (isIOS) {
      alert("To install Jikoni Express on your iPhone/iPad:\n\n1. Tap the 'Share' icon (⬆️) at the bottom of your browser.\n2. Scroll down and select 'Add to Home Screen'.");
      return;
    }

    if (deferredPrompt.current) {
      try {
        deferredPrompt.current.prompt();
        const { outcome } = await deferredPrompt.current.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ User accepted the install prompt.');
        } else {
          console.log('❌ User dismissed the install prompt.');
        }
      } catch (error) {
        console.error('Error during PWA installation prompt:', error);
        alert("There was an error trying to install the app. Please try your browser's 'Add to Home Screen' option manually.");
      } finally {
        deferredPrompt.current = null;
      }
    } else {
      alert("To install Jikoni Express, please use your browser's 'Add to Home Screen' or 'Install app' option in the menu.");
    }
  };

  const trackInstall = async () => {
    const BASE_URL = "https://your-api-endpoint.com/apiV1/jikoni-express"; // REMINDER: Update this API endpoint

    try {
      const response = await fetch(`${BASE_URL}/track-install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username || 'Guest' }),
      });

      if (!response.ok) throw new Error('Tracking installation failed');
      console.log('✅ Installation tracked successfully.');
    } catch (error) {
      console.error('Error tracking installation:', error);
    }
  };

  return (
    <DownloadContainer>
      <DownloadCard>
        <HeaderSection>
          <AppIcon>
            <FaMobileAlt />
          </AppIcon>
          <Title>JIKONI EXPRESS</Title>
          <Subtitle>Your Local Culinary & Liquor Hub</Subtitle>
        </HeaderSection>

        <ContentSection>
          <Greeting>Hello {username || 'Jikoni Lover'}!</Greeting>
          <Instruction>
            Unlock the full experience by installing our app directly to your home screen.
            It's fast, free, and gives you instant access!
          </Instruction>

          {isInstalled ? (
            <InstallButton disabled>
              <FaCheckCircle /> App Installed
            </InstallButton>
          ) : (
            <>
              {showInstallButton || isIOS ? (
                <InstallButton onClick={handleInstallClick}>
                  {isIOS ? <FaApple /> : <FaGooglePlay />}
                  {isIOS ? 'Add to Home Screen (iOS)' : 'Install App'}
                </InstallButton>
              ) : (
                <InstallButton disabled>
                  <FaMobileAlt /> Preparing for Install...
                </InstallButton>
              )}

              {!isInstalled && isIOS && (
                <FallbackInstruction>
                  On iOS, tap the **'Share' icon (⬆️)** in your browser's toolbar, then scroll down and select **'Add to Home Screen'** to install.
                </FallbackInstruction>
              )}
               {!isInstalled && !isIOS && !showInstallButton && (
                <FallbackInstruction>
                  If the "Install App" button doesn't appear, you might find an "Add to Home Screen" or "Install App" option in your browser's menu (e.g., three dots icon).
                </FallbackInstruction>
              )}
            </>
          )}

          <FeaturesSection>
            <FeaturesTitle>App Highlights</FeaturesTitle>
            <FeatureList>
              <FeatureItem><FaRocket /> Instant food & liquor delivery right to your door.</FeatureItem>
              <FeatureItem><FaMapMarkerAlt /> Real-time order tracking from kitchen to your couch.</FeatureItem>
              <FeatureItem><FaCrown /> Exclusive chef specials and hidden gems only for app users.</FeatureItem>
              <FeatureItem><FaCreditCard /> Secure in-app payments for a hassle-free checkout.</FeatureItem>
              <FeatureItem><FaGift /> Earn rewards with every order and redeem for discounts!</FeatureItem>
            </FeatureList>
          </FeaturesSection>
        </ContentSection>

        <DeveloperSection>
          <DeveloperTitle>Powered by</DeveloperTitle>
          <DeveloperCard>
            <CompanyName>WELT TALLIS</CompanyName>
            <Tagline>Where culinary innovation meets digital excellence</Tagline>
            <ContactInfo>
              <p><FaEnvelope /> infoweltallis@gmail.com</p>
              <p><FaPhoneAlt /> +254 740 045 355</p>
            </ContactInfo>
          </DeveloperCard>
          <CopyrightText>
            <FaCopyright /> {new Date().getFullYear()} WELT TALLIS. All rights reserved.
          </CopyrightText>
        </DeveloperSection>
      </DownloadCard>
    </DownloadContainer>
  );
};

export default Download;