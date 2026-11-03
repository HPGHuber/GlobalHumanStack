const $ = (id) => document.getElementById(id);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
let identity = null;
let rooms = [{ id: "world", name: "Welcome to ONCE" }, { id: "future", name: "Future Network" }];
let activeRoom = "world";
let key = null;

function b64(bytes) {
  let s = ""; bytes.forEach((b) => s += String.fromCharCode(b)); return btoa(s);
}
function fromB64(value) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("once-local-demo", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("vault");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function vaultGet(k) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction("vault", "readonly");
    const req = tx.objectStore("vault").get(k);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function vaultSet(k, value) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction("vault", "readwrite");
    tx.objectStore("vault").put(value, k);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function getKey() {
  let stored = await vaultGet("aes-key");
  if (!stored) {
    stored = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    await vaultSet("aes-key", stored);
  }
  return stored;
}
async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text));
  return { iv: b64(iv), data: b64(new Uint8Array(ciphertext)) };
}
async function decrypt(payload) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(payload.iv) }, key, fromB64(payload.data));
  return decoder.decode(plain);
}
async function loadMessages() {
  const stored = (await vaultGet("messages")) || [];
  const area = $("messages");
  area.innerHTML = '<div class="day-divider">YOUR ONCE JOURNEY STARTS HERE</div>';
  const relevant = stored.filter((m) => m.room === activeRoom);
  if (!relevant.length && activeRoom === "world") {
    addGuide("Welcome. This is a local-first prototype of the ONCE experience.");
    addGuide("Create your HeavenKey demo identity, then send your first encrypted local message. Nothing is sent to a server.");
  }
  for (const item of relevant) {
    try { addBubble(await decrypt(item.payload), item.mine); } catch { addGuide("A saved message could not be decrypted in this browser."); }
  }
}
function addGuide(text) { addBubble(text, false, "ONCE GUIDE"); }
function addBubble(text, mine, sender) {
  const article = document.createElement("article");
  article.className = "bubble" + (mine ? " mine" : " theirs");
  const who = document.createElement("span"); who.className = "sender"; who.textContent = sender || (mine ? identity?.name || "YOU" : "ONCE CONTACT");
  const p = document.createElement("p"); p.textContent = text;
  const time = document.createElement("time"); time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  article.append(who, p, time); $("messages").append(article); $("messages").scrollTop = $("messages").scrollHeight;
}
async function saveMessage(text) {
  const payload = await encrypt(text);
  const stored = (await vaultGet("messages")) || [];
  stored.push({ room: activeRoom, payload, mine: true, createdAt: Date.now() });
  await vaultSet("messages", stored);
  addBubble(text, true);
}
function renderRooms() {
  document.querySelectorAll(".conversation[data-room]").forEach((button) => button.remove());
  const heading = document.querySelector(".list-heading");
  rooms.forEach((room) => {
    const button = document.createElement("button");
    button.className = "conversation" + (room.id === activeRoom ? " active" : "");
    button.dataset.room = room.id;
    const icon = document.createElement("span"); icon.className = "room-avatar"; icon.textContent = room.id === "world" ? "◎" : "✦";
    const copy = document.createElement("span"); const name = document.createElement("b"); name.textContent = room.name;
    const sub = document.createElement("small"); sub.textContent = room.id === "world" ? "Your first conversation" : "Local demo conversation";
    copy.append(name, sub); button.append(icon, copy); button.addEventListener("click", () => selectRoom(room.id));
    heading.after(button);
  });
}
async function selectRoom(id) {
  activeRoom = id; const room = rooms.find((r) => r.id === id);
  $("room-title").textContent = room.name; renderRooms(); await loadMessages();
}
async function createPasskeyDemo() {
  const name = $("display-name").value.trim();
  const handle = $("handle").value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (!name || !handle) { $("dialog-status").textContent = "Please enter a display name and ONCE handle."; return; }
  let credentialId = null;
  if (window.PublicKeyCredential && navigator.credentials) {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const credential = await navigator.credentials.create({ publicKey: {
        challenge, rp: { name: "ONCE HeavenKey Demo", id: location.hostname },
        user: { id: userId, name: handle + "@once", displayName: name },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
        timeout: 60000, attestation: "none"
      }});
      credentialId = b64(new Uint8Array(credential.rawId));
    } catch (error) {
      $("dialog-status").textContent = "Passkey was not created (" + (error.name || "cancelled") + "). You can still explore the local demo identity.";
    }
  } else {
    $("dialog-status").textContent = "WebAuthn is unavailable here. A local demo identity can still be created; no passkey was made.";
  }
  identity = { name, handle, credentialId, createdAt: Date.now() };
  await vaultSet("identity", identity);
  $("identity-name").textContent = name; $("identity-id").textContent = "@" + handle + ":once";
  $("avatar").textContent = name.slice(0, 1).toUpperCase();
  $("key-status").textContent = credentialId ? "Local passkey credential created. Not server-verified." : "Local demo identity created. No passkey credential.";
  $("dialog-status").textContent = credentialId ? "Credential created on this device. This demo has no server to verify it." : "Local demo identity ready. Authentication is not verified.";
  $("identity-dialog").close();
}
$("heavenkey").addEventListener("click", () => $("identity-dialog").showModal());
$("create-identity").addEventListener("click", () => createPasskeyDemo().catch((e) => $("dialog-status").textContent = e.message));
$("new-chat").addEventListener("click", () => $("new-chat-dialog").showModal());
$("create-room").addEventListener("click", async () => {
  const name = $("room-name").value.trim(); if (!name) return;
  const id = "room-" + crypto.randomUUID();
  rooms.push({ id, name }); await vaultSet("rooms", rooms); $("new-chat-dialog").close(); $("room-name").value = ""; await selectRoom(id);
});
$("composer").addEventListener("submit", async (event) => {
  event.preventDefault(); const input = $("message-input"); const value = input.value.trim();
  if (!value) return;
  if (!identity) { $("identity-dialog").showModal(); $("dialog-status").textContent = "Create your HeavenKey demo identity before sending a message."; return; }
  try { await saveMessage(value); input.value = ""; } catch (e) { addGuide("Could not encrypt this message: " + e.message); }
});
document.querySelectorAll(".conversation[data-room]").forEach((button) => button.addEventListener("click", () => selectRoom(button.dataset.room)));
(async function init() {
  if (!window.crypto?.subtle || !window.indexedDB) {
    $("key-status").textContent = "This browser lacks required secure storage features. Use a modern browser on HTTPS or localhost.";
    $("composer").querySelector("button[type=submit]").disabled = true; return;
  }
  try {
    key = await getKey();
    identity = await vaultGet("identity");
    rooms = (await vaultGet("rooms")) || rooms;
    if (identity) {
      $("identity-name").textContent = identity.name; $("identity-id").textContent = "@" + identity.handle + ":once";
      $("avatar").textContent = identity.name.slice(0, 1).toUpperCase();
      $("key-status").textContent = identity.credentialId ? "Local credential present. Not server-verified." : "Local demo identity restored.";
    }
    renderRooms(); await loadMessages();
  } catch (e) { $("key-status").textContent = "Local setup failed: " + e.message; }
})();