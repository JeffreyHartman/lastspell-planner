export interface SavedBuild {
  id: string;
  name: string;
  query: string;
  createdAt: string;
  updatedAt: string;
}

interface SaveBuildInput {
  id?: string;
  name: string;
  query: string;
}

const STORAGE_KEY = "tls-planner.saved-builds.v1";
const DEFAULT_BUILD_NAME = "Untitled Build";

const sanitizeBuildName = (rawName: string): string => {
  const trimmedName = rawName.trim();
  return trimmedName.length > 0 ? trimmedName : DEFAULT_BUILD_NAME;
};

const sanitizeQuery = (rawQuery: string): string => {
  return rawQuery.startsWith("?") ? rawQuery.slice(1) : rawQuery;
};

const createBuildId = (): string => {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return randomUuid;
  }

  return `build-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeStoredBuild = (rawValue: unknown): SavedBuild | null => {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const candidate = rawValue as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id : "";
  const name =
    typeof candidate.name === "string"
      ? sanitizeBuildName(candidate.name)
      : DEFAULT_BUILD_NAME;
  const query =
    typeof candidate.query === "string" ? sanitizeQuery(candidate.query) : "";
  const createdAt =
    typeof candidate.createdAt === "string" ? candidate.createdAt : "";
  const updatedAt =
    typeof candidate.updatedAt === "string" ? candidate.updatedAt : "";

  if (!id) {
    return null;
  }

  return {
    id,
    name,
    query,
    createdAt,
    updatedAt,
  };
};

const sortBuildsByUpdatedAt = (builds: SavedBuild[]): SavedBuild[] => {
  return [...builds].sort((leftBuild, rightBuild) => {
    return rightBuild.updatedAt.localeCompare(leftBuild.updatedAt);
  });
};

const persistBuilds = (builds: SavedBuild[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
};

export const getSavedBuilds = (): SavedBuild[] => {
  const serializedBuilds = localStorage.getItem(STORAGE_KEY);
  if (!serializedBuilds) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(serializedBuilds) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortBuildsByUpdatedAt(
      parsedValue
        .map((rawBuild) => normalizeStoredBuild(rawBuild))
        .filter((build): build is SavedBuild => Boolean(build)),
    );
  } catch {
    return [];
  }
};

export const saveBuild = (input: SaveBuildInput): SavedBuild => {
  const now = new Date().toISOString();
  const currentBuilds = getSavedBuilds();
  const normalizedName = sanitizeBuildName(input.name);
  const normalizedQuery = sanitizeQuery(input.query);

  if (input.id) {
    const existingBuildIndex = currentBuilds.findIndex(
      (build) => build.id === input.id,
    );

    if (existingBuildIndex >= 0) {
      const existingBuild = currentBuilds[existingBuildIndex];
      const updatedBuild: SavedBuild = {
        ...existingBuild,
        name: normalizedName,
        query: normalizedQuery,
        updatedAt: now,
      };

      const nextBuilds = [...currentBuilds];
      nextBuilds[existingBuildIndex] = updatedBuild;
      persistBuilds(nextBuilds);
      return updatedBuild;
    }
  }

  const createdBuild: SavedBuild = {
    id: createBuildId(),
    name: normalizedName,
    query: normalizedQuery,
    createdAt: now,
    updatedAt: now,
  };

  persistBuilds([createdBuild, ...currentBuilds]);
  return createdBuild;
};

export const getDefaultBuildName = (): string => {
  return DEFAULT_BUILD_NAME;
};
