import { DEFAULT_SETTINGS } from "../src/settings"
import { resolveDisplayTitle } from "../src/title-resolver"

describe("resolveDisplayTitle", () => {
  it("uses frontmatter title before delimiter title for files", () => {
    const result = resolveDisplayTitle({
      basename: "20260619__meeting",
      delimiter: "__",
      frontmatter: { title: "Weekly Meeting" },
      kind: "file",
      titleKey: "title",
    })

    expect(result).toEqual({ source: "frontmatter", title: "Weekly Meeting" })
  })

  it("uses delimiter title when frontmatter title is empty", () => {
    const result = resolveDisplayTitle({
      basename: "20260619__meeting",
      delimiter: "__",
      frontmatter: { title: "   " },
      kind: "file",
      titleKey: "title",
    })

    expect(result).toEqual({ source: "delimiter", title: "meeting" })
  })

  it("uses the first delimiter for names with repeated delimiters", () => {
    const result = resolveDisplayTitle({
      basename: "01__foo__bar",
      delimiter: "__",
      kind: "folder",
      titleKey: DEFAULT_SETTINGS.titleKey,
    })

    expect(result).toEqual({ source: "delimiter", title: "foo__bar" })
  })

  it("keeps the original title when delimiter output is blank", () => {
    const result = resolveDisplayTitle({
      basename: "01__   ",
      delimiter: "__",
      kind: "folder",
      titleKey: DEFAULT_SETTINGS.titleKey,
    })

    expect(result).toEqual({ source: "original", title: "01__   " })
  })
})
