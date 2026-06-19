import { TFile, TFolder, type WorkspaceLeaf } from "obsidian"
import { SORT_MODE } from "../constants"
import {
  type ExplorerItemState,
  type ExplorerViewState,
  getPrototypeRecord,
  isCallable,
  readExplorerItem,
  readExplorerView,
  readFolderArgument,
} from "../obsidian-internals"
import type { UnderscoreTitleSettings } from "../settings"
import type { TitleService } from "../title-service"

type MethodPatch = {
  readonly hadOwnMethod: boolean
  readonly original: (...args: unknown[]) => unknown
}

export class ExplorerFeature {
  private readonly itemPatches = new WeakMap<object, ExplorerItemState>()
  private readonly sortPatches = new WeakMap<object, MethodPatch>()
  private enabled = false

  public constructor(
    private readonly getLeaves: () => readonly WorkspaceLeaf[],
    private readonly getSettings: () => UnderscoreTitleSettings,
    private readonly titleService: TitleService,
  ) {}

  public enable(): void {
    this.enabled = true
    this.refresh()
  }

  public disable(): void {
    this.enabled = false
    this.restoreItems()
    this.restoreSorts()
  }

  public refresh(): void {
    if (!this.enabled) {
      return
    }

    for (const view of this.getExplorerViews()) {
      this.patchSort(view)
      for (const item of Object.values(view.fileItems)) {
        this.patchItem(item)
      }
      view.requestSort?.()
    }
  }

  private patchItem(item: unknown): void {
    const state = readExplorerItem(item)
    if (state === null || this.itemPatches.has(state.record)) {
      if (state !== null) {
        state.originalUpdateTitle.call(state.record)
      }
      return
    }

    const feature = this
    state.record["updateTitle"] = function updateTitle(): void {
      state.originalUpdateTitle.call(this)
      feature.applyItemTitle(state)
    }

    if (state.originalStartRename !== null) {
      state.record["startRename"] = function startRename(...args: unknown[]): unknown {
        state.innerEl.textContent =
          state.file instanceof TFile ? state.file.basename : state.file.name
        return state.originalStartRename?.apply(this, args)
      }
    }

    this.itemPatches.set(state.record, state)
    state.originalUpdateTitle.call(state.record)
    this.applyItemTitle(state)
  }

  private applyItemTitle(state: ExplorerItemState): void {
    const title = this.titleService.resolveFile(state.file)
    if (title !== null) {
      state.innerEl.textContent = title.title
    }
  }

  private patchSort(view: ExplorerViewState): void {
    if (this.getSettings().explorerSort !== SORT_MODE.DisplayTitle) {
      return
    }

    const original = readSortMethod(view)
    if (original === null || this.sortPatches.has(view.record)) {
      return
    }

    const feature = this
    this.sortPatches.set(view.record, {
      hadOwnMethod: Object.hasOwn(view.record, "getSortedFolderItems"),
      original,
    })
    view.record["getSortedFolderItems"] = function getSortedFolderItems(
      ...args: unknown[]
    ): unknown {
      const folder = readFolderArgument(args[0])
      return folder === null
        ? original.apply(this, args)
        : feature.sortFolderItems(view, folder, original, this)
    }
  }

  private sortFolderItems(
    view: ExplorerViewState,
    folder: TFolder,
    original: (...args: unknown[]) => unknown,
    thisArg: unknown,
  ): unknown {
    const sortOrder = view.sortOrder
    if (sortOrder !== "alphabetical" && sortOrder !== "alphabeticalReverse") {
      return original.call(thisArg, folder)
    }

    const multiplier = sortOrder === "alphabetical" ? 1 : -1
    return [...folder.children]
      .filter(isSortableFile)
      .sort((left, right) => this.compareFiles(left, right) * multiplier)
      .map((file) => view.fileItems[file.path])
      .filter((item) => item !== undefined)
  }

  private compareFiles(left: TFile | TFolder, right: TFile | TFolder): number {
    if (left instanceof TFolder && right instanceof TFile) {
      return -1
    }
    if (left instanceof TFile && right instanceof TFolder) {
      return 1
    }
    return this.displayTitle(left).localeCompare(this.displayTitle(right))
  }

  private displayTitle(file: TFile | TFolder): string {
    return (
      this.titleService.resolveFile(file)?.title ??
      (file instanceof TFile ? file.basename : file.name)
    )
  }

  private getExplorerViews(): readonly ExplorerViewState[] {
    return this.getLeaves()
      .map((leaf) => readExplorerView(leaf.view))
      .filter((view) => view !== null)
  }

  private restoreItems(): void {
    for (const view of this.getExplorerViews()) {
      for (const item of Object.values(view.fileItems)) {
        const state = readExplorerItem(item)
        if (state === null || !this.itemPatches.has(state.record)) {
          continue
        }
        state.record["updateTitle"] = state.originalUpdateTitle
        if (state.originalStartRename !== null) {
          state.record["startRename"] = state.originalStartRename
        }
        this.itemPatches.delete(state.record)
        state.originalUpdateTitle.call(state.record)
      }
    }
  }

  private restoreSorts(): void {
    for (const view of this.getExplorerViews()) {
      const patch = this.sortPatches.get(view.record)
      if (patch === undefined) {
        continue
      }
      if (patch.hadOwnMethod) {
        view.record["getSortedFolderItems"] = patch.original
      } else {
        delete view.record["getSortedFolderItems"]
      }
      this.sortPatches.delete(view.record)
      view.requestSort?.()
    }
  }
}

function isSortableFile(file: unknown): file is TFile | TFolder {
  return file instanceof TFile || file instanceof TFolder
}

function readSortMethod(view: ExplorerViewState): ((...args: unknown[]) => unknown) | null {
  const own = view.record["getSortedFolderItems"]
  if (isCallable(own)) {
    return own
  }

  const prototype = getPrototypeRecord(view.record)
  const inherited = prototype?.["getSortedFolderItems"]
  return isCallable(inherited) ? inherited : null
}
