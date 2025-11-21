import React, { useState } from "react";
import { AuthProvider } from "./AuthContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import SubmitReview from "./SubmitReview";
import ReviewsList from "./reviewsList";
import ArtistSearch from './Pages/ArtistSearch';
import ArtistDetailPage from './Pages/ArtistDetailPage';

function App() {
    const [page, setPage] = useState("submit");
    const [selectedArtistId, setSelectedArtistId] = useState(null);

    const handleArtistSelect = (artistId) => {
        setSelectedArtistId(artistId);
        setPage("artistDetail");
    };

    const handleBackToSearch = () => {
        setSelectedArtistId(null);
        setPage("search");
    };

    return (
        <AuthProvider>
            <div className="container mt-4">
                <nav className="mb-4 d-flex gap-2">
                    <button
                        className={`btn ${page === "submit" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setPage("submit")}
                    >
                        Submit Review
                    </button>

                    <button
                        className={`btn ${page === "reviews" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setPage("reviews")}
                    >
                        All Reviews
                    </button>

                    <button
                        className={`btn ${page === "search" || page === "artistDetail" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setPage("search")}
                    >
                        Search Artists
                    </button>

                    <button
                        className={`btn ${page === "login" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setPage("login")}
                    >
                        Login
                    </button>

                    <button
                        className={`btn ${page === "register" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setPage("register")}
                    >
                        Register
                    </button>
                </nav>


                {/* Render pages */}
                {page === "submit" && <SubmitReview />}
                {page === "reviews" && <ReviewsList />}
                {page === "search" && <ArtistSearch onArtistSelect={handleArtistSelect} />}
                {page === "artistDetail" && selectedArtistId && (
                    <ArtistDetailPage
                        artistId={selectedArtistId}
                        onBack={handleBackToSearch}
                    />
                )}
                {page === "login" && <Login setPage={setPage} />}
                {page === "register" && <Register setPage={setPage} />}
            </div>
        </AuthProvider>
    );
}

export default App;
