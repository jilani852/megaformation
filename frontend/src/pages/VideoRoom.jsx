import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';

function VideoRoom() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamsRef = useRef([]);
  const audioContextRef = useRef(null);
  const timerRef = useRef(null);
  const hadAudioRef = useRef(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState('');
  const [showRecordingHint, setShowRecordingHint] = useState(false);

  const userName = location.state?.userName || 'Invité';
  const sessionName = location.state?.sessionName || code;
  const isTeacher = location.state?.isTeacher === true;

  const roomName = `MegaFormation-${code}`;
  const toolbarButtons = JSON.stringify([
    'microphone', 'camera', 'desktop', 'recording', 'localrecording',
    'chat', 'raisehand', 'participants', 'tileview', 'fullscreen', 'hangup', 'settings',
  ]);
  const meetingUrl =
    `https://meet.jit.si/${roomName}#userInfo.displayName=${encodeURIComponent(JSON.stringify(userName))}` +
    `&lang=fr` +
    `&config.localRecording.disable=false` +
    `&config.recordingService.enabled=false` +
    `&config.toolbarButtons=${toolbarButtons}`;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      streamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((t) => t.stop());
      });
      streamsRef.current = [];
    };
  }, []);

  const handleOpenMeeting = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLeave = () => {
    if (isRecording) stopRecording();
    navigate('/');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const startRecording = async () => {
    setRecordingError('');
    setShowRecordingHint(true);
    hadAudioRef.current = true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError('L\'enregistrement n\'est pas supporté par ce navigateur.');
        return;
      }

      const supportsScreenCapture = !!navigator.mediaDevices.getDisplayMedia;
      const tracks = [];
      let recordingStream;
      let hasAudio = false;

      if (supportsScreenCapture) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          const videoTracks = screenStream.getVideoTracks();
          if (videoTracks.length === 0) {
            setRecordingError('Impossible de capturer la vidéo.');
            screenStream.getTracks().forEach((t) => t.stop());
            return;
          }

          tracks.push(screenStream);

          const screenHasAudio = screenStream.getAudioTracks().length > 0;
          const finalTracks = [...screenStream.getTracks()];

          if (screenHasAudio) {
            hasAudio = true;
          } else {
            try {
              const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                },
              });
              tracks.push(micStream);
              finalTracks.push(...micStream.getTracks());
              hasAudio = true;
            } catch (micErr) {
              console.log('Microphone not available, recording without mic:', micErr);
            }
          }

          recordingStream = new MediaStream(finalTracks);
          hadAudioRef.current = hasAudio;

          screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              stopRecording();
            }
          });
        } catch (screenErr) {
          if (screenErr.name === 'NotAllowedError') {
            setRecordingError('Vous avez annulé le partage d\'écran. L\'enregistrement a été annulé.');
            return;
          }
          console.log('Screen capture failed, falling back to camera:', screenErr);
          recordingStream = null;
        }
      }

      if (!recordingStream) {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        tracks.push(userStream);
        recordingStream = userStream;
        hadAudioRef.current = true;
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const recorder = new MediaRecorder(recordingStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `megaformation-recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        cleanupRecordingStreams();
        if (!hadAudioRef.current) {
          setRecordingError(
            'Vidéo téléchargée mais AUCUN son capturé. Pour enregistrer le son des autres participants, sélectionnez l\'ONGLET de la réunion Jitsi lors du partage d\'écran et cochez "Partager le son de l\'onglet".'
          );
        }
      };

      streamsRef.current = tracks;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      if (err.name === 'NotAllowedError') {
        setRecordingError('Vous devez autoriser la caméra et le microphone pour enregistrer.');
      } else {
        setRecordingError('Erreur lors du démarrage de l\'enregistrement.');
      }
      setIsRecording(false);
    }
  };

  const cleanupRecordingStreams = () => {
    streamsRef.current.forEach((stream) => {
      stream.getTracks().forEach((t) => t.stop());
    });
    streamsRef.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
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

          {isRecording && (
            <span className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              REC {formatTime(recordingTime)}
            </span>
          )}

          {isTeacher && (
            <button
              onClick={isRecording ? handleStopRecording : startRecording}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-dark-600 hover:bg-dark-500 text-white'
              }`}
              title={isRecording ? 'Arrêter l\'enregistrement et télécharger' : 'Enregistrer la session'}
            >
              {isRecording ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span className="hidden sm:inline">Arrêter</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Enregistrer</span>
                </>
              )}
            </button>
          )}

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

      {showRecordingHint && isRecording && (
        <div className="bg-yellow-900/30 border-b border-yellow-700/30 px-4 py-2 text-yellow-300 text-sm text-center">
          <strong>Astuce audio:</strong> Pour enregistrer le son des autres participants,
          sélectionnez l'<strong>onglet de la réunion Jitsi</strong> dans le partage d'écran
          et cochez <strong>"Partager le son de l'onglet"</strong>.
          <br />
          Pour <strong>arrêter l'enregistrement</strong>, revenez sur cette page et cliquez sur le
          bouton rouge <strong>"Arrêter"</strong> en bas de l'écran.
        </div>
      )}

      {recordingError && (
        <div className="bg-red-900/30 border-b border-red-700/30 px-4 py-2 text-red-300 text-sm text-center">
          {recordingError}
        </div>
      )}

      {isRecording && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-full shadow-2xl border-2 border-red-400">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            <span className="font-bold">REC</span>
            <span className="font-mono">{formatTime(recordingTime)}</span>
            <button
              onClick={handleStopRecording}
              className="bg-white text-red-600 font-bold px-5 py-2 rounded-full text-sm hover:bg-red-50 transition-colors"
            >
              Arrêter
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 relative flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {sessionName}
          </h2>
          <p className="text-dark-300 mb-8">
            Cliquez sur le bouton ci-dessous pour ouvrir la réunion vidéo dans un nouvel onglet.
          </p>

          <button
            onClick={handleOpenMeeting}
            className="btn-primary text-lg py-4 px-10 rounded-xl inline-flex items-center justify-center gap-2 mb-8"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ouvrir la Réunion
          </button>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-left">
            <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide">
              Comment ça marche
            </h3>
            <ul className="text-dark-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">1.</span>
                Ouvrez la réunion dans le nouvel onglet (audio + caméra).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 font-bold">2.</span>
                Partagez le lien avec les étudiants pour qu'ils rejoignent la même salle.
              </li>
              {isTeacher ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">3.</span>
                    <span>
                      <strong className="text-white">Méthode Jitsi (conseillée):</strong> dans la
                      réunion, cliquez sur l'icône <strong className="text-white">menu (⋮)</strong>,
                      puis <strong className="text-white">Enregistrement</strong>. Choisissez{" "}
                      <strong className="text-white">"Fichier"</strong> et lancez l'enregistrement.
                      Pour arrêter, revenez au même menu et cliquez sur{" "}
                      <strong className="text-white">Arrêter l'enregistrement</strong> — la vidéo se
                      télécharge automatiquement. <em className="text-dark-400">(Fonctionne sur
                      Chrome/Edge uniquement)</em>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">4.</span>
                    <span>
                      <strong className="text-white">Solution de secours:</strong> notre bouton{" "}
                      <strong className="text-white">Enregistrer</strong> sur cette page (fonctionne
                      sur tous les navigateurs). Revenez ici, cliquez sur Enregistrer, et lors du
                      partage d'écran choisissez l'<strong className="text-white">onglet de la
                      réunion</strong> en cochant <strong className="text-white">"Partager le son de
                      l'onglet"</strong>.
                    </span>
                  </li>
                </>
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">3.</span>
                  Rejoignez la salle dans l'onglet ouvert et participez à la session.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VideoRoom;
