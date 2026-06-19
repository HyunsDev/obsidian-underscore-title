import type { SettingDefinition } from "obsidian"
import { LANGUAGE_MODE, SORT_MODE } from "./constants"
import type { UnderscoreTitleSettings } from "./settings"

export type SettingKey =
  | "debug"
  | "delimiter"
  | "explorerSort"
  | "features.explorer"
  | "features.graph"
  | "features.tabs"
  | "language"
  | "previewFrontmatterTitle"
  | "previewName"
  | "titleKey"

export function textSetting(
  key: SettingKey,
  name: string,
  desc: string,
): SettingDefinition<SettingKey> {
  return {
    control: {
      key,
      type: "text",
      validate: (value) => (value.trim().length === 0 ? "Required." : undefined),
    },
    desc,
    name,
  }
}

export function toggleSetting(
  key: SettingKey,
  name: string,
  desc: string,
): SettingDefinition<SettingKey> {
  return {
    control: {
      key,
      type: "toggle",
    },
    desc,
    name,
  }
}

export function updateSetting(
  settings: UnderscoreTitleSettings,
  key: string,
  value: unknown,
): UnderscoreTitleSettings {
  switch (key) {
    case "debug":
      return typeof value === "boolean" ? { ...settings, debug: value } : settings
    case "delimiter":
      return typeof value === "string" && value.length > 0
        ? { ...settings, delimiter: value }
        : settings
    case "explorerSort":
      return value === SORT_MODE.DisplayTitle || value === SORT_MODE.OriginalName
        ? { ...settings, explorerSort: value }
        : settings
    case "features.explorer":
    case "features.graph":
    case "features.tabs":
      return typeof value === "boolean" ? updateFeature(settings, key, value) : settings
    case "language":
      return value === LANGUAGE_MODE.Auto ||
        value === LANGUAGE_MODE.English ||
        value === LANGUAGE_MODE.Korean
        ? { ...settings, language: value }
        : settings
    case "previewFrontmatterTitle":
      return typeof value === "string" ? { ...settings, previewFrontmatterTitle: value } : settings
    case "previewName":
      return typeof value === "string" && value.length > 0
        ? { ...settings, previewName: value }
        : settings
    case "titleKey":
      return typeof value === "string" && value.trim().length > 0
        ? { ...settings, titleKey: value.trim() }
        : settings
    default:
      return settings
  }
}

export function splitRules(value: string): readonly string[] {
  return value
    .split("\n")
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0)
}

function updateFeature(
  settings: UnderscoreTitleSettings,
  key: "features.explorer" | "features.graph" | "features.tabs",
  value: boolean,
): UnderscoreTitleSettings {
  switch (key) {
    case "features.explorer":
      return { ...settings, features: { ...settings.features, explorer: value } }
    case "features.graph":
      return { ...settings, features: { ...settings.features, graph: value } }
    case "features.tabs":
      return { ...settings, features: { ...settings.features, tabs: value } }
  }
}
