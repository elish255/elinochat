import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, MessageCircle, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getNotifications, getProfile, getSession, logout } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    if (!getSession()) { navigate({ to: "/login" }); return; }
    Promise.all([getProfile(), getNotifications()]).then(([p, n]) => { setProfile(p); setNotifications(n); }).catch(() => null);
  }, [navigate]);
  const signOut = async () => { await logout(); clearSession(); navigate({ to: "/" }); };
  if (!profile) return <div className="center-loading">Inapakia account...</div>;
  const canChat = profile.account_status === "active";
  return <div className="dashboard-page"><header className="dashboard-header"><Link to="/" className="payment-brand"><span>EC</span> ElinoChat</Link><button onClick={signOut}><LogOut /> Logout</button></header><main className="dashboard-shell">
    <section className="dash-welcome"><div><p>Karibu tena</p><h1>{profile.full_name}</h1><span>@{profile.username} • {profile.country}</span></div><div className={`status-badge ${profile.account_status}`}>{profile.account_status === "active" ? "ACTIVE" : profile.account_status.toUpperCase().replace("_", " ")}</div></section>
    {!canChat && <div className="activation-banner"><strong>Account yako bado haija-active.</strong><p>Kamilisha malipo ili ufungue chats na kuanza kupata malipo.</p><Link to="/payment">LIPA SASA</Link></div>}
    <div className="dash-grid"><div className="dash-card"><WalletCards /><span>Current Balance</span><strong>TSh {Number(profile.balance ?? 0).toLocaleString()}</strong></div><div className="dash-card"><Bell /><span>Notifications</span><strong>{notifications.length}</strong></div><div className="dash-card"><MessageCircle /><span>Chat Access</span><strong>{canChat ? "OPEN" : "LOCKED"}</strong></div></div>
    <section className="dash-card wide"><h2>Notifications</h2>{notifications.length ? notifications.map((n) => <article key={n.id} className="notification-item"><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString()}</small></article>) : <p className="muted">Hakuna notifications mpya.</p>}</section>
    {canChat && <section className="dash-card wide"><h2>Ready to chat?</h2><p className="muted">Anza mazungumzo na profile yoyote. Foreigner ataelewa Kiswahili na mazungumzo yataendelea kwa muktadha.</p><Link className="primary-link" to="/">START CHAT</Link></section>}
  </main></div>;
}
