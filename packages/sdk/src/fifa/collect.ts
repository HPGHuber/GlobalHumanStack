import { sha256Hex } from "../crypto.js";

/**
 * A football fan's public profile, as surfaced by FIFA Collect
 * (https://collect.fifa.com) — the official FIFA digital collectibles platform.
 * Only public, low-sensitivity fields are modelled; never payment data or PII.
 */
export interface FanProfile {
  handle: string;
  displayName?: string;
  favoriteTeam?: string;
  memberSince?: string;
  collectiblesCount: number;
  /** Public wallet / account reference holding the collectibles. */
  wallet?: string;
  /** Loyalty tier derived from collection activity. */
  tier?: string;
}

export interface FifaCollectAdapter {
  getFanProfile(handle: string): Promise<FanProfile>;
}

const TIERS = ["Kickoff", "Supporter", "Ultra", "Legend"] as const;

/**
 * Offline FIFA Collect adapter (default). Derives a deterministic, plausible
 * fan profile from the handle so the WorldPass demo runs with no network/secrets.
 * The same handle always yields the same profile.
 */
export class MockFifaCollectAdapter implements FifaCollectAdapter {
  async getFanProfile(handle: string): Promise<FanProfile> {
    const seed = sha256Hex(`fifa-collect:${handle.toLowerCase()}`);
    const collectiblesCount = parseInt(seed.slice(0, 4), 16) % 240;
    const year = 2018 + (parseInt(seed.slice(4, 6), 16) % 8);
    const month = String((parseInt(seed.slice(6, 8), 16) % 12) + 1).padStart(2, "0");
    const tier = TIERS[Math.min(TIERS.length - 1, Math.floor(collectiblesCount / 60))];
    return {
      handle,
      displayName: handle,
      memberSince: `${year}-${month}`,
      collectiblesCount,
      wallet: `0x${seed.slice(0, 40)}`,
      tier
    };
  }
}

/**
 * Live FIFA Collect adapter. Active only when `FIFA_COLLECT_API_URL` is set.
 * FIFA Collect exposes no public open identity API, so this targets a
 * configurable gateway that returns a {@link FanProfile} for a handle.
 */
export class LiveFifaCollectAdapter implements FifaCollectAdapter {
  constructor(
    private readonly apiUrl: string,
    private readonly fallback: FifaCollectAdapter = new MockFifaCollectAdapter()
  ) {}

  async getFanProfile(handle: string): Promise<FanProfile> {
    const response = await fetch(`${this.apiUrl}/fans/${encodeURIComponent(handle)}`, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`FIFA Collect responded ${response.status}: ${await response.text()}`);
    }
    const data = (await response.json()) as Partial<FanProfile>;
    const base = await this.fallback.getFanProfile(handle);
    return { ...base, ...data, handle };
  }
}
