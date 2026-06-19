import type { LanguageMode, SortMode } from "./constants"
import { LANGUAGE_MODE, SORT_MODE } from "./constants"

export type FeatureSettings = {
  readonly explorer: boolean
  readonly graph: boolean
  readonly search: boolean
  readonly tabs: boolean
}

export type UnderscoreTitleSettings = {
  readonly debug: boolean
  readonly delimiter: string
  readonly explorerSort: SortMode
  readonly features: FeatureSettings
  readonly ignoreRules: readonly string[]
  readonly includeRules: readonly string[]
  readonly language: LanguageMode
  readonly previewFrontmatterTitle: string
  readonly previewName: string
  readonly titleKey: string
}

export const DEFAULT_SETTINGS: UnderscoreTitleSettings = {
  debug: false,
  delimiter: "__",
  explorerSort: SORT_MODE.OriginalName,
  features: {
    explorer: true,
    graph: true,
    search: false,
    tabs: true,
  },
  ignoreRules: [],
  includeRules: [],
  language: LANGUAGE_MODE.Auto,
  previewFrontmatterTitle: "",
  previewName: "20260619__Meeting note",
  titleKey: "title",
}

export type StoredFeatureSettings = {
  explorer?: boolean
  graph?: boolean
  search?: boolean
  tabs?: boolean
}

export type StoredSettings = {
  debug?: boolean
  delimiter?: string
  explorerSort?: SortMode
  features?: StoredFeatureSettings
  ignoreRules?: readonly string[]
  includeRules?: readonly string[]
  language?: LanguageMode
  previewFrontmatterTitle?: string
  previewName?: string
  titleKey?: string
}

export function parseSettings(value: unknown): UnderscoreTitleSettings {
  if (!isRecord(value)) {
    return DEFAULT_SETTINGS
  }

  const settings: StoredSettings = {}
  put(settings, "debug", readBoolean(value, "debug"))
  put(settings, "delimiter", readString(value, "delimiter"))
  put(settings, "explorerSort", readSortMode(value["explorerSort"]))
  put(settings, "features", readFeatureSettings(value["features"]))
  put(settings, "ignoreRules", readStringArray(value["ignoreRules"]))
  put(settings, "includeRules", readStringArray(value["includeRules"]))
  put(settings, "language", readLanguageMode(value["language"]))
  put(settings, "previewFrontmatterTitle", readString(value, "previewFrontmatterTitle"))
  put(settings, "previewName", readString(value, "previewName"))
  put(settings, "titleKey", readString(value, "titleKey"))
  return normalizeSettings(settings)
}

export function normalizeSettings(input: StoredSettings): UnderscoreTitleSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...input,
    delimiter: input.delimiter?.length ? input.delimiter : DEFAULT_SETTINGS.delimiter,
    features: {
      ...DEFAULT_SETTINGS.features,
      ...input.features,
    },
    ignoreRules: input.ignoreRules ?? DEFAULT_SETTINGS.ignoreRules,
    includeRules: input.includeRules ?? DEFAULT_SETTINGS.includeRules,
    titleKey: input.titleKey?.trim() || DEFAULT_SETTINGS.titleKey,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key]
  return typeof value === "boolean" ? value : undefined
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === "string" ? value : undefined
}

function readStringArray(value: unknown): readonly string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined
}

function readFeatureSettings(value: unknown): StoredFeatureSettings | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const features: StoredFeatureSettings = {}
  put(features, "explorer", typeof value["explorer"] === "boolean" ? value["explorer"] : undefined)
  put(features, "graph", typeof value["graph"] === "boolean" ? value["graph"] : undefined)
  put(features, "search", typeof value["search"] === "boolean" ? value["search"] : undefined)
  put(features, "tabs", typeof value["tabs"] === "boolean" ? value["tabs"] : undefined)
  return features
}

function readLanguageMode(value: unknown): LanguageMode | undefined {
  return value === LANGUAGE_MODE.Auto ||
    value === LANGUAGE_MODE.English ||
    value === LANGUAGE_MODE.Korean
    ? value
    : undefined
}

function readSortMode(value: unknown): SortMode | undefined {
  return value === SORT_MODE.DisplayTitle || value === SORT_MODE.OriginalName ? value : undefined
}

function put<T extends object, K extends keyof T>(
  record: T,
  key: K,
  value: T[K] | undefined,
): void {
  if (value !== undefined) {
    record[key] = value
  }
}
