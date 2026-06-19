export type PathRules = {
  readonly ignore: readonly string[]
  readonly include: readonly string[]
}

export type PathRuleResult =
  | { readonly kind: "included"; readonly rule: string | null }
  | { readonly kind: "ignored"; readonly rule: string }
  | { readonly kind: "excluded_by_include"; readonly rule: null }

export function evaluatePathRules(path: string, rules: PathRules): PathRuleResult {
  const ignoreRule = findMatchingRule(path, rules.ignore)
  if (ignoreRule !== null) {
    return { kind: "ignored", rule: ignoreRule }
  }

  if (rules.include.length === 0) {
    return { kind: "included", rule: null }
  }

  const includeRule = findMatchingRule(path, rules.include)
  return includeRule !== null
    ? { kind: "included", rule: includeRule }
    : { kind: "excluded_by_include", rule: null }
}

export function isPathAllowed(path: string, rules: PathRules): boolean {
  return evaluatePathRules(path, rules).kind === "included"
}

function findMatchingRule(path: string, rules: readonly string[]): string | null {
  for (const rawRule of rules) {
    const rule = rawRule.trim()
    if (rule.length > 0 && globMatches(path, rule)) {
      return rule
    }
  }

  return null
}

function globMatches(path: string, glob: string): boolean {
  const pattern = glob
    .split("/")
    .map((segment) => {
      if (segment === "**") {
        return "(?:[^/]+/)*[^/]*"
      }
      return escapeRegExp(segment).replaceAll("\\*", "[^/]*").replaceAll("\\?", "[^/]")
    })
    .join("/")

  return new RegExp(`^${pattern}$`).test(path)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
