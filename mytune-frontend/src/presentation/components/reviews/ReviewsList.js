import React, { useEffect, useMemo, useState } from 'react';
import { container } from '../../../app/di/container';
import { listReviews } from '../../../application/usecases/reviews/listReviews';
import { deleteReview } from '../../../application/usecases/reviews/deleteReview';
import { getMe } from '../../../application/usecases/profile/getMe';

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [search, setSearch] = useState('');
  const [artistFilter, setArtistFilter] = useState('all');
  const [albumFilter, setAlbumFilter] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const listReviewsUC = useMemo(
    () => listReviews({ reviewsGateway: container.reviewsGateway }),
    [],
  );
  const deleteReviewUC = useMemo(
    () => deleteReview({ reviewsGateway: container.reviewsGateway }),
    [],
  );
  const getMeUC = useMemo(() => getMe({ profileGateway: container.profileGateway }), []);

  useEffect(() => {
    (async () => {
      try {
        const reviewsData = await listReviewsUC();
        setReviews(reviewsData);

        // Admin check (optional; ignore if not logged in)
        try {
          const me = await getMeUC();
          setIsAdmin(me.is_admin === true);
        } catch {
          setIsAdmin(false);
        }
      } catch (e) {
        setError(e.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    })();
  }, [listReviewsUC, getMeUC]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReviewUC(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete review');
    }
  };

  const artists = useMemo(() => {
    const set = new Set(reviews.map((r) => r.artist).filter(Boolean));
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [reviews]);

  const albums = useMemo(() => {
    const set = new Set(reviews.map((r) => r.album).filter(Boolean));
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minRating === 'all' ? null : Number(minRating);

    let list = reviews.filter((r) => {
      if (artistFilter !== 'all' && r.artist !== artistFilter) return false;
      if (albumFilter !== 'all') {
        const albumValue = r.album || '';
        if (albumValue !== albumFilter) return false;
      }
      if (min !== null && Number(r.rating) < min) return false;

      if (!q) return true;
      const haystack = [r.title, r.content, r.user, r.artist, r.album]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    list.sort((a, b) => {
      if (sortBy === 'rating_desc') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === 'rating_asc') return (Number(a.rating) || 0) - (Number(b.rating) || 0);

      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === 'oldest') return aDate - bDate;
      return bDate - aDate;
    });

    return list;
  }, [reviews, search, artistFilter, albumFilter, minRating, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setArtistFilter('all');
    setAlbumFilter('all');
    setMinRating('all');
    setSortBy('newest');
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error: {error}</p>;

  // IDs for accessibility (label -> control)
  const searchId = 'reviews-search';
  const artistId = 'reviews-artist-filter';
  const albumId = 'reviews-album-filter';
  const ratingId = 'reviews-min-rating';
  const sortId = 'reviews-sort-by';

  return (
    <div className="container mt-5">
      <h2 className="mb-3">All Reviews</h2>

      {/* Filters UI */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor={searchId}>
                Search
              </label>
              <input
                id={searchId}
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label" htmlFor={artistId}>
                Artist
              </label>
              <select
                id={artistId}
                className="form-select"
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
              >
                {artists.map((a) => (
                  <option key={a} value={a}>
                    {a === 'all' ? 'All artists' : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label" htmlFor={albumId}>
                Album
              </label>
              <select
                id={albumId}
                className="form-select"
                value={albumFilter}
                onChange={(e) => setAlbumFilter(e.target.value)}
              >
                {albums.map((a) => (
                  <option key={a} value={a}>
                    {a === 'all' ? 'All albums' : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label" htmlFor={ratingId}>
                Min rating
              </label>
              <select
                id={ratingId}
                className="form-select"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="all">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label" htmlFor={sortId}>
                Sort
              </label>
              <select
                id={sortId}
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating_desc">Rating (high → low)</option>
                <option value="rating_asc">Rating (low → high)</option>
              </select>
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing <strong>{filteredReviews.length}</strong> of{' '}
                <strong>{reviews.length}</strong>
              </small>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <p>No reviews match your filters.</p>
      ) : (
        <div className="list-group">
          {filteredReviews.map((review) => (
            <div key={review.id} className="list-group-item mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>{review.title}</h5>
                  <h6 className="text-muted">
                    {review.artist}
                    {review.album && (
                      <>
                        {' '}
                        <span className="fw-normal">—</span>{' '}
                        <span className="fw-semibold">{review.album}</span>
                      </>
                    )}
                  </h6>
                  <p>{review.content}</p>
                  <small className="text-muted">
                    By <strong>{review.user}</strong> • Rating {review.rating}/5
                    {review.created_at && <> • {new Date(review.created_at).toLocaleString()}</>}
                  </small>
                </div>

                {isAdmin && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(review.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsList;
