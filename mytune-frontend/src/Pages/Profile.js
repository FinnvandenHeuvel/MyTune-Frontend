import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { authFetch } from "../Services/authFetch";

export default function Profile({ setPage }) {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

    const [me, setMe] = useState(null);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        (async () => {
            setLoading(true);
            setError("");

            const meRes = await authFetch("/me/", { method: "GET" });
            if (!meRes.ok) {
                setError("Could not load profile. Please log in again.");
                setLoading(false);
                return;
            }
            const meData = await meRes.json();
            setMe(meData);

            const rRes = await authFetch("/my-reviews/", { method: "GET" });
            if (!rRes.ok) {
                setError("Could not load your reviews.");
                setLoading(false);
                return;
            }
            const reviewsData = await rRes.json();
            setMyReviews(reviewsData);

            setLoading(false);
        })();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    You must be logged in to view your profile.
                </div>
                <button className="btn btn-primary" onClick={() => setPage?.("login")}>
                    Go to Login
                </button>
            </div>
        );
    }

    if (loading) return <div className="container mt-4"><p>Loading profile…</p></div>;
    if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Profile</h2>
            </div>

            <div className="card p-3 mb-4">
                <div><strong>Username:</strong> {me?.username}</div>
                <div><strong>Email:</strong> {me?.email}</div>
                <div>
                    <strong>Joined:</strong>{" "}
                    {me?.date_joined ? new Date(me.date_joined).toLocaleDateString() : "—"}
                </div>
            </div>

            <h3 className="mb-3">My Reviews</h3>

            {myReviews.length === 0 ? (
                <p className="text-muted">You haven’t posted any reviews yet.</p>
            ) : (
                <div className="list-group mb-5">
                    {myReviews.map((r) => (
                        <div key={r.id} className="list-group-item mb-2">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="mb-1">{r.title}</h5>
                                    <div className="text-muted">
                                        {r.artist}
                                        {r.album ? ` • ${r.album}` : ""}
                                    </div>
                                    <p className="mb-1">{r.content}</p>
                                    <small className="text-muted">
                                        ⭐ {r.rating}/5
                                        {r.created_at ? ` • ${new Date(r.created_at).toLocaleDateString()}` : ""}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
