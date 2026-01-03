const API = "http://localhost:5000/api/auth";

export async function registerCandidate(data) {
  return fetch(`${API}/register/candidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export async function registerHR(formData) {
  return fetch(`${API}/register/hr`, {
    method: "POST",
    body: formData
  }).then(res => res.json());
}

export async function loginUser(data) {
  return fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
}
