import React, { useState } from "react";
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
        <div className="container mt-4">
            <nav className="mb-4">
                <button
                    className={`btn ${page === "submit" ? "btn-primary" : "btn-secondary"} me-2`}
                    onClick={() => setPage("submit")}
                >
                    Submit Review
                </button>
                <button
                    className={`btn ${page === "reviews" ? "btn-primary" : "btn-secondary"} me-2`}
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
            </nav>

            {page === "submit" && <SubmitReview />}
            {page === "reviews" && <ReviewsList />}
            {page === "search" && <ArtistSearch onArtistSelect={handleArtistSelect} />}
            {page === "artistDetail" && selectedArtistId && (
                <ArtistDetailPage
                    artistId={selectedArtistId}
                    onBack={handleBackToSearch}
                />
            )}
        </div>
    );
}

export default App;