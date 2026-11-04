/**
 * Minimal server-side Swan GraphQL transport.
 *
 * This is deliberately not a complete Swan SDK:
 * - OAuth token acquisition/refresh is not implemented.
 * - GraphQL operations are not guessed or embedded here.
 * - No browser/client use is supported.
 * - Callers must validate operations against Swan's current partner schema.
 */
export type SwanEnvironment = "sandbox" | "live";

export interface SwanConfig {
  environment: SwanEnvironment;
  accessToken: string;
  timeoutMs?: number;
}

export interface SwanGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface SwanGraphQLResponse<T> {
  data?: T;
  errors?: SwanGraphQLError[];
}

const ENDPOINTS: Record<SwanEnvironment, string> = {
  sandbox: "https://api.swan.io/sandbox-partner/graphql",
  live: "https://api.swan.io/live-partner/graphql",
};

export class SwanApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly graphQLErrors?: SwanGraphQLError[],
  ) {
    super(message);
    this.name = "SwanApiError";
  }
}

/**
 * Execute a GraphQL request from a trusted backend service only.
 * Never pass accessToken from a browser or mobile client.
 */
export async function swanGraphQL<TData, TVariables extends Record<string, unknown>>(
  config: SwanConfig,
  query: string,
  variables?: TVariables,
): Promise<TData> {
  if (!config.accessToken.trim()) {
    throw new SwanApiError("Swan access token is missing");
  }
  if (!query.trim()) {
    throw new SwanApiError("GraphQL query must not be empty");
  }

  const timeoutMs = config.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ENDPOINTS[config.environment], {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Do not include response bodies or authorization material in thrown errors.
      throw new SwanApiError("Swan API request failed", response.status);
    }

    const payload = (await response.json()) as SwanGraphQLResponse<TData>;
    if (payload.errors?.length) {
      throw new SwanApiError(
        "Swan GraphQL operation returned errors",
        response.status,
        payload.errors,
      );
    }
    if (payload.data === undefined) {
      throw new SwanApiError("Swan API returned no data", response.status);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof SwanApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new SwanApiError("Swan API request timed out");
    }
    throw new SwanApiError("Unable to reach Swan API");
  } finally {
    clearTimeout(timeout);
  }
}
