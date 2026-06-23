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

/** A candidate player on a match roster (a "Player of the Match" nominee). */
export interface MatchPlayer {
  /** Stable slug id, e.g. "messi". */
  id: string;
  name: string;
  team: string;
  position?: string;
}

/** A scheduled fixture whose roster fans can vote a Player of the Match for. */
export interface MatchFixture {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  /** Whether the post-match voting window is open. */
  status: "scheduled" | "voting_open" | "voting_closed";
  roster: MatchPlayer[];
}

export interface FifaCollectAdapter {
  getFanProfile(handle: string): Promise<FanProfile>;
  /** Fixtures + rosters for a competition, used for Player-of-the-Match voting. */
  listMatches(competition: string): Promise<MatchFixture[]>;
}

const TIERS = ["Kickoff", "Supporter", "Ultra", "Legend"] as const;

function p(id: string, name: string, team: string, position: string): MatchPlayer {
  return { id, name, team, position };
}

/** A small, deterministic set of sample fixtures so voting runs offline. */
function mockFixtures(competition: string): MatchFixture[] {
  return [
    {
      id: "M-ARG-FRA",
      competition,
      homeTeam: "Argentina",
      awayTeam: "France",
      kickoff: "2026-07-19T19:00:00Z",
      status: "voting_open",
      roster: [
        p("messi", "Lionel Messi", "Argentina", "FW"),
        p("di-maria", "Ángel Di María", "Argentina", "FW"),
        p("martinez", "Emiliano Martínez", "Argentina", "GK"),
        p("mbappe", "Kylian Mbappé", "France", "FW"),
        p("griezmann", "Antoine Griezmann", "France", "MF")
      ]
    },
    {
      id: "M-BRA-GER",
      competition,
      homeTeam: "Brazil",
      awayTeam: "Germany",
      kickoff: "2026-07-15T19:00:00Z",
      status: "voting_open",
      roster: [
        p("vinicius", "Vinícius Júnior", "Brazil", "FW"),
        p("rodrygo", "Rodrygo", "Brazil", "FW"),
        p("musiala", "Jamal Musiala", "Germany", "MF"),
        p("wirtz", "Florian Wirtz", "Germany", "MF")
      ]
    }
  ];
}

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

  async listMatches(competition: string): Promise<MatchFixture[]> {
    return mockFixtures(competition);
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

  async listMatches(competition: string): Promise<MatchFixture[]> {
    const response = await fetch(
      `${this.apiUrl}/competitions/${encodeURIComponent(competition)}/matches`,
      { headers: { accept: "application/json" } }
    );
    if (!response.ok) {
      // Gateways focused on fan profiles may not expose fixtures — fall back to
      // the offline roster so Player-of-the-Match voting still works.
      return this.fallback.listMatches(competition);
    }
    const data = (await response.json()) as MatchFixture[];
    return Array.isArray(data) && data.length > 0
      ? data
      : this.fallback.listMatches(competition);
  }
}
