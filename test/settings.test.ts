import { LANGUAGE_MODE, SORT_MODE } from "../src/constants"
import { DEFAULT_SETTINGS, parseSettings } from "../src/settings"

describe("parseSettings", () => {
  it("repairs invalid stored values with defaults", () => {
    const settings = parseSettings({
      delimiter: "",
      explorerSort: "unknown",
      features: { explorer: false, graph: "yes" },
      ignoreRules: ["Archive/**"],
      language: "ko",
      titleKey: "  ",
    })

    expect(settings).toEqual({
      ...DEFAULT_SETTINGS,
      explorerSort: SORT_MODE.OriginalName,
      features: {
        ...DEFAULT_SETTINGS.features,
        explorer: false,
      },
      ignoreRules: ["Archive/**"],
      language: LANGUAGE_MODE.Korean,
    })
  })
})
