import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';

function VideoRoom() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userName = location.state?.userName || 'Invité';
  const sessionName = location.state?.sessionName || code;

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('jitsi-script')) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }

        const domain = 'meet.jit.si';
        const roomName = `MegaFormation-${code}`;

        const options = {
          roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            defaultLanguage: 'fr',
            toolbarButtons: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'participants', 'tileview',
              'fullscreen', 'hangup', 'settings',
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: '#1a1a1a',
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            TILE_VIEW_MAX_COLUMNS: 4,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('readyToClose', () => {
          navigate('/');
        });

        api.addEventListener('participantJoined', (participant) => {
          console.log('Participant joined:', participant);
        });

        setLoading(false);
      } catch (err) {
        console.error('Jitsi error:', err);
        setError('Impossible de charger la salle vidéo. Veuillez réessayer.');
        setLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [code, userName, navigate]);

  const handleLeave = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    navigate('/');
  };

  return (
    <div className="h-screen bg-dark-900 flex flex-col">
      <header className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MegaFormation" className="h-8 w-auto object-contain" />
            <span className="text-white font-bold text-lg hidden sm:inline">
              Mega<span className="text-primary-500">Formation</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2 bg-dark-700 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-dark-200 text-sm font-medium">{sessionName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white text-sm hidden sm:inline">{userName}</span>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Quitter
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">Connexion à la session...</p>
              <p className="text-dark-400 text-sm mt-2">Patientez pendant que nous préparons votre salle</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Erreur</h3>
              <p className="text-dark-400 mb-6">{error}</p>
              <button onClick={handleLeave} className="btn-primary">
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        <div
          ref={jitsiContainerRef}
          className="w-full h-full"
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      </main>
    </div>
  );
}

export default VideoRoom;
