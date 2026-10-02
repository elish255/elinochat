import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, LockKeyhole, Mail, Phone, User, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const countries = ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "South Sudan", "Ethiopia", "Somalia"];

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", phone: "", email: "", country: "Tanzania", password: "", confirmPassword: "" });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!agree) return setError("Kubali Privacy Policy ili kuendelea.");
    if (form.password !== form.confirmPassword) return setError("Password hazifanani.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Weka namba ya simu iliyo sahihi.");
    setBusy(true);
    try { await register(form); navigate({ to: "/payment" }); }
    catch (e) { setError(e instanceof Error ? e.message : "Imeshindikana kujisajili."); }
    finally { setBusy(false); }
  };

  const field = (name: keyof typeof form, label: string, placeholder: string, icon: React.ReactNode, type = "text") => (
    <label className="auth-field"><span>{label}</span><div className="auth-input"><i>{icon}</i><input required value={form[name]} type={type} placeholder={placeholder} onChange={(e) => setForm((v) => ({ ...v, [name]: e.target.value }))} /></div></label>
  );

  return <div className="auth-page"><div className="auth-card register-card">
    <div className="auth-heading"><div className="auth-logo">EC</div><h1>Create Your Account</h1><p>Enter your personal details to create account</p></div>
    <form onSubmit={submit}>
      {field("fullName", "Full Name", "Full Name", <UserRound />)}
      {field("username", "Username", "Username", <User />)}
      {field("phone", "Phone", "255XXXXXXXXX", <Phone />, "tel")}
      {field("email", "Email Address", "user@gmail.com", <Mail />, "email")}
      <label className="auth-field"><span>Country</span><div className="auth-input"><i>🌍</i><select value={form.country} onChange={(e) => setForm((v) => ({ ...v, country: e.target.value }))}>{countries.map((country) => <option key={country}>{country}</option>)}</select></div></label>
      <div className="password-row">
        <label className="auth-field"><span>Password</span><div className="auth-input"><i><LockKeyhole /></i><input required minLength={6} type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}/><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        <label className="auth-field"><span>Confirm Password</span><div className="auth-input"><i><LockKeyhole /></i><input required minLength={6} type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm((v) => ({ ...v, confirmPassword: e.target.value }))}/><button type="button" onClick={() => setShowConfirm((v) => !v)}>{showConfirm ? <EyeOff /> : <Eye />}</button></div></label>
      </div>
      <label className="check-row"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span><Check /> Agree With Privacy Policy</span></label>
      {error && <div className="form-error">{error}</div>}
      <button disabled={busy} className="auth-submit" type="submit">{busy ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></div>;
}
