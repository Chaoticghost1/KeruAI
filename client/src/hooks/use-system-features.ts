import { useQuery } from "@tanstack/react-query";

export const FEATURE_KEYS = [
  "revision_materials",
  "studybuddy_ai",
  "budget_tracker",
  "games",
  "content_management",
  "travel_blog",
  "dao_access",
  "admin_panel",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface SystemFeatures {
  revision_materials: boolean;
  studybuddy_ai: boolean;
  budget_tracker: boolean;
  games: boolean;
  content_management: boolean;
  travel_blog: boolean;
  dao_access: boolean;
  admin_panel: boolean;
}

const defaultFeatures: SystemFeatures = {
  revision_materials: true,
  studybuddy_ai: true,
  budget_tracker: true,
  games: true,
  content_management: true,
  travel_blog: true,
  dao_access: true,
  admin_panel: true,
};

export function useSystemFeatures(): SystemFeatures {
  const { data } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/system/features"],
    staleTime: 60_000,
    placeholderData: defaultFeatures,
  });
  if (!data || typeof data !== "object") return defaultFeatures;
  return {
    revision_materials: data.revision_materials !== false,
    studybuddy_ai: data.studybuddy_ai !== false,
    budget_tracker: data.budget_tracker !== false,
    games: data.games !== false,
    content_management: data.content_management !== false,
    travel_blog: data.travel_blog !== false,
    dao_access: data.dao_access !== false,
    admin_panel: data.admin_panel !== false,
  };
}

/** Map sidebar nav key to feature flag key */
export const NAV_TO_FEATURE: Record<string, FeatureKey> = {
  revision: "revision_materials",
  study: "studybuddy_ai",
  budget: "budget_tracker",
  game: "games",
  travel: "travel_blog",
  dao: "dao_access",
};
