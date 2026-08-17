import { ApiError, type SearchResponse, type TrackResult } from "./types";

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5193";
const SEARCH_ENDPOINT = "/api/search";

export interface SearchByTermParams {
  query: string;
  limit?: number;
  signal?: AbortSignal;
}

export interface SearchByCursorParams {
  cursor: string;
  signal?: AbortSignal;
}

function isTrackResult(value: unknown): value is TrackResult {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.ownerName === "string" &&
    typeof record.imageUrl === "string" &&
    typeof record.pageUrl === "string" &&
    typeof record.embedUrl === "string"
  );
}

function parseSearchResponse(data: unknown): SearchResponse {
  if (typeof data !== "object" || data === null) {
    throw new ApiError(
      "Unexpected response shape from the search API.",
      "unknown",
    );
  }

  const record = data as Record<string, unknown>;
  const items = Array.isArray(record.items) ? record.items : null;

  if (items === null || !items.every(isTrackResult)) {
    throw new ApiError(
      "Unexpected response shape from the search API.",
      "unknown",
    );
  }

  const nextCursor =
    typeof record.nextCursor === "string" ? record.nextCursor : null;
  const previousCursor =
    typeof record.previousCursor === "string" ? record.previousCursor : null;

  return { items, nextCursor, previousCursor };
}

async function handleResponse(response: Response): Promise<SearchResponse> {
  if (!response.ok) {
    const kind = response.status >= 500 ? "server" : "client";
    throw new ApiError(
      `Search request failed with status ${response.status}.`,
      kind,
    );
  }

  const data: unknown = await response.json();
  return parseSearchResponse(data);
}

async function performFetch(
  url: URL,
  signal: AbortSignal | undefined,
): Promise<SearchResponse> {
  try {
    const response = await fetch(url, { signal });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Network error while searching. Check your connection and try again.",
      "network",
    );
  }
}

export function searchByTerm({
  query,
  limit = 6,
  signal,
}: SearchByTermParams): Promise<SearchResponse> {
  const url = new URL(SEARCH_ENDPOINT, API_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  return performFetch(url, signal);
}

export function searchByCursor({
  cursor,
  signal,
}: SearchByCursorParams): Promise<SearchResponse> {
  const url = new URL(SEARCH_ENDPOINT, API_BASE_URL);
  url.searchParams.set("cursor", cursor);
  return performFetch(url, signal);
}
