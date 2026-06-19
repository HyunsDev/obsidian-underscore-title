export const TITLE_SOURCE = {
  Delimiter: "delimiter",
  Frontmatter: "frontmatter",
  Original: "original",
} as const

export type TitleSource = (typeof TITLE_SOURCE)[keyof typeof TITLE_SOURCE]

export const ITEM_KIND = {
  File: "file",
  Folder: "folder",
} as const

export type ItemKind = (typeof ITEM_KIND)[keyof typeof ITEM_KIND]

export const LANGUAGE_MODE = {
  Auto: "auto",
  English: "en",
  Korean: "ko",
} as const

export type LanguageMode = (typeof LANGUAGE_MODE)[keyof typeof LANGUAGE_MODE]

export const SORT_MODE = {
  DisplayTitle: "display-title",
  OriginalName: "original-name",
} as const

export type SortMode = (typeof SORT_MODE)[keyof typeof SORT_MODE]
