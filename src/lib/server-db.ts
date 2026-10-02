const supabaseUrl = () => String(process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const serviceKey = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");
const publishableKey = () => String(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");

export function assertServerEnv() {
  if (!supabaseUrl() || !serviceKey()) throw new Error("Server Supabase environment variables are missing.");
  return { url: supabaseUrl(), serviceKey: serviceKey() };
}

export async function supabaseAdmin(path: string, init: RequestInit = {}) {
  const { url, serviceKey: key } = assertServerEnv();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${url}${path}`, { ...init, headers });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.msg || body?.message || body?.error_description || `Supabase error ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export async function verifyAccessToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: { apikey: publishableKey() || serviceKey(), Authorization: `Bearer ${token}` },
  });
  const user = await response.json().catch(() => null);
  if (!response.ok || !user?.id) throw new Response("Unauthorized", { status: 401 });
  return { token, user };
}

export async function requireAdmin(request: Request) {
  const { user } = await verifyAccessToken(request);
  const configuredAdmin = String(process.env.ELINOCHAT_ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (configuredAdmin && String(user.email ?? "").toLowerCase() === configuredAdmin) return user;
  const rows = await supabaseAdmin(`/rest/v1/elinochat_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!rows?.[0]) throw new Response("Forbidden", { status: 403 });
  return user;
}
