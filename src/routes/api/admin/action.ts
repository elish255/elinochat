import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin, supabaseAdmin } from "@/lib/server-db";

const allowedStatuses = new Set(["active", "inactive", "banned", "pending_payment"]);

export const Route = createFileRoute("/api/admin/action")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
          const body = await request.json();
          const action = String(body.action ?? "");
          const userId = String(body.userId ?? "");
          if (!userId) return Response.json({ message: "User ID haipo." }, { status: 400 });

          if (action === "status") {
            const status = String(body.status ?? "");
            if (!allowedStatuses.has(status)) return Response.json({ message: "Status si sahihi." }, { status: 400 });
            await supabaseAdmin(`/rest/v1/elinochat_profiles?id=eq.${encodeURIComponent(userId)}`, { method: "PATCH", body: JSON.stringify({ account_status: status, is_active: status === "active", updated_at: new Date().toISOString() }) });
            return Response.json({ ok: true });
          }

          if (action === "notify") {
            const title = String(body.title ?? "Taarifa").trim();
            const message = String(body.message ?? "").trim();
            if (!message) return Response.json({ message: "Ujumbe hauwezi kuwa tupu." }, { status: 400 });
            await supabaseAdmin("/rest/v1/elinochat_notifications", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: userId, title, message }) });
            return Response.json({ ok: true });
          }

          if (action === "broadcast") {
            const title = String(body.title ?? "Taarifa").trim();
            const message = String(body.message ?? "").trim();
            if (!message) return Response.json({ message: "Ujumbe hauwezi kuwa tupu." }, { status: 400 });
            const users = await supabaseAdmin("/rest/v1/elinochat_profiles?select=id");
            const rows = (users ?? []).map((u: { id: string }) => ({ user_id: u.id, title, message }));
            if (rows.length) await supabaseAdmin("/rest/v1/elinochat_notifications", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(rows) });
            return Response.json({ ok: true, count: rows.length });
          }

          return Response.json({ message: "Action haijulikani." }, { status: 400 });
        } catch (error) {
          if (error instanceof Response) return error;
          return Response.json({ message: error instanceof Error ? error.message : "Admin action imeshindikana." }, { status: 500 });
        }
      },
    },
  },
});
