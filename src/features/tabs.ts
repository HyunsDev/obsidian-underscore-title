import { TFile, type WorkspaceLeaf } from "obsidian"
import { readTabLeaf } from "../obsidian-internals"
import type { TitleService } from "../title-service"

export class TabsFeature {
  private enabled = false

  public constructor(
    private readonly getLeaves: () => readonly WorkspaceLeaf[],
    private readonly titleService: TitleService,
  ) {}

  public enable(): void {
    this.enabled = true
    this.refresh()
  }

  public disable(): void {
    this.enabled = false
    this.refresh()
  }

  public refresh(): void {
    for (const leaf of this.getLeaves()) {
      const tab = readTabLeaf(leaf)
      if (tab === null) {
        continue
      }

      const title = this.enabled ? this.titleService.resolveFile(tab.file) : null
      tab.titleEl.textContent =
        title?.title ?? (tab.file instanceof TFile ? tab.file.basename : tab.file.name)
    }
  }
}
