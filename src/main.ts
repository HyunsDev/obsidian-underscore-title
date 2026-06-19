import { Notice, Plugin } from "obsidian"
import { FeatureCoordinator } from "./features/coordinator"
import { createTranslator, type Translator } from "./i18n"
import { DEFAULT_SETTINGS, parseSettings, type UnderscoreTitleSettings } from "./settings"
import { UnderscoreTitleSettingTab } from "./settings-tab"
import { TitleService } from "./title-service"

export default class UnderscoreTitlePlugin extends Plugin {
  public settings: UnderscoreTitleSettings = DEFAULT_SETTINGS
  public t: Translator = createTranslator(DEFAULT_SETTINGS.language)
  private coordinator: FeatureCoordinator | null = null

  public override async onload(): Promise<void> {
    await this.loadSettings()

    const titleService = new TitleService(this.app, () => this.settings)
    this.coordinator = new FeatureCoordinator(
      (type) => this.app.workspace.getLeavesOfType(type),
      () => this.settings,
      titleService,
    )

    this.addSettingTab(new UnderscoreTitleSettingTab(this.app, this))
    this.addCommand({
      callback: () => {
        this.refresh()
        new Notice(this.t("command.refresh"))
      },
      id: "refresh-displayed-titles",
      name: this.t("command.refresh"),
    })

    this.registerEvents()
    this.app.workspace.onLayoutReady(() => {
      this.coordinator?.apply(this.settings)
    })
  }

  public override onunload(): void {
    this.coordinator?.disable()
  }

  public getSettings(): UnderscoreTitleSettings {
    return this.settings
  }

  public async updateSettings(settings: UnderscoreTitleSettings): Promise<void> {
    this.settings = settings
    this.t = createTranslator(settings.language)
    await this.saveData(settings)
    this.coordinator?.apply(settings)
    this.refresh()
  }

  private async loadSettings(): Promise<void> {
    const loaded: unknown = await this.loadData()
    this.settings = parseSettings(loaded)
    this.t = createTranslator(this.settings.language)
    await this.saveData(this.settings)
  }

  private registerEvents(): void {
    this.registerEvent(this.app.workspace.on("layout-change", () => this.refresh()))
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.refresh()))
    this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()))
    this.registerEvent(this.app.vault.on("rename", () => this.refresh()))
  }

  private refresh(): void {
    if (this.settings.debug) {
      console.debug("[underscore-title] refresh displayed titles")
    }
    this.coordinator?.refresh()
  }
}
