import { ITEM_KIND, type ItemKind, TITLE_SOURCE, type TitleSource } from "./constants"

export type Frontmatter = Readonly<Record<string, unknown>>

export type ResolveTitleInput = {
  readonly basename: string
  readonly delimiter: string
  readonly frontmatter?: Frontmatter | undefined
  readonly kind: ItemKind
  readonly titleKey: string
}

export type ResolvedTitle = {
  readonly source: TitleSource
  readonly title: string
}

export function resolveDisplayTitle(input: ResolveTitleInput): ResolvedTitle {
  const frontmatterTitle = input.kind === ITEM_KIND.File ? getFrontmatterTitle(input) : null
  if (frontmatterTitle !== null) {
    return { source: TITLE_SOURCE.Frontmatter, title: frontmatterTitle }
  }

  const delimiterTitle = getDelimiterTitle(input.basename, input.delimiter)
  if (delimiterTitle !== null) {
    return { source: TITLE_SOURCE.Delimiter, title: delimiterTitle }
  }

  return { source: TITLE_SOURCE.Original, title: input.basename }
}

function getFrontmatterTitle(input: ResolveTitleInput): string | null {
  const raw = input.frontmatter?.[input.titleKey]
  return coerceTitleValue(raw)
}

function getDelimiterTitle(basename: string, delimiter: string): string | null {
  if (delimiter.length === 0) {
    return null
  }

  const delimiterIndex = basename.indexOf(delimiter)
  if (delimiterIndex < 0) {
    return null
  }

  const title = basename.slice(delimiterIndex + delimiter.length).trim()
  return title.length > 0 ? title : null
}

function coerceTitleValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const title = coerceTitleValue(item)
      if (title !== null) {
        return title
      }
    }
  }

  return null
}
