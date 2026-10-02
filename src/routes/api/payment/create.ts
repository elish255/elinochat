import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin, verifyAccessToken } from "@/lib/server-db";

export const Route = createFileRoute("/api/payment/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { user } = await verifyAccessToken(request);
          const body = await request.json();
          const phone = String(body.phone ?? "").replace(/\D/g, "");
          const amount = Number(process.env.ELINOCHAT_PAYMENT_AMOUNT_TZS ?? "");
          if (!/^255\d{9}$/.test(phone)) return Response.json({ message: "Weka namba ya Tanzania kwa format 255XXXXXXXXX." }, { status: 400 });
          if (!Number.isFinite(amount) || amount <= 0) return Response.json({ message: "ELINOCHAT_PAYMENT_AMOUNT_TZS haijawekwa kwenye environment variables." }, { status: 500 });

          const profiles = await supabaseAdmin(`/rest/v1/elinochat_profiles?select=id,email,full_name,account_status&id=eq.${encodeURIComponent(user.id)}&limit=1`);
          const profile = profiles?.[0];
          if (!profile) return Response.json({ message: "Account haijapatikana." }, { status: 404 });
          if (profile.account_status === "banned") return Response.json({ message: "Account yako imefungiwa. Wasiliana na admin." }, { status: 403 });
          if (profile.account_status === "active") return Response.json({ message: "Account yako tayari iko active." }, { status: 400 });

          const fimipayKey = String(process.env.FIMIPAY_SECRET_KEY ?? "");
          if (!fimipayKey) return Response.json({ message: "Payment service haijawekewa key ya server." }, { status: 500 });

          const payment = await supabaseAdmin("/rest/v1/elinochat_payments", {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({ user_id: user.id, phone, amount, currency: "TZS", status: "pending" }),
          });
          const paymentId = payment?.[0]?.id;

          const upstream = await fetch("https://fimipay.com/api/v1/payment/create_order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "ElinoChat/1.0",
              Authorization: `Bearer ${fimipayKey}`,
            },
            body: JSON.stringify({ buyer_email: profile.email, buyer_name: profile.full_name, buyer_phone: phone, amount, currency: "TZS", payment_method: "mobile" }),
          });
          const result = await upstream.json().catch(() => null);
          if (!upstream.ok || result?.status !== "success") {
            await supabaseAdmin(`/rest/v1/elinochat_payments?id=eq.${encodeURIComponent(paymentId)}`, { method: "PATCH", body: JSON.stringify({ status: "failed" }) }).catch(() => null);
            return Response.json({ message: result?.message ?? "Ombi la malipo halikukubaliwa." }, { status: 502 });
          }
          const orderId = result?.data?.order_id;
          await supabaseAdmin(`/rest/v1/elinochat_payments?id=eq.${encodeURIComponent(paymentId)}`, {
            method: "PATCH",
            body: JSON.stringify({ provider_order_id: orderId, provider_status: result?.data?.payment_status ?? "PENDING" }),
          });
          return Response.json({ paymentId, orderId, amount, status: result?.data?.payment_status ?? "PENDING" });
        } catch (error) {
          const status = error instanceof Response ? error.status : 500;
          if (error instanceof Response) return error;
          return Response.json({ message: error instanceof Error ? error.message : "Imeshindikana kuanzisha malipo." }, { status });
        }
      },
    },
  },
});
