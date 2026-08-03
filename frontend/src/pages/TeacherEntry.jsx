import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function TeacherEntry() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/teacher/verify', {
        name: name.trim(),
        code: code.trim(),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Impossible de vérifier l\'enseignant');
        setLoading(false);
        return;
      }

      navigate(`/session/${code.trim().toUpperCase()}`, {
        state: { userName: name.trim(), sessionName: data.session.name, isTeacher: true },
      });
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full relative">
        <Link
          to="/"
          className="absolute -top-2 left-0 flex items-center gap-1 text-dark-500 hover:text-primary-500 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Accueil
        </Link>
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="MegaFormation" className="h-16 w-auto object-contain" />
        </Link>

        <div className="card">
          <h2 className="text-2xl font-bold text-dark-900 text-center mb-2">
            Espace Enseignant
          </h2>
          <p className="text-dark-500 text-center mb-8">
            Entrez votre nom et le code de la session
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Votre Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez votre nom complet"
                className="input-field"
                autoFocus
                required
              />
            </div>

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
              disabled={loading || !name.trim() || !code.trim()}
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
                'Entrer dans la Session'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherEntry;
