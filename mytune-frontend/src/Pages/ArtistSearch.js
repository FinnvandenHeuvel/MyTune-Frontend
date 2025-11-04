import React, { useState } from "react";
import { searchArtist, getArtist, getArtistTopTracks } from "../Services/spotifyService";

function ArtistSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [artists, setArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError("");

        searchArtist(searchTerm)
            .then((data) => {
                setArtists(data);
                setSelectedArtist(null);
                setTopTracks([]);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    const handleSelectArtist = (artistId) => {
        setLoading(true);
        setError("");

        Promise.all([
            getArtist(artistId),
            getArtistTopTracks(artistId)
        ])
            .then(([artist, tracks]) => {
                setSelectedArtist(artist);
                setTopTracks(tracks);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    if (loading) return <p className="container mt-5">Loading...</p>;
    if (error) return <p className="container mt-5">Error: {error}</p>;

    return (
        <div className="container mt-5">
            <h1>Spotify Artist Search</h1>

            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for an artist..."
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {artists.length > 0 && !selectedArtist && (
                <div>
                    <h2>Search Results:</h2>
                    <div className="list-group">
                        {artists.map((artist) => (
                            <div
                                key={artist.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handleSelectArtist(artist.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="d-flex align-items-center">
                                    {artist.images[0] && (
                                        <img
                                            src={artist.images[0].url}
                                            alt={artist.name}
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                borderRadius: "50%",
                                                marginRight: "15px"
                                            }}
                                        />
                                    )}
                                    <div>
                                        <h5 className="mb-1">{artist.name}</h5>
                                        <p className="mb-0 text-muted">
                                            Followers: {artist.followers?.total.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Artist Details */}
            {selectedArtist && (
                <div>
                    <button
                        onClick={() => setSelectedArtist(null)}
                        className="btn btn-secondary mb-4"
                    >
                        ← Back to Results
                    </button>

                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    {selectedArtist.images[0] && (
                                        <img
                                            src={selectedArtist.images[0].url}
                                            alt={selectedArtist.name}
                                            className="img-fluid rounded-circle"
                                        />
                                    )}
                                </div>
                                <div className="col-md-9">
                                    <h2>{selectedArtist.name}</h2>
                                    <p>
                                        <strong>Followers:</strong>{" "}
                                        {selectedArtist.followers?.total.toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Popularity:</strong> {selectedArtist.popularity}/100
                                    </p>
                                    <p>
                                        <strong>Genres:</strong>{" "}
                                        {selectedArtist.genres.join(", ") || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Top Tracks</h3>
                    <div className="list-group">
                        {topTracks.map((track, index) => (
                            <div key={track.id} className="list-group-item">
                                <div className="d-flex align-items-center">
                                    <span className="me-3 fw-bold">{index + 1}.</span>
                                    {track.album.images[0] && (
                                        <img
                                            src={track.album.images[0].url}
                                            alt={track.album.name}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                marginRight: "15px"
                                            }}
                                        />
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="mb-0">{track.name}</h6>
                                        <small className="text-muted">{track.album.name}</small>
                                    </div>
                                </div>
                                {track.preview_url && (
                                    <audio controls src={track.preview_url} className="mt-2 w-100" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/*{artists.length === 0 && !selectedArtist && searchTerm && !loading && (*/}
            {/*    <p>No artists found. Try a different search term.</p>*/}
            {/*)}*/}
        </div>
    );
}

export default ArtistSearch;