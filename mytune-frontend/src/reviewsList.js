import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "./Services/authFetch";

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Filters UI state
  const [search, setSearch] = useState("");
  const [artistFilter, setArtistFilter] = useState("all");
  const [albumFilter, setAlbumFilter] = useState("all");
  const [minRating, setMinRating] = useState("all"); // keep as string for <select>
  const [sortBy, setSortBy] = useState("newest");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  // Fetch reviews + user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reviews (public)
        const reviewsRes = await fetch(`${API_URL}/reviews/`);
        if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);

        // Fetch user info (auth required)
        const meRes = await authFetch("/me/");
        if (meRes.ok) {
          const meData = await meRes.json();
          setIsAdmin(meData.is_admin === true);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    const res = await authFetch(`/reviews/${id}/`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Failed to delete review");
    }
  };

  // ✅ Build dropdown options from data
  const artists = useMemo(() => {
    const set = new Set(reviews.map((r) => r.artist).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [reviews]);

  const albums = useMemo(() => {
    const set = new Set(reviews.map((r) => r.album).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [reviews]);

  // ✅ Filter + sort derived list (no mutation)
  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minRating === "all" ? null : Number(minRating);

    let list = reviews.filter((r) => {
      // Artist filter
      if (artistFilter !== "all" && r.artist !== artistFilter) return false;

      // Album filter
      // note: treat empty/undefined album as "no album"
      if (albumFilter !== "all") {
        const albumValue = r.album || "";
        if (albumValue !== albumFilter) return false;
      }

      // Min rating
      if (min !== null && Number(r.rating) < min) return false;

      // Search
      if (!q) return true;
      const haystack = [
        r.title,
        r.content,
        r.user,
        r.artist,
        r.album,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === "rating_desc") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === "rating_asc") return (Number(a.rating) || 0) - (Number(b.rating) || 0);

      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (sortBy === "oldest") return aDate - bDate;
      // default newest
      return bDate - aDate;
    });

    return list;
  }, [reviews, search, artistFilter, albumFilter, minRating, sortBy]);

  // ✅ Reset helper
  const clearFilters = () => {
    setSearch("");
    setArtistFilter("all");
    setAlbumFilter("all");
    setMinRating("all");
    setSortBy("newest");
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-3">All Reviews</h2>

      {/* ✅ Filters UI */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, content, user, artist, album..."
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Artist</label>
              <select
                className="form-select"
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
              >
                {artists.map((a) => (
                  <option key={a} value={a}>
                    {a === "all" ? "All artists" : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Album</label>
              <select
                className="form-select"
                value={albumFilter}
                onChange={(e) => setAlbumFilter(e.target.value)}
              >
                {/* If you want an explicit "No album" option, tell me and I’ll add it */}
                {albums.map((a) => (
                  <option key={a} value={a}>
                    {a === "all" ? "All albums" : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Min rating</label>
              <select
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
              <label className="form-label">Sort</label>
              <select
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
                Showing <strong>{filteredReviews.length}</strong> of{" "}
                <strong>{reviews.length}</strong>
              </small>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Results */}
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
                        {" "}
                        <span className="fw-normal">—</span>{" "}
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
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(review.id)}
                  >
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
