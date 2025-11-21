import { useState } from "react";
import { registerUser } from "../Services/auth";

export default function Register({ setPage }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await registerUser(formData);

        if (data.message) {
            alert("Registration successful! Please log in.");
            setPage("login");
        } else {
            setError(JSON.stringify(data));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <input type="text" placeholder="Username" required
                   onChange={(e)=>setFormData({...formData, username:e.target.value})}
            />
            <input type="email" placeholder="Email" required
                   onChange={(e)=>setFormData({...formData, email:e.target.value})}
            />
            <input type="password" placeholder="Password" required
                   onChange={(e)=>setFormData({...formData, password:e.target.value})}
            />
            <input type="password" placeholder="Confirm Password" required
                   onChange={(e)=>setFormData({...formData, password2:e.target.value})}
            />

            <button type="submit">Register</button>
        </form>
    );
}
