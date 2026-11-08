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

const { codeLanguages } = (() => {
const PREFIX = "language-";
const LANGUAGE = new RegExp("^[A-Za-z0-9+#._-]{1,40}$");

function codeLanguages(plugin) {
  plugin.registerMarkdownPostProcessor((el) => {
    if (state.unloaded || !themeOn()) return;
    for (const pre of Array.from(el.querySelectorAll(`pre[class*="${PREFIX}"]`))) {
      const language = Array.from(pre.classList).find((c) => c.startsWith(PREFIX))?.slice(PREFIX.length) ?? "";
      if (LANGUAGE.test(language)) pre.setAttribute("data-claude-lang", language);
    }
  }, 100);
}
return { codeLanguages };
})();

const { mathBreaks } = (() => {
const BIN = 2;
const REL = 3;
const SCRIPT = "/lib/mathjax/obsidian-mathjax.js";

const mathJax = () => (window ).MathJax;

const filter = ({ math }) => {
  if (state.unloaded || !themeOn()) return;
  math.root.walkTree((node) => {
    if (node.isKind("mo") && (node.texClass === BIN || node.texClass === REL)) node.attributes.set("linebreakstyle", "after");
  });
};

function texInput() {
  const inputs = mathJax()?.startup?.document?.inputJax;
  if (!inputs) return undefined;
  return (Array.isArray(inputs) ? inputs : Object.values(inputs)).find((jax) => jax.name === "TeX");
}

function mathBreaks(plugin) {
  let added = null;
  const add = () => {
    if (added || state.unloaded) return added !== null;
    const tex = texInput();
    if (!tex) return false;
    tex.postFilters.add(filter, 200);
    added = tex;
    return true;
  };
  plugin.register(() => {
    added?.postFilters.remove(filter);
    added = null;
  });
  if (add()) return;

  const watch = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (!(node instanceof HTMLScriptElement) || !node.src.endsWith(SCRIPT)) continue;
        watch.disconnect();
        const settings = mathJax();
        if (!settings) return;
        settings.startup ??= {};
        const theirs = settings.startup.ready;
        settings.startup.ready = function () {
          if (theirs) theirs.call(this);
          else mathJax()?.startup?.defaultReady?.();
          add();
        };
        return;
      }
    }
  });
  watch.observe(document.body, { childList: true });
  plugin.register(() => watch.disconnect());
}
return { mathBreaks };
})();

const { caretInEditor } = (() => {
const flips = new WeakMap();

function caretInEditor(plugin) {
  plugin.registerEditorExtension([
    cmView.EditorView.editorAttributes.compute([], () => ({ class: !state.unloaded && themeOn() ? "claude-caret-drawn" : "" })),
    cmView.layer({
      above: true,
      class: "claude-caret-layer",
      update: (update) => {
        if (update.selectionSet || update.docChanged) flips.set(update.view, !flips.get(update.view));
        return update.selectionSet || update.docChanged || update.viewportChanged || update.focusChanged || update.geometryChanged;
      },
      markers: (view) => {
        const main = view.state.selection.main;
        if (state.unloaded || !themeOn() || !view.hasFocus || !main.empty) return [];
        const blink = flips.get(view) ? "claude-caret-a" : "claude-caret-b";
        return cmView.RectangleMarker.forRange(view, `claude-caret ${blink}`, main);
      },
    }),
  ]);
}
return { caretInEditor };
})();

const { listChain, startState, scanAll, rescan } = (() => {
const FENCE = new RegExp("^\\s*(`{3,}|~{3,})");
const LIST_ITEM = new RegExp("^\\s*([-*+]|\\d{1,9}[.)])(\\s|$)");
const INDENTED = new RegExp("^(\\s{2,}|\\t)\\S");
const HEADING = new RegExp("^(#{1,6})(\\s|$)");
const TABLE_ROW = new RegExp("^\\s*\\|");
const RULE = new RegExp("^\\s{0,3}((\\*\\s*){3,}|(-\\s*){3,}|(_\\s*){3,})$");
const DASH_RULE = new RegExp("^\\s{0,3}(-\\s*){3,}$");
const SETEXT = new RegExp("^\\s{0,3}(=+|-+)\\s*$");
const LONE_LINK = new RegExp("^(\\[\\[[^\\]]+\\]\\]|\\[[^\\]]*\\]\\([^)]+\\))\\s*$");
const SAVE_EVERY = 64;
const LANGUAGE = new RegExp("^[A-Za-z0-9+#._-]{1,40}$");

function before(line) {
  if (HEADING.test(line)) return "heading";
  if (LIST_ITEM.test(line)) return "list";
  if (TABLE_ROW.test(line)) return "table";
  if (RULE.test(line)) return "rule";
  return "text";
}

function after(line) {
  const heading = HEADING.exec(line);
  if (heading) return `h${Math.min((heading[1] ?? "###").length, 3)}`;
  if (LIST_ITEM.test(line)) return "list";
  if (TABLE_ROW.test(line)) return "table";
  if (RULE.test(line)) return "rule";
  if (LONE_LINK.test(line)) return "card";
  return "text";
}

const isQuote = (line) => line.trimStart().startsWith(">");

function startsBlock(above, aboveIsFenceEnd, line) {
  if (SETEXT.test(line) && !RULE.test(line)) return false;
  const aboveText = before(above) === "text" && !INDENTED.test(above) && !aboveIsFenceEnd && !isQuote(above);
  if (HEADING.test(above) || aboveIsFenceEnd || RULE.test(above)) return true;
  if (HEADING.test(line) || FENCE.test(line)) return true;
  if (LIST_ITEM.test(line)) return !(LIST_ITEM.test(above) || INDENTED.test(above));
  if (isQuote(line)) return !isQuote(above);
  if (RULE.test(line)) return !(aboveText && DASH_RULE.test(line));
  return false;
}

function indent(line) {
  let columns = 0;
  for (const ch of line) {
    if (ch === " ") columns += 1;
    else if (ch === "\t") columns += 4 - (columns % 4);
    else break;
  }
  return columns;
}

function drawn(line) {
  let width = 0;
  for (const ch of line) {
    if (ch === " ") width += 1;
    else if (ch === "\t") width += 4;
    else break;
  }
  return width;
}

function levelOf(doc, number) {
  let current = indent(doc.line(number).text);
  if (current === 0) return { level: 0, item: 0 };
  let level = 0;
  let item = 0;
  for (let n = number - 1; n >= 1 && current > 0; n--) {
    const text = doc.line(n).text;
    if (text.trim() === "") continue;
    const at = indent(text);
    if (LIST_ITEM.test(text) && at < current) {
      level++;
      if (item === 0) item = n;
      current = at;
    } else if (at === 0) {
      break;
    }
  }
  return { level: Math.min(level, 6), item: level > 0 ? item : 0 };
}

const TASK = new RegExp("^\\s*([-*+]|\\d{1,9}[.)])\\s+\\[.\\](\\s|$)");

function listChain(doc, number) {
  const text = doc.line(number).text;
  if (!LIST_ITEM.test(text) || isQuote(text)) return [];
  const chain = [TASK.test(text)];
  let current = indent(text);
  for (let n = number - 1; n >= 1 && current > 0; n--) {
    const above = doc.line(n).text;
    if (above.trim() === "") continue;
    const at = indent(above);
    if (LIST_ITEM.test(above) && at < current) {
      chain.push(TASK.test(above));
      current = at;
    } else if (at === 0) {
      break;
    }
  }
  return chain;
}

function startState(doc) {
  return {
    front: doc.lines > 1 && doc.line(1).text.trim() === "---",
    fence: null,
    fenceLevel: 0,
    fenceIndent: 0,
    fenceItem: 0,
    contItem: 0,
    maths: false,
    comment: false,
    prev: null,
    prevKind: "text",
    prevLine: 0,
    prevIsFenceEnd: false,
    inList: false,
    unit: "other",
    owed: 0,
    run: [],
  };
}

const copy = (s) => ({ ...s, run: s.run.slice() });

const emptyData = () => ({ marks: new Map(), styles: new Map(), spacers: new Map(), parents: new Map(), saved: new Map() });

function addTo(map, n, classes) {
  const had = map.get(n);
  map.set(n, had === undefined ? classes : `${had} ${classes}`);
}

function read(doc, s, n, out) {
  const text = doc.line(n).text;
  const trimmed = text.trim();
  const mark = (line, classes) => addTo(out.marks, line, classes);
  if (s.front) {
    if (n > 1 && (trimmed === "---" || trimmed === "...")) s.front = false;
    return;
  }
  const nested = (t) => s.inList && (LIST_ITEM.test(t) || INDENTED.test(t));
  if (s.fence !== null) {
    if (s.fenceLevel > 0) {
      mark(n, `claude-list-level-${s.fenceLevel}`);
      out.styles.set(n, `--claude-list-indent: ${Math.min(drawn(text), s.fenceIndent)}`);
      out.parents.set(n, s.fenceItem);
    }
    if (trimmed.startsWith(s.fence)) {
      s.fence = null;
      s.fenceLevel = 0;
      s.fenceIndent = 0;
      s.fenceItem = 0;
      s.prevKind = nested(text) ? "list" : "text";
      s.unit = s.prevKind === "list" ? "fence" : "other";
      s.owed = s.prevKind === "list" ? 1 : 0;
      s.prev = text;
      s.prevLine = n;
      s.prevIsFenceEnd = true;
    }
    return;
  }
  if (s.maths) {
    if (trimmed.endsWith("$$")) s.maths = false;
    return;
  }
  if (s.comment) {
    if (trimmed.includes("%%")) s.comment = false;
    return;
  }
  if (trimmed === "") {
    s.run.push(n);
    return;
  }
  const adjacent = s.run.length === 0 && s.prevLine === n - 1;
  const inside = nested(text) || (s.inList && adjacent && isQuote(text));
  const item = LIST_ITEM.test(text);
  const quote = isQuote(text);
  const opens = FENCE.test(text);

  let spacer = null;
  if (s.prev !== null && adjacent && !(s.prevKind === "list" && inside) && startsBlock(s.prev, s.prevIsFenceEnd, text)) {
    spacer = `claude-gap claude-gap-from-${s.prevKind} claude-gap-to-${after(text)}`;
  }

  if (quote && inside) {
    const under = indent(text) > 0 ? levelOf(doc, n).item : 0;
    const parent = under > 0 ? under : s.unit === "quote" ? (out.parents.get(n - 1) ?? 0) : s.contItem;
    if (parent > 0) out.parents.set(n, parent);
  }
  const plain = inside && !item && !quote && !opens;
  if (adjacent && ((s.unit === "quote" && (quote || plain)) || ((s.unit === "para" || s.unit === "item") && plain))) {
    if (s.unit === "item") {
      if (s.owed === 0) mark(s.prevLine, "claude-list-item-continued");
      mark(n, "claude-list-continuation");
      out.parents.set(n, s.contItem);
      s.owed = 1;
    }
  } else {
    let start = 0;
    let next = "other";
    if (item) next = "item";
    else if (!inside) next = "other";
    else if (opens) [next, start] = ["fence", 1];
    else if (quote) [next, start] = ["quote", 1];
    else if (adjacent && s.unit === "fence") [next, s.owed] = ["para", 0];
    else [next, start] = ["para", s.run.length > 0 ? 1 : 0];
    const space = s.owed + start;
    const first = s.run[0];
    if (space > 0) {
      const pad = `claude-list-pad-top-${space}`;
      if (first !== undefined && !(s.prevKind === "list" && inside)) mark(first, pad);
      else if (spacer !== null) spacer += ` ${pad}`;
      else if (!opens) mark(n, pad);
      else if (!s.prevIsFenceEnd) mark(s.prevLine, `claude-list-pad-bottom-${space}`);
    }
    s.unit = next;
    s.owed = next === "quote" || next === "para" ? 1 : 0;
    s.contItem = next === "item" ? n : 0;
  }

  if (s.run.length > 0) {
    const from = s.prev === null ? null : s.prevKind;
    const to = inside ? "list" : after(text);
    s.run.forEach((line, i) => {
      if (from === null) mark(line, "claude-blank claude-blank-extra");
      else if (from === "list" && to === "list") mark(line, "claude-blank claude-blank-list");
      else if (i === 0) mark(line, `claude-blank claude-gap claude-gap-from-${from} claude-gap-to-${to}`);
      else mark(line, "claude-blank claude-blank-extra");
    });
    s.run = [];
  }
  if (spacer !== null) out.spacers.set(n, spacer);

  s.prevKind = inside ? "list" : before(text);
  s.inList = inside || item;
  const open = FENCE.exec(text);
  if (open) {
    s.fence = open[1] ?? null;
    const { level, item: parent } = levelOf(doc, n);
    s.fenceLevel = level;
    s.fenceIndent = drawn(text);
    s.fenceItem = parent;
    const styles = [];
    const language = trimmed.slice(s.fence?.length ?? 0).trim().split(new RegExp("\\s"))[0] ?? "";
    if (LANGUAGE.test(language)) styles.push(`--claude-lang: "${language}"`);
    if (s.fenceLevel > 0) {
      mark(n, `claude-list-level-${s.fenceLevel}`);
      styles.push(`--claude-list-indent: ${s.fenceIndent}`);
      out.parents.set(n, s.fenceItem);
    }
    if (styles.length > 0) out.styles.set(n, styles.join("; "));
  } else if (trimmed.startsWith("$$") && !(trimmed.length > 2 && trimmed.endsWith("$$"))) {
    s.maths = true;
  } else if (trimmed.startsWith("%%") && trimmed.indexOf("%%", 2) < 0) {
    s.comment = true;
  }
  s.prev = text;
  s.prevLine = n;
  s.prevIsFenceEnd = false;
}

function finish(s, out) {
  for (const line of s.run) addTo(out.marks, line, "claude-blank claude-blank-extra");
}

const quiet = (s) => !s.inList;

function readFrom(doc, s, from, out, lastSaved,
  stop) {
  let saved = lastSaved;
  for (let n = from; n <= doc.lines; n++) {
    if (n > from && stop(n, s)) return n;
    if (n - saved >= SAVE_EVERY && quiet(s)) {
      out.saved.set(n, copy(s));
      saved = n;
    }
    read(doc, s, n, out);
  }
  finish(s, out);
  return null;
}

function scanAll(doc) {
  const out = emptyData();
  readFrom(doc, startState(doc), 1, out, 1, () => false);
  return out;
}

function rescan(data, doc, fromLine, oldTo, newTo, delta)
  {
  const oldLines = doc.lines - delta;
  let start = 1;
  let s = startState(doc);
  for (const [n, saved] of data.saved) {
    if (n <= fromLine && n > start) {
      start = n;
      s = copy(saved);
    }
  }
  if (start === 1) s = startState(doc);
  const waiting = s.run.slice();
  const firstTouched = waiting.length > 0 ? Math.min(start, ...waiting) : start;
  const map = (n) => (n < fromLine ? n : n > oldTo ? n + delta : null);
  const same = (a, oldState) => {
    if (a.front !== oldState.front || a.fence !== oldState.fence || a.fenceLevel !== oldState.fenceLevel ||
      a.fenceIndent !== oldState.fenceIndent || a.maths !== oldState.maths || a.comment !== oldState.comment ||
      a.fenceItem !== (oldState.fenceItem === 0 ? 0 : map(oldState.fenceItem)) ||
      a.contItem !== (oldState.contItem === 0 ? 0 : map(oldState.contItem)) ||
      a.prev !== oldState.prev || a.prevKind !== oldState.prevKind || a.prevIsFenceEnd !== oldState.prevIsFenceEnd ||
      a.inList !== oldState.inList || a.unit !== oldState.unit || a.owed !== oldState.owed) return false;
    if (a.prevLine !== (oldState.prevLine === 0 ? 0 : map(oldState.prevLine))) return false;
    if (a.run.length !== oldState.run.length) return false;
    return a.run.every((line, i) => line === map(oldState.run[i] ?? -1));
  };
  const stop = (n, state) => {
    if (n <= newTo) return false;
    const oldState = data.saved.get(n - delta);
    return oldState !== undefined && same(state, oldState);
  };
  const fresh = emptyData();
  const joined = readFrom(doc, s, start, fresh, start, stop);
  const oldJoin = joined === null ? oldLines + 1 : joined - delta;
  const waitingAtJoin = joined === null ? [] : s.run.map((line) => [line, data.marks.get(line < fromLine ? line : line - delta)] );
  for (const line of waiting) data.marks.delete(line);
  for (let n = start; n < oldJoin; n++) {
    data.marks.delete(n);
    data.styles.delete(n);
    data.spacers.delete(n);
    data.parents.delete(n);
    if (n > start) data.saved.delete(n);
  }
  if (delta !== 0 && joined !== null) {
    const move = (map) => {
      const moved = [];
      for (let n = oldJoin; n <= oldLines; n++) {
        const v = map.get(n);
        if (v !== undefined) {
          moved.push([n + delta, v]);
          map.delete(n);
        }
      }
      for (const [n, v] of moved) map.set(n, v);
    };
    move(data.marks);
    move(data.styles);
    move(data.spacers);
    const parentsMoved = [];
    for (let n = oldJoin; n <= oldLines; n++) {
      const v = data.parents.get(n);
      if (v === undefined) continue;
      data.parents.delete(n);
      parentsMoved.push([n + delta, map(v) ?? v]);
    }
    for (const [n, v] of parentsMoved) data.parents.set(n, v);
    const savedMoved = [];
    for (let n = oldJoin; n <= oldLines; n++) {
      const v = data.saved.get(n);
      if (v === undefined) continue;
      data.saved.delete(n);
      const prevLine = v.prevLine === 0 ? 0 : map(v.prevLine);
      const fenceItem = v.fenceItem === 0 ? 0 : map(v.fenceItem);
      const contItem = v.contItem === 0 ? 0 : map(v.contItem);
      const run = v.run.map(map);
      if (prevLine === null || fenceItem === null || contItem === null || run.some((line) => line === null)) continue;
      savedMoved.push([n + delta, { ...v, prevLine, fenceItem, contItem, run: run }]);
    }
    for (const [n, v] of savedMoved) data.saved.set(n, v);
  }
  for (const [line, v] of waitingAtJoin) {
    if (v === undefined) data.marks.delete(line);
    else data.marks.set(line, v);
  }
  for (const [n, v] of fresh.marks) addTo(data.marks, n, v);
  for (const [n, v] of fresh.styles) data.styles.set(n, v);
  for (const [n, v] of fresh.spacers) data.spacers.set(n, v);
  for (const [n, v] of fresh.parents) data.parents.set(n, v);
  for (const [n, v] of fresh.saved) data.saved.set(n, v);
  return { data, from: firstTouched, to: joined === null ? doc.lines : joined - 1 };
}
return { listChain, startState, scanAll, rescan };
})();

const { blankLinesInLivePreview } = (() => {
const TEXT_START = new RegExp("^([>\\s]*)(([*+-] |(\\d+)([.)] ))(?:\\[(.)\\] )?)?");

class Spacer extends cmView.WidgetType {
  classes;
  constructor(classes) {
    super();
    this.classes = classes;
  }
  eq(other) {
    return other.classes === this.classes;
  }
  toDOM() {
    const el = document.createElement("div");
    el.className = `claude-gap-spacer ${this.classes}`;
    el.setAttribute("aria-hidden", "true");
    return el;
  }
  ignoreEvent() {
    return false;
  }
}

function decorate(doc, data, from, to) {
  const out = [];
  for (let n = Math.max(1, from); n <= Math.min(to, doc.lines); n++) {
    const pos = doc.line(n).from;
    const spacer = data.spacers.get(n);
    if (spacer !== undefined) out.push(cmView.Decoration.widget({ widget: new Spacer(spacer), block: true, side: -1 }).range(pos));
    const classes = data.marks.get(n);
    const style = data.styles.get(n);
    if (classes !== undefined || style !== undefined) {
      out.push(cmView.Decoration.line({ class: classes ?? "", attributes: style === undefined ? {} : { style } }).range(pos));
    }
  }
  return out;
}

const shownNow = () => !state.unloaded && themeOn();

const field = cmState.StateField.define({
  create(s) {
    const data = scanAll(s.doc);
    return { data, decorations: cmView.Decoration.set(decorate(s.doc, data, 1, s.doc.lines), true), version: state.version, shown: shownNow() };
  },
  update(value, tr) {
    let next = value;
    if (tr.docChanged) {
      const oldDoc = tr.startState.doc;
      const doc = tr.state.doc;
      let fromA = Infinity;
      let toA = -1;
      let toB = -1;
      tr.changes.iterChangedRanges((a0, a1, _b0, b1) => {
        fromA = Math.min(fromA, a0);
        toA = Math.max(toA, a1);
        toB = Math.max(toB, b1);
      });
      const fromLine = oldDoc.lineAt(fromA).number;
      const { data, from, to } = rescan(value.data, doc, fromLine, oldDoc.lineAt(toA).number, doc.lineAt(toB).number, doc.lines - oldDoc.lines);
      const fromPos = doc.line(Math.max(1, Math.min(from, doc.lines))).from;
      const toPos = doc.line(Math.min(to, doc.lines)).to;
      const decorations = value.decorations.map(tr.changes).update({
        filterFrom: fromPos,
        filterTo: toPos,
        filter: () => false,
        add: decorate(doc, data, from, to),
        sort: true,
      });
      next = { ...next, data, decorations };
    }
    if (next.version !== state.version) next = { ...next, version: state.version, shown: shownNow() };
    return next;
  },
});

const shown = cmView.EditorView.decorations.compute([field, obsidian.editorLivePreviewField], (s) => {
  const value = s.field(field);
  return value.shown && s.field(obsidian.editorLivePreviewField, false) === true ? value.decorations : cmView.Decoration.none;
});

const placed = cmState.StateEffect.define();

const placing = cmState.StateField.define({
  create: () => ({ styles: new Map(), decorations: cmView.Decoration.none }),
  update(value, tr) {
    let next = value;
    if (tr.docChanged) {
      const styles = new Map();
      for (const [pos, style] of value.styles) {
        const moved = tr.changes.mapPos(pos, -1, cmState.MapMode.TrackDel);
        if (moved !== null) styles.set(moved, style);
      }
      next = { styles, decorations: value.decorations.map(tr.changes) };
    }
    for (const effect of tr.effects) {
      if (!effect.is(placed)) continue;
      const ranges = [];
      for (const [pos, style] of effect.value) ranges.push(cmView.Decoration.line({ attributes: { style } }).range(pos));
      next = { styles: effect.value, decorations: cmView.Decoration.set(ranges, true) };
    }
    return next;
  },
  provide: (f) => cmView.EditorView.decorations.from(f, (v) => v.decorations),
});

function textX(view, number, left) {
  const line = view.state.doc.line(number);
  const marker = TEXT_START.exec(line.text);
  const at = view.coordsAtPos(line.from + (marker?.[0].length ?? 0), 1);
  return at ? at.left - left : null;
}

function shiftNow(view, pos, name) {
  const node = view.domAtPos(pos).node;
  const line = (node instanceof HTMLElement ? node : node.parentElement)?.closest(".cm-line");
  return line ? Number.parseFloat(getComputedStyle(line).getPropertyValue(name)) || 0 : 0;
}

function quoteX(view, number, left) {
  const line = view.state.doc.line(number);
  const pos = line.from + line.text.indexOf(">");
  const at = view.coordsAtPos(pos, 1);
  if (!at) return null;
  const node = view.domAtPos(pos + 1).node;
  const mark = (node instanceof HTMLElement ? node : node.parentElement)?.closest(".cm-formatting-quote-1");
  const inset = mark ? Number.parseFloat(getComputedStyle(mark).paddingInlineStart) || 0 : 0;
  return at.left - left - inset;
}

const roundPx = (x) => `${Math.round(x * 64) / 64}px`;

function itemTarget(view, number, lengths) {
  const chain = listChain({ lines: view.state.doc.lines, line: (n) => view.state.doc.line(n) }, number);
  if (chain.length === 0) return null;
  const [self, ...around] = chain;
  return around.reduce((x, task) => x + (task ? lengths.task : lengths.list), 0) + (self ? lengths.task + lengths.box : lengths.list);
}

function measurePlaces(view) {
  if (!active(view)) return new Map();
  const doc = view.state.doc;
  const onScreen = (pos) => view.visibleRanges.some((r) => pos >= r.from && pos <= r.to);
  const want = new Map([...view.state.field(placing).styles].filter(([pos]) => !onScreen(pos)));
  const data = view.state.field(field).data;
  const left = view.contentDOM.getBoundingClientRect().left;
  const css = getComputedStyle(view.contentDOM);
  const length = (name) => Number.parseFloat(css.getPropertyValue(name)) || 0;
  const lengths = { list: length("--claude-list-step"), task: length("--claude-task-step"), box: length("--claude-task-text") };
  const itemX = new Map();
  const xOf = (n) => {
    if (!itemX.has(n)) itemX.set(n, n >= 1 && n <= doc.lines ? (lengths.list > 0 ? itemTarget(view, n, lengths) : null) ?? textX(view, n, left) : null);
    return itemX.get(n) ?? null;
  };
  for (const { from, to } of view.visibleRanges) {
    for (let n = doc.lineAt(from).number; n <= doc.lineAt(to).number; n++) {
      const line = doc.line(n);
      const target = lengths.list > 0 ? itemTarget(view, n, lengths) : null;
      if (target !== null) {
        const own = textX(view, n, left);
        if (own === null) continue;
        const shift = shiftNow(view, line.from, "--claude-item-shift") + target - own;
        if (Math.abs(shift) >= 1 / 128) want.set(line.from, `--claude-item-shift: ${roundPx(shift)}`);
        continue;
      }
      const parent = data.parents.get(n);
      if (parent === undefined || parent === 0) continue;
      const at = xOf(parent);
      if (at === null) continue;
      if ((data.marks.get(n) ?? "").includes("claude-list-continuation")) {
        const own = textX(view, n, left);
        if (own !== null) want.set(line.from, `--claude-cont-shift: ${roundPx(shiftNow(view, line.from, "--claude-cont-shift") + at - own)}`);
      } else if (line.text.trimStart().startsWith(">")) {
        const own = quoteX(view, n, left);
        if (own !== null) want.set(line.from, `--claude-quote-shift: ${roundPx(shiftNow(view, line.from, "--claude-quote-shift") + at - own)}`);
      } else {
        want.set(line.from, `--claude-list-shift: ${roundPx(at)}`);
      }
    }
  }
  return want;
}

const sameStyles = (a, b) =>
  a.size === b.size && [...a].every(([k, v]) => b.get(k) === v);

const placer = cmView.ViewPlugin.fromClass(class {
  constructor(view) {
    this.schedule(view);
  }
  update(update) {
    if (update.docChanged || update.viewportChanged || update.geometryChanged ||
      update.transactions.some((t) => t.effects.some((e) => e.is(placed)))) this.schedule(update.view);
  }
  schedule(view) {
    view.requestMeasure({
      key: this,
      read: (v) => measurePlaces(v),
      write: (want, v) => {
        if (sameStyles(want, v.state.field(placing).styles)) return;
        window.setTimeout(() => {
          if (!sameStyles(want, v.state.field(placing).styles)) v.dispatch({ effects: placed.of(want) });
        }, 0);
      },
    });
  }
});

function active(view) {
  return !state.unloaded && themeOn() && view.state.field(obsidian.editorLivePreviewField, false) === true;
}

function vertical(app, view, forward, extend) {
  if (!active(view) || view.composing || view.state.selection.ranges.length !== 1) return false;
  if (view.dom.ownerDocument.querySelector(".suggestion-container, .cm-tooltip-autocomplete")) return false;
  if ((app.vault ).getConfig?.("vimMode") === true) return false;
  const range = view.state.selection.main;
  if (!extend && !range.empty) return false;
  const moved = view.moveVertically(range, forward);
  const doc = view.state.doc;
  const from = doc.lineAt(range.head).number;
  const to = doc.lineAt(moved.head).number;
  const step = forward ? 1 : -1;
  if ((to - from) * step <= 1) return false;
  for (let n = from + step; n !== to; n += step) if (doc.line(n).text.trim() !== "") return false;
  const head = doc.line(from + step).from;
  let goal = moved.goalColumn;
  const line = doc.line(from);
  const marker = TEXT_START.exec(line.text);
  if (goal !== undefined && marker?.[2] !== undefined) {
    const text = view.coordsAtPos(line.from + marker[0].length);
    const blank = view.coordsAtPos(head);
    if (text && blank) goal += blank.left - text.left;
  }
  const target = extend
    ? cmState.EditorSelection.range(range.anchor, head, goal)
    : cmState.EditorSelection.cursor(head, 0, undefined, goal);
  view.dispatch({ selection: cmState.EditorSelection.create([target]), scrollIntoView: true, userEvent: "select" });
  return true;
}

function measureAll(app) {
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const view = leaf.view ;
    view.editor?.cm?.requestMeasure();
  }
}

function blankLinesInLivePreview(plugin) {
  const app = plugin.app;
  plugin.registerEditorExtension([
    field,
    shown,
    placing,
    placer,
    cmState.Prec.highest(cmView.keymap.of([
      { key: "ArrowDown", run: (view) => vertical(app, view, true, false), shift: (view) => vertical(app, view, true, true) },
      { key: "ArrowUp", run: (view) => vertical(app, view, false, false), shift: (view) => vertical(app, view, false, true) },
    ])),
  ]);
  const later = obsidian.debounce(() => measureAll(app), 100, true);
  plugin.registerEvent(app.workspace.on("css-change", later));
  app.workspace.onLayoutReady(later);
}
return { blankLinesInLivePreview };
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
    codeLanguages(this);
    caretInEditor(this);
    mathBreaks(this);
    blankLinesInLivePreview(this);

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
