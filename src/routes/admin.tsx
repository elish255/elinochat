import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Ban, Bell, CheckCircle2, LockKeyhole, LogOut, RefreshCw, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getSession, logout, saveSession } from "@/lib/api";

export const Route = createFileRoute("/admin")({ component: AdminPage });

async function adminRequest(path: string, options: RequestInit = {}) {
  const session = getSession();
  if (!session) throw new Error("LOGIN_REQUIRED");
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(options.headers ?? {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || (response.status === 403 ? "Huna ruhusa ya admin." : "Request imeshindikana."));
  return data;
}

function AdminPage() {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState(!getSession());
  const [identifier, setIdentifier] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>({ users: [], payments: [], notifications: [] }); const [query, setQuery] = useState(""); const [noticeUser, setNoticeUser] = useState<any>(null); const [title, setTitle] = useState("Taarifa kutoka ElinoChat"); const [message, setMessage] = useState("");

  const load = async () => { setBusy(true); setError(""); try { setData(await adminRequest("/api/admin/users")); setLoginMode(false); } catch (e) { const msg = e instanceof Error ? e.message : ""; if (msg === "LOGIN_REQUIRED" || msg === "Huna ruhusa ya admin.") setLoginMode(true); else setError(msg); } finally { setBusy(false); } };
  useEffect(() => { if (!loginMode) load(); }, []);
  const adminLogin = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) }); const d = await response.json(); if (!response.ok) throw new Error(d?.message || "Login imeshindikana."); saveSession(d.session); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Login imeshindikana."); } finally { setBusy(false); } };
  const action = async (userId: string, status: string) => { await adminRequest("/api/admin/action", { method: "POST", body: JSON.stringify({ action: "status", userId, status }) }); await load(); };
  const sendNotice = async () => { if (!message.trim()) return; await adminRequest("/api/admin/action", { method: "POST", body: JSON.stringify({ action: noticeUser ? "notify" : "broadcast", userId: noticeUser?.id, title, message }) }); setMessage(""); setNoticeUser(null); await load(); };
  const filtered = data.users.filter((u: any) => `${u.full_name} ${u.username} ${u.email} ${u.phone}`.toLowerCase().includes(query.toLowerCase()));

  if (loginMode) return <div className="admin-login"><form onSubmit={adminLogin} className="admin-login-card"><ShieldCheck /><h1>ElinoChat Admin</h1><p>Ingia kwa admin account yako.</p><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Admin email / username" required/><div className="admin-password"><LockKeyhole/><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/></div>{error && <div className="form-error">{error}</div>}<button disabled={busy}>{busy ? "INAINGIA..." : "ADMIN LOGIN"}</button><Link to="/">← Rudi website</Link></form></div>;

  return <div className="admin-page"><header className="admin-header"><div><ShieldCheck/><span><b>ElinoChat Admin</b><small>Users • Payments • Notifications</small></span></div><div><button onClick={load}><RefreshCw/> Refresh</button><button onClick={async () => { await logout(); navigate({ to: "/admin" }); }}><LogOut/> Logout</button></div></header><main className="admin-shell">
    {error && <div className="form-error">{error}</div>}
    <div className="admin-stats"><div><span>Users</span><b>{data.users.length}</b></div><div><span>Active</span><b>{data.users.filter((u:any)=>u.account_status === "active").length}</b></div><div><span>Paid / successful</span><b>{data.payments.filter((p:any)=>p.status === "success").length}</b></div><div><span>Banned</span><b>{data.users.filter((u:any)=>u.account_status === "banned").length}</b></div></div>
    <section className="admin-panel"><div className="admin-panel-head"><h2>Users</h2><div className="admin-search"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name, username, email..."/></div></div><div className="admin-users">{filtered.map((u:any) => { const payment = data.payments.find((p:any)=>p.user_id === u.id); return <article className="admin-user" key={u.id}><div className="admin-user-main"><div className="admin-avatar">{u.full_name?.slice(0,1)?.toUpperCase()}</div><div><h3>{u.full_name}</h3><p>@{u.username} • {u.email}</p><small>{u.phone} • {u.country}</small></div></div><div className="admin-user-meta"><span className={`status-badge ${u.account_status}`}>{u.account_status}</span>{payment && <small>Payment: {payment.status}{payment.amount ? ` • TSh ${Number(payment.amount).toLocaleString()}` : ""}</small>}</div><div className="admin-actions"><button onClick={()=>action(u.id,"active")}><UserCheck/>Activate</button><button onClick={()=>action(u.id,"inactive")}><UserX/>Deactivate</button><button onClick={()=>action(u.id,"banned")}><Ban/>Ban</button><button onClick={()=>action(u.id,"active")}><CheckCircle2/>Unban</button><button className="notify-btn" onClick={()=>setNoticeUser(u)}><Bell/>Notify</button></div></article>})}</div></section>
    <section className="admin-panel"><div className="admin-panel-head"><h2>Send notification</h2><span>{noticeUser ? `Kwa: ${noticeUser.full_name}` : "Broadcast kwa users wote"}</span></div><input className="admin-text-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title"/><textarea className="admin-text-input" rows={4} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Andika ujumbe..."/><div className="admin-notice-actions">{noticeUser && <button onClick={()=>setNoticeUser(null)}>Broadcast badala yake</button>}<button onClick={sendNotice}><Bell/> Tuma Notification</button></div></section>
  </main></div>;
}
