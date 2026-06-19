import { type App, type TAbstractFile, TFile, TFolder } from "obsidian"
import { ITEM_KIND } from "./constants"
import { isPathAllowed } from "./path-rules"
import type { UnderscoreTitleSettings } from "./settings"
import { type Frontmatter, type ResolvedTitle, resolveDisplayTitle } from "./title-resolver"

export class TitleService {
  public constructor(
    private readonly app: App,
    private readonly getSettings: () => UnderscoreTitleSettings,
  ) {}

  public resolveFile(file: TAbstractFile): ResolvedTitle | null {
    const settings = this.getSettings()
    if (
      !isPathAllowed(file.path, {
        ignore: settings.ignoreRules,
        include: settings.includeRules,
      })
    ) {
      return null
    }

    if (file instanceof TFile) {
      const cache = this.app.metadataCache.getFileCache(file)
      const frontmatter = isRecord(cache?.frontmatter) ? cache.frontmatter : undefined
      return resolveDisplayTitle({
        basename: file.basename,
        delimiter: settings.delimiter,
        frontmatter,
        kind: ITEM_KIND.File,
        titleKey: settings.titleKey,
      })
    }

    if (file instanceof TFolder) {
      return resolveDisplayTitle({
        basename: file.name,
        delimiter: settings.delimiter,
        kind: ITEM_KIND.Folder,
        titleKey: settings.titleKey,
      })
    }

    return null
  }

  public resolvePath(path: string): ResolvedTitle | null {
    const file = this.app.vault.getAbstractFileByPath(path)
    return file === null ? null : this.resolveFile(file)
  }
}

function isRecord(value: unknown): value is Frontmatter {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
