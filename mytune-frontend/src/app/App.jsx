import React, { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './providers/AuthProvider';
import Login from '../presentation/Pages/Login';
import Register from '../presentation/Pages/Register';
import Profile from '../presentation/Pages/Profile';
import ReviewsList from '../presentation/components/reviews/ReviewsList';
import ArtistSearch from '../presentation/Pages/ArtistSearch';
import ArtistDetailPage from '../presentation/Pages/ArtistDetailPage';

function AppContent() {
  const { isAuthenticated, setIsAuthenticated, logout } = useContext(AuthContext);
  const [page, setPage] = useState('reviews');
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  const handleArtistSelect = (artistId) => {
    setSelectedArtistId(artistId);
    setPage('artistDetail');
  };

  const handleBackToSearch = () => {
    setSelectedArtistId(null);
    setPage('search');
  };

  const onLogout = () => {
    logout();
    setIsAuthenticated(false);
    setPage('login');
  };

  return (
    <div className="container mt-4">
      <nav className="mb-4 d-flex gap-2 flex-wrap">
        <button
          className={`btn ${page === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPage('reviews')}
        >
          All Reviews
        </button>

        <button
          className={`btn ${
            page === 'search' || page === 'artistDetail' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setPage('search')}
        >
          Search Artists
        </button>

        {isAuthenticated ? (
          <>
            <button
              className={`btn ${page === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage('profile')}
            >
              Profile
            </button>
            <button className="btn btn-outline-danger" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className={`btn ${page === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage('login')}
            >
              Login
            </button>
            <button
              className={`btn ${page === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage('register')}
            >
              Register
            </button>
          </>
        )}
      </nav>

      {page === 'reviews' && <ReviewsList />}
      {page === 'search' && <ArtistSearch onArtistSelect={handleArtistSelect} />}
      {page === 'artistDetail' && selectedArtistId && (
        <ArtistDetailPage artistId={selectedArtistId} onBack={handleBackToSearch} />
      )}
      {page === 'login' && <Login setPage={setPage} />}
      {page === 'register' && <Register setPage={setPage} />}
      {page === 'profile' && <Profile setPage={setPage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
