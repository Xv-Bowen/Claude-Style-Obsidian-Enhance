/*
Claude Style Enhance, for the Claude Style theme for Obsidian
https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance
Written by Xv-Bowen (https://github.com/Xv-Bowen)
Copyright (c) 2026 Xv-Bowen
Licensed under CC BY-NC-ND 4.0: https://creativecommons.org/licenses/by-nc-nd/4.0/
SPDX-License-Identifier: CC-BY-NC-ND-4.0
Not affiliated with Anthropic
*/

"use strict";

const { obsidian, cmView, cmState, cmLanguage, themeOn, chinese, state, redraw } = (() => {
const obsidian = require("obsidian");
const cmView = require("@codemirror/view");
const cmState = require("@codemirror/state");
const cmLanguage = require("@codemirror/language");

const themeOn = () => getComputedStyle(document.body).getPropertyValue("--claude-style").trim() !== "";

function chinese() {
  return obsidian.getLanguage() === "zh";
}

const state = {
  version: 0,
  unloaded: false,
};

function redraw(app) {
  state.version++;
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const view = leaf.view ;
    view.previewMode?.rerender(true);
    view.editor?.cm?.dispatch({});
  }
}
return { obsidian, cmView, cmState, cmLanguage, themeOn, chinese, state, redraw };
})();

const { extensionOf, cardName, fileCardInfo, isWidePicture, isFileTarget } = (() => {
const words = (text) => new Set(text.split(" "));

const ARCHIVE = words("zip tar gz bz2 xz 7z rar tgz");
const SLIDES = words("ppt pptx");
const DATA = words("jsonl parquet db sqlite sqlite3");
const TABLE = words("csv tsv");
const CODE = words(
  "js jsx gs ts tsx py rb go rs c cpp h hpp java kt swift sh bash zsh json yaml yml toml xml html css scss sql graphql " +
    "proto lua r cs vue pl php htm xhtml",
);
const DOCS = words("pdf md markdown txt log rtf doc docx odt pages rst tex epub");
const MEDIA = words("mp4 mov webm mkv avi m4v ogv 3gp mp3 wav ogg oga opus flac aac m4a wma aiff");
const SHEETS = words("xls xlsx");
const PICTURES = words("mermaid mmd svg png jpg jpeg gif bmp webp");
const THUMBNAILS = words("png jpg jpeg gif webp bmp svg");

function category(ext) {
  if (ARCHIVE.has(ext)) return "archive";
  if (SLIDES.has(ext)) return "slides";
  if (DATA.has(ext)) return "data";
  if (TABLE.has(ext)) return "table";
  if (CODE.has(ext)) return "code";
  if (ext === "ico") return "image";
  if (DOCS.has(ext) || MEDIA.has(ext)) return "doc";
  if (SHEETS.has(ext)) return "table";
  if (PICTURES.has(ext)) return "image";
  return "doc";
}

const CATEGORY_ICON = {
  doc: "file",
  code: "code",
  data: "database",
  table: "sheet",
  slides: "slides",
  image: "image",
  archive: "archive",
};

const ICON_COLOR = {
  file: "blue",
  note: "blue",
  sheet: "green",
  database: "green",
  code: "yellow",
  slides: "orange",
  image: "violet",
  globe: "violet",
  archive: "gray",
};

const LABEL_LISTS = [
  ["文档", "doc docx log markdown md odt pdf rtf txt xhtml"],
  ["文件", "3gp 7z aac aiff avi bz2 db dmg epub fig flac gs gz jsonl m4a m4v mkv mobi mov mp3 mp4 oga ogg ogv opus pages " +
    "parquet rar rst sketch sqlite sqlite3 tar tgz wav webm wma xz zip"],
  ["电子表格", "numbers ods xls xlsx"],
  ["表格", "csv tsv"],
  ["演示文稿", "key odp ppt pptx"],
  ["图片", "ai bmp gif heic ico jpeg jpg png psd svg tif tiff webp"],
  ["图表", "mermaid mmd"],
  ["代码", "bash c cpp cs css go graphql h hpp htm html java js json jsx kt lua php pl proto py r rb rs scss sh sql swift " +
    "tex toml ts tsx vue xml yaml yml zsh"],
];
const LABELS = new Map();
for (const [label, exts] of LABEL_LISTS) for (const ext of exts.split(" ")) LABELS.set(ext, label);

const ENGLISH = {
  文档: "Document", 文件: "File", 电子表格: "Spreadsheet", 表格: "Table", 演示文稿: "Presentation", 图片: "Image", 代码: "Code",
  图表: "Diagram",
};

function extensionOf(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

const BIDI = new Set(Array.from("؜‎‏‪‫‬‭‮⁦⁧⁨⁩"));
const INVISIBLE = new Set(Array.from("­᠎​‌‍⁠⁡⁢⁣⁤﻿"));
const isControl = (ch) => {
  const code = ch.codePointAt(0) ?? 0;
  return code < 0x20 || (code >= 0x7f && code < 0xa0);
};
const SPACES = new RegExp("\\s+", "gu");
const OTHER_SPACE = new RegExp("[^\\S ]", "u");
const PROGRAMS = words("bat cmd com exe msi ps1 vb vbs wsf wsh app command scpt scptd applescript workflow jar jnlp");

function clean(text) {
  const kept = Array.from(text).filter((ch) => !isControl(ch) && !INVISIBLE.has(ch) && !BIDI.has(ch)).join("");
  return kept.replace(SPACES, " ").trim();
}

function cardName(fileName) {
  const name = Array.from(fileName).filter((ch) => !BIDI.has(ch)).join("");
  const ext = extensionOf(name);
  const odd =
    OTHER_SPACE.test(name) || Array.from(name).some(isControl) || name.includes("\\") || name.endsWith(".") ||
    name.endsWith(" ") || PROGRAMS.has(ext);
  if (!odd) {
    const dot = name.lastIndexOf(".");
    const stem = dot >= 0 ? name.slice(0, dot) : name;
    const lower = stem.split("_").join(" ").split("-").join(" ").toLowerCase();
    const tidy = clean(lower.charAt(0).toUpperCase() + lower.slice(1));
    if (tidy !== "") return tidy;
  }
  return clean(fileName);
}

function fileCardInfo(fileName, chinese) {
  const ext = extensionOf(fileName);
  let icon = CATEGORY_ICON[category(ext)];
  if (ext === "md" || ext === "markdown") icon = "note";
  if (ext === "html" || ext === "htm" || ext === "xhtml") icon = "globe";
  let color = ICON_COLOR[icon];
  if (ext === "txt" || ext === "md" || ext === "markdown" || ext === "pdf") color = "gray";
  if (ext === "html") color = "magenta";
  const label = LABELS.get(ext) ?? "文件";
  return {
    name: cardName(fileName),
    color,
    icon,
    label: chinese ? label : (ENGLISH[label] ?? label),
    ext: ext.toUpperCase(),
    thumbnail: THUMBNAILS.has(ext),
  };
}

function isWidePicture(width, height) {
  return width > 0 && height > 0 && 10 + (64 * height) / width < 70;
}

function isFileTarget(target) {
  if (target === "" || target.includes("#") || target.includes("?") || target.includes(":") || target.startsWith("//")) return false;
  if (target.endsWith("/")) return false;
  return extensionOf(target.slice(target.lastIndexOf("/") + 1)) !== "";
}
return { extensionOf, cardName, fileCardInfo, isWidePicture, isFileTarget };
})();

const { fileCards } = (() => {
const BLOCK = "claude-file-card-block";

const WIKI_LINE = new RegExp("^\\[\\[([^\\]|#^]+)(?:\\|[^\\]]*)?\\]\\]\\s*$");
const MARKDOWN_LINE = new RegExp("^\\[[^\\]]*\\]\\((?:<([^>]+)>|([^)\\s]+))\\)\\s*$");
const HEADING = new RegExp("^#{1,6}(\\s|$)");
const BLOCK_START = new RegExp("^(#{1,6}(\\s|$)|[-*+]\\s|\\d{1,9}[.)]\\s|>|```|~~~|\\||\\$\\$|<|(\\*\\s*){3,}$|(-\\s*){3,}$|(_\\s*){3,}$)");

function lineTarget(text) {
  const wiki = WIKI_LINE.exec(text);
  if (wiki) return wiki[1] ?? null;
  const md = MARKDOWN_LINE.exec(text);
  if (!md) return null;
  const raw = md[1] ?? md[2] ?? "";
  try {
    return decodeURI(raw);
  } catch {
    return raw;
  }
}

function standsAlone(doc, number) {
  if (number > 1) {
    const before = doc.line(number - 1).text;
    if (before.trim() !== "" && !HEADING.test(before) && before.trim() !== "---") return false;
  }
  if (number < doc.lines) {
    const after = doc.line(number + 1).text;
    if (after.trim() !== "" && !BLOCK_START.test(after)) return false;
  }
  return true;
}

function resolve(app, target, sourcePath) {
  if (!isFileTarget(target)) return null;
  return app.metadataCache.getFirstLinkpathDest(target, sourcePath);
}

function inText(view, pos) {
  const name = cmLanguage.syntaxTree(view.state).resolveInner(pos, 1).name;
  return !name.includes("codeblock") && !name.includes("frontmatter") && !name.includes("comment") && !name.includes("math");
}

function fillCard(card, info, picture) {
  card.classList.add("claude-file-card");
  card.dataset["claudeFileColor"] = info.color;
  card.dataset["claudeFileIcon"] = info.icon;
  card.replaceChildren();
  const slot = card.createSpan({ cls: "claude-file-card-slot" });
  slot.createSpan({ cls: "claude-file-card-under" });
  const page = slot.createSpan({ cls: "claude-file-card-page" });
  if (picture) {
    const img = page.createEl("img", { cls: "claude-file-card-picture", attr: { alt: "", draggable: "false" } });
    img.addEventListener("load", () => {
      card.dataset["claudeFileThumb"] = isWidePicture(img.naturalWidth, img.naturalHeight) ? "wide" : "tall";
    });
    img.addEventListener("error", () => {
      delete card.dataset["claudeFileThumb"];
      img.remove();
    });
    img.src = picture;
  }
  const text = card.createSpan({ cls: "claude-file-card-text" });
  text.createSpan({ cls: "claude-file-card-name", text: info.name });
  const meta = text.createSpan({ cls: "claude-file-card-meta" });
  meta.createSpan({ text: info.label });
  if (info.ext) {
    meta.createSpan({ cls: "claude-file-card-dot", text: "·" });
    meta.createSpan({ text: info.ext });
  }
}

function pictureOf(app, file, info) {
  return info.thumbnail ? app.vault.getResourcePath(file) : null;
}

function soleLink(p) {
  let link = null;
  for (const node of Array.from(p.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent ?? "").trim() !== "") return null;
    } else if (node instanceof HTMLAnchorElement && node.classList.contains("internal-link") && link === null) {
      if (node.querySelector("img, .internal-embed")) return null;
      link = node;
    } else if (!(node instanceof HTMLBRElement)) {
      return null;
    }
  }
  return link;
}

class FileCardWidget extends cmView.WidgetType {
  hoverPopover = null;
  info;
  picture;
  linktext;
  sourcePath;
  app;

  constructor(app, info, picture, linktext, sourcePath) {
    super();
    this.app = app;
    this.info = info;
    this.picture = picture;
    this.linktext = linktext;
    this.sourcePath = sourcePath;
  }

  eq(other) {
    return (
      other.linktext === this.linktext && other.sourcePath === this.sourcePath && other.info.name === this.info.name &&
      other.info.label === this.info.label && other.picture === this.picture
    );
  }

  toDOM() {
    const card = document.createElement("span");
    card.setAttribute("role", "link");
    fillCard(card, this.info, this.picture);
    card.addEventListener("click", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.app.workspace.openLinkText(this.linktext, this.sourcePath, obsidian.Keymap.isModEvent(event));
    });
    card.addEventListener("auxclick", (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      void this.app.workspace.openLinkText(this.linktext, this.sourcePath, "tab");
    });
    card.addEventListener("mouseover", (event) => {
      this.app.workspace.trigger("hover-link", {
        event,
        source: "editor",
        hoverParent: this,
        targetEl: card,
        linktext: this.linktext,
        sourcePath: this.sourcePath,
      });
    });
    return card;
  }

  ignoreEvent() {
    return true;
  }
}

function editorCards(app, view) {
  if (state.unloaded || !themeOn() || !view.state.field(obsidian.editorLivePreviewField, false)) return cmView.Decoration.none;
  const sourcePath = view.state.field(obsidian.editorInfoField, false)?.file?.path ?? "";
  const doc = view.state.doc;
  const ranges = [];
  const cardLines = new Set();
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = doc.lineAt(pos);
      pos = line.to + 1;
      const target = lineTarget(line.text);
      if (target === null || !standsAlone(doc, line.number)) continue;
      if (view.state.selection.ranges.some((r) => r.from <= line.to && r.to >= line.from)) continue;
      if (!inText(view, line.from)) continue;
      const file = resolve(app, target, sourcePath);
      if (!file) continue;
      const info = fileCardInfo(file.name, chinese());
      const widget = new FileCardWidget(app, info, pictureOf(app, file, info), target, sourcePath);
      ranges.push(cmView.Decoration.line({ class: "claude-file-card-line" }).range(line.from));
      ranges.push(cmView.Decoration.replace({ widget }).range(line.from, line.to));
      cardLines.add(line.number);
    }
  }
  for (const number of cardLines) {
    if (number + 2 <= doc.lines && cardLines.has(number + 2) && doc.line(number + 1).text.trim() === "") {
      ranges.push(cmView.Decoration.line({ class: "claude-file-card-gap" }).range(doc.line(number + 1).from));
    }
  }
  return cmView.Decoration.set(ranges, true);
}

function fileCards(plugin) {
  const app = plugin.app;

  plugin.registerMarkdownPostProcessor((el, ctx) => {
    if (state.unloaded || !themeOn()) return;
    let holds = false;
    for (const p of Array.from(el.querySelectorAll("p"))) {
      if (p.closest("li, blockquote, .callout, table")) continue;
      const link = soleLink(p);
      if (!link) continue;
      const file = resolve(app, link.getAttribute("data-href") ?? "", ctx.sourcePath);
      if (!file) continue;
      const info = fileCardInfo(file.name, chinese());
      fillCard(link, info, pictureOf(app, file, info));
      p.classList.add("claude-file-card-p");
      if (p.parentElement === el) holds = true;
      else if (p.parentElement?.tagName === "DIV") p.parentElement.classList.add(BLOCK);
    }
    if (el.tagName === "DIV") el.classList.toggle(BLOCK, holds);
  });
  plugin.register(() => {
    for (const block of Array.from(document.querySelectorAll(`.${BLOCK}`))) block.classList.remove(BLOCK);
  });

  plugin.registerEditorExtension(
    cmState.Prec.high(cmView.ViewPlugin.fromClass(
      class {
        decorations;
        seen;
        constructor(view) {
          this.decorations = editorCards(app, view);
          this.seen = state.version;
        }
        update(update) {
          if (update.docChanged || update.viewportChanged || update.selectionSet || this.seen !== state.version) {
            this.decorations = editorCards(app, update.view);
            this.seen = state.version;
          }
        }
      },
      { decorations: (value) => value.decorations },
    )),
  );
}
return { fileCards };
})();

const { sidebarSearch } = (() => {
const ROW = "claude-search-row";
const MARK = "claude-has-search-row";
const COMMAND = "global-search:open";

function addRow(app, bar) {
  if (bar.querySelector(`.${ROW}`)) return;
  const label = app.workspace.getLeavesOfType("search")[0]?.view.getDisplayText() ?? "Search";
  const row = createDiv({ cls: ["clickable-icon", "nav-action-button", ROW], attr: { "aria-label": label } });
  obsidian.setIcon(row, "search");
  const hotkey = (app ).hotkeyManager?.printHotkeyForCommand?.(COMMAND) ?? "";
  if (hotkey) row.dataset["claudeShortcut"] = hotkey;
  row.addEventListener("click", () => {
    (app ).commands.executeCommandById(COMMAND);
  });
  bar.insertBefore(row, bar.firstChild);
}

function removeRows() {
  for (const row of Array.from(document.querySelectorAll(`.${ROW}`))) row.remove();
  for (const split of Array.from(document.querySelectorAll(`.${MARK}`))) split.classList.remove(MARK);
}

function sync(app) {
  if (state.unloaded || !themeOn()) {
    removeRows();
    return;
  }
  for (const leaf of app.workspace.getLeavesOfType("file-explorer")) {
    const bar = leaf.view.containerEl.querySelector(".nav-buttons-container");
    if (bar) addRow(app, bar);
  }
  for (const split of Array.from(document.querySelectorAll(".workspace-split.mod-left-split"))) {
    split.classList.toggle(MARK, split.querySelector(`.${ROW}`) !== null);
  }
}

function sidebarSearch(plugin) {
  const app = plugin.app;
  app.workspace.onLayoutReady(() => sync(app));
  plugin.registerEvent(app.workspace.on("layout-change", () => sync(app)));
  plugin.registerEvent(app.workspace.on("css-change", () => sync(app)));
  plugin.register(removeRows);
}
return { sidebarSearch };
})();

const { vaultRoot } = (() => {
const ROW = "claude-vault-root";
const MARK = "claude-has-vault-root";
const FOLDED = "claude-vault-collapsed";

function removeRows() {
  for (const row of Array.from(document.querySelectorAll(`.${ROW}`))) row.remove();
  for (const list of Array.from(document.querySelectorAll(`.${MARK}, .${FOLDED}`))) list.classList.remove(MARK, FOLDED);
}

function addRow(app, list, header) {
  if (header.querySelector(`.${ROW}`)) return;
  const row = createDiv({ cls: ["tree-item", "nav-folder", ROW] });
  const self = row.createDiv({ cls: ["tree-item-self", "nav-folder-title", "is-clickable", "mod-collapsible"] });
  const collapse = self.createDiv({ cls: ["tree-item-icon", "collapse-icon"] });
  obsidian.setIcon(collapse, "right-triangle");
  self.createDiv({ cls: ["tree-item-inner", "nav-folder-title-content"], text: app.vault.getName() });
  self.addEventListener("click", () => {
    const folded = !row.hasClass("is-collapsed");
    row.toggleClass("is-collapsed", folded);
    collapse.toggleClass("is-collapsed", folded);
    list.classList.toggle(FOLDED, folded);
  });
  header.appendChild(row);
  list.classList.add(MARK);
  list.classList.remove(FOLDED);
}

function sync(app) {
  if (state.unloaded || !themeOn()) {
    removeRows();
    return;
  }
  for (const leaf of app.workspace.getLeavesOfType("file-explorer")) {
    const list = leaf.view.containerEl;
    const header = list.querySelector(".nav-header");
    if (header) addRow(app, list, header);
  }
}

function vaultRoot(plugin) {
  const app = plugin.app;
  app.workspace.onLayoutReady(() => sync(app));
  plugin.registerEvent(app.workspace.on("layout-change", () => sync(app)));
  plugin.registerEvent(app.workspace.on("css-change", () => sync(app)));
  plugin.register(removeRows);
}
return { vaultRoot };
})();

const { sidebarNav } = (() => {
const GROUP = "claude-sidebar-nav";
const MARK = "claude-has-sidebar-nav";

function historyOf(leaf) {
  return leaf ? ((leaf ).history ?? null) : null;
}

function target(app) {
  const workspace = app.workspace ;
  return workspace.getMostRecentLeaf(workspace.rootSplit);
}

function removeGroups() {
  for (const group of Array.from(document.querySelectorAll(`.${GROUP}`))) group.remove();
  document.body.classList.remove(MARK);
}

function update(app) {
  const history = historyOf(target(app));
  for (const group of Array.from(document.querySelectorAll(`.${GROUP}`))) {
    const [back, forward] = Array.from(group.children);
    back?.setAttribute("aria-disabled", String(!history || history.backHistory.length === 0));
    forward?.setAttribute("aria-disabled", String(!history || history.forwardHistory.length === 0));
  }
}

function button(app, group, command, icon, steps) {
  const name = (app ).commands.commands[command]?.name ?? "";
  const el = group.createEl("button", { cls: "clickable-icon", attr: { "aria-label": name, "aria-disabled": "true" } });
  obsidian.setIcon(el, icon);
  el.addEventListener("click", async (event) => {
    let leaf = target(app);
    if (!leaf || el.getAttribute("aria-disabled") === "true") return;
    const how = obsidian.Keymap.isModEvent(event);
    if (how) leaf = await (app.workspace ).duplicateLeaf(leaf, how);
    await historyOf(leaf)?.go(steps);
    update(app);
  });
}

function sync(app) {
  if (state.unloaded || !themeOn()) {
    removeGroups();
    return;
  }
  const toggle = document.querySelector(".sidebar-toggle-button.mod-left");
  if (toggle) {
    let group = document.querySelector(`.${GROUP}`);
    if (!group) {
      group = createDiv({ cls: GROUP });
      button(app, group, "app:go-back", "chevron-left", -1);
      button(app, group, "app:go-forward", "chevron-right", 1);
    }
    if (toggle.nextElementSibling !== group) toggle.after(group);
  }
  document.body.classList.toggle(MARK, document.querySelector(`.${GROUP}`) !== null);
  update(app);
}

function sidebarNav(plugin) {
  const app = plugin.app;
  let watched = null;
  let ref = null;
  const follow = () => {
    const leaf = target(app);
    if (leaf !== watched) {
      if (watched && ref) watched.offref(ref);
      watched = leaf;
      ref = leaf ? (leaf ).on("history-change", () => update(app)) : null;
    }
    update(app);
  };
  app.workspace.onLayoutReady(() => {
    sync(app);
    follow();
  });
  plugin.registerEvent(app.workspace.on("layout-change", () => {
    sync(app);
    follow();
  }));
  plugin.registerEvent(app.workspace.on("active-leaf-change", follow));
  plugin.registerEvent(app.workspace.on("file-open", follow));
  plugin.registerEvent(app.workspace.on("css-change", () => sync(app)));
  plugin.registerEvent(app.workspace.on("resize", () => sync(app)));
  plugin.register(() => {
    if (watched && ref) watched.offref(ref);
    removeGroups();
  });
}
return { sidebarNav };
})();

const { vaultMenu } = (() => {
const MENU = "claude-vault-menu";
const GAP = 6;
const EDGE = 5;

function place(menu, button) {
  menu.addClass(MENU);
  const b = button.getBoundingClientRect();
  const m = menu.getBoundingClientRect();
  const win = menu.win;
  let left = b.left;
  if (left + m.width > win.innerWidth - EDGE) left = Math.max(EDGE, b.right - m.width);
  let top = b.top - GAP - m.height;
  if (top < EDGE) top = Math.max(EDGE, Math.min(b.bottom + GAP, win.innerHeight - EDGE - m.height));
  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
}

function vaultMenu(plugin) {
  plugin.registerDomEvent(
    document,
    "click",
    (event) => {
      if (state.unloaded || !themeOn() || event.button !== 0) return;
      const target = event.target;
      const button = target instanceof Element ? target.closest(".workspace-drawer-vault-switcher") : null;
      if (!button || button.hasClass("has-active-menu")) return;
      const body = button.doc.body;
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (node instanceof HTMLElement && node.hasClass("menu")) {
              observer.disconnect();
              place(node, button);
              return;
            }
          }
        }
      });
      observer.observe(body, { childList: true });
      window.setTimeout(() => observer.disconnect(), 1000);
    },
    { capture: true },
  );
}
return { vaultMenu };
})();

const { printBlocks } = (() => {
const HEADING = "claude-block-heading";
const LIST = "claude-block-list";
const HEADINGS = ["H1", "H2", "H3", "H4", "H5", "H6"];
const LISTS = ["UL", "OL", "DL", "TABLE"];

function name(block) {
  if (block.tagName !== "DIV") return;
  const kinds = Array.from(block.children, (child) => child.tagName);
  block.classList.toggle(HEADING, kinds.some((kind) => HEADINGS.includes(kind)));
  block.classList.toggle(LIST, kinds.some((kind) => LISTS.includes(kind)));
}

function printBlocks(plugin) {
  plugin.registerMarkdownPostProcessor((el) => {
    if (state.unloaded || !themeOn()) return;
    if (el.classList.contains("markdown-rendered")) for (const block of Array.from(el.children)) name(block);
    else name(el);
  });
  plugin.register(() => {
    for (const block of Array.from(document.querySelectorAll(`.${HEADING}, .${LIST}`))) block.classList.remove(HEADING, LIST);
  });
}
return { printBlocks };
})();

(() => {
class ClaudeStyleEnhance extends obsidian.Plugin {
  async onload() {
    const app = this.app;
    state.unloaded = false;

    fileCards(this);
    sidebarSearch(this);
    vaultRoot(this);
    sidebarNav(this);
    vaultMenu(this);
    printBlocks(this);

    const later = obsidian.debounce(() => redraw(app), 200, true);
    this.registerEvent(app.workspace.on("css-change", later));
    app.workspace.onLayoutReady(() => {
      this.registerEvent(app.vault.on("create", later));
      this.registerEvent(app.vault.on("delete", later));
      this.registerEvent(app.vault.on("rename", later));
    });
  }

  onunload() {
    state.unloaded = true;
    const app = this.app;
    window.setTimeout(() => redraw(app), 0);
  }
}

module.exports = ClaudeStyleEnhance;
})();

/*
End of Claude Style Enhance
https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance
Written by Xv-Bowen (https://github.com/Xv-Bowen)
Copyright (c) 2026 Xv-Bowen
Licensed under CC BY-NC-ND 4.0: https://creativecommons.org/licenses/by-nc-nd/4.0/
SPDX-License-Identifier: CC-BY-NC-ND-4.0
Not affiliated with Anthropic
*/
