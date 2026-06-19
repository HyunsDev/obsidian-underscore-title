import { moment } from "obsidian"
import { LANGUAGE_MODE, type LanguageMode } from "./constants"

type Messages = Record<string, string>

const EN = {
  "command.refresh": "Refresh displayed titles",
  "settings.debug.desc": "Log refresh decisions to the developer console.",
  "settings.debug.name": "Debug mode",
  "settings.delimiter.desc": "Text before this separator is hidden in file and folder titles.",
  "settings.delimiter.name": "Delimiter",
  "settings.explorer.desc": "Apply display titles to the file explorer.",
  "settings.explorer.name": "File explorer",
  "settings.graph.desc": "Apply display titles to graph and local graph nodes.",
  "settings.graph.name": "Graph",
  "settings.group.features": "Scopes",
  "settings.group.rules": "Path rules",
  "settings.group.title": "Title resolving",
  "settings.ignore.desc": "One glob per line. Matching paths are never changed.",
  "settings.ignore.name": "Ignore rules",
  "settings.include.desc": "One glob per line. Leave empty to include every path.",
  "settings.include.name": "Include rules",
  "settings.language.desc": "Automatic uses Obsidian's current locale.",
  "settings.language.name": "Language",
  "settings.language.option.auto": "Automatic",
  "settings.language.option.en": "English",
  "settings.language.option.ko": "Korean",
  "settings.preview.frontmatter.desc": "Optional frontmatter title used by the preview.",
  "settings.preview.frontmatter.name": "Preview frontmatter title",
  "settings.preview.name.desc": "A file or folder basename to preview.",
  "settings.preview.name.name": "Preview name",
  "settings.preview.result": "Preview result",
  "settings.preview.source": "Source",
  "settings.search.desc": "Reserved for search and suggest surfaces.",
  "settings.search.name": "Search and suggest",
  "settings.sort.desc": "Choose how files are sorted when Explorer scope is enabled.",
  "settings.sort.name": "Explorer sorting",
  "settings.sort.option.display": "Displayed title",
  "settings.sort.option.original": "Original filename",
  "settings.tabs.desc": "Apply display titles to markdown tab headers.",
  "settings.tabs.name": "Tabs",
  "settings.titleKey.desc": "Frontmatter key that overrides delimiter titles for files.",
  "settings.titleKey.name": "Frontmatter title key",
} as const satisfies Messages

const KO = {
  "command.refresh": "표시 제목 새로고침",
  "settings.debug.desc": "개발자 콘솔에 새로고침 결정을 기록합니다.",
  "settings.debug.name": "디버그 모드",
  "settings.delimiter.desc": "파일/폴더 제목에서 이 구분자 앞의 텍스트를 숨깁니다.",
  "settings.delimiter.name": "구분자",
  "settings.explorer.desc": "파일 탐색기에 표시 제목을 적용합니다.",
  "settings.explorer.name": "파일 탐색기",
  "settings.graph.desc": "그래프와 로컬 그래프 노드에 표시 제목을 적용합니다.",
  "settings.graph.name": "그래프",
  "settings.group.features": "적용 범위",
  "settings.group.rules": "경로 규칙",
  "settings.group.title": "제목 해석",
  "settings.ignore.desc": "한 줄에 glob 하나씩 입력합니다. 일치한 경로는 항상 제외됩니다.",
  "settings.ignore.name": "무시 규칙",
  "settings.include.desc": "한 줄에 glob 하나씩 입력합니다. 비워두면 전체 경로를 포함합니다.",
  "settings.include.name": "포함 규칙",
  "settings.language.desc": "자동은 Obsidian의 현재 언어를 사용합니다.",
  "settings.language.name": "언어",
  "settings.language.option.auto": "자동",
  "settings.language.option.en": "영어",
  "settings.language.option.ko": "한국어",
  "settings.preview.frontmatter.desc": "미리보기에 사용할 선택적 frontmatter 제목입니다.",
  "settings.preview.frontmatter.name": "미리보기 frontmatter 제목",
  "settings.preview.name.desc": "미리볼 파일 또는 폴더 basename입니다.",
  "settings.preview.name.name": "미리보기 이름",
  "settings.preview.result": "미리보기 결과",
  "settings.preview.source": "출처",
  "settings.search.desc": "검색과 제안 UI 적용을 위한 예약 설정입니다.",
  "settings.search.name": "검색과 제안",
  "settings.sort.desc": "Explorer 적용 시 파일 정렬 기준을 선택합니다.",
  "settings.sort.name": "Explorer 정렬",
  "settings.sort.option.display": "표시 제목",
  "settings.sort.option.original": "원래 파일명",
  "settings.tabs.desc": "마크다운 탭 헤더에 표시 제목을 적용합니다.",
  "settings.tabs.name": "탭",
  "settings.titleKey.desc": "파일에서 구분자 제목보다 우선할 frontmatter 키입니다.",
  "settings.titleKey.name": "Frontmatter 제목 키",
} as const satisfies Messages

export type Translator = (key: keyof typeof EN) => string

export function createTranslator(language: LanguageMode): Translator {
  const resolved = language === LANGUAGE_MODE.Auto ? resolveAutomaticLanguage() : language
  const messages = resolved === LANGUAGE_MODE.Korean ? KO : EN
  return (key) => messages[key] ?? EN[key]
}

function resolveAutomaticLanguage(): Exclude<LanguageMode, "auto"> {
  return moment.locale().toLowerCase().startsWith("ko")
    ? LANGUAGE_MODE.Korean
    : LANGUAGE_MODE.English
}
