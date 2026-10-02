import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/lib/server-db";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const identifier = String(body.identifier ?? "").trim().toLowerCase();
          const password = String(body.password ?? "");
          if (!identifier || !password) return Response.json({ message: "Weka username/email na password." }, { status: 400 });
          const url = String(process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
          const key = String(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "");
          let email = identifier;
          if (!identifier.includes("@")) {
            const profiles = await supabaseAdmin(`/rest/v1/elinochat_profiles?select=email,account_status&username=eq.${encodeURIComponent(identifier)}&limit=1`);
            if (!profiles?.[0]?.email) return Response.json({ message: "Username haijapatikana." }, { status: 401 });
            email = profiles[0].email;
          }
          const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const session = await response.json();
          if (!response.ok) return Response.json({ message: session?.msg || session?.error_description || "Taarifa za login si sahihi." }, { status: 401 });
          const profiles = await supabaseAdmin(`/rest/v1/elinochat_profiles?select=account_status&email=eq.${encodeURIComponent(email)}&limit=1`);
          if (profiles?.[0]?.account_status === "banned") return Response.json({ message: "Account yako imefungiwa. Wasiliana na admin." }, { status: 403 });
          return Response.json({ session });
        } catch (error) {
          return Response.json({ message: error instanceof Error ? error.message : "Login imeshindikana." }, { status: 500 });
        }
      },
    },
  },
});
