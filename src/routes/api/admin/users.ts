import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin, supabaseAdmin } from "@/lib/server-db";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
          const users = await supabaseAdmin("/rest/v1/elinochat_profiles?select=*&order=created_at.desc");
          const payments = await supabaseAdmin("/rest/v1/elinochat_payments?select=*&order=created_at.desc&limit=200");
          const notifications = await supabaseAdmin("/rest/v1/elinochat_notifications?select=id,user_id,title,message,created_at,read&order=created_at.desc&limit=200");
          return Response.json({ users: users ?? [], payments: payments ?? [], notifications: notifications ?? [] });
        } catch (error) {
          if (error instanceof Response) return error;
          return Response.json({ message: error instanceof Error ? error.message : "Admin data haijapatikana." }, { status: 500 });
        }
      },
    },
  },
});
