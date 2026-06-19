import { evaluatePathRules } from "../src/path-rules"

describe("evaluatePathRules", () => {
  it("includes every path when no include rules are set", () => {
    const result = evaluatePathRules("Projects/01__Plan.md", {
      ignore: [],
      include: [],
    })

    expect(result).toEqual({ kind: "included", rule: null })
  })

  it("requires at least one include match when include rules are set", () => {
    const result = evaluatePathRules("Archive/old.md", {
      ignore: [],
      include: ["Projects/**"],
    })

    expect(result).toEqual({ kind: "excluded_by_include", rule: null })
  })

  it("lets ignore rules win over include rules", () => {
    const result = evaluatePathRules("Projects/private/Plan.md", {
      ignore: ["Projects/private/**"],
      include: ["Projects/**"],
    })

    expect(result).toEqual({ kind: "ignored", rule: "Projects/private/**" })
  })
})
