import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminDashboard({ token, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/sessions', token);

      if (response.status === 401) {
        onLogout();
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setSessions(data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des sessions');
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/teachers', token);

      if (response.status === 401) {
        onLogout();
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      setError('Erreur lors du chargement des enseignants');
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchTeachers();
  }, [token]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const response = await api.post('/api/sessions', { name: newSessionName }, token);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
        setCreating(false);
        return;
      }

      setNewSessionName('');
      fetchSessions();
    } catch (err) {
      setError('Erreur de connexion');
      setCreating(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      return;
    }

    try {
      await api.delete(`/api/sessions/${id}`, token);
      fetchSessions();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setAddingTeacher(true);

    try {
      const response = await api.post('/api/teachers', { name: newTeacherName.trim() }, token);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'ajout de l\'enseignant');
        setAddingTeacher(false);
        return;
      }

      setNewTeacherName('');
      fetchTeachers();
      setAddingTeacher(false);
    } catch (err) {
      setError('Erreur de connexion');
      setAddingTeacher(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet enseignant ?')) {
      return;
    }

    try {
      await api.delete(`/api/teachers/${id}`, token);
      fetchTeachers();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'enseignant');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="MegaFormation" className="h-10 w-auto object-contain" />
            <span className="text-white font-bold text-xl hidden sm:inline">
              Mega<span className="text-primary-500">Formation</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-dark-700 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-dark-200 text-sm">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Tableau de Bord</h1>
          <p className="text-dark-500">Gérez vos sessions et codes d'accès</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-dark-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-dark-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-dark-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Total Enseignants</p>
                <p className="text-2xl font-bold text-dark-900">{teachers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-dark-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4">Créer une Nouvelle Session</h2>
          <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Ex: Session Janvier Anglais"
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </span>
              ) : (
                '+ Créer la Session'
              )}
            </button>
          </form>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-dark-100">
          <div className="p-6 border-b border-dark-100">
            <h2 className="text-lg font-bold text-dark-900">Sessions Actives</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-dark-500">Chargement des sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-dark-700 font-semibold mb-1">Aucune session</h3>
              <p className="text-dark-400 text-sm">Créez votre première session pour commencer</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-100">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-dark-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-dark-900 font-semibold text-lg">{session.name}</h3>
                    <p className="text-dark-400 text-sm mt-1">
                      Créée le {new Date(session.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-dark-100 rounded-lg px-4 py-2">
                      <span className="text-dark-500 text-xs">Code:</span>
                      <span className="font-mono font-bold text-dark-900 tracking-wider">
                        {session.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(session.code)}
                        className="ml-1 p-1 hover:bg-dark-200 rounded transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode === session.code ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <Link
                      to={`/session/${session.code}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ouvrir
                    </Link>

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-dark-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4">Gérer les Enseignants</h2>
          <p className="text-dark-500 text-sm mb-4">
            Seuls les enseignants ajoutés ici peuvent enregistrer une session vidéo.
          </p>
          <form onSubmit={handleAddTeacher} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Nom complet de l'enseignant"
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={addingTeacher}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {addingTeacher ? 'Ajout...' : '+ Ajouter'}
            </button>
          </form>

          {teachers.length === 0 ? (
            <p className="text-dark-400 text-sm">Aucun enseignant ajouté pour le moment</p>
          ) : (
            <div className="divide-y divide-dark-100">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 text-sm font-bold">
                        {teacher.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-dark-900 font-medium">{teacher.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id)}
                    className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Retirer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
