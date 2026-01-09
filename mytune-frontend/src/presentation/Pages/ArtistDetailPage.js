import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../../app/providers/AuthProvider';
import { container } from '../../app/di/container';
import { getArtist } from '../../application/usecases/spotify/getArtist';
import { getArtistAlbums } from '../../application/usecases/spotify/getArtistAlbums';
import { listReviews } from '../../application/usecases/reviews/listReviews';
import { createReview } from '../../application/usecases/reviews/createReview';

function ArtistDetailPage({ artistId, onBack }) {
  const { isAuthenticated } = useContext(AuthContext);

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
  });

  const getArtistUC = useMemo(() => getArtist({ spotifyGateway: container.spotifyGateway }), []);
  const getAlbumsUC = useMemo(
    () => getArtistAlbums({ spotifyGateway: container.spotifyGateway }),
    [],
  );
  const listReviewsUC = useMemo(
    () => listReviews({ reviewsGateway: container.reviewsGateway }),
    [],
  );
  const createReviewUC = useMemo(
    () => createReview({ reviewsGateway: container.reviewsGateway }),
    [],
  );

  const refreshReviews = useCallback(async () => {
    const data = await listReviewsUC({ artist_id: artistId });
    setReviews(data);
  }, [artistId, listReviewsUC]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');

        const artistData = await getArtistUC(artistId);
        setArtist(artistData);

        const albumsData = await getAlbumsUC(artistId);
        setAlbums(albumsData);

        await refreshReviews();
      } catch (error_) {
        setError(error_?.message || 'Failed to load artist');
      } finally {
        setLoading(false);
      }
    })();
  }, [artistId, getArtistUC, getAlbumsUC, refreshReviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isAuthenticated) {
      setMessage('You must be logged in to submit a review.');
      return;
    }
    if (!artist) return;

    const payload = {
      title: formData.title,
      content: formData.content,
      rating: formData.rating,
      artist: artist.name,
      artist_id: artist.id,
      album: selectedAlbum?.name || null,
      album_id: selectedAlbum?.id || null,
    };

    try {
      await createReviewUC(payload);
      setMessage('Review submitted successfully!');
      setFormData({ title: '', content: '', rating: 5 });
      setSelectedAlbum(null);
      await refreshReviews();
      setTimeout(() => setMessage(''), 2000);
    } catch (error_) {
      setMessage(`Error: ${error_?.message || 'Failed to submit review'}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!artist) return <p>Artist not found</p>;

  return (
    <div className="container mt-5">
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        ← Back to Search
      </button>

      <div className="row mb-4">
        <div className="col-md-3">
          {artist.images?.[0]?.url && (
            <img src={artist.images[0].url} alt={artist.name} className="img-fluid rounded" />
          )}
        </div>
        <div className="col-md-9">
          <h1>{artist.name}</h1>
          <p className="text-muted">
            <strong>Followers:</strong> {artist.followers?.total?.toLocaleString()}
          </p>
          <p>
            <strong>Genres:</strong> {artist.genres?.join(', ') || 'N/A'}
          </p>
          <a
            href={artist.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
          >
            Open in Spotify
          </a>
        </div>
      </div>

      <h2>Albums & Singles</h2>
      <div className="row mb-5">
        {albums.map((album) => (
          <div key={album.id} className="col-md-3 mb-3">
            <div className="card h-100 d-flex flex-column">
              {album.images?.[0]?.url && (
                <img src={album.images[0].url} className="card-img-top" alt={album.name} />
              )}
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{album.name}</h6>
                <small className="text-muted">
                  {album.release_date ? new Date(album.release_date).getFullYear() : ''}
                </small>
                <button
                  type="button"
                  className="btn btn-sm btn-primary mt-auto"
                  onClick={() => setSelectedAlbum(album)}
                >
                  Write Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <h2>{selectedAlbum ? `Review: ${selectedAlbum.name}` : `Review: ${artist.name}`}</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="card p-4">
            {selectedAlbum && (
              <div className="mb-3">
                <label className="fw-bold">Album: {selectedAlbum.name}</label>
              </div>
            )}

            <input
              type="text"
              name="title"
              className="form-control mb-3"
              placeholder="Review Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="content"
              className="form-control mb-3"
              rows="4"
              placeholder="Share your thoughts..."
              value={formData.content}
              onChange={handleChange}
              required
            />

            <select
              name="rating"
              className="form-select mb-3"
              value={formData.rating}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>

            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </form>
        ) : (
          <div className="alert alert-warning">You must be logged in to submit a review.</div>
        )}
      </div>

      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="list-group mb-5">
          {reviews.map((review) => (
            <div key={review.id} className="list-group-item mb-3">
              <h5>{review.title}</h5>
              <p className="mb-1">{review.content}</p>
              <small className="text-muted">
                ⭐ {review.rating}/5 — By <strong>{review.user}</strong>
                {review.album && (
                  <>
                    {' '}
                    | Album: <strong>{review.album}</strong>
                  </>
                )}
                {review.created_at && <> | {new Date(review.created_at).toLocaleDateString()}</>}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ArtistDetailPage.propTypes = {
  artistId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ArtistDetailPage;
