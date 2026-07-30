import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function CodeEntry() {
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/session/verify', { code: code.trim() });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Code invalide');
        setLoading(false);
        return;
      }

      setStep(2);
      setLoading(false);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/session/join', { code: code.trim(), userName: userName.trim() });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur');
        setLoading(false);
        return;
      }

      navigate(`/session/${code.trim().toUpperCase()}`, {
        state: { userName: userName.trim(), sessionName: data.session.name },
      });
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="MegaFormation" className="h-16 w-auto object-contain" />
        </Link>

        <div className="card">
          <h2 className="text-2xl font-bold text-dark-900 text-center mb-2">
            Rejoindre une Session
          </h2>
          <p className="text-dark-500 text-center mb-8">
            {step === 1 ? 'Entrez le code de votre session' : 'Entrez votre nom pour continuer'}
          </p>

          {step === 1 ? (
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Code de Session
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABCD1234"
                  className="input-field text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={20}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Vérification...
                  </span>
                ) : (
                  'Vérifier le Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin}>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 text-sm font-medium">Session trouvée!</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Votre Nom
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Entrez votre nom complet"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setError(''); }}
                  className="btn-secondary flex-1"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !userName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connexion...' : 'Rejoindre'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeEntry;
