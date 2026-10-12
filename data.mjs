// Lưu sổ thu chi vào Netlify Blobs: 1 bản ghi duy nhất + bản sao lưu theo ngày.
import { getStore } from "@netlify/blobs";
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
export const config = { path: "/api/sothuchi" };
export default async (req) => {
  const pw = process.env.APP_PASSWORD;
  if (!pw || req.headers.get("x-app-key") !== pw) return json({ error: "unauthorized" }, 401);
  const store = getStore({ name: "sothuchi", consistency: "strong" });
  if (req.method === "GET") return json({ data: (await store.get("data", { type: "json" })) || null });
  if (req.method === "PUT") {
    const body = await req.json();
    if (!body || typeof body !== "object" || !Array.isArray(body.rows)) return json({ error: "bad body" }, 400);
    await store.setJSON("data", body);
    await store.setJSON(`backup/${new Date().toISOString().slice(0, 10)}`, body);
    return json({ ok: true });
  }
  return json({ error: "method" }, 405);
};
