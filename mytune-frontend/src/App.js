import React, { useState } from "react";
import SubmitReview from "./SubmitReview";
import ReviewsList from "./reviewsList";

function App() {
    const [page, setPage] = useState("submit"); // "submit" or "reviews"

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
            </nav>

            {page === "submit" && <SubmitReview />}
            {page === "reviews" && <ReviewsList />}
        </div>
    );
}

export default App;
