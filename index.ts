import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = "mailto:rena@renaomber.com";
const PUB_KEY = "sb_publishable_guNzoa22ChBWwGo6w_JqgA_9makz2Yl";

async function sendPush(member: string, message: string) {
  await fetch("https://fqvfnohhilkzvijqukfg.supabase.co/functions/v1/send-push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": PUB_KEY,
      "Authorization": `Bearer ${PUB_KEY}`
    },
    body: JSON.stringify({ task_name: message, assigned_to: member })
  });
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { type } = await req.json(); // "progress" or "deadline"
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const MEMBERS = ["rena", "nom", "gapl", "pix", "jee", "tok"];

    if (type === "progress") {
      // Cek siapa yang sudah lapor progress hari ini
      const { data: notes } = await ctx.supabaseAdmin
        .from("user_notes")
        .select("user_name")
        .eq("note_type", "progress")
        .gte("created_at", today + "T00:00:00Z")
        .lte("created_at", today + "T23:59:59Z");

      const alreadyReported = new Set((notes || []).map((n: any) => n.user_name));

      // Kirim notif ke yang belum lapor
      for (const member of MEMBERS) {
        if (!alreadyReported.has(member)) {
          await sendPush(member, "⏰ Belum ada laporan progress hari ini. Tulis di Alert sekarang!");
        }
      }
      return Response.json({ sent: MEMBERS.length - alreadyReported.size });
    }

    if (type === "deadline") {
      // Cek task yang deadline besok dan belum In Progress/Done
      const { data: tasks } = await ctx.supabaseAdmin
        .from("timeline_tasks")
        .select("*")
        .eq("end_date", tomorrow)
        .not("actual_status", "in", '("done","progress")');

      for (const task of (tasks || [])) {
        if (task.assigned_to) {
          await sendPush(task.assigned_to, `⚠️ H-1 Deadline: "${task.name}" — belum dimulai!`);
        }
      }
      return Response.json({ sent: (tasks || []).length });
    }

    return Response.json({ error: "unknown type" }, { status: 400 });
  }),
};