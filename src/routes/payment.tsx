import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, Smartphone, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfile, getSession } from "@/lib/api";

export const Route = createFileRoute("/payment")({ component: PaymentPage });

function PaymentPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session) { navigate({ to: "/login" }); return; }
    getProfile().then((profile) => {
      if (!profile) return;
      const savedPhone = String(profile.phone ?? "").replace(/\D/g, "");
      const localPhone = savedPhone.startsWith("255") ? savedPhone.slice(3, 12) : savedPhone.startsWith("0") ? savedPhone.slice(1, 10) : savedPhone.slice(0, 9);
      setPhone(localPhone); setProfileName(String(profile.full_name ?? ""));
      if (profile.account_status === "active" && profile.is_active === true) {
        navigate({ to: "/dashboard" });
        return;
      }
      if (profile.account_status === "banned" || profile.account_status === "inactive") {
        navigate({ to: "/login" });
      }
    }).catch(() => null);
  }, [navigate]);

  useEffect(() => {
    if (!orderId) return;
    const session = getSession(); if (!session) return;
    let attempts = 0;
    const timer = window.setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch("/api/payment/status", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ orderId }) });
        const data = await response.json();
        if (data.status === "SUCCESS") { window.clearInterval(timer); setStatus("success"); setMessage("Malipo yamekamilika. Account yako imekuwa active."); window.setTimeout(() => navigate({ to: "/dashboard" }), 1200); }
        else if (["CANCELLED", "USERCANCELLED", "REJECTED"].includes(data.status)) { window.clearInterval(timer); setStatus("error"); setMessage("Malipo hayajakamilika. Jaribu tena."); }
      } catch { /* keep polling */ }
      if (attempts >= 30) { window.clearInterval(timer); setStatus("timeout"); setMessage("Bado hatujapokea uthibitisho. Angalia simu yako au jaribu kuangalia tena."); }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [orderId, navigate]);

  const pay = async () => {
    const session = getSession(); if (!session) return navigate({ to: "/login" });
    setStatus("starting"); setMessage("");
    const localPhone = phone.replace(/\D/g, "").slice(0, 9);
    const normalized = `255${localPhone}`;
    try {
      const response = await fetch("/api/payment/create", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ phone: normalized }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Malipo hayajaanzishwa.");
      setAmount(Number(data.amount)); setOrderId(String(data.orderId)); setStatus("waiting"); setMessage("Angalia simu yako. Ombi la malipo limetumwa; weka PIN/Siri yako kuthibitisha.");
    } catch (e) { setStatus("error"); setMessage(e instanceof Error ? e.message : "Malipo hayajaanzishwa."); }
  };

  return <div className="payment-page"><div className="payment-shell">
    <div className="payment-top"><Link to="/" className="payment-brand"><span>EC</span> ElinoChat</Link><span className="country-pill">🇹🇿 Tanzania</span></div>
    <section className="pay-card">
      <div className="pay-header"><div className="pay-icon"><Zap /></div><div><h1>Tanzania</h1><p>Lipia moja kwa moja kwa USSD Push</p></div><span className="tz-flag">🇹🇿</span></div>
      <div className="pay-body"><label>NAMBA YA SIMU</label><div className="phone-input"><span>🇹🇿 +255</span><input inputMode="numeric" value={phone} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); const local = raw.startsWith("255") ? raw.slice(3) : raw.startsWith("0") ? raw.slice(1) : raw; setPhone(local.slice(0, 9)); }} placeholder="7XXXXXXXX" /></div>
      {amount && <div className="pay-amount">Ada ya activation: <strong>TSh {amount.toLocaleString()}</strong></div>}
      <button className="pay-now" disabled={status === "starting" || status === "waiting"} onClick={pay}><LockKeyhole /> {status === "starting" ? "INATUMA..." : status === "waiting" ? "INASUBIRI UTHIBITISHO..." : "LIPA SASA"}</button>
      {message && <div className={`pay-message ${status === "error" || status === "timeout" ? "error" : status === "success" ? "success" : ""}`}>{message}</div>}
      <div className="powered"><span>Secure mobile payment</span><b>⚡</b><b>✓</b><b>▣</b><b>◉</b></div></div>
    </section>
    <section className="pay-info"><h2>Jinsi malipo yanavyofanyika</h2><ol><li>Weka namba ya simu iliyosajiliwa kwenye mobile money.</li><li>Gusa <b>LIPA SASA</b> na ombi litatumwa kwenye simu yako.</li><li>Weka PIN/Siri yako kwenye simu kuthibitisha.</li><li>Baada ya malipo kuwa Completed, account yako itakuwa active moja kwa moja.</li></ol></section>
    {profileName && <p className="pay-user">Account: <b>{profileName}</b></p>}
  </div></div>;
}
