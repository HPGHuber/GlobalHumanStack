import "dotenv/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import {
  IdentityStack,
  type Kingdom,
  type LivingBeingSubject,
  type Taxon,
  type UniquenessProof,
  type WorldIdProof
} from "@ghs/sdk";

interface OnboardHumanBody {
  worldId?: WorldIdProof;
  profile?: { name?: string; jurisdiction?: string; ageOver?: number };
}

interface OnboardBeingBody {
  kingdom?: Kingdom;
  taxon?: Taxon;
  guardianDid?: string;
  uniqueness?: UniquenessProof;
  attributes?: Record<string, string | number | boolean>;
}

interface OnboardFanBody {
  worldId?: WorldIdProof;
  fan?: { handle?: string; favoriteTeam?: string; displayName?: string };
  competition?: string;
}

interface PresentBody {
  credentialId?: string;
  disclose?: Array<keyof LivingBeingSubject>;
}

interface VoteBody {
  worldPassCredentialId?: string;
  playerId?: string;
}

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

async function main(): Promise<void> {
  const stack = await IdentityStack.create();
  const app = express();
  app.use(cors());
  app.use(express.json());

  const api = express.Router();

  api.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  api.get("/config", (_req, res) => {
    res.json({
      mode: stack.mode(),
      trustAnchorDid: stack.trustAnchorDid,
      worldId: { appId: stack.config.worldid.appId, action: stack.config.worldid.action },
      fifa: { competition: stack.config.fifa.competition }
    });
  });

  api.post(
    "/onboard/human",
    asyncHandler(async (req, res) => {
      const body = req.body as OnboardHumanBody;
      const result = await stack.onboardHuman({
        worldId: body.worldId ?? { simulate: true },
        profile: body.profile
      });
      res.json(result);
    })
  );

  api.post(
    "/onboard/being",
    asyncHandler(async (req, res) => {
      const body = req.body as OnboardBeingBody;
      if (!body.kingdom || (body.kingdom !== "animalia" && body.kingdom !== "plantae")) {
        res.status(400).json({ error: "kingdom must be 'animalia' or 'plantae'" });
        return;
      }
      if (!body.taxon?.scientificName) {
        res.status(400).json({ error: "taxon.scientificName is required" });
        return;
      }
      if (!body.guardianDid) {
        res.status(400).json({ error: "guardianDid is required" });
        return;
      }
      const result = await stack.onboardBeing({
        kingdom: body.kingdom,
        taxon: body.taxon,
        guardianDid: body.guardianDid,
        uniqueness: body.uniqueness,
        attributes: body.attributes
      });
      res.json(result);
    })
  );

  api.post(
    "/onboard/fan",
    asyncHandler(async (req, res) => {
      const body = req.body as OnboardFanBody;
      if (!body.fan?.handle) {
        res.status(400).json({ error: "fan.handle is required" });
        return;
      }
      const result = await stack.onboardFan({
        worldId: body.worldId ?? { simulate: true },
        fan: {
          handle: body.fan.handle,
          favoriteTeam: body.fan.favoriteTeam,
          displayName: body.fan.displayName
        },
        competition: body.competition
      });
      res.json(result);
    })
  );

  api.post("/present", (req, res) => {
    const body = req.body as PresentBody;
    if (!body.credentialId) {
      res.status(400).json({ error: "credentialId is required" });
      return;
    }
    res.json(stack.present(body.credentialId, body.disclose ?? []));
  });

  api.post(
    "/verify",
    asyncHandler(async (req, res) => {
      const body = req.body as { jwt?: string };
      if (!body.jwt) {
        res.status(400).json({ error: "jwt is required" });
        return;
      }
      res.json(await stack.verify(body.jwt));
    })
  );

  api.post("/revoke", (req, res) => {
    const body = req.body as { credentialId?: string };
    if (!body.credentialId) {
      res.status(400).json({ error: "credentialId is required" });
      return;
    }
    stack.revoke(body.credentialId);
    res.json({ ok: true });
  });

  api.get("/registry", (_req, res) => {
    res.json(stack.registry());
  });

  api.get(
    "/matches",
    asyncHandler(async (_req, res) => {
      res.json(await stack.listMatches());
    })
  );

  api.get(
    "/matches/:id/tally",
    asyncHandler(async (req, res) => {
      res.json(await stack.getMatch(req.params.id));
    })
  );

  api.post(
    "/matches/:id/vote",
    asyncHandler(async (req, res) => {
      const body = req.body as VoteBody;
      if (!body.worldPassCredentialId) {
        res.status(400).json({ error: "worldPassCredentialId is required" });
        return;
      }
      if (!body.playerId) {
        res.status(400).json({ error: "playerId is required" });
        return;
      }
      res.json(
        await stack.castVote({
          worldPassCredentialId: body.worldPassCredentialId,
          matchId: req.params.id,
          playerId: body.playerId
        })
      );
    })
  );

  api.post(
    "/matches/:id/award",
    asyncHandler(async (req, res) => {
      res.json(await stack.awardPlayerOfTheMatch(req.params.id));
    })
  );

  app.use("/api", api);

  // Serve the built web UI if present (single-server demo mode).
  const webDist = path.resolve(fileURLToPath(import.meta.url), "../../../../apps/web/dist");
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  // Centralised error handler — surfaces SDK validation errors as 400s.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message });
  });

  const port = Number(process.env.PORT ?? 8787);
  app.listen(port, () => {
    const mode = stack.mode();
    console.log(`AYA.ONE Identity Stack API listening on http://localhost:${port}`);
    console.log(
      `  mode: iota=${mode.iota} walt.id=${mode.waltid} worldid=${mode.worldid} fifa=${mode.fifa}`
    );
    console.log(`  trust anchor: ${stack.trustAnchorDid}`);
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
