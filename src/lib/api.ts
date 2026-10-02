export type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type?: string;
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> };
};

const STORAGE_KEY = "elinochat_session";

export function getSupabaseConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
  const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
  if (!url || !key) throw new Error("Supabase haijawekwa. Weka VITE_SUPABASE_URL na VITE_SUPABASE_PUBLISHABLE_KEY.");
  return { url, key };
}

export function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function supabaseFetch(path: string, init: RequestInit = {}, token?: string) {
  const { url, key } = getSupabaseConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token ?? key}`);
  const response = await fetch(`${url}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Supabase error ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

export async function login(email: string, password: string): Promise<Session> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.msg || data?.error_description || data?.message || "Email au password si sahihi.");
  saveSession(data as Session);
  return data as Session;
}

export async function register(payload: Record<string, string>): Promise<Session> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Imeshindikana kujisajili.");
  saveSession(data.session as Session);
  return data.session as Session;
}

export async function logout() {
  const session = getSession();
  if (session) {
    try {
      await supabaseFetch("/auth/v1/logout", { method: "POST" }, session.access_token);
    } catch {
      // Local logout still succeeds when the remote session is already expired.
    }
  }
  clearSession();
}

export async function getProfile() {
  const session = getSession();
  if (!session) return null;
  const rows = await supabaseFetch(
    `/rest/v1/elinochat_profiles?select=*&id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
    {},
    session.access_token,
  );
  return rows?.[0] ?? null;
}

export async function getNotifications() {
  const session = getSession();
  if (!session) return [];
  return supabaseFetch(
    `/rest/v1/elinochat_notifications?select=*&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc&limit=30`,
    {},
    session.access_token,
  );
}
