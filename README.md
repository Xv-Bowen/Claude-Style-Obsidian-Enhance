# Claude Style Enhance

English · [简体中文](README.zh-CN.md)

The optional plugin for the [Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian) theme. A theme can only change how Obsidian looks, and a few things need code; this plugin adds those. The cards, buttons and rows are drawn by the theme, and the plugin only finds where they belong and puts them there, so it is meant to be used with the Claude Style theme: with another theme, it does nothing.

Claude Style is an independent theme. It is not made, endorsed or supported by Anthropic. Claude is a trademark of Anthropic.

## What it does

- **Live preview laid out like the reading view**: the plugin reads what each block of a note is and what comes before and after it, and the theme spaces them as the reading view does. Blank lines in the source fold away, and blocks are spaced only by Claude's spacing, however many blank lines there are; blocks with no blank line between them are spaced as in the reading view too. Code blocks in lists move under the item's text, without the list's indent inside the code; quotes and continuation lines in lists line up with the item's text. The 81 ways of putting one of 9 kinds of block (paragraph, three levels of heading — first, second, third and below —, list, table, horizontal rule, code block and quote) after another were each measured against the reading view, as were blocks written with no blank line between them and the many ways of writing lists. A folded blank line opens up when the cursor is on it, so you can type there, and the up and down arrow keys still move one line at a time. The blank lines and text of your note stay as they are; only how they show changes. Only the lines around a change are read again, so typing stays quick in long notes.
- **Code block language names**: shown as written in the code block (`js` stays js), the same in the reading view, live preview and exported PDFs, for any language.
- **Line breaks in inline maths**: a formula that reaches the end of a line breaks after a sign such as = or +, as in Claude (`E =` stays at the end of the line and `mc²` starts the next), not before it.
- **File cards**: a file linked in a paragraph of its own becomes the card Claude shows for a file it shares, in the reading view and in live preview. The card has a colour and icon for the kind of file, the file's name (without its extension, with `_` and `-` turned into spaces), and its kind and extension below; picture files show a thumbnail. Clicking a card opens the file, and ⌘-clicking (Ctrl-clicking on Windows and Linux) opens it in a new tab. In live preview, the card turns back into the link when the cursor moves onto its line, so you can edit it. A file link inside a sentence, in a quote, callout, list or table, or a link to a web page or to part of a file, stays a link.
- **A Search row**: a Search row above the file list, as at the top of Claude's sidebar, opens Obsidian's search.
- **The vault's own folder**: a row with the vault's name heads the file list; clicking it folds and unfolds the whole list.
- **Back and forward**: next to the button that hides the sidebar, as in Claude.
- **The vault menu**: opens above the vault's name, as Claude's account menu does.
- **The cursor**: the cursor in the editor is drawn the way Claude draws it: rounded, thicker than the system's, and it starts blinking again whenever it moves.

See [Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian) for previews and the full description.

## Installation

Install the [Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian) theme first.

- **From within Obsidian**: open **Settings → Community plugins**, turn off **Restricted mode**, select **Browse** next to Community plugins, search for **Claude Style Enhance**, install it and enable it.
- **By hand**: download `main.js` and `manifest.json` from the [latest release](https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance/releases/latest), put them in your vault's `.obsidian/plugins/claude-style-enhance/` folder (create it if it is not there), reopen Obsidian and enable the plugin in **Settings → Community plugins**. The theme's releases also include a zip with the theme and the plugin together.

It needs Obsidian 1.15 or later. The plugin and the theme share one version number; please use the same version of both.

## Privacy

The plugin does not use the network, collects nothing, needs no account and does not change your notes. It only reads files in your vault: a card's name and kind come from the file the link points to, and a picture's thumbnail is that picture in your vault.

The `main.js` in this repository is the whole plugin, neither minified nor obfuscated.

## Feedback

Found something that does not look right? Please [open an issue](https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance/issues) with a screenshot, your Obsidian version and your system.

## License

Claude Style Enhance is licensed under [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International](LICENSE) (CC BY-NC-ND 4.0).

- You may use it and share unchanged copies, for non-commercial purposes, with credit to the author.
- You may not share changed versions of it, or use it commercially.

For anything else, please ask the author.
