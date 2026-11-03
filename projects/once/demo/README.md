# ONCE Browser Demo

A zero-build, static browser prototype for the ONCE product experience and HeavenKey entry.

## Run it

Serve this directory from **localhost or HTTPS** (WebAuthn requires a secure context):

```bash
cd projects/once/demo
python3 -m http.server 8080
```

Open `http://localhost:8080`.

You can also use any static HTTPS hosting provider after publishing the directory.

## What works

- Responsive ONCE messaging interface.
- HeavenKey demo identity creation.
- Browser WebAuthn credential creation attempt, when supported.
- Local AES-256-GCM message encryption using the Web Crypto API.
- Encrypted local message storage in IndexedDB.
- Local conversation creation.

## Important security limitations

This is a **local browser prototype**, not a production messenger:
- There is no relying-party backend, so the WebAuthn challenge is not verified by a server. The UI explicitly reports this.
- A passkey credential created here is not a production ONCE account or a verified login.
- The AES key is stored in this browser's IndexedDB and protects this local demo store only. It is not a peer-to-peer or end-to-end messaging protocol.
- Messages never leave this browser and cannot reach another person or device.
- There is no federation, contact discovery, backup, multi-device sync, group cryptography, anti-abuse service or external app bridge.
- Do not use real secrets or sensitive conversations in this demo.

## Next engineering step

Replace the local identity placeholder with a WebAuthn relying-party service and device-key registration. Then integrate a reviewed interoperable E2EE engine and a Matrix-compatible homeserver profile before enabling network delivery.
