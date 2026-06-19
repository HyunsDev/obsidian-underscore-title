import type { WorkspaceLeaf } from "obsidian"
import {
  callMethod,
  getPrototypeRecord,
  isCallable,
  readGraphNode,
  readGraphView,
} from "../obsidian-internals"
import type { TitleService } from "../title-service"

type GraphPatch = {
  readonly original: (...args: unknown[]) => unknown
  readonly prototype: Record<string, unknown>
}

export class GraphFeature {
  private patch: GraphPatch | null = null
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
    if (this.patch !== null) {
      this.patch.prototype["getDisplayText"] = this.patch.original
      this.patch = null
    }
  }

  public refresh(): void {
    if (!this.enabled) {
      return
    }

    this.patchGraphNodePrototype()
    for (const view of this.getGraphViews()) {
      view.onIframeLoad?.()
    }
  }

  private patchGraphNodePrototype(): void {
    if (this.patch !== null) {
      return
    }

    const node = this.getGraphViews()
      .flatMap((view) => view.nodes)
      .map(readGraphNode)
      .find(isPresent)
    if (node === undefined) {
      return
    }

    const prototype = getPrototypeRecord(node.record)
    const original = prototype?.["getDisplayText"]
    if (prototype === null || !isCallable(original)) {
      return
    }

    const service = this.titleService
    prototype["getDisplayText"] = function getDisplayText(...args: unknown[]): unknown {
      const current = readGraphNode(this)
      if (current !== null) {
        const title = service.resolvePath(current.id)
        if (title !== null) {
          return title.title
        }
      }
      return callMethod(original, this, args)
    }
    this.patch = { original, prototype }
  }

  private getGraphViews() {
    return this.getLeaves()
      .map((leaf) => readGraphView(leaf.view))
      .filter((view) => view !== null)
  }
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}
