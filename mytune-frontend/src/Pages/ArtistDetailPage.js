import React, { useState, useEffect } from "react";
import { getArtist, getArtistAlbums } from "../Services/spotifyService";

function ArtistDetailPage({ artistId, onBack }) {
    const [artist, setArtist] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        title: "",
        content: "",
        rating: 5,
    });

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const artistData = await getArtist(artistId);
                setArtist(artistData);

                const albumsData = await getArtistAlbums(artistId);
                setAlbums(albumsData);

                // Fetch reviews only for this artist using artist_id
                const reviewsResponse = await fetch(
                    `${API_URL}/reviews/?artist_id=${artistId}`
                );
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData);
                }

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [artistId, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "rating" ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!artist) return;

        const payload = {
            ...formData,
            artist: artist.name,
            artist_id: artistId,
            album: selectedAlbum ? selectedAlbum.name : null,
            album_id: selectedAlbum ? selectedAlbum.id : null,
        };

        try {
            const response = await fetch(`${API_URL}/reviews/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to submit review");

            const data = await response.json();
            setMessage("Review submitted successfully!");
            setFormData({ name: "", title: "", content: "", rating: 5 });
            setReviews([data, ...reviews]);
            setSelectedAlbum(null);
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Error: " + err.message);
        }
    };

    if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
    if (error) return <div className="container mt-5"><p>Error: {error}</p></div>;
    if (!artist) return <div className="container mt-5"><p>Artist not found</p></div>;

    return (
        <div className="container mt-5">
            {/* Back button */}
            <button className="btn btn-secondary mb-3" onClick={onBack}>
                ← Back to Search
            </button>

            {/* Artist Header */}
            <div className="row mb-4">
                <div className="col-md-3">
                    {artist.images && artist.images[0] && (
                        <img src={artist.images[0].url} alt={artist.name} className="img-fluid rounded"/>
                    )}
                </div>
                <div className="col-md-9">
                    <h1>{artist.name}</h1>
                    <p className="text-muted">
                        <strong>Followers:</strong> {artist.followers?.total.toLocaleString()}
                    </p>
                    <p>
                        <strong>Genres:</strong> {artist.genres?.join(", ") || "N/A"}
                    </p>
                    <a href={artist.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                        Open in Spotify
                    </a>
                </div>
            </div>

            {/* Albums Section */}
            <div className="mb-5">
                <h2>Albums & Singles</h2>
                <div className="row">
                    {albums.map((album) => (
                        <div key={album.id} className="col-md-3 mb-3">
                            <div className="card h-100 d-flex flex-column">
                                {album.images && album.images[0] && (
                                    <img src={album.images[0].url} className="card-img-top" alt={album.name}/>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h6 className="card-title">{album.name}</h6>
                                    <p className="card-text">
                                        <small className="text-muted">{new Date(album.release_date).getFullYear()}</small>
                                    </p>
                                    <a href={album.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mb-2">
                                        Listen
                                    </a>
                                    <button type="button" className="btn btn-sm btn-primary mt-auto" onClick={() => setSelectedAlbum(album)}>
                                        Write a Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Review Form */}
            <div className="mb-5">
                <h2>{selectedAlbum ? `Submit Review for ${selectedAlbum.name}` : `Submit Review for ${artist.name}`}</h2>
                {message && (
                    <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="card p-4">
                    {selectedAlbum && (
                        <div className="mb-3">
                            <label className="form-label fw-bold">Reviewing Album: {selectedAlbum.name}</label>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">Your Name</label>
                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Review Title</label>
                        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="e.g., Amazing album!" required/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Review</label>
                        <textarea name="content" className="form-control" rows="4" value={formData.content} onChange={handleChange} placeholder="Share your thoughts..." required></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Rating</label>
                        <select name="rating" className="form-select" value={formData.rating} onChange={handleChange}>
                            {[1,2,3,4,5].map(r => (
                                <option key={r} value={r}>{r} {r === 1 ? "Star" : "Stars"}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
            </div>

            {/* Reviews List */}
            <div className="mb-5">
                <h2>Reviews for {artist.name}</h2>
                {reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="list-group">
                        {reviews.map(review => (
                            <div key={review.id} className="list-group-item mb-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5>{review.title}</h5>
                                        <p className="mb-1">{review.content}</p>
                                        <small className="text-muted">
                                            By {review.name} | Rating: {review.rating}/5
                                            {review.album && <> | Album: {review.album}</>}
                                            {review.created_at && <> | {new Date(review.created_at).toLocaleDateString()}</>}
                                        </small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">{review.rating} ⭐</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ArtistDetailPage;
