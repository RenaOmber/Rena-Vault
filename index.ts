import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = "mailto:rena@renaomber.com";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { task_name, assigned_to } = await req.json();

    const { data: subs } = await ctx.supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_name", assigned_to);

    if (!subs?.length) {
      return Response.json({ sent: 0, msg: "no subscriptions" });
    }

    const payload = JSON.stringify({
      title: "Task Baru! 📋",
      body: `${task_name} telah di-assign ke kamu`,
      icon: "/icon-192.png",
      data: { url: "/alert.html" }
    });

    const webpush = await import("https://esm.sh/web-push@3.6.7");
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await ctx.supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return Response.json({ sent });
  }),
};