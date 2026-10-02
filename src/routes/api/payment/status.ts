import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin, verifyAccessToken } from "@/lib/server-db";

export const Route = createFileRoute("/api/payment/status")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { user } = await verifyAccessToken(request);
          const { orderId } = await request.json();
          const cleanOrderId = String(orderId ?? "").trim();
          if (!cleanOrderId) return Response.json({ message: "Order haipo." }, { status: 400 });
          const payments = await supabaseAdmin(`/rest/v1/elinochat_payments?select=*&provider_order_id=eq.${encodeURIComponent(cleanOrderId)}&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
          const payment = payments?.[0];
          if (!payment) return Response.json({ message: "Malipo hayajapatikana." }, { status: 404 });
          const fimipayKey = String(process.env.FIMIPAY_SECRET_KEY ?? "");
          if (!fimipayKey) return Response.json({ message: "Payment service haijawekewa key ya server." }, { status: 500 });

          const upstream = await fetch("https://fimipay.com/api/v1/payment/order_status", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "ElinoChat/1.0", Authorization: `Bearer ${fimipayKey}` },
            body: JSON.stringify({ order_id: cleanOrderId }),
          });
          const result = await upstream.json().catch(() => null);
          if (!upstream.ok || result?.status !== "success") return Response.json({ message: result?.message ?? "Haikuweza kupata hali ya malipo." }, { status: 502 });

          const providerStatus = String(result?.data?.payment_status ?? "PENDING").toUpperCase();
          const mapped = providerStatus === "SUCCESS" ? "success" : providerStatus.toLowerCase();
          await supabaseAdmin(`/rest/v1/elinochat_payments?id=eq.${encodeURIComponent(payment.id)}`, {
            method: "PATCH",
            body: JSON.stringify({ status: mapped, provider_status: providerStatus, provider_transaction_id: result?.data?.transid ?? null, completed_at: providerStatus === "SUCCESS" ? new Date().toISOString() : null }),
          });

          if (providerStatus === "SUCCESS") {
            await supabaseAdmin(`/rest/v1/elinochat_profiles?id=eq.${encodeURIComponent(user.id)}`, {
              method: "PATCH",
              body: JSON.stringify({ account_status: "active", is_active: true, updated_at: new Date().toISOString() }),
            });
          }
          return Response.json({ status: providerStatus, transactionId: result?.data?.transid ?? null });
        } catch (error) {
          if (error instanceof Response) return error;
          return Response.json({ message: error instanceof Error ? error.message : "Imeshindikana kuangalia malipo." }, { status: 500 });
        }
      },
    },
  },
});
