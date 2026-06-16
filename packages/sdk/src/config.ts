/**
 * Resolves which adapters are "live" vs "mock" based on environment variables.
 * With an empty environment everything runs in mock mode (offline, no secrets).
 */
export interface StackConfig {
  iota: { enabled: boolean; network?: string; nodeUrl?: string };
  waltid: { enabled: boolean; issuerUrl?: string; verifierUrl?: string };
  worldid: { enabled: boolean; appId?: string; rpId?: string; action: string };
  fifa: { enabled: boolean; apiUrl?: string; competition: string };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): StackConfig {
  const iotaNetwork = env.IOTA_NETWORK;
  const waltidIssuer = env.WALTID_ISSUER_URL;
  const worldAppId = env.WORLD_APP_ID;
  const fifaApiUrl = env.FIFA_COLLECT_API_URL;
  return {
    iota: {
      enabled: Boolean(iotaNetwork),
      network: iotaNetwork ?? "local",
      nodeUrl: env.IOTA_NODE_URL
    },
    waltid: {
      enabled: Boolean(waltidIssuer),
      issuerUrl: waltidIssuer,
      verifierUrl: env.WALTID_VERIFIER_URL
    },
    worldid: {
      enabled: Boolean(worldAppId),
      appId: worldAppId,
      rpId: env.WORLD_RP_ID,
      action: env.WORLD_ACTION ?? "aya-onboard"
    },
    fifa: {
      enabled: Boolean(fifaApiUrl),
      apiUrl: fifaApiUrl,
      competition: env.FIFA_COMPETITION ?? "FIFA World Cup 2026"
    }
  };
}

export function describeMode(config: StackConfig): Record<string, "live" | "mock"> {
  return {
    iota: config.iota.enabled ? "live" : "mock",
    waltid: config.waltid.enabled ? "live" : "mock",
    worldid: config.worldid.enabled ? "live" : "mock",
    fifa: config.fifa.enabled ? "live" : "mock"
  };
}
