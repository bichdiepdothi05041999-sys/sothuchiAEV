// Dịch Việt -> Hàn cho sổ thu chi (Google Translate công khai, dự phòng MyMemory).
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
export const config = { path: "/api/translate" };
export default async (req) => {
  const pw = process.env.APP_PASSWORD;
  if (!pw || req.headers.get("x-app-key") !== pw) return json({ error: "unauthorized" }, 401);
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 480);
  if (!q) return json({ text: "" });
  try {
    const r = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=ko&dt=t&q=" + encodeURIComponent(q));
    const d = await r.json();
    const text = (d && d[0] || []).map((x) => x[0]).join("").trim();
    if (text) return json({ text });
  } catch (e) {}
  try {
    const r = await fetch("https://api.mymemory.translated.net/get?langpair=vi|ko&q=" + encodeURIComponent(q));
    const d = await r.json();
    return json({ text: (d && d.responseData && d.responseData.translatedText) || "" });
  } catch (e) { return json({ text: "" }); }
};
