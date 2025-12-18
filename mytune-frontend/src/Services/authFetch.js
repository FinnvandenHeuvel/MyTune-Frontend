const API_URL = "http://localhost:8000/api";

export async function authFetch(path, options = {}) {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (!access) {
        return new Response(JSON.stringify({ detail: "Not logged in" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
    };

    let res = await fetch(`${API_URL}${path}`, { ...options, headers });

    // Access expired → refresh and retry once
    if (res.status === 401 && refresh) {
        const refreshRes = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("access", data.access);

            const retryHeaders = { ...headers, Authorization: `Bearer ${data.access}` };
            res = await fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders });
        }
    }

    return res;
}
