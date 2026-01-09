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

  return (
    <div className="container mt-5">
      <h2>Submit a Review</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Artist</label>
          <input
            name="artist"
            className="form-control"
            value={formData.artist}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            className="form-control"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Rating</label>
          <select
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
