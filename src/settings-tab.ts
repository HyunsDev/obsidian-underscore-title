import {
  type App,
  type Plugin,
  PluginSettingTab,
  type SettingDefinition,
  type SettingDefinitionItem,
  type SettingGroupItem,
} from "obsidian"
import { ITEM_KIND, LANGUAGE_MODE, SORT_MODE } from "./constants"
import type { Translator } from "./i18n"
import type { UnderscoreTitleSettings } from "./settings"
import {
  type SettingKey,
  splitRules,
  textSetting,
  toggleSetting,
  updateSetting,
} from "./settings-bindings"
import { resolveDisplayTitle } from "./title-resolver"

export interface SettingsHost {
  readonly app: App
  readonly t: Translator
  getSettings(): UnderscoreTitleSettings
  updateSettings(settings: UnderscoreTitleSettings): Promise<void>
}

export class UnderscoreTitleSettingTab extends PluginSettingTab {
  public constructor(
    app: App,
    private readonly host: SettingsHost & Plugin,
  ) {
    super(app, host)
  }

  public override getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
    const t = this.host.t
    return [
      {
        heading: t("settings.group.title"),
        items: [
          textSetting("delimiter", t("settings.delimiter.name"), t("settings.delimiter.desc")),
          textSetting("titleKey", t("settings.titleKey.name"), t("settings.titleKey.desc")),
          {
            name: t("settings.language.name"),
            desc: t("settings.language.desc"),
            control: {
              defaultValue: LANGUAGE_MODE.Auto,
              key: "language",
              options: {
                [LANGUAGE_MODE.Auto]: t("settings.language.option.auto"),
                [LANGUAGE_MODE.English]: t("settings.language.option.en"),
                [LANGUAGE_MODE.Korean]: t("settings.language.option.ko"),
              },
              type: "dropdown",
            },
          },
          textSetting(
            "previewName",
            t("settings.preview.name.name"),
            t("settings.preview.name.desc"),
          ),
          textSetting(
            "previewFrontmatterTitle",
            t("settings.preview.frontmatter.name"),
            t("settings.preview.frontmatter.desc"),
          ),
          this.previewDefinition(),
        ] satisfies SettingGroupItem<SettingKey>[],
        type: "group",
      },
      {
        heading: t("settings.group.features"),
        items: [
          toggleSetting(
            "features.explorer",
            t("settings.explorer.name"),
            t("settings.explorer.desc"),
          ),
          {
            name: t("settings.sort.name"),
            desc: t("settings.sort.desc"),
            control: {
              defaultValue: SORT_MODE.OriginalName,
              key: "explorerSort",
              options: {
                [SORT_MODE.OriginalName]: t("settings.sort.option.original"),
                [SORT_MODE.DisplayTitle]: t("settings.sort.option.display"),
              },
              type: "dropdown",
            },
          },
          toggleSetting("features.graph", t("settings.graph.name"), t("settings.graph.desc")),
          toggleSetting("features.tabs", t("settings.tabs.name"), t("settings.tabs.desc")),
          toggleSetting("debug", t("settings.debug.name"), t("settings.debug.desc")),
        ] satisfies SettingGroupItem<SettingKey>[],
        type: "group",
      },
      {
        heading: t("settings.group.rules"),
        items: [
          this.rulesDefinition(
            "includeRules",
            t("settings.include.name"),
            t("settings.include.desc"),
          ),
          this.rulesDefinition("ignoreRules", t("settings.ignore.name"), t("settings.ignore.desc")),
        ] satisfies SettingGroupItem<SettingKey>[],
        type: "group",
      },
    ]
  }

  public override getControlValue(key: string): unknown {
    const settings = this.host.getSettings()
    switch (key) {
      case "debug":
        return settings.debug
      case "delimiter":
        return settings.delimiter
      case "explorerSort":
        return settings.explorerSort
      case "features.explorer":
        return settings.features.explorer
      case "features.graph":
        return settings.features.graph
      case "features.tabs":
        return settings.features.tabs
      case "language":
        return settings.language
      case "previewFrontmatterTitle":
        return settings.previewFrontmatterTitle
      case "previewName":
        return settings.previewName
      case "titleKey":
        return settings.titleKey
      default:
        return undefined
    }
  }

  public override async setControlValue(key: string, value: unknown): Promise<void> {
    const settings = this.host.getSettings()
    const next = updateSetting(settings, key, value)
    await this.host.updateSettings(next)
    this.update()
  }

  private previewDefinition(): SettingDefinition<SettingKey> {
    const t = this.host.t
    return {
      name: t("settings.preview.result"),
      render: (setting) => {
        const settings = this.host.getSettings()
        const frontmatterTitle = settings.previewFrontmatterTitle.trim()
        const result = resolveDisplayTitle({
          basename: settings.previewName,
          delimiter: settings.delimiter,
          frontmatter:
            frontmatterTitle.length > 0 ? { [settings.titleKey]: frontmatterTitle } : undefined,
          kind: ITEM_KIND.File,
          titleKey: settings.titleKey,
        })
        setting.setDesc(`${t("settings.preview.source")}: ${result.source}`)
        setting.controlEl.createEl("code", { text: result.title })
      },
    }
  }

  private rulesDefinition(
    key: "ignoreRules" | "includeRules",
    name: string,
    desc: string,
  ): SettingDefinition<SettingKey> {
    return {
      desc,
      name,
      render: (setting) => {
        const settings = this.host.getSettings()
        setting.addTextArea((text) => {
          text.inputEl.rows = 5
          text
            .setPlaceholder("Projects/**")
            .setValue(settings[key].join("\n"))
            .onChange(async (value) => {
              await this.host.updateSettings({ ...settings, [key]: splitRules(value) })
            })
        })
      },
    }
  }
}
