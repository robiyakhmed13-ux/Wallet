// Supabase REST helper (optional) - extracted from original
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const sb = {
  enabled: () => !!SUPABASE_URL && !!SUPABASE_KEY,
  async req(path, { method = "GET", body } = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    };
    if (method === "POST") headers.Prefer = "return=representation";
    if (method === "PATCH") headers.Prefer = "return=representation";

    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const txt = await res.text();
    let json = null;
    try {
      json = txt ? JSON.parse(txt) : null;
    } catch {
      json = null;
    }
    if (!res.ok) {
      const err = new Error("Supabase request failed");
      err.status = res.status;
      err.payload = json || txt;
      throw err;
    }
    return json;
  },
};

export { SUPABASE_URL, SUPABASE_KEY, sb };
