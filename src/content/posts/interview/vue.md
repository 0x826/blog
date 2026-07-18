---
title: vue
description: vue
pubDate: 2026-07-17
category: 前端
tags: ["vue", "面试", "前端"]
---

### 一、 响应式原理 (Vue2 vs Vue3)

**1. Vue2 响应式原理 & Object.defineProperty**

- **原理**：通过 `Object.defineProperty` 劫持数据的 `getter` 和 `setter`。在 `getter` 中进行**依赖收集**（将 Watcher 存入 Dep），在 `setter` 中进行**派发更新**（通知 Dep 中的 Watcher 触发视图更新）。

**2. Vue2 响应式缺陷 & Vue.set / Vue.delete**

- **缺陷**：无法检测对象属性的新增/删除；无法检测数组索引的变化和长度的修改。
- **解决**：`Vue.set` 内部对对象调用 `defineProperty` 劫持新属性并触发更新；对数组则调用重写的 `splice` 方法。`Vue.delete` 同理，删除属性后触发更新。

**3. Vue2 数组响应式 & 方法重写**

- **原理**：Vue 创建了一个继承自 `Array.prototype` 的新原型对象，重写了 7 个变更方法（`push/pop/shift/unshift/splice/sort/reverse`）。将数组的 `__proto__` 指向这个新原型。调用这些方法时，先执行原生逻辑，再手动触发依赖更新。

**4. Vue3 为什么用 Proxy 替代 defineProperty？**

- **全面性**：Proxy 可以拦截整个对象，原生支持属性新增/删除、数组索引和长度变化、Map/Set 等集合。
- **性能**：Proxy 是**懒代理**（访问到深层属性时才代理），而 Vue2 在初始化时需要递归遍历所有属性，性能更好。

**5. Vue3 中 Reflect 的作用**

- **保证 this 指向**：`Reflect.get/set` 的第三个参数 `receiver` 能保证 `getter/setter` 中的 `this` 正确指向代理对象。
- **保证默认行为**：返回布尔值，配合 Proxy 的布尔返回值要求，保证操作成功与否的正确反馈。

**6. Vue3 effect、track、trigger 协作机制**

- `effect`：创建响应式副作用函数，执行时将其赋值给全局 `activeEffect`。
- `track`：在 `getter` 中触发，将当前的 `activeEffect` 收集到 `targetMap` (WeakMap) 中。
- `trigger`：在 `setter` 中触发，从 `targetMap` 中找出相关依赖，执行对应的 `effect`。

**7. ref 和 reactive 的区别与原理**

- `ref`：用于基本类型（也可用于对象）。底层通过 `get value()` 和 `set value()` 实现劫持，值存在 `.value` 中。
- `reactive`：用于对象。底层通过 `Proxy` 实现深度代理。

**8. 各种 API 的作用**

- `toRef`：为 `reactive` 对象的属性创建一个 ref，保持响应式连接。
- `toRefs`：解构 `reactive` 对象时，将其所有属性转为 ref，保持响应式。
- `shallowRef`：只劫持 `.value` 的赋值，不深度代理内部对象（适合大对象/第三方库实例）。
- `shallowReactive`：只代理对象的第一层属性。
- `readonly`：创建深度只读代理，拦截所有修改操作。

**9. isRef、unref、customRef**

- `isRef`：判断是否为 ref 对象。
- `unref`：如果是 ref 返回 `.value`，否则返回本身（常用于模板或工具函数中）。
- `customRef`：自定义 ref，提供 `get/set` 追踪依赖。**典型场景**：实现防抖/节流的输入框。

---

### 二、 虚拟 DOM 与 Diff 算法

**10. 虚拟 DOM 优缺点**

- **优点**：保证性能下限（避免非法 DOM 操作）；实现跨平台；将手动 DOM 操作变为声明式。
- **缺点**：无法做到极致优化（首次渲染有创建 VNode 的开销）；极端场景下性能不如原生 DOM 操作。

**11. Vue2 diff 算法（双端比较）**

- 对比新旧头节点、新旧尾节点、旧头新尾、旧尾新头。若 4 种都不匹配，则通过 `key` 创建旧节点的哈希表进行查找。

**12. Vue3 快速 diff 优化**

- **预处理**：先同步头尾相同的节点。
- **核心**：中间剩余部分使用**最长递增子序列**算法。

**13. 最长递增子序列的作用**

- 找出无需移动的节点序列，其余节点只需根据该序列进行**最小化移动**，大幅减少 DOM 操作。

**14. patchFlag、静态提升、Block Tree (编译期优化)**

- `patchFlag`：编译时给动态节点打标记（如文本、class），diff 时只对比标记部分，跳过静态对比。
- 静态提升：将静态节点/属性提取到外部变量，避免每次渲染重复创建。
- Block Tree：将带有 `patchFlag` 的节点收集为 Block，diff 时直接对比 Block 内的动态节点（**扁平化 diff**），跳过静态节点。

---

### 三、 模板编译与 Tree-shaking

**15. 模板编译流程**

- **Parse**：将模板字符串解析为 AST（抽象语法树）。
- **Transform**：优化 AST，添加 `patchFlag`、静态提升等标记。
- **Generate**：将 AST 转换为 `render` 函数字符串。

**16. 为什么 Vue3 对 Tree-shaking 更友好？**

- Vue3 将全局 API 改为按需引入（如 `import { nextTick } from 'vue'`）。编译产物也会按需引入运行时 API，未使用的 API 会被打包工具（Webpack/Vite）自动剔除。

---

### 四、 计算属性、侦听器与生命周期

**17. computed vs watch & 缓存原理**

- `computed` 有缓存，依赖不变不重新计算，侧重**派生状态**；`watch` 无缓存，侧重**副作用**（如请求、操作 DOM）。
- **缓存原理**：内部维护 `dirty` 标志位。依赖变化时置为 `true`，读取时若为 `true` 才重新求值并置为 `false`。

**18. computed 的 setter**

- 可以设置。当需要直接给计算属性赋值时使用（如双向绑定一个派生状态）。

**19. watch 的 deep、immediate、flush**

- `deep`：深度监听对象内部变化。
- `immediate`：初始化时立即执行一次回调。
- `flush`：控制回调执行时机（`pre` 更新前，`post` 更新后，`sync` 同步）。

**20. watch vs watchEffect**

- `watch`：需显式指定数据源，可获取新旧值，默认懒执行。
- `watchEffect`：自动收集内部用到的响应式依赖，无法获取旧值，默认立即执行。

**21. 生命周期对应 & setup 执行时机**

- `beforeCreate/created` -> `setup`；`beforeMount` -> `onBeforeMount`，以此类推。
- `setup` 在 `beforeCreate` 之前执行，此时组件实例还未完全创建，**没有 `this`**。

---

### 五、 模板指令与内置组件

**22. v-if vs v-show**

- `v-if`：真正的条件渲染，销毁/创建 DOM。切换开销大，适用**条件很少改变**的场景。
- `v-show`：仅切换 CSS `display`。初始渲染开销大，适用**频繁切换**的场景。

**23. v-for 的 key**

- 用于 Diff 算法识别 VNode 身份。不用 `index` 是因为当列表发生插入/删除/排序时，`index` 不变但内容变了，会导致**错误复用**或**无效更新**。

**24. v-model 原理及 Vue2/3 差异**

- **原理**：语法糖。Vue2 是 `:value` + `@input`。
- **差异**：Vue3 改为 `:modelValue` + `@update:modelValue`，且**支持在同一个组件上使用多个 v-model**。

**25. .sync 修饰符**

- Vue2 中用于 prop 双向绑定（`:title.sync` 等同于 `:title` + `@update:title`）。Vue3 移除，**统一用 v-model 替代**。

**26. 事件修饰符**

- `.stop` (阻止冒泡), `.prevent` (阻止默认), `.capture` (捕获阶段), `.self` (仅自身触发), `.once` (只触发一次), `.passive` (不阻止默认，提升滚动性能)。

**27. 插槽原理**

- 本质是**函数**。父组件传递插槽模板（函数），子组件在 render 中执行该函数。作用域插槽则是子组件执行函数时**传入数据**作为参数。

**28. Fragment / 多根节点**

- Vue3 虚拟 DOM 支持 `Fragment` 类型，允许组件返回数组形式的 VNode，编译器和 Patch 算法直接处理多根节点。

**29. nextTick 原理**

- 利用微任务（Promise/MutationObserver）或宏任务将回调推迟到下次 DOM 更新循环之后。数据修改后，Watcher 异步更新 DOM，`nextTick` 保证在 DOM 更新完毕后执行。

**30. keep-alive 原理**

- 缓存组件实例（VNode），不销毁。通过 `include/exclude` 匹配。从缓存读取时触发 `activated`，被隐藏时触发 `deactivated`。

**31. 动态组件 & 异步组件**

- `<component :is="comp">` 动态切换。
- Vue3 异步组件用 `defineAsyncComponent`，支持配置 `loadingComponent`、`errorComponent`、`delay`、`timeout`。

**32. Teleport & Suspense**

- `Teleport`：将组件内部 DOM 渲染到指定节点（如 `body`），解决模态框 `z-index` 和样式隔离问题。
- `Suspense`：处理异步依赖（异步组件或 async setup），提供 `#default` 和 `#fallback` 插槽处理加载状态。

---

### 六、 Composition API 与组件通信

**33. Composition API vs Options API**

- Options 按选项（data, methods）组织，逻辑分散；Composition 按**逻辑功能**组织，代码复用好，TS 支持极佳。

**34. mixin vs Composables (组合式函数)**

- `mixin` 有命名冲突、数据来源不清晰的问题。
- `Composables` 利用函数返回响应式数据，来源清晰，无冲突，是 Vue3 推荐的复用方式。

**35. `<script setup>` 优势**

- 编译时语法糖。优势：更少样板代码；更好的 TS 推断；更好的运行时性能（无需创建 proxy 暴露变量）；顶层变量直接暴露给模板。

**36. setup 参数**

- `props`：响应式，只读。
- `context`：包含 `attrs`, `slots`, `emit`, `expose`。非响应式，需解构使用。

**37. 组件间通信方式**

- 父子：`props/emit`, `$parent/$refs`。
- 跨级：`provide/inject`。
- 全局：`Vuex/Pinia`。
- 兄弟/任意：`EventBus` (Vue3 需引入 mitt 等第三方库)。
- 透传：`$attrs`。

**38. provide / inject**

- 祖先提供，后代注入。保持响应式需传入 `ref/reactive` 或 `computed`。注意解构会丢失响应式（需用 `toRefs`）。

**39. $attrs 变化 & emits 选项**

- Vue2 中 `$attrs` 包含未声明 prop，`$listeners` 包含事件。Vue3 **合并到 `$attrs`**。
- `emits` 选项用于声明组件触发的自定义事件，决定事件是作为原生监听器还是自定义事件（影响 `$attrs`）。

**40. defineExpose**

- 在 `<script setup>` 中显式暴露属性/方法给父组件（通过 ref 获取）。默认封闭是为了安全和减少代理开销。

---

### 七、 状态管理 (Vuex & Pinia)

**41. Vuex 核心概念**

- `state` (状态), `getter` (计算属性), `mutation` (同步修改), `action` (异步操作), `module` (模块化)。

**42. Vuex 严格模式 & 命名空间**

- 严格模式：禁止在 mutation 外修改 state（开发环境报错）。
- 命名空间：`namespaced: true` 让 module 拥有独立的 `dispatch/commit` 命名空间，避免冲突。

**43. Pinia 优势 & 两种写法**

- **优势**：无 mutations；TS 支持极好；无模块嵌套（扁平化）；体积更小；支持 SSR。
- **写法**：Options Store（类似 Vuex）和 Setup Store（类似 setup 函数，返回 ref/computed，更灵活）。

---

### 八、 Vue Router

**44. hash vs history 模式**

- `hash`：带 `#`，不发给服务器，兼容性好。
- `history`：基于 H5 API，URL 美观，需服务器配置 fallback 防 404。

**45. 导航守卫及执行顺序**

- 全局（`beforeEach`, `beforeResolve`, `afterEach`） -> 路由独享（`beforeEnter`） -> 组件内（`beforeRouteLeave`, `beforeRouteUpdate`, `beforeRouteEnter`）。
- **完整顺序**：`beforeEach` -> `beforeEnter` -> `beforeRouteEnter` -> `beforeResolve` -> `afterEach`。

**46. 动态路由/懒加载/meta/scrollBehavior**

- 动态路由：`router.addRoute()`。
- 懒加载：`() => import('@/views/xxx.vue')`。
- `meta`：存路由元信息（如权限、页面标题）。
- `scrollBehavior`：控制路由切换时的滚动位置。

---

### 九、 性能优化与 SSR

**47. 常见性能优化手段**

- 路由/组件懒加载；合理使用 `v-if/v-show`；`v-for` 加 `key`；`keep-alive` 缓存；静态提升/`v-once`/`v-memo`；虚拟列表；防抖节流；图片懒加载；减少深层响应式（`shallowRef`）。

**48. v-once vs v-memo**

- `v-once`：渲染一次后变静态节点。
- `v-memo`：缓存子树，依赖数组不变则跳过更新（常用于 `v-for` 内部优化）。

**49. 虚拟列表原理**

- 只渲染可视区域及上下缓冲区的 DOM，通过计算 `transform` 或 `padding` 撑开滚动条。解决长列表 DOM 过多导致的卡顿。

**50. 避免模板调用方法**

- 方法每次渲染都会执行，无缓存。`computed` 有缓存，依赖不变不执行，性能更好。

**51. SSR & Nuxt & Hydration**

- **SSR**：服务端渲染 HTML，解决首屏慢和 SEO 问题。代价是服务器压力大、开发受限（无 window/document）。Nuxt 是 Vue 的 SSR 框架。
- **Hydration (注水)**：客户端 JS 加载后，接管服务端渲染的静态 HTML，为其绑定事件和响应式。
- **Mismatch**：服务端和客户端渲染的 DOM 结构不一致（通常因时间、随机数、浏览器特有 API 导致）。

---

### 十、 其他核心概念

**52. Vue2 升 Vue3 破坏性变更**

- 移除过滤器、`.sync`、`$on/$off/$once` (EventBus)。
- 全局 API 改为实例属性（`Vue.config` -> `app.config`）。
- 过渡类名更改（`v-enter` -> `v-enter-from`）。
- `v-model` 更改，移除 `$children`。

**53. 自定义指令生命周期差异**

- Vue2：`bind, inserted, update, componentUpdated, unbind`。
- Vue3：与组件生命周期对齐（`created, beforeMount, mounted, beforeUpdate, updated, beforeUnmount, unmounted`）。

**54. 过滤器移除与替代**

- Vue3 移除过滤器，因为可以用 `methods` 或 `computed` 替代，减少框架体积和概念。

**55. 单向数据流 & 修改 props**

- 数据从父到子流动，便于追踪数据流向，防止子组件意外修改父组件状态导致数据流混乱。`props` 是只读的。

**56. data 为什么必须是函数？**

- 组件可能被复用多次。如果是对象，所有实例会共享同一个数据引用。函数每次返回新对象，保证**实例数据独立**。

**57. `defineModel` (Vue 3.4+ 稳定) 解决了什么痛点？**

- **痛点**：以前在组件中实现 `v-model` 需要手动定义 `props` (modelValue) 和 `emits` (update:modelValue)，并在 `watch` 或 `computed` 中处理双向绑定，代码冗余。
- **解决**：`defineModel` 是一个宏，直接返回一个可写的 ref。它自动处理了 prop 的接收和 emit 的触发，让组件内的 `v-model` 用起来就像本地的 `ref` 一样简单。

**58. `effectScope` 的作用是什么？（解决组合式函数内存泄漏）**

- **场景**：在组合式函数（Composables）中创建了大量的 `watchEffect` 或 `computed`，当组件卸载时，如果忘记手动停止（`stop`），会导致**内存泄漏**。
- **作用**：`effectScope` 可以创建一个作用域，捕获其中创建的所有响应式 effect。当组件卸载时，只需调用 `scope.stop()`，即可**批量清理**该作用域内的所有 effect，无需逐个停止。

**59. `toRaw` 和 `markRaw` 的区别与原理？**

- `toRaw`：返回 `reactive` 或 `readonly` 代理的**原始对象**。用于读取数据时避免触发依赖收集（性能优化），或传递给不需要响应式的第三方库。
- `markRaw`：标记一个对象，使其**永远不会被代理**。即使把它放进 `reactive` 对象中，它依然是普通对象。适用于大型第三方库实例（如 ECharts 实例、Three.js 对象）或静态数据。

**60. Vue3 是如何支持 Map / Set 等集合类型的响应式的？**

- Vue3 重写了 Proxy 的 `get/set/has/deleteProperty` 等拦截器（Collection handlers）。
- 当调用 `map.get(key)` 时，拦截器会进行**依赖收集**；当调用 `map.set(key, val)` 时，拦截器会进行**派发更新**。底层通过重写集合原型链上的方法来实现。

**61. Vue2 的 `nextTick` 降级策略是什么？**

- Vue2 的 `nextTick` 优先使用**微任务**，降级使用**宏任务**。
- **顺序**：`Promise` (微) -> `MutationObserver` (微，模拟微任务) -> `setImmediate` (宏，IE独有) -> `setTimeout` (宏，最终兜底)。
- _面试追问_：为什么优先微任务？因为微任务在当前宏任务执行完毕后、下一次渲染前执行，能更快拿到更新后的 DOM。

**62. Vue2 的异步更新队列机制是怎样的？为什么要异步？**

- **机制**：数据变化时，Vue 不会立即更新 DOM，而是将对应的 Watcher 推入一个**队列（Queue）**。如果同一个 Watcher 被多次触发，只会被推入一次（去重）。然后在下一个事件循环（`nextTick`）中，清空队列并执行更新。
- **为什么异步**：避免同步更新带来的**性能损耗**。如果数据连续变化多次，同步更新会导致 DOM 重绘/重排多次；异步队列可以将多次数据变化合并为一次 DOM 更新。

**63. Vue2 中的 Watcher 有哪几种？**

- **Render Watcher**：渲染 Watcher，每个组件实例对应一个，负责将 VNode 渲染为真实 DOM。
- **User Watcher**：用户 Watcher，即我们手写的 `watch` 选项或 `$watch`。
- **Computed Watcher**：计算属性 Watcher，带有 `lazy` 属性，只有依赖变化时才重新计算。
- _执行优先级_：User Watcher > Render Watcher (保证数据先更新，视图再更新)。

**64. Vue2 中 `v-for` 的 `key` 如果传了 `undefined` 会怎样？**

- 如果 `key` 为 `undefined`，Vue 会启用 **inlinedClone（内联克隆）** 机制。
- 它会尝试复用相同标签的旧节点，但会检查其内部状态（如 `v-if` 条件、组件状态）。如果状态不匹配，则不复用。这会导致性能下降和潜在的渲染错误，所以**必须提供唯一的 key**。

**65. Vue3 的依赖收集底层数据结构是怎样的？**

- 采用三层嵌套结构：`targetMap` (WeakMap) -> `depsMap` (Map) -> `dep` (Set)。
- **第一层 `targetMap`**：Key 是**原始对象 (target)**，Value 是 `depsMap`。使用 WeakMap 是为了**防止内存泄漏**（当对象被垃圾回收时，WeakMap 的引用也会自动清除）。
- **第二层 `depsMap`**：Key 是**属性名 (key)**，Value 是 `dep`。
- **第三层 `dep`**：是一个 **Set** 结构，存储了所有依赖该属性的 **effect 函数**。使用 Set 是为了**自动去重**。

**66. Vue3 的 `trigger` 在触发更新时，对不同操作 (ADD/SET/DELETE) 有什么区别？**

- Vue3 内部定义了 `TriggerOpTypes` (ADD, SET, DELETE, CLEAR)。
- **SET (修改)**：只触发当前 key 对应的 `dep` 中的 effect。
- **ADD (新增)**：除了触发当前 key 的 effect，还会触发 `ITERATE_KEY`（用于触发 `for...in` 或 `Object.keys` 的依赖）。
- **DELETE (删除)**：同 ADD，也会触发 `ITERATE_KEY`。
- **CLEAR (清空 Map/Set)**：触发该集合所有的依赖。

**67. 为什么 Vite 在开发环境下比 Webpack 快那么多？**

- **Webpack**：Bundle-based。开发时也要把整个项目打包成 Bundle，项目越大越慢。
- **Vite**：Native ESM-based。
  1.  **开发服务器**：利用浏览器原生支持 ES Module 的特性，**不打包**，按需编译。只有浏览器请求到的文件才会被编译（基于 ESBuild，速度极快）。
  2.  **HMR (热更新)**：无论项目多大，HMR 的速度只与**发生改变的模块**有关，而不是整个项目。

**68. Vue3 在 Vite 中的 HMR (热更新) 是如何做到精准更新的？**

- Vite 的 Vue 插件 (`@vitejs/plugin-vue`) 在编译 SFC 时，会为每个组件注入 HMR 代码。
- 当组件文件改变时，Vite 只发送该组件的更新请求。浏览器接收到新模块后，通过 Vue 提供的 `__VUE_HMR_RUNTIME__.rerender` (模板改变) 或 `reload` (逻辑改变) 方法，**精准替换**对应的组件实例，而不需要刷新整个页面。

**69. 为什么 Vue3 移除了 `$on / $off / $once` (EventBus)？**

- **原因**：EventBus 会导致组件间的数据流向变得**不可追踪**，违背了 Vue 单向数据流的设计理念，且容易导致内存泄漏（忘记 `$off`）。
- **替代**：官方推荐使用第三方的轻量级库（如 `mitt` 或 `tiny-emitter`），将事件总线从 Vue 核心中解耦，减小核心包体积。

**70. Vue 的 `v-html` 原理是什么？如何防御 XSS？**

- **原理**：底层通过设置 DOM 元素的 `innerHTML` 属性来渲染 HTML 字符串。
- **XSS 风险**：如果 `v-html` 的内容包含用户输入，恶意用户可注入 `<script>` 或 `onerror` 等恶意代码。
- **防御**：
  1.  永远不要将用户输入直接传给 `v-html`。
  2.  如果必须渲染用户输入的富文本，必须在服务端或客户端使用 DOMPurify 等库进行**HTML 清洗 (Sanitize)**。

**71. Vue3 的 `Suspense` 到底是怎么收集异步依赖的？**

- 当 `Suspense` 渲染其默认插槽时，会遍历其子组件。
- 如果子组件是异步组件（`defineAsyncComponent`），或者子组件的 `setup` 是 `async` 的（返回 Promise），`Suspense` 会收集这些 Promise。
- 只有当**所有**收集到的异步依赖都 `resolve` 后，`Suspense` 才会将 fallback 插槽替换为 default 插槽的内容。
