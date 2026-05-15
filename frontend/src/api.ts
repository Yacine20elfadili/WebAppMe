// const API = "http://localhost:3001";

interface User {
  id: number;
  username: string;
  created: string;
}

interface AuthResponse {
  message: string;
  user?: User;
  error?: string;
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}