import type {
  AppConfig,
  BeingRecord,
  Kingdom,
  OnboardResult,
  Presentation,
  Taxon,
  UniquenessProof,
  VerificationResult
} from "./types";

async function request<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  getConfig: () => request<AppConfig>("/api/config"),
  getRegistry: () => request<BeingRecord[]>("/api/registry"),
  onboardHuman: (input: {
    worldId: { simulate?: boolean; signal?: string };
    profile?: { name?: string; jurisdiction?: string; ageOver?: number };
  }) => request<OnboardResult>("/api/onboard/human", input),
  onboardBeing: (input: {
    kingdom: Kingdom;
    taxon: Taxon;
    guardianDid: string;
    uniqueness?: UniquenessProof;
    attributes?: Record<string, string | number | boolean>;
  }) => request<OnboardResult>("/api/onboard/being", input),
  present: (credentialId: string, disclose: string[]) =>
    request<Presentation>("/api/present", { credentialId, disclose }),
  verify: (jwt: string) => request<VerificationResult>("/api/verify", { jwt }),
  revoke: (credentialId: string) => request<{ ok: boolean }>("/api/revoke", { credentialId })
};
