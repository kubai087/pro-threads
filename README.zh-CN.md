# PRO Threads

[English](README.md) · **简体中文**

**由成千上万根光丝织成的字母，用 WebGL 实时绘制。** 一张动态壁纸，灵感来自 MacBook Pro 的 PROLED XDR 壁纸，用实时着色器从零重写。它带有完整的 A–Z 光丝字体、配色、参数面板、适合落地页首屏的场景，以及可以直接放进任何网页的 `<pro-threads>` Web 组件。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![No build step](https://img.shields.io/badge/build-none-brightgreen.svg)](#本地运行)
[![WebGL 2](https://img.shields.io/badge/WebGL-2-990000.svg)](#浏览器支持)
[![Live demo](https://img.shields.io/badge/demo-live-black.svg)](https://www.kubai.design/pro-threads/)

![默认 XDR 蓝配色下实时绘制的 PRO](media/pro.jpg)

**[在线体验](https://www.kubai.design/pro-threads/)** · [A–Z 字母表](https://www.kubai.design/pro-threads/?view=az) · [首屏场景](https://www.kubai.design/pro-threads/hero/) · [嵌入到网站](#嵌入) · [网址参数](#设置与网址参数)

## 目录

- [功能](#功能)
- [图集](#图集)
- [嵌入](#嵌入)
- [设置与网址参数](#设置与网址参数)
- [快捷键](#快捷键)
- [本地运行](#本地运行)
- [实现原理](#实现原理)
- [项目结构](#项目结构)
- [浏览器支持](#浏览器支持)
- [性能](#性能)
- [参与贡献](#参与贡献)
- [致谢与商标](#致谢与商标)
- [许可证](#许可证)

## 功能

- **实时绘制，不是视频。** 整个画面由一个全屏片段着色器画出。光沿着每根丝线呼吸、扫过、流动，彩色的细丝经过时会渐渐变暖。
- **一整套字体。** 26 个字母都由同一组部件拼成：被一道缝分开的左右两半，切成几段，每段的两端弯成拱、圆顶、弧、楔或脚。可以输入最多 10 个字母的任意单词，也可以展示整张字母表。
- **配色与效果。** 9 套配色（XDR Blue、Graphite、Ember、Chroma、Violet、Ocean、Aurora、Rose Gold、Paper），每套都是一条随亮度变化色相的渐变，并配有同色系的彩丝；还有 7 个效果预设（Original、Calm、Lively、Silk、Fine Wire、Glow、Low Light）。所有颜色、光线和形状参数都能手动调。
- **任意尺寸。** 桌面尺寸从 16:9 到 9:16，还有当前主流 iPhone 和 Android 手机的预设，也可以自定义。**拉伸**（Stretch）可以让字母从保持比例逐渐过渡到铺满画面。
- **导出 PNG。** 可按 1×–4× 倍率保存（手机预设默认用手机自己的倍率，比如 iPhone 17 Pro 导出 1206 × 2622）。大图分块绘制，单边最大 16384 px。
- **首屏场景。** 用同样的光丝做成的五个 3D 场景，适合落地页的第一屏：圆环、光线追踪的黑洞、广角透视、莫比乌斯环和隧道。每个场景都有辉光、对比度和饱和度调色，以及跟随指针的视差。还附带一个演示落地页，展示场景放在真实内容后面的效果。
- **设置写在网址里。** 你改动的一切都会写进地址栏，所以刷新、收藏或分享链接都能打开同样的效果。
- **中英文面板。** 面板可以在底部切换到简体中文，或用 `?lang=zh` 打开。
- **方便嵌入。** 面板里的 **Embed（嵌入）** 按钮会生成带有当前设置、可以直接粘贴的代码；一个 script 标签就能把实时场景放到任何网站上。
- **对设备友好。** 默认每秒最多 60 帧；隐藏、暂停或滚出屏幕时不绘制；帧率跟不上时自动降低分辨率。
- **无需构建。** 纯 ES 模块加一个静态文件夹，起个静态服务就能打开。

## 图集

**配色。** 9 套配色，每套都是随亮度变化色相的渐变，彩丝取自同一色系。

![九套配色](media/palettes.jpg)

**A–Z 字体。** 每个字母都保持原作的比例，由同样几种部件构成（`?view=az`）。

![A–Z 光丝字体](media/alphabet.jpg)

**你自己的单词**，配上不同配色和效果：Chroma 配色的 `HELLO`，Ember 配 Glow 效果的 `LIGHT`，Ocean 配 Silk 效果的 `SILK`，Graphite 配 Fine Wire 效果的 `WIRE`。

![不同配色和效果下的自定义单词](media/words.jpg)

**参数面板。** 预设、尺寸、动态、光线、颜色、字形和性能，全部实时生效。

![带参数面板的壁纸](media/panel.jpg)

**尺寸。** 桌面、iPhone 和 Android 预设，每一项都标出导出 PNG 的像素尺寸。

![手机尺寸壁纸上展开的尺寸预设菜单](media/sizes.jpg)

**拉伸**，iPhone 17 Pro 屏幕上：`0` 保持字母比例，`1` 横向和纵向都铺满。

![手机屏幕上拉伸为 0、0.5 和 1 的效果](media/stretch.jpg)

**首屏场景**：圆环、黑洞、透视、莫比乌斯环和隧道。

![五个首屏场景](media/scenes.jpg)

**演示落地页**，叠在莫比乌斯环上（居中布局）和透视场景上（靠左布局，带实时帧时间图）。

![叠在两个首屏场景上的演示落地页](media/landing.jpg)

**首屏场景的面板**，这里是中文界面（`?lang=zh`）。

![中文界面的首屏场景面板](media/hero-panel.jpg)

**嵌入对话框**提供 Web 组件、iframe 和链接三种写法，当前设置已经填好。

![嵌入对话框](media/embed.jpg)

## 嵌入

把实时场景放进你自己的网站、落地页或产品里。

**最快的方式：** 打开[壁纸](https://www.kubai.design/pro-threads/)或[首屏场景](https://www.kubai.design/pro-threads/hero/)，在面板里调好，点面板底部的 **Embed（嵌入）**，再点 **Copy（复制）**。你会得到下面某一种代码，设置已经填在里面。

### Web 组件

纯 HTML 和任何框架里都能用：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/kubai087/pro-threads@main/embed.js"></script>

<pro-threads scene="mobius" palette="ember" style="height: 100vh"></pro-threads>
```

场景会铺满这个元素的区域（最小高度 200 px）。它运行在 iframe 里，不会和你页面的样式或脚本冲突。它会延迟加载，画好第一帧后才淡入（不会闪白）；作为装饰，它不会被屏幕阅读器读到，也不会进入 Tab 键焦点顺序；滚出屏幕时停止绘制；访客如果开启了"减弱动态效果"，它会保持静止。

| 属性 | 取值 |
| --- | --- |
| `scene` | `pro`（壁纸，默认）、`az`（字母表）、`ring`、`blackhole`、`perspective`、`mobius`、`tunnel` |
| `text` | 壁纸上的单词，最多 10 个字母，例如 `text="HELLO"` |
| `palette` | `xdr-blue`、`graphite`、`ember`、`chroma`、`violet`、`ocean`、`aurora`、`rose-gold`、`paper` |
| `fps` | 每秒最多帧数：`30`、`60`（默认）或 `120` |
| `settings` | 其他任意设置，写成查询字符串，例如 `settings="speed=0.6&glow=1.2"`（见[网址参数](#设置与网址参数)；嵌入按钮会帮你写好） |
| `src` | 如果你自己托管了一份，就填它的地址（见[自行托管](#自行托管)） |

所有属性都是可选的。用脚本修改任何属性，场景会原地更新。首屏场景嵌入时默认不显示演示落地页，除非 `settings` 里写了 `landing=1`。

### 作为背景

```html
<section style="position: relative; min-height: 100vh">
  <pro-threads scene="tunnel" style="position: absolute; inset: 0; z-index: -1"></pro-threads>
  <h1>你的标题</h1>
</section>
```

### 通过 npm

直接从这个仓库安装：

```bash
npm install github:kubai087/pro-threads
```

```js
import 'pro-threads'; // 注册 <pro-threads> 元素
```

这个包的代码只有 `embed.js`；场景本身仍然从托管站点加载，或者通过 `src` 从你自己的副本加载。

- **React 19 / Next.js：** 像普通元素一样写 `<pro-threads scene="ring" />`。在服务端渲染时导入这个包不会做任何事，所以放在哪里导入都安全；元素会在浏览器里注册（在 Next.js 里，从客户端组件 `'use client'` 中导入）。用 TypeScript 的话，声明一次即可：

  ```ts
  declare module 'react' {
    namespace JSX {
      interface IntrinsicElements { 'pro-threads': any }
    }
  }
  ```

- **Vue：** 告诉编译器这是自定义元素：`compilerOptions.isCustomElement = (tag) => tag === 'pro-threads'`。

### 稳定性

嵌入的场景设计成出问题时安静地退让，而不是把你的页面弄坏：

- **运行时没有外部依赖。** 嵌入的场景不加载面板库，也不加载网络字体，只加载它自己的文件。
- **没有 WebGL 2**，或者访客的显卡编译不了着色器时，会显示一张静态图（壁纸）或一个深色背景（首屏场景），而不是一个空框。
- **显卡上下文丢失时**（比如驱动重置），浏览器把上下文还回来后，场景会自动重新加载。
- **错误的参数不会把它弄坏。** 超出面板范围的数值会被限制到范围内，无效的值（未知的场景、格式不对的颜色、`fps=abc` 之类）会退回默认值。
- **同一页上放很多个。** 浏览器同时保留的 WebGL 上下文数量有限。页面上的 `<pro-threads>` 超过四个时，离可视区很远并持续十秒的场景会被卸载，滚回来时再重新加载。
- **内容安全策略（CSP）。** 如果你的网站设置了 CSP，需要放行组件脚本（`script-src https://cdn.jsdelivr.net`）和场景所在的框架（`frame-src https://www.kubai.design`，或你自己副本的域名）。

### iframe

如果你不想引入脚本，在页面地址后加上 `embed=1` 即可。它会隐藏面板、关闭快捷键、不再改写网址，并让场景适配框架大小。

```html
<iframe src="https://www.kubai.design/pro-threads/hero/?scene=ring&landing=0&embed=1"
  title="PRO Threads" loading="lazy" style="display: block; width: 100%; height: 100vh; border: 0"></iframe>
```

### 自行托管

这是一个无需构建的静态文件夹。Fork 这个仓库并开启 GitHub Pages（*Settings → Pages → Deploy from a branch → `main`、`/ (root)`*），或者把文件夹拷到任意网页服务器上。然后用 `src` 让元素指向你的副本：

```html
<pro-threads src="https://you.github.io/pro-threads/" scene="ring"></pro-threads>
```

在你自己的副本上点嵌入按钮，生成的代码会自动带上 `src`。

### 固定版本

`@main` 总是加载这个仓库最新的 `embed.js`（jsDelivr 会缓存一段时间）。想固定在某个版本，就改用一个提交号：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/kubai087/pro-threads@<commit>/embed.js"></script>
```

这个元素只负责拼出 iframe 的地址；场景的样子取决于它指向的站点（默认是托管的演示站，或者通过 `src` 指向你自己的副本）。如果需要场景本身也固定不变，请自行托管。

## 设置与网址参数

你在面板里改的东西都会写进网址（只写和默认值不同的部分），所以刷新、收藏或分享链接都能打开同样的效果。在壁纸和首屏场景之间切换（面板上的 **PRO / A–Z / Shapes** 标签）时，会回到各自上次的状态，配色也会带过去。**强制刷新**（绕过缓存）会回到默认设置。面板上的 **Reset（重置）** 按钮会把参数恢复为默认值，保留当前的视图或场景。

所有设置也都可以直接写在网址里。颜色用不带 `#` 的十六进制，开关用 `1` 或 `0`。超出面板范围的数字会被限制到范围内，无效的值会被忽略。

### 两个页面通用

| 参数 | 作用 |
| --- | --- |
| `t=7` | 定格在某一时刻（单位是光线时钟的秒数），停止动画，用于截图 |
| `ui=0` | 打开时隐藏面板（按 `H` 显示） |
| `embed=1` | 嵌入模式：没有面板、没有快捷键、不改写网址，场景适配框架大小 |
| `lang=zh` | 面板显示为简体中文 |
| `palette=` | `xdr-blue`（默认）、`graphite`、`ember`、`chroma`、`violet`、`ocean`、`aurora`、`rose-gold`、`paper` |
| `fps=` | 每秒最多帧数：`30`、`60`（默认）或 `120` |
| `quality=` | 绘制屏幕像素的比例，`0.4`–`1`（高像素密度屏幕默认 `0.75`，其他默认 `1`） |
| `autoQuality=0` | 固定分辨率，帧率跟不上时也不降低 |
| `paused=1` | 打开时处于暂停状态 |

### 壁纸（`/`）

| 分组 | 参数（默认值） |
| --- | --- |
| 视图 | `view=az`（字母表；不写则显示单词）、`text`（`PRO`，最多 10 个字母 A–Z 和空格） |
| 预设 | `effect`：`original`（默认）、`calm`、`lively`、`silk`、`fine-wire`、`glow`、`low-light`。配色或效果会设定一组参数，同时写出的单个参数会覆盖它 |
| 尺寸 | `width`（`2000`）、`height`（`1293`）、`scale`（`1`–`4`，PNG 倍率）、`stretch`（`0`–`1`） |
| 动态 | `speed`（`1.6`）、`breathe`（`1.5`）、`swell`（`2`）、`fibrePace`（`1.4`） |
| 光线 | `gain`（亮度，`1.5`）、`reach`（`1`）、`floorDim`（`0.2`）、`floorLit`（`0.52`）、`density`（丝线密度，`1`）、`texture`（`1`）、`rim`（边缘高光，`1`） |
| 颜色 | `shadow`、`steel`、`silver`、`highlight`（渐变）、`glow`（边缘辉光）、`background`、`fibreCool`、`warmLight`、`warmMid`、`warmDeep`（彩丝）、`warm`（`0.6`）、`sparkle`（彩丝数量，`1`） |
| 字形 | `corner`（`28`）、`arch`（`40`）、`tip`（`66`），单位是原图像素 |
| 字母表 | `spacing`（`90`，字母间距，单位像素）、`rowGap`（`0.22`，行距，单位是字母高度） |
| 参考图 | `ref=0.5` 以该透明度叠加你自己的 `reference.webp`（见[参考图](#参考图)） |

示例：

- `?text=HELLO&palette=chroma&effect=calm&speed=1.2`
- `?width=402&height=874&scale=3&stretch=1`（iPhone 17 Pro，导出 1206 × 2622 的 PNG，字母铺满屏幕）
- `?palette=ember&background=1a0500&rim=1.6`

### 首屏场景（`/hero/`）

| 分组 | 参数（默认值） |
| --- | --- |
| 场景 | `scene`：`ring`（默认）、`blackhole`、`perspective`、`mobius`、`tunnel` |
| 落地页 | `landing=0` 隐藏演示落地页；`layout`：`auto`（默认，按场景自动选择）、`left`、`center` |
| 动态 | `speed`（光流速度，`1`）、`spin`（旋转，`1`）、`parallax`（视差，`1`） |
| 外观 | `zoom`（距离，`1`）、`threads`（丝线，`1`）、`sheen`（光泽，`0.8`）、`gain`（亮度，`1.4`）、`contrast`（对比度，`1`）、`saturation`（饱和度，`1`）、`warm`（暖度，`0.7`）、`sparkle`（彩丝，`1`） |
| 辉光 | `glow`（强度，`0.7`）、`threshold`（辉光起始亮度，`0.62`） |

示例：

- `?scene=blackhole&palette=ember`
- `?scene=perspective&palette=chroma&layout=center`
- `?scene=tunnel&palette=ocean&landing=0&ui=0`

首屏场景面板里的 **Save PNG（保存 PNG）** 会按画布两倍大小保存。

## 快捷键

| 按键 | 作用 |
| --- | --- |
| `H` | 显示或隐藏面板 |
| `Space` | 暂停或继续 |
| `R` | 叠加参考图（仅壁纸，需要你自己提供） |
| `Esc` | 关闭嵌入对话框或下拉菜单 |

在输入框里打字、按住修饰键（这样浏览器自己的快捷键照常可用）以及嵌入模式下，快捷键都不响应。下拉菜单也支持方向键、`Enter` 和 `Space`。

## 本地运行

不需要安装或构建任何东西。用 HTTP 提供这个文件夹即可（ES 模块不能从 `file://` 加载）：

```bash
git clone https://github.com/kubai087/pro-threads.git
cd pro-threads
python3 -m http.server 8765
```

然后打开 <http://localhost:8765> 查看壁纸，打开 <http://localhost:8765/hero/> 查看首屏场景。任何静态服务器都可以（`npx serve`、`php -S` 等）。

面板的库（Tweakpane 及其 Essentials 插件）从 jsDelivr 加载，演示落地页的字体从 Google Fonts 加载。两者都不会拖住场景：加载不到时，场景照常运行，只是没有面板，或者用备用字体显示。

### 参考图

如果想和原壁纸对比，把你自己的一份原图命名为 `reference.webp` 放在 `index.html` 旁边，然后按 `R`（或用 `?ref=0.5` 打开）。这个仓库不包含原图，git 也会忽略它。

## 实现原理

### 壁纸

主要靠几何，而不是噪声。每个字母由几片平行竖直光丝组成的**丝片**构成。在丝片的每一端，每根光丝先直走，再逐渐转弯，直到平躺在端部；而每根丝横向偏移的距离在整片上是线性变化的。所以丝片最外侧的光丝自然画出了轮廓：圆角、缝上方的尖拱、长长的外撇尖角。

由于偏移量对光丝自身的坐标 **ψ** 是线性的，每个像素都能精确解出自己落在哪根丝上。于是一次全屏绘制中，每个像素会：

1. **找到**自己所在的行、字母和丝片。
2. **解出 ψ**、到丝片边缘的距离，以及光丝在这里的倾斜程度；边缘用"距离除以梯度"做抗锯齿。
3. **平均**像素下覆盖的光丝。光丝平躺的地方会互相重叠，条纹融成一片柔和的光泽。
4. **打光**：亮度衰减曲线按原作的亮度拟合，再加上缓慢的呼吸、扫过的光涌和沿光丝流动的光带。
5. **上色**：通过配色渐变映射，高光柔和过渡，再加上边缘高光、彩丝，以及光线尽头的暖色辉光。
6. **合成**重叠的丝片时把它们当作半透明的丝，所以在缝的上方交叉的地方两片都能看见。

每根丝的差异来自 ψ 的哈希值和三层值噪声。字母的丝片和彩丝数据打包在一张很小的浮点纹理里（`letters.js`），着色器逐个像素读取。保存 PNG 时分块绘制，再拷进同一张 2D 画布，所以能比 WebGL 单次能画的尺寸更大。

### 首屏场景

圆环、透视、莫比乌斯环和隧道都是**带状网格**：沿曲线铺开的一条光丝带，`u` 沿着光丝方向，`v` 横跨光丝（`hero/shapes.js`）。它们用多重采样加深度缓冲绘制，着色方式和壁纸一样：每根丝有自己的亮度，上面叠着更宽的光带，光沿丝线流动，再经过配色渐变、边缘高光和彩丝。莫比乌斯环转了半圈后，光丝会以相反的顺序和自己接上，着色器在接缝处做了过渡。

**黑洞**是一次光线追踪：光线绕着黑洞弯曲，所以能看到吸积盘从黑洞上下两侧绕过去，还有一圈光子环。

每个场景最后都会加上**辉光**：把亮的部分按四分之一和八分之一尺寸模糊后叠回画面，再做对比度和饱和度调色。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `index.html`、`style.css` | 壁纸页面及其布局 |
| `wallpaper.js` | 壁纸：设置、WebGL 初始化、绘制、PNG 导出和面板 |
| `letters.js` | A–Z 字体（用丝片描述），以及 `pack()`，负责把一行行字母排好交给着色器 |
| `shader.js` | 壁纸的顶点和片段着色器 |
| `palettes.js` | 9 套配色，两个页面共用 |
| `pace.js` | 何时绘制：帧率上限、滚出屏幕或页面隐藏时暂停、发现掉帧 |
| `persist.js` | 设置写入网址、每个页面在当前标签页里的设置记忆、强制刷新检测、嵌入模式 |
| `menu.js` | 面板的自定义下拉菜单，支持分组和附加说明 |
| `i18n.js` | 面板的英文和简体中文 |
| `share.js` | 嵌入对话框及其代码片段 |
| `embed.js` | `<pro-threads>` Web 组件（也是 npm 包的入口） |
| `panel.js` | 只在用到面板时才加载面板库，加载不到时用一个替身 |
| `webgl.js` | 安全地获取 WebGL 2 上下文：没有时显示静态图，上下文丢失后重新加载 |
| `hero/index.html`、`hero/style.css` | 首屏场景页面、布局和演示落地页的样式 |
| `hero/hero.js` | 首屏场景：相机、渲染目标、辉光和面板 |
| `hero/shaders.js` | 光丝带、黑洞、背景、辉光和合成的着色器 |
| `hero/shapes.js` | 带状网格：圆环、透视墙、莫比乌斯环和隧道 |
| `hero/landing.js` | 叠在场景上的演示落地页，带实时帧时间图 |
| `media/` | 本 README 用到的截图，均由本项目渲染 |
| `favicon.svg`、`favicon-32.png`、`apple-touch-icon.png` | 图标 |

## 浏览器支持

PRO Threads 需要 **WebGL 2**。它面向当前版本的 Chrome、Edge、Safari 和 Firefox，还用到了 ES 模块、CSS 容器查询、`ResizeObserver` 和 `IntersectionObserver`，这些浏览器都支持。没有 WebGL 2 时，壁纸会显示一张静态图，首屏场景显示深色背景。

## 性能

- **默认 60 帧上限。** 120 Hz 屏幕不需要把光画两倍那么多次；可以在面板里或用 `fps=` 选 30、60 或 120。
- **看不见就不画。** 画布滚出可视区、标签页隐藏或场景暂停时，都不绘制。
- **自动分辨率。** 高像素密度屏幕上只绘制 75% 的像素。如果帧持续明显超出预算，分辨率会自动逐级降低（最低到一半）；可以在 Performance（性能）分组里关掉 **Auto（自动）**，或用 `autoQuality=0`。
- **定格不耗资源。** 使用 `t=` 时页面只画一次就停下。

## 参与贡献

欢迎提 Issue 和 Pull Request。运行方式、代码风格和提交信息格式见 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请按 [SECURITY.md](SECURITY.md) 的说明私下报告。更新记录见 [CHANGELOG.md](CHANGELOG.md)。

## 致谢与商标

- 灵感来自 Apple 的 MacBook Pro PROLED XDR 壁纸。本项目是从零编写的独立再创作，**与 Apple Inc. 没有任何关联，也未获其认可或赞助**。Apple、MacBook Pro 和 PROLED XDR 是 Apple Inc. 的商标。
- 仓库不包含任何 Apple 的美术素材。原壁纸图片不在本仓库中；`reference.webp` 已被 git 忽略，只有你自己提供时才会在本地使用。
- [Tweakpane](https://tweakpane.github.io/docs/) 和 [@tweakpane/plugin-essentials](https://github.com/tweakpane/plugin-essentials) 采用 MIT 许可，从 jsDelivr 加载。
- 演示落地页使用 Google Fonts 上的 [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)、[Raleway](https://fonts.google.com/specimen/Raleway) 和 [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)，遵循 SIL Open Font License。

## 许可证

[MIT](LICENSE) © Kubai087。许可证涵盖代码和 `media/` 中的图片（都是本项目的渲染图）。
