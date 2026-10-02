import { createFileRoute } from "@tanstack/react-router";
import { assertServerEnv, supabaseAdmin } from "@/lib/server-db";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const fullName = String(body.fullName ?? "").trim();
          const username = String(body.username ?? "").trim().toLowerCase();
          const phone = String(body.phone ?? "").trim().replace(/\D/g, "");
          const email = String(body.email ?? "").trim().toLowerCase();
          const country = String(body.country ?? "").trim();
          const password = String(body.password ?? "");
          if (!fullName || username.length < 3 || !email || phone.length < 10 || !country || password.length < 6) {
            return Response.json({ message: "Jaza taarifa zote kwa usahihi. Password iwe angalau herufi 6." }, { status: 400 });
          }
          assertServerEnv();

          const existing = await supabaseAdmin(`/rest/v1/elinochat_profiles?select=id&or=(email.eq.${encodeURIComponent(email)},username.eq.${encodeURIComponent(username)})&limit=1`);
          if (existing?.length) return Response.json({ message: "Email au username tayari imetumika." }, { status: 409 });

          const created = await supabaseAdmin("/auth/v1/admin/users", {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
              email_confirm: true,
              user_metadata: { full_name: fullName, username, phone, country },
            }),
          });

          try {
            await supabaseAdmin("/rest/v1/elinochat_profiles", {
              method: "POST",
              headers: { Prefer: "return=minimal" },
              body: JSON.stringify({
                id: created.id,
                email,
                full_name: fullName,
                username,
                phone,
                country,
                account_status: "pending_payment",
                balance: 0,
              }),
            });
          } catch (error) {
            await supabaseAdmin(`/auth/v1/admin/users/${encodeURIComponent(created.id)}`, { method: "DELETE" }).catch(() => null);
            throw error;
          }

          const url = String(process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
          const key = String(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
          const sessionResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const session = await sessionResponse.json();
          if (!sessionResponse.ok) return Response.json({ message: "Account imeundwa, lakini login ya moja kwa moja imeshindikana. Tumia Login." }, { status: 201 });
          return Response.json({ session });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Imeshindikana kujisajili.";
          return Response.json({ message }, { status: 500 });
        }
      },
    },
  },
});
