import React, { useMemo, useState, useContext } from 'react';
import { AuthContext } from '../../../app/providers/AuthProvider';
import { container } from '../../../app/di/container';
import { createReview } from '../../../application/usecases/reviews/createReview';

function SubmitReview() {
  const { isAuthenticated } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    content: '',
    rating: 5,
  });

  const [message, setMessage] = useState('');

  const createReviewUC = useMemo(
    () => createReview({ reviewsGateway: container.reviewsGateway }),
    [],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isAuthenticated) {
      setMessage('You must be logged in to submit a review.');
      return;
    }

    try {
      await createReviewUC({
        title: formData.title,
        artist: formData.artist,
        content: formData.content,
        rating: formData.rating,
      });

      setMessage('Review submitted successfully!');
      setFormData({ title: '', artist: '', content: '', rating: 5 });
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Failed to submit review'));
    }
  };

  const titleId = 'review-title';
  const artistId = 'review-artist';
  const contentId = 'review-content';
  const ratingId = 'review-rating';

  return (
    <div className="container mt-5">
      <h2>Submit a Review</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor={titleId}>
            Title
          </label>
          <input
            id={titleId}
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor={artistId}>
            Artist
          </label>
          <input
            id={artistId}
            name="artist"
            className="form-control"
            value={formData.artist}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor={contentId}>
            Content
          </label>
          <textarea
            id={contentId}
            name="content"
            className="form-control"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor={ratingId}>
            Rating
          </label>
          <select
            id={ratingId}
            name="rating"
            className="form-select"
            value={formData.rating}
            onChange={handleChange}
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default SubmitReview;
