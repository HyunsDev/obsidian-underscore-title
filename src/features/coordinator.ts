import type { WorkspaceLeaf } from "obsidian"
import type { UnderscoreTitleSettings } from "../settings"
import type { TitleService } from "../title-service"
import { ExplorerFeature } from "./explorer"
import { GraphFeature } from "./graph"
import { TabsFeature } from "./tabs"

export class FeatureCoordinator {
  private readonly explorer: ExplorerFeature
  private readonly graph: GraphFeature
  private readonly tabs: TabsFeature

  public constructor(
    getLeavesOfType: (type: string) => readonly WorkspaceLeaf[],
    getSettings: () => UnderscoreTitleSettings,
    titleService: TitleService,
  ) {
    this.explorer = new ExplorerFeature(
      () => getLeavesOfType("file-explorer"),
      getSettings,
      titleService,
    )
    this.graph = new GraphFeature(
      () => [...getLeavesOfType("graph"), ...getLeavesOfType("localgraph")],
      titleService,
    )
    this.tabs = new TabsFeature(() => getLeavesOfType("markdown"), titleService)
  }

  public apply(settings: UnderscoreTitleSettings): void {
    settings.features.explorer ? this.explorer.enable() : this.explorer.disable()
    settings.features.graph ? this.graph.enable() : this.graph.disable()
    settings.features.tabs ? this.tabs.enable() : this.tabs.disable()
  }

  public refresh(): void {
    this.explorer.refresh()
    this.graph.refresh()
    this.tabs.refresh()
  }

  public disable(): void {
    this.explorer.disable()
    this.graph.disable()
    this.tabs.disable()
  }
}
