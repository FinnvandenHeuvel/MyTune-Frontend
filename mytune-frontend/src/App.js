import React, { useState } from "react";
import SubmitReview from "./SubmitReview";
import ReviewsList from "./reviewsList";
import ArtistSearch from './Pages/ArtistSearch';

function App() {
    const [page, setPage] = useState("submit"); // "submit" or "reviews"d

    return (
        <div className="container mt-4">
            <nav className="mb-4">
                <button
                    className="btn btn-primary me-2"
                    onClick={() => setPage("submit")}
                >
                    Submit Review
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => setPage("reviews")}
                >
                    All Reviews
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => setPage("search")}
                >
                    Search
                </button>
            </nav>

            {page === "submit" && <SubmitReview />}
            {page === "reviews" && <ReviewsList />}
            {page === "search" && <ArtistSearch />}
        </div>
    );
}

export default App;
