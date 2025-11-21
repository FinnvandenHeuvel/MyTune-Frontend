import { useState, useContext } from "react";
import { loginUser } from "../Services/auth";
import { AuthContext } from "../AuthContext";

export default function Login({ setPage }) {
    const { setIsAuthenticated } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await loginUser(formData);

        if (data.access) {
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            setIsAuthenticated(true);
            setPage("submit");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
            />

            <button type="submit">Login</button>
        </form>
    );
}
