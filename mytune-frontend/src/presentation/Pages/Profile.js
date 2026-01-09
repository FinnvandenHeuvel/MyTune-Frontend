import React, { useEffect, useMemo, useState, useContext } from 'react';
import { AuthContext } from '../../app/providers/AuthProvider';
import { container } from '../../app/di/container';
import { getMe } from '../../application/usecases/profile/getMe';
import { getMyReviews } from '../../application/usecases/profile/getMyReviews';

export default function Profile({ setPage }) {
  const { isAuthenticated } = useContext(AuthContext);

  const [meState, setMeState] = useState(null);
  const [myReviews, setMyReviewsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getMeUC = useMemo(() => getMe({ profileGateway: container.profileGateway }), []);
  const getMyReviewsUC = useMemo(
    () => getMyReviews({ profileGateway: container.profileGateway }),
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError('');

        const meData = await getMeUC();
        setMeState(meData);

        const reviewsData = await getMyReviewsUC();
        setMyReviewsState(reviewsData);
      } catch (e) {
        setError(e.message || 'Could not load profile. Please log in again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, getMeUC, getMyReviewsUC]);

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">You must be logged in to view your profile.</div>
        <button className="btn btn-primary" onClick={() => setPage?.('login')}>
          Go to Login
        </button>
      </div>
    );
  }

  if (loading)
    return (
      <div className="container mt-4">
        <p>Loading profile…</p>
      </div>
    );
  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container mt-4">
      <h2>Profile</h2>

      <div className="card p-3 mb-4">
        <div>
          <strong>Username:</strong> {meState?.username}
        </div>
        <div>
          <strong>Email:</strong> {meState?.email}
        </div>
        <div>
          <strong>Joined:</strong>{' '}
          {meState?.date_joined ? new Date(meState.date_joined).toLocaleDateString() : '—'}
        </div>
      </div>

      <h3 className="mb-3">My Reviews</h3>

      {myReviews.length === 0 ? (
        <p className="text-muted">You haven’t posted any reviews yet.</p>
      ) : (
        <div className="list-group mb-5">
          {myReviews.map((r) => (
            <div key={r.id} className="list-group-item mb-2">
              <h5 className="mb-1">{r.title}</h5>
              <div className="text-muted">
                {r.artist}
                {r.album ? ` • ${r.album}` : ''}
              </div>
              <p className="mb-1">{r.content}</p>
              <small className="text-muted">
                ⭐ {r.rating}/5
                {r.created_at ? ` • ${new Date(r.created_at).toLocaleDateString()}` : ''}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
