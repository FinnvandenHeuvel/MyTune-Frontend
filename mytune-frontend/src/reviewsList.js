import React, { useEffect, useState } from "react";

function ReviewsList() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    useEffect(() => {
        fetch(`${API_URL}/reviews/`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch reviews");
                return res.json();
            })
            .then((data) => {
                setReviews(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [API_URL]);

    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p>Error: {error}</p>;
    if (reviews.length === 0) return <p>No reviews found.</p>;

    return (
        <div className="container mt-5">
            <h2>All Reviews</h2>
            <div className="list-group">
                {reviews.map((review) => (
                    <div key={review.id} className="list-group-item mb-3">
                        <h5>{review.title}</h5>
                        <p>{review.content}</p>
                        <p>
                            <strong>By:</strong> {review.name} | <strong>Rating:</strong> {review.rating}
                        </p>
                        {review.created_at && (
                            <small className="text-muted">
                                {new Date(review.created_at).toLocaleString()}
                            </small>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReviewsList;
