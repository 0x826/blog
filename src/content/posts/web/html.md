---
title: HTML
description: HTML
pubDate: 2026-07-17
category: 前端
tags: ["html", "面试", "前端"]
heroImage: /images/covers/code-monitor.jpg
---


### 什么是语义化标签？为什么要语义化？
1. **提升代码可读性与可维护性**：让代码结构更清晰，便于团队协作。
2. **有利于搜索引擎优化 (SEO)**：爬虫能更好地理解页面结构和内容权重。
3. **增强无障碍访问 (a11y)**：方便屏幕阅读器等辅助设备解析页面。
4. **降级体验**：在不使用 CSS 或 CSS 加载失败的情况下，依然能看出页面的基本轮廓和层级。

### DOCTYPE 的作用是什么？
声明文档类型（如 HTML5），并**触发浏览器的标准渲染模式**，防止浏览器进入怪异模式（Quirks Mode）。

### 标准模式与怪异模式的区别？
- **标准模式**：浏览器严格按照 W3C 规范解析和渲染页面。
- **怪异模式**：浏览器为了兼容老旧网页，使用非标准的、向后兼容的方式渲染（模拟旧版 IE 的行为）。
- **盒模型差异**：标准模式下默认使用**标准盒模型**；怪异模式下（特别是针对旧版 IE）默认使用 **IE 盒模型**。
  - **标准盒模型**：`width/height` = `content`（内容区域）。
  - **IE 盒模型**：`width/height` = `content` + `padding` + `border`。

```css
/* 现代开发中，推荐全局统一使用 IE 盒模型（替代盒模型） */
*, *::before, *::after {
  box-sizing: border-box;
}
```

### 行内元素与块级元素的区别？有哪些？
- **行内元素 (inline)**：与其他元素同行排列，宽高由内容决定，不支持设置宽高和上下 margin。如 `span`, `a`, `strong`, `img`, `input`。
- **块级元素 (block)**：独占一行，可设置宽高和所有 margin/padding。如 `div`, `p`, `h1-h6`, `ul`, `li`, `form`。

### src 和 href 的区别？
- **`src` (Source)**：用于**引入**外部资源（如 `<script src>`, `<img src>`, `<iframe src>`）。
  - 对于 `<script>`，浏览器会**暂停** HTML 解析，去下载并执行脚本（**会阻塞 DOM 解析**，除非加了 `async` 或 `defer`）。
  - **`async`**：并行下载，**下载完成后立即执行**（**会阻塞** DOM 解析，执行顺序不可控）。
  - **`defer`**：并行下载，**DOM 解析完成后、DOMContentLoaded 触发前**按顺序执行（**不会阻塞** DOM 解析）。
- **`href` (Hypertext Reference)**：用于建立当前文档与外部资源的**链接**（如 `<link href>`, `<a href>`）。
  - 浏览器会**并行**下载资源，**不会中断** HTML 文档的解析。

### meta 标签有哪些常见用途？
1. **字符编码**：`<meta charset="UTF-8">`
2. **移动端视口配置**：`<meta name="viewport" content="width=device-width, initial-scale=1.0">`
3. **SEO 优化**：`<meta name="description" content="...">`, `<meta name="keywords" content="...">`
4. **浏览器行为控制**：`<meta http-equiv="X-UA-Compatible" content="IE=edge">`
5. **安全策略**：`<meta http-equiv="Content-Security-Policy" content="...">`

### 如何做 HTML 层面的 SEO 优化？
- **结构语义化**：合理使用 `header`, `article`, `nav` 等标签。
- **信息完整化**：完善 `title`, `description`, `alt`（图片替代文本）。
- **内容可被抓取**：采用 SSR（服务端渲染）或 SSG（静态站点生成）；配置 `sitemap.xml` 和 `robots.txt`。

### canvas 与 svg 的区别？如何选型？
- **SVG**：矢量图，基于 XML，放大不失真；DOM 节点，可通过 CSS/JS 单独操作每个图形；**适合**图标、简单图表、需要独立交互的图形。
- **Canvas**：像素图（位图），基于 JS 逐像素绘制；单 DOM 节点，无法直接操作内部图形（需重绘整个画布）；**适合**复杂动画、游戏、大数据量可视化（如 WebGL）。

### iframe 的优缺点？
- **优点**：核心价值是**强隔离**（CSS/JS 独立），适合嵌入第三方内容（广告、支付、地图）；可实现跨域通信。
- **缺点**：阻塞父页面 `onload` 事件；SEO 不友好（搜索引擎难以抓取内部内容）；移动端适配差；跨域通信需使用 `postMessage`；存在安全隐患（需配合 `sandbox` 和 CSP 防点击劫持）。

### HTML5 有哪些新特性？
- **语义标签**：`header`, `nav`, `article`, `section`, `footer`, `figure`, `time`, `mark`。
- **表单增强**：新 input 类型（`email/date/range/color`）、`placeholder`, `required`, `pattern`, `datalist`。
- **多媒体**：`audio`, `video`, `track`，全部无需插件。
- **图形**：`canvas`、内联 `svg`。
- **存储**：`localStorage`（永久）、`sessionStorage`（会话级）、`IndexedDB`（本地数据库）。
- **离线与通信**：`Service Worker`（离线缓存/拦截请求）、`Web Worker`（后台线程）、`WebSocket`（双向长连接）、`SSE`（单向推送）。
- **设备 API**：地理定位、拖放、`requestAnimationFrame`（按刷新节奏执行动画）。

### 什么是 BFC？如何触发？有什么应用？
- **BFC (块级格式化上下文)**：一个独立的渲染区域，内部元素的布局不会影响外部，反之亦然。
- **触发条件**：
  1. 根元素 `<html>`
  2. `float` 不为 `none`
  3. `position` 为 `absolute` 或 `fixed`
  4. `display` 为 `inline-block`, `flex`, `grid`, `table-cell`, `flow-root` 等
  5. `overflow` 不为 `visible`（如 `hidden`, `auto`, `scroll`）
- **三大应用**：
  1. 清除内部浮动（防止父元素高度塌陷）。
  2. 防止 margin 重叠（塌陷）。
  3. 阻止元素被浮动元素覆盖（实现自适应两栏布局）。

### CSS 选择器优先级如何计算？
- **权重计算 (Specificity)**：
  - `!important`：最高优先级（但应尽量避免使用，破坏层叠规则）。
  - 行内样式（`style="..."`）：1000
  - ID 选择器（`#id`）：100
  - 类、伪类、属性选择器（`.class`, `:hover`, `[type="text"]`）：10
  - 标签、伪元素选择器（`div`, `::before`）：1
  - 通配符、组合器（`*`, `>`, `+`）：0
- **规则**：从左到右比较权重，权重相同则后定义的覆盖先定义的。

### 哪些 CSS 属性可以继承？
- **可继承**：颜色、字体相关（`color`, `font-*`, `line-height`, `text-align`）、列表相关（`list-style`）、可见性（`visibility`）、光标（`cursor`）。
- **不可继承**：盒模型（`width`, `margin`, `padding`）、定位（`position`, `z-index`）、背景（`background`）、布局（`display`, `flex`）。

### display 各取值的含义？
- `block`：块级，独占一行。
- `inline`：行内，同行排列，不支持宽高。
- `inline-block`：行内块，同行排列，支持宽高。
- `none`：不渲染，不占据空间。
- `flex`：弹性盒子（一维布局）。
- `grid`：网格容器（二维布局）。
- `table / table-cell`：表格布局。
- `flow-root`：创建 BFC，无副作用。
- `contents`：元素自身不生成盒，其子元素直接参与父级布局。

### position 各取值与定位原理？
- `static`：默认，正常文档流，`top/left` 无效。
- `relative`：相对自身原位置偏移，**不脱离文档流**。
- `absolute`：脱离文档流，相对最近的**非 static** 祖先元素偏移。
- `fixed`：脱离文档流，相对**浏览器视口**偏移，滚动不移动。
- `sticky`：粘性布局，滚动到阈值前表现为 `relative`，达到阈值后表现为 `fixed`。

### 浮动的原理与清除浮动的方法？
- **原理**：浮动元素会脱离文档流，导致父元素无法计算其高度，产生**高度塌陷**。
- **清除方法**：
```css
/* 1. 推荐：clearfix 伪元素（触发 BFC 清除） */
.clearfix::after { content: ""; display: block; clear: both; }
 
/* 2. 父级触发 BFC */
.parent { overflow: hidden; } /* 或 display: flow-root; */
 
/* 3. 额外空标签（不推荐，污染 DOM 结构） */
<div style="clear:both"></div>
```

### margin 合并（塌陷）是什么？如何避免？
- **现象**：只有普通文档流中的块级元素，在**垂直方向**上相邻时，上下 margin 会合并，取两者中的**较大值**。
- **避免方法**：
  1. 使用 Flex 或 Grid 布局（子元素的 margin 不会合并）。
  2. 触发 BFC（如父元素设置 `overflow: hidden`）。
  3. 规范代码：只设置单边 margin（如统一用 `margin-bottom`）。
  4. 使用 `padding` 替代 `margin`。

### Flex 布局完整属性？
**容器属性**：
- `flex-direction`：主轴方向（`row`, `column` 等）。
- `flex-wrap`：是否换行（`nowrap`, `wrap`）。
- `justify-content`：主轴对齐（`flex-start`, `center`, `space-between`, `space-around`）。
- `align-items`：交叉轴对齐（`stretch`, `center`, `flex-start`）。
- `align-content`：多根交叉轴的对齐（换行时生效）。

**项目属性**：
- `order`：排列顺序。
- `flex-grow`：放大比例（默认 0）。
- `flex-shrink`：缩小比例（默认 1）。
- `flex-basis`：占据主轴的初始大小（默认 `auto`）。
- `flex`：上述三者的简写。
- `align-self`：单个项目的交叉轴对齐，覆盖容器的 `align-items`。

### flex: 1 到底代表什么？
`flex: 1` 是 `flex: 1 1 0%` 的简写。
代表：`flex-grow: 1`（按比例分配剩余空间），`flex-shrink: 1`（空间不足时按比例缩小），`flex-basis: 0%`（初始主轴尺寸为 0）。因此，设置 `flex: 1` 的元素会忽略内容宽度，完全按 1:1 的比例瓜分容器的剩余空间。

### Grid 布局核心属性？
**容器属性**：
- `grid-template-columns / rows`：定义列/行尺寸（如 `1fr 2fr`, `repeat(3, 1fr)`）。
- `grid-template-areas`：定义网格区域命名。
- `gap`：设置网格间距。
- `justify-items / align-items`：单元格内容在网格区域内的对齐。
- `justify-content / align-content`：整个网格在容器内的对齐。

**项目属性**：
- `grid-column / row`：指定跨越的列/行起止位置（如 `1 / 3`）。
- `grid-area`：指定命名区域或作为起止位置的简写。

### 各种垂直水平居中方案？
```css
/* 1. Flex（最常用、最推荐） */
.parent { display: flex; justify-content: center; align-items: center; }
 
/* 2. Grid（最简洁） */
.parent { display: grid; place-items: center; }
 
/* 3. absolute + transform（不需知道子元素宽高） */
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
 
/* 4. absolute + margin auto（需已知宽高或 inset:0） */
.child { position: absolute; inset: 0; margin: auto; width: 100px; height: 100px; }
```

### z-index 失效的常见原因？
1. 元素未设置 `position`（`z-index` 仅对定位元素和 Flex/Grid 子元素有效）。
2. 被父元素的**层叠上下文 (Stacking Context)** 隔离（父元素 `z-index` 较小，子元素再大也无法突破）。
3. 元素是 Flex/Grid 子元素，但 `z-index` 默认值为 `auto`，需显式设置数值。

### position:sticky 吸顶怎么用？为什么有时失效？
- **用法**：`sticky = relative + fixed` 的混血儿，必须设置 `top/bottom` 等阈值。
- **失效排查**：
  1. 父元素或祖先元素设置了 `overflow: hidden/auto/scroll`（截断了滚动参考）。
  2. 没有设置 `top`/`bottom` 阈值。
  3. 父元素的高度小于 sticky 元素的高度（没有滚动空间）。

### px、em、rem、vw/vh、% 的区别？
- `px`：绝对单位，设备像素。
- `em`：相对**当前元素**的 `font-size`。**坑**：会层层叠加，嵌套深了字越来越大，适合做“跟着字号联动”的局部缩放。
- `rem`：相对**根元素 (html)** 的 `font-size`。统一基准、不受嵌套影响，是移动端适配的主流方案。
- `vw/vh`：相对**视口**宽/高的百分比（1vw = 视口宽度的 1%）。
- `%`：相对**父元素**的对应属性（如宽度相对父宽度，高度相对父高度）。

### 移动端适配方案有哪些？
主流套路：`viewport meta` 打底，再叠加 **rem 方案**（配合 `postcss-pxtorem` 自动转换）、**vw 方案**（配合 `postcss-px-to-viewport`）、或 **flex/grid + 百分比 + 媒体查询**。

### 移动端 1px 边框问题如何解决？
高清屏上 CSS 的「1px」会被渲染成 2~3 个物理像素，显得偏粗。
- **最推荐方案**：使用**伪元素 + transform: scale**。用 `::after` 画 1px 边框，然后 `transform: scaleY(0.5)` 或 `scale(0.5)`。
- 其他方案：`box-shadow` 模拟（颜色易发虚）、viewport 整体缩放（副作用大）。

### CSS 自定义属性（变量）怎么用？
```css
:root {
  --primary: #3498db;
  --gap: 16px;
}
.box {
  color: var(--primary);
  padding: var(--gap, 8px);  /* 第二参数为兜底值 */
}
```

### calc / clamp / min / max 怎么用？
- `calc`：做混合单位的加减乘除（如 `width: calc(100% - 20px)`）。
- `min / max`：取较小/较大值（如 `width: min(500px, 100%)`）。
- `clamp`：设「下限-首选-上限」三段式，专治响应式字号（如 `font-size: clamp(16px, 2vw, 24px)`）。

### Sass/Less 解决了什么问题？
预处理器给 CSS 补上「变量/嵌套/mixin/函数/循环」的编程能力，编译后输出普通 CSS。

### PostCSS 是什么？和预处理器的关系？
- **PostCSS**：基于插件的 CSS **后处理**平台，典型用 `autoprefixer` 加前缀、`cssnano` 压缩。
- **关系**：不是竞争关系。预处理器做「超集语言 ➔ CSS」，PostCSS 做「CSS ➔ CSS」，实战中一前一后配合。

### CSS Modules 与 CSS-in-JS 的区别？
- **CSS Modules**：构建期哈希类名、零运行时开销、适合稳定样式。
- **CSS-in-JS**：在 JS 里写样式、可按 props 动态生成、和逻辑共享变量；代价是运行时开销和 SSR 配置复杂（除非用零运行时方案如 Vanilla Extract）。

### 原子化 CSS（Tailwind/UnoCSS）是什么？优缺点？
- **优点**：开发极快（无需命名类名）、样式复用率高、打包体积极小（按需生成）、无需在 CSS 和 JS 间切换。
- **缺点**：HTML 中类名冗长（“class 地狱”）、学习曲线（需记忆大量工具类）、不利于复杂动画和伪类的维护、脱离 HTML 后样式难以复用。

### 什么是重排（回流）和重绘？如何减少？
- **重排 (Reflow/Layout)**：DOM 变化影响几何信息（宽高、位置），浏览器重新计算布局。**代价极高**。
- **重绘 (Repaint)**：元素外观改变但不影响布局（如颜色、阴影），浏览器重新绘制像素。**代价中等**。
- **关系**：重排必定导致重绘，重绘不一定导致重排。
- **减少方法**：
  1. 批量修改 DOM（使用 `DocumentFragment` 或先隐藏再修改）。
  2. 避免频繁读取布局信息（如 `offsetTop`, `getComputedStyle` 会触发强制同步布局）。
  3. 使用绝对/固定定位，使元素脱离文档流。
  4. 使用 CSS3 硬件加速（`transform`, `opacity`），跳过重排重绘。

### will-change 与合成层是什么？有何注意？
- **合成层 (Compositing Layer)**：浏览器将某些元素（如设置了 `transform`, `opacity` 的元素）提升为独立层，由 GPU 渲染。修改它们时**不会触发重排和重绘**，性能极高。
- **will-change**：提前告诉浏览器“这个元素即将发生变化”，让其提前创建合成层。
- **注意事项**：
  1. **不要滥用**：合成层会占用额外 GPU 内存，滥用会导致内存泄漏和卡顿。
  2. **用完即毁**：动画结束后，通过 JS 移除 `will-change` 属性释放内存。

### 隐藏元素的多种方式有何区别？
| 属性 | 占据空间 | 触发重排/重绘 | 绑定事件 | 子元素继承 | 适用场景 |
|---|---|---|---|---|---|
| `display: none` | ❌ 不占据 | 触发重排+重绘 | ❌ 无法触发 | ❌ 不继承 | 彻底隐藏，如折叠面板、Tab 切换。 |
| `visibility: hidden` | ✅ 占据 | 仅触发重绘 | ❌ 无法触发 | ✅ 继承（子设 visible 可显示） | 隐藏但保留占位，防布局抖动。 |
| `opacity: 0` | ✅ 占据 | 仅触发重绘/合成 | ✅ 可触发 | ❌ 不继承 | 需要淡入淡出动画，或保留交互（透明按钮）。 |
| `z-index: -1` | ✅ 占据 | 仅触发重绘 | ❌ 被遮挡无法触发 | ❌ 不继承 | 将元素置于底层（需配合 position）。 |