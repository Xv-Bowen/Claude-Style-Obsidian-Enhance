# Claude Style Enhance

[English](README.md) · 简体中文

[Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian) 主题的可选增强插件。主题能改的只有 Obsidian 的外观，有几件事要靠程序才能做到，这个插件补上的就是这几件。卡片、按钮和各行的样子都由主题画出，插件只负责认出该画的地方、把它们放进去，所以要和 Claude Style 主题一起用：换成别的主题时，插件什么也不做。

Claude Style 是独立制作的主题，不是 Anthropic 出品，也没有得到 Anthropic 的认可或支持。Claude 是 Anthropic 的商标。

## 它做什么

- **文件卡片**：单独成段的文件链接画成 Claude 分享文件时的卡片，阅读视图和实时预览里都画。卡片按文件类型配颜色和图标，写着文件名（去掉扩展名，`_` 和 `-` 换成空格），下面是类型和扩展名；图片文件的卡片带缩略图。点卡片打开文件，⌘ 点击（Windows 和 Linux 上是 Ctrl 点击）在新标签页里打开。实时预览里把光标移进那一行，卡片就变回链接，方便修改。写在句子里的文件链接，引用块、callout、列表和表格里的文件链接，指向网页或文件里某一部分的链接，都保持链接。
- **"搜索"一行**：文件列表上面加一行"搜索"，和 Claude 侧栏顶上一样，点它打开 Obsidian 的搜索。
- **库的根文件夹**：文件列表最上面加一行，写着库名，点它收起、展开整个列表。
- **后退和前进**：放在侧栏顶上、收起侧栏的按钮旁边，和 Claude 一样。
- **切换库的菜单**：开在库名按钮的上方，和 Claude 的账户菜单一样。

主题的预览图和完整说明见 [Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian)。

## 安装

先装好 [Claude Style](https://github.com/Xv-Bowen/Claude-Style-Obsidian) 主题。

- **在 Obsidian 里安装**：打开 **设置 → 第三方插件**，关掉 **安全模式**，在"社区插件市场"一栏点 **浏览**，搜索 **Claude Style Enhance**，安装后启用。
- **手动安装**：从[最新发布](https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance/releases/latest)下载 `main.js` 和 `manifest.json`，放进库里的 `.obsidian/plugins/claude-style-enhance/` 文件夹（没有就新建），重新打开 Obsidian，在 **设置 → 第三方插件** 里启用它。主题的发布里也有一个主题和插件一起的压缩包。

需要 Obsidian 1.15 或更新的版本。插件和主题用同一个版本号，请装同一版本的主题和插件。

## 隐私

插件不联网，没有统计，不需要账号，也不改笔记的内容。它只读库里的文件：卡片上的名字和类型来自链接指向的文件，图片的缩略图就是库里的那张图片。

这个仓库里的 `main.js` 就是插件的全部代码，没有压缩、没有混淆。

## 反馈

发现哪里不对，欢迎[提交 issue](https://github.com/Xv-Bowen/Claude-Style-Obsidian-Enhance/issues)，附上截图、Obsidian 的版本和所用的系统。

## 许可证

Claude Style Enhance 采用[知识共享 署名-非商业性使用-禁止演绎 4.0 国际许可协议](LICENSE)（CC BY-NC-ND 4.0）。

- 可以使用，也可以原样转发给别人，但只限非商业用途，并且要注明作者。
- 不可以分享修改过的版本，也不可以用于商业用途。

其他用途请先联系作者。
