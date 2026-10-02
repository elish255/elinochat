import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { saveSession } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Login imeshindikana.");
      if (remember) saveSession(data.session); else saveSession(data.session);
      navigate({ to: "/dashboard" });
    } catch (e) { setError(e instanceof Error ? e.message : "Login imeshindikana."); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-card login-card">
    <div className="auth-heading"><div className="auth-logo">EC</div><h1>Login</h1><p>Welcome back! Log in to your account.</p></div>
    <form onSubmit={submit}>
      <label className="auth-field"><span>Username</span><div className="auth-input"><i><Mail /></i><input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="username or email" /></div></label>
      <label className="auth-field"><span>Password</span><div className="auth-input"><i><LockKeyhole /></i><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="**********"/><button type="button" onClick={() => setShow((v) => !v)}>{show ? <EyeOff /> : <Eye />}</button></div></label>
      <div className="login-options"><label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/> Remember password</label><button type="button" onClick={() => setError("Wasiliana na support kwa reset ya password.")}>Forgot password?</button></div>
      {error && <div className="form-error">{error}</div>}
      <button disabled={busy} className="auth-submit" type="submit">{busy ? "SIGNING IN..." : "SIGN IN"}</button>
    </form>
    <div className="auth-divider"><span>or continue with</span></div><div className="social-row"><span>in</span><span>𝕏</span><span>f</span><span>◎</span></div>
    <p className="auth-switch">Don't have an account? <Link to="/register">Create Account</Link></p>
  </div></div>;
}
