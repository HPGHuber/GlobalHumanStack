import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type {
  AppConfig,
  BeingRecord,
  Kingdom,
  MatchView,
  Presentation,
  VerificationResult
} from "./types";

const DISCLOSE_FIELDS = [
  "kingdom",
  "taxon",
  "uniqueness",
  "guardian",
  "connectedTo",
  "fan",
  "award",
  "attributes"
] as const;

function short(did: string): string {
  return did.length > 28 ? `${did.slice(0, 20)}…${did.slice(-6)}` : did;
}

const KINGDOM_ICON: Record<Kingdom, string> = {
  human: "🧍",
  animalia: "🐾",
  plantae: "🌱"
};

export function App(): JSX.Element {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [registry, setRegistry] = useState<BeingRecord[]>([]);
  const [jwts, setJwts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [humanName, setHumanName] = useState("Alice");
  const [humanJurisdiction, setHumanJurisdiction] = useState("CH");

  const [kingdom, setKingdom] = useState<Exclude<Kingdom, "human">>("plantae");
  const [scientificName, setScientificName] = useState("Quercus robur");
  const [commonName, setCommonName] = useState("English oak");
  const [uniquenessRef, setUniquenessRef] = useState("sha256:geo-genetic-fingerprint");
  const [guardianDid, setGuardianDid] = useState("");

  const [fanHandle, setFanHandle] = useState("messi_fan_10");
  const [favoriteTeam, setFavoriteTeam] = useState("Argentina");

  const [matches, setMatches] = useState<MatchView[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedWorldPassId, setSelectedWorldPassId] = useState("");

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [disclose, setDisclose] = useState<string[]>(["kingdom", "taxon"]);

  const humans = useMemo(
    () => registry.filter((r) => r.kingdom === "human" && !r.subject.award),
    [registry]
  );
  const worldPasses = useMemo(() => registry.filter((r) => r.subject.fan), [registry]);
  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) ?? null,
    [matches, selectedMatchId]
  );

  const refresh = useCallback(async () => {
    const [cfg, reg, mts] = await Promise.all([
      api.getConfig(),
      api.getRegistry(),
      api.listMatches()
    ]);
    setConfig(cfg);
    setRegistry(reg);
    setMatches(mts);
  }, []);

  useEffect(() => {
    refresh().catch((e: unknown) => setError((e as Error).message));
  }, [refresh]);

  useEffect(() => {
    if (!guardianDid && humans.length > 0) setGuardianDid(humans[0].did);
  }, [humans, guardianDid]);

  useEffect(() => {
    if (!selectedMatchId && matches.length > 0) setSelectedMatchId(matches[0].id);
  }, [matches, selectedMatchId]);

  useEffect(() => {
    if (!selectedWorldPassId && worldPasses.length > 0) {
      setSelectedWorldPassId(worldPasses[0].credentialId);
    }
  }, [worldPasses, selectedWorldPassId]);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await fn();
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const onboardHuman = () =>
    run(async () => {
      const result = await api.onboardHuman({
        worldId: { simulate: true, signal: humanName || `human-${Date.now()}` },
        profile: { name: humanName, jurisdiction: humanJurisdiction, ageOver: 18 }
      });
      setJwts((prev) => ({ ...prev, [result.credential.id]: result.credential.jwt }));
      await refresh();
    });

  const onboardBeing = () =>
    run(async () => {
      const result = await api.onboardBeing({
        kingdom,
        taxon: { scientificName, rank: "species", commonName },
        guardianDid,
        uniqueness: {
          method: kingdom === "animalia" ? "microchip" : "geo-genetic-hash",
          proofRef: uniquenessRef
        }
      });
      setJwts((prev) => ({ ...prev, [result.credential.id]: result.credential.jwt }));
      await refresh();
    });

  const onboardFan = () =>
    run(async () => {
      const result = await api.onboardFan({
        worldId: { simulate: true, signal: `worldpass:${fanHandle || Date.now()}` },
        fan: { handle: fanHandle, favoriteTeam, displayName: fanHandle }
      });
      setJwts((prev) => ({ ...prev, [result.credential.id]: result.credential.jwt }));
      await refresh();
    });

  const castVote = (playerId: string) =>
    run(async () => {
      if (!selectedMatchId) throw new Error("Select a match to vote in.");
      if (!selectedWorldPassId) throw new Error("Claim a WorldPass first, then vote.");
      const updated = await api.vote(selectedMatchId, selectedWorldPassId, playerId);
      setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    });

  const awardPom = () =>
    run(async () => {
      if (!selectedMatchId) throw new Error("Select a match to award.");
      const result = await api.award(selectedMatchId);
      setJwts((prev) => ({ ...prev, [result.credential.id]: result.credential.jwt }));
      await refresh();
    });

  const verify = (credentialId: string) =>
    run(async () => {
      const jwt = jwts[credentialId];
      if (!jwt) throw new Error("No cached JWT for this credential (re-onboard in this session).");
      setPresentation(null);
      setVerification(await api.verify(jwt));
    });

  const present = (credentialId: string) =>
    run(async () => {
      setVerification(null);
      setPresentation(await api.present(credentialId, disclose));
    });

  const revoke = (credentialId: string) =>
    run(async () => {
      await api.revoke(credentialId);
      await refresh();
    });

  const toggleField = (field: string) =>
    setDisclose((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]));

  return (
    <div className="page">
      <header>
        <h1>AYA.ONE — Identity Stack</h1>
        <p className="tagline">All is Sacred. All is Unique. All is Connected.</p>
        {config && (
          <div className="modes">
            <Mode label="IOTA Identity" value={config.mode.iota} />
            <Mode label="walt.id" value={config.mode.waltid} />
            <Mode label="World ID" value={config.mode.worldid} />
            <Mode label="FIFA Collect" value={config.mode.fifa} />
            <span className="anchor" title={config.trustAnchorDid}>
              Trust anchor: {short(config.trustAnchorDid)}
            </span>
          </div>
        )}
      </header>

      {error && <div className="error">⚠ {error}</div>}

      <div className="grid">
        <section className="card">
          <h2>1. Onboard a Human</h2>
          <p className="hint">
            Gated by a World ID proof of personhood ({config?.mode.worldid === "live" ? "live" : "simulated"}),
            enforcing one human = one identity.
          </p>
          <label>
            Name
            <input value={humanName} onChange={(e) => setHumanName(e.target.value)} />
          </label>
          <label>
            Jurisdiction
            <input value={humanJurisdiction} onChange={(e) => setHumanJurisdiction(e.target.value)} />
          </label>
          <button disabled={busy} onClick={onboardHuman}>
            Prove humanity &amp; create identity
          </button>
        </section>

        <section className="card">
          <h2>2. Register a Plant or Animal</h2>
          <p className="hint">Created under a human guardian/steward identity.</p>
          <label>
            Kingdom
            <select
              value={kingdom}
              onChange={(e) => setKingdom(e.target.value as Exclude<Kingdom, "human">)}
            >
              <option value="plantae">🌱 plantae</option>
              <option value="animalia">🐾 animalia</option>
            </select>
          </label>
          <label>
            Scientific name
            <input value={scientificName} onChange={(e) => setScientificName(e.target.value)} />
          </label>
          <label>
            Common name
            <input value={commonName} onChange={(e) => setCommonName(e.target.value)} />
          </label>
          <label>
            Uniqueness ref (hash only)
            <input value={uniquenessRef} onChange={(e) => setUniquenessRef(e.target.value)} />
          </label>
          <label>
            Guardian
            <select value={guardianDid} onChange={(e) => setGuardianDid(e.target.value)}>
              {humans.length === 0 && <option value="">— onboard a human first —</option>}
              {humans.map((h) => (
                <option key={h.did} value={h.did}>
                  {h.subject.attributes?.name ? `${String(h.subject.attributes.name)} · ` : ""}
                  {short(h.did)}
                </option>
              ))}
            </select>
          </label>
          <button disabled={busy || humans.length === 0} onClick={onboardBeing}>
            Register being
          </button>
        </section>

        <section className="card worldpass">
          <h2>3. Claim a WorldPass — a FREEDENTITY for every Fan</h2>
          <p className="hint">
            Every unique human football fan proves personhood with World ID and links their{" "}
            <a href="https://collect.fifa.com" target="_blank" rel="noreferrer">
              FIFA Collect
            </a>{" "}
            profile to mint a WorldPass credential
            {config?.fifa?.competition ? ` · ${config.fifa.competition}` : ""}.
          </p>
          <label>
            FIFA Collect handle
            <input value={fanHandle} onChange={(e) => setFanHandle(e.target.value)} />
          </label>
          <label>
            Favourite team
            <input value={favoriteTeam} onChange={(e) => setFavoriteTeam(e.target.value)} />
          </label>
          <button disabled={busy || !fanHandle} onClick={onboardFan}>
            ⚽ Claim your WorldPass
          </button>
        </section>
      </div>

      <section className="card pom">
        <h2>4. Vote — Player of the Match</h2>
        <p className="hint">
          One fan, one vote per match — gated to WorldPass holders. Each WorldPass votes once;
          when voting closes the winner is issued a verifiable <code>PlayerOfTheMatchCredential</code>.
        </p>
        {matches.length === 0 ? (
          <p className="empty">No matches available.</p>
        ) : (
          <>
            <div className="pom-controls">
              <label>
                Match
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} · {m.status === "voting_open" ? "voting open" : "voting closed"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Vote as (WorldPass)
                <select
                  value={selectedWorldPassId}
                  onChange={(e) => setSelectedWorldPassId(e.target.value)}
                >
                  {worldPasses.length === 0 && (
                    <option value="">— claim a WorldPass first —</option>
                  )}
                  {worldPasses.map((w) => (
                    <option key={w.credentialId} value={w.credentialId}>
                      {w.subject.fan?.fifaCollectHandle} · {w.subject.fan?.worldPassId}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedMatch && (
              <ul className="roster">
                {selectedMatch.results.map((pl) => {
                  const pct =
                    selectedMatch.totalVotes > 0
                      ? Math.round((pl.votes / selectedMatch.totalVotes) * 100)
                      : 0;
                  const isWinner = selectedMatch.winnerPlayerId === pl.id;
                  return (
                    <li key={pl.id} className={isWinner ? "winner" : ""}>
                      <div className="roster-row">
                        <button
                          disabled={
                            busy || !selectedWorldPassId || selectedMatch.status !== "voting_open"
                          }
                          onClick={() => castVote(pl.id)}
                        >
                          Vote
                        </button>
                        <span className="player">
                          {isWinner ? "🏆 " : ""}
                          {pl.name}
                          <span className="subtle">
                            {" "}· {pl.team}
                            {pl.position ? ` · ${pl.position}` : ""}
                          </span>
                        </span>
                        <span className="vote-count">{pl.votes}</span>
                      </div>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="pom-footer">
              <span className="subtle">{selectedMatch?.totalVotes ?? 0} votes cast</span>
              <button
                disabled={
                  busy ||
                  !selectedMatch ||
                  selectedMatch.status !== "voting_open" ||
                  (selectedMatch?.totalVotes ?? 0) === 0
                }
                onClick={awardPom}
              >
                🏆 Award Player of the Match
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <h2>Identity Registry ({registry.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Being</th>
              <th>DID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registry.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  No identities yet — onboard a human to begin.
                </td>
              </tr>
            )}
            {registry.map((r) => (
              <tr key={r.did}>
                <td>
                  {r.subject.award ? "🏆" : r.subject.fan ? "⚽" : KINGDOM_ICON[r.kingdom]}{" "}
                  {r.subject.award
                    ? `${r.subject.award.title} · ${r.subject.award.playerName}`
                    : r.subject.fan
                      ? `WorldPass · ${r.subject.fan.favoriteTeam ?? r.subject.fan.fifaCollectHandle}`
                      : (r.subject.taxon?.commonName ?? r.kingdom)}
                  {r.subject.award && (
                    <div className="subtle">
                      {r.subject.award.match} · {r.subject.award.votes}/{r.subject.award.totalVotes}{" "}
                      votes
                    </div>
                  )}
                  {r.subject.fan && (
                    <div className="subtle">
                      {r.subject.fan.worldPassId}
                      {typeof r.subject.fan.collectiblesCount === "number"
                        ? ` · ${r.subject.fan.collectiblesCount} collectibles`
                        : ""}
                      {r.subject.fan.tier ? ` · ${r.subject.fan.tier}` : ""}
                    </div>
                  )}
                </td>
                <td title={r.did}>
                  <code>{short(r.did)}</code>
                </td>
                <td>{r.revoked ? <span className="revoked">revoked</span> : <span className="active">active</span>}</td>
                <td className="actions">
                  <button disabled={busy} onClick={() => verify(r.credentialId)}>
                    Verify
                  </button>
                  <button disabled={busy} onClick={() => present(r.credentialId)}>
                    Present
                  </button>
                  <button disabled={busy || r.revoked} className="danger" onClick={() => revoke(r.credentialId)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="disclose">
          <span>Disclose fields in presentation:</span>
          {DISCLOSE_FIELDS.map((f) => (
            <label key={f} className="chip">
              <input type="checkbox" checked={disclose.includes(f)} onChange={() => toggleField(f)} />
              {f}
            </label>
          ))}
        </div>
      </section>

      {verification && (
        <section className="card">
          <h2>Verification result</h2>
          <p className={verification.valid ? "active" : "revoked"}>
            {verification.valid ? "✓ Valid credential" : "✗ Invalid credential"}
          </p>
          <ul className="checks">
            <Check label="Signature" ok={verification.checks.signatureValid} />
            <Check label="Issuer trusted" ok={verification.checks.issuerTrusted} />
            <Check label="Not revoked" ok={verification.checks.notRevoked} />
          </ul>
          {verification.errors.length > 0 && (
            <pre>{verification.errors.join("\n")}</pre>
          )}
        </section>
      )}

      {presentation && (
        <section className="card">
          <h2>Selective-disclosure presentation</h2>
          <p className="hint">Only the chosen fields are shared with the verifier.</p>
          <pre>{JSON.stringify(presentation.disclosed, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

function Mode({ label, value }: { label: string; value: "live" | "mock" }): JSX.Element {
  return (
    <span className={`mode ${value}`}>
      {label}: {value}
    </span>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }): JSX.Element {
  return (
    <li className={ok ? "active" : "revoked"}>
      {ok ? "✓" : "✗"} {label}
    </li>
  );
}
