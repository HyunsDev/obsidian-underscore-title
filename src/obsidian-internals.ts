import { TAbstractFile, TFolder } from "obsidian"

export type ExplorerItemState = {
  readonly file: TAbstractFile
  readonly innerEl: HTMLElement
  readonly originalStartRename: Callable | null
  readonly originalUpdateTitle: Callable
  readonly record: Record<string, unknown>
}

export type ExplorerViewState = {
  readonly fileItems: Record<string, unknown>
  readonly record: Record<string, unknown>
  readonly requestSort: Callable | null
  readonly sortOrder: string | null
}

export type GraphNodeState = {
  readonly id: string
  readonly record: Record<string, unknown>
}

export type GraphViewState = {
  readonly nodes: readonly unknown[]
  readonly onIframeLoad: Callable | null
}

export type TabLeafState = {
  readonly file: TAbstractFile
  readonly titleEl: HTMLElement
}

type Callable = (...args: unknown[]) => unknown

export function readExplorerView(view: unknown): ExplorerViewState | null {
  if (!isRecord(view) || !isRecord(view["fileItems"])) {
    return null
  }

  return {
    fileItems: view["fileItems"],
    record: view,
    requestSort: readCallable(view["requestSort"]),
    sortOrder: typeof view["sortOrder"] === "string" ? view["sortOrder"] : null,
  }
}

export function readExplorerItem(item: unknown): ExplorerItemState | null {
  if (
    !isRecord(item) ||
    !(item["file"] instanceof TAbstractFile) ||
    !(item["innerEl"] instanceof HTMLElement)
  ) {
    return null
  }

  const updateTitle = readCallable(item["updateTitle"])
  if (updateTitle === null) {
    return null
  }

  return {
    file: item["file"],
    innerEl: item["innerEl"],
    originalStartRename: readCallable(item["startRename"]),
    originalUpdateTitle: updateTitle,
    record: item,
  }
}

export function readGraphView(view: unknown): GraphViewState | null {
  if (!isRecord(view) || !isRecord(view["renderer"])) {
    return null
  }

  const nodes = Array.isArray(view["renderer"]["nodes"]) ? view["renderer"]["nodes"] : []
  return {
    nodes,
    onIframeLoad: readCallable(view["renderer"]["onIframeLoad"]),
  }
}

export function readGraphNode(node: unknown): GraphNodeState | null {
  if (!isRecord(node) || typeof node["id"] !== "string") {
    return null
  }
  return { id: node["id"], record: node }
}

export function readTabLeaf(leaf: unknown): TabLeafState | null {
  if (!isRecord(leaf) || !isRecord(leaf["view"])) {
    return null
  }

  const file = leaf["view"]["file"]
  const titleEl = leaf["tabHeaderInnerTitleEl"]
  return file instanceof TAbstractFile && titleEl instanceof HTMLElement ? { file, titleEl } : null
}

export function readFolderArgument(value: unknown): TFolder | null {
  return value instanceof TFolder ? value : null
}

export function getPrototypeRecord(value: Record<string, unknown>): Record<string, unknown> | null {
  const prototype = Object.getPrototypeOf(value)
  return isRecord(prototype) ? prototype : null
}

export function callMethod(
  method: Callable,
  thisArg: unknown,
  args: readonly unknown[] = [],
): unknown {
  return method.apply(thisArg, [...args])
}

function readCallable(value: unknown): Callable | null {
  return isCallable(value) ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function isCallable(value: unknown): value is Callable {
  return typeof value === "function"
}
