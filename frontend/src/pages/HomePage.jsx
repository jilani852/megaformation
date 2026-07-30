import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dark-900 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="MegaFormation"
              className="mx-auto h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
            <span className="text-primary-500">M</span><span className="text-white">ega</span>
            <span className="text-primary-500">F</span><span className="text-white">ormation</span>
          </h1>
          <p className="text-xl text-dark-300 mb-12 font-light">
            Plateforme Éducative En Ligne
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/enter"
              className="btn-primary text-lg py-4 px-10 rounded-xl inline-flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Rejoindre une Session
            </Link>

            <Link
              to="/admin/login"
              className="btn-secondary text-lg py-4 px-10 rounded-xl inline-flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Espace Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-dark-900 font-bold text-lg mb-2">Cours en Direct</h3>
            <p className="text-dark-500 text-sm">Participez à des sessions vidéo en temps réel</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-dark-900 font-bold text-lg mb-2">Plusieurs Sessions</h3>
            <p className="text-dark-500 text-sm">Accédez à différentes matières et niveaux</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-dark-900 font-bold text-lg mb-2">Accès Rapide</h3>
            <p className="text-dark-500 text-sm">Entrez le code et rejoignez en un clic</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
