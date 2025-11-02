import React, { useState } from "react";

function SubmitReview() {
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        content: "",
        rating: 5,
    });

    const [message, setMessage] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "rating" ? parseInt(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
        };

        fetch(`${API_URL}/reviews/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to submit review");
                return res.json();
            })
            .then((data) => {
                setMessage("Review submitted successfully!");
                setFormData({
                    name: "",
                    title: "",
                    content: "",
                    rating: 5,
                });
                console.log("Response:", data);
            })
            .catch((err) => {
                setMessage("Error: " + err.message);
            });
    };

    return (
        <div className="container mt-5">
            <h2>Submit a Review</h2>
            {message && <div className="alert alert-info">{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>



                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
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
                        type="text"
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
                    ></textarea>
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
