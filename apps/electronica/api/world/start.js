import { createHash, createHmac, randomBytes } from "node:crypto";
const b64 = (v) => Buffer.from(v).toString("base64url");
const sign = (value, secret) => createHmac("sha256", secret).update(value).digest("base64url");
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { WORLD_CLIENT_ID, WORLD_CLIENT_SECRET, WORLD_REDIRECT_URI, WORLD_SESSION_SECRET } = process.env;
  if (!WORLD_CLIENT_ID || !WORLD_CLIENT_SECRET || !WORLD_REDIRECT_URI || !WORLD_SESSION_SECRET) {
    return res.status(503).json({ error: "World ID production credentials are not configured." });
  }
  try {
    const issuer = process.env.WORLD_ISSUER || "https://auth.world.org";
    const discovery = await fetch(issuer + "/.well-known/openid-configuration").then(r => r.json());
    if (!discovery.authorization_endpoint) throw new Error("World IdP discovery unavailable");
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const payload = b64(JSON.stringify({ state, nonce, verifier, exp: Date.now() + 600000 }));
    const cookie = payload + "." + sign(payload, WORLD_SESSION_SECRET);
    res.setHeader("Set-Cookie", "world_tx=" + cookie + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600");
    const url = new URL(discovery.authorization_endpoint);
    for (const [k,v] of Object.entries({ client_id: WORLD_CLIENT_ID, redirect_uri: WORLD_REDIRECT_URI, response_type: "code", scope: "openid", state, nonce, code_challenge: challenge, code_challenge_method: "S256", acr_values: "https://world.org/oidc/acr/orb" })) url.searchParams.set(k,v);
    return res.status(200).json({ url: url.toString() });
  } catch (e) { return res.status(502).json({ error: "Could not initialize World ID authentication." }); }
}