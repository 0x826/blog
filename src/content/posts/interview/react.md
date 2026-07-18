---
title: react
description: react
pubDate: 2026-07-17
category: 前端
tags: ["react", "面试"]
---

## 模块一：基础与编译机制

**1. JSX 是什么？它是如何被编译的？**
JSX 是 JavaScript 的语法扩展，用于声明式地描述 UI。
*   **传统编译（React 17 前）**：Babel 将其编译为 `React.createElement(type, props, ...children)`，因此文件顶部必须手动 `import React`。
*   **新 JSX 转换（React 17+）**：编译为自动引入的 `_jsx` 函数（如 `import { jsx as _jsx } from 'react/jsx-runtime'`）。这免去了手动引入 React，并减少了运行时的辅助函数调用，提升了性能。

**2. 为什么 JSX 中组件名必须大写？**
React 在编译时通过**首字母大小写**来区分原生标签和自定义组件。小写（如 `div`）会被编译为字符串 `'div'`，交由 Renderer 创建原生 DOM；大写（如 `MyComponent`）会被编译为变量引用，交由 React 实例化组件。

**3. 什么是虚拟 DOM？它真的更快吗？**
虚拟 DOM 是描述真实 DOM 结构的轻量级 JS 对象。**它不一定比直接操作原生 DOM 快**。它的核心价值在于：1) 保证性能下限，避免极端慢的 DOM 操作；2) 实现跨平台（Web、Native、Canvas）；3) 支持声明式编程和 Diff 算法。

**4. React 的 Diff 算法做了哪些优化？复杂度如何？**
通过三大策略将传统树对比的 O(n^3) 复杂度降为 **O(n)**：
1.  **同层比较**：只对比同一层级的节点，不跨层级移动。
2.  **类型判断**：若节点类型（type）不同，直接销毁旧树，构建新树，不再深度对比。
3.  **Key 标识**：通过 `key` 识别节点的稳定性，实现精准的节点复用和移动。

**5. 为什么列表渲染需要 key？为什么不推荐用 index 作为 key？**
*   **作用**：Key 帮助 React 在 Diff 算法的 Map 查找阶段，识别哪些元素被添加、删除或移动，从而复用 DOM 节点和其内部状态。
*   **Index 的坑**：如果在列表头部插入新元素，使用 index 会导致 React 误判后续所有元素的 key 都变了，从而触发不必要的 Update。更严重的是，如果列表项包含 `<input>` 等带有内部状态的组件，状态会发生**错位**（旧状态被错误地保留在新数据对应的 DOM 上）。

**6. React 的设计哲学：单向数据流和不可变性**
*   **单向数据流**：数据只能从父组件通过 props 流向子组件。子组件不能直接修改父组件的状态，必须通过父组件传递的回调函数来触发更新。这使得数据流向可预测，易于调试。
*   **不可变性（Immutability）**：状态更新时，不直接修改原对象，而是返回一个新对象（如使用扩展运算符 `...` 或 Immer）。这使得 React 可以通过简单的**浅比较（Shallow Compare）** 快速判断状态是否发生变化，从而优化渲染。

---

## 模块二：核心渲染原理 (Fiber 与调度)

**7. Fiber 架构是什么？它解决了什么问题？**
Fiber 既是**数据结构**，也是**执行单元**。
*   **数据结构**：将传统的树形结构转为**链表结构**（包含 `child`, `sibling`, `return` 指针），使得遍历可以通过循环而非递归实现。
*   **解决问题**：解决了旧版 Stack Reconciler 递归渲染**不可中断**的问题。Fiber 让渲染过程变得可中断、可恢复、可分配优先级，是实现并发渲染（Concurrent Mode）的基石。

**8. 解释 Fiber 的两大阶段：Render 阶段和 Commit 阶段**
*   **Render 阶段（可中断）**：纯内存操作。构建 `workInProgress` Fiber 树，执行 Diff 算法，计算状态更新，并将产生的副作用（DOM 变更、Effect 调用）标记并收集到 Effect 链表中。此阶段可随时被高优先级任务打断。
*   **Commit 阶段（不可中断）**：分为 Before Mutation、Mutation（真正操作 DOM）、Layout 三个子阶段。将 Render 阶段收集的副作用同步应用到真实 DOM 上，并执行 `useLayoutEffect` 等生命周期。

**9. 什么是双缓存（Double Buffering）机制？**
React 内存中始终维护两棵 Fiber 树：`current` 树（当前屏幕显示）和 `workInProgress` 树（正在构建）。在构建时，React 会尽可能复用 `current` 树中未变化的 Fiber 节点（通过 `alternate` 指针互相引用）。当 Commit 阶段完成后，只需执行 `root.current = finishedWork` 切换根指针，即可瞬间完成 UI 更新，避免页面闪烁。

**10. Lane 模型（优先级车道）是什么？**
取代了旧的 `expirationTime`。它使用 32 位二进制（Bitset）来表示优先级，每一位代表一个“车道”（如 `SyncLane=1`, `DefaultLane=16`）。通过位运算（`&`, `|`），React 可以极快地判断优先级高低、合并优先级，并支持同一个任务属于多个优先级车道。

**11. 时间切片（Time Slicing）和可中断渲染如何实现？**
React 没有使用不稳定的 `requestIdleCallback`，而是通过 **`MessageChannel`** 模拟宏任务。在 `Scheduler` 中设定默认 **5ms** 的时间切片阈值。每处理完一个 Fiber 节点，检查当前时间是否超时。若超时，则通过 MessageChannel 让出主线程（Yield），等浏览器处理完高优先级任务（如用户输入）后，再恢复执行下一个 Fiber 节点。

**12. Reconciliation（协调）的完整流程是怎样的？**
1. 触发更新，创建 Update 对象并入队。
2. 调度器（Scheduler）安排任务，进入 Render 阶段。
3. 从根节点开始，深度优先遍历构建 `workInProgress` 树。
4. 对比新旧 Fiber 节点（Diff），复用或创建新节点，计算最新的 state。
5. 将产生的 DOM 变更和 Hook 副作用打上标签（Flags），收集到 Effect 链表中。
6. 进入 Commit 阶段，同步执行 Effect 链表，更新真实 DOM。

**13. Reconciler 与 Renderer 的分层设计是怎样的？**
*   **Reconciler（协调器）**：平台无关的核心算法层。负责调度、Diff 算法、构建 Fiber 树和收集副作用。
*   **Renderer（渲染器）**：平台特定的执行层。如 `react-dom` 负责将副作用操作到浏览器 DOM，`react-native` 负责操作原生视图。两者通过宿主配置（Host Config）进行通信。

---

## 模块三：Hooks 深度解析

**14. Hooks 的原理是什么？为什么不能在条件/循环中调用？**
Hooks 的状态存储在函数组件对应的 Fiber 节点的 `memoizedState` 属性上，它是一个**单向链表**。每次调用 Hook，React 会在链表尾部追加一个 Hook 对象。在更新阶段，React 严格按照**调用顺序**遍历链表来匹配状态。如果在条件或循环中调用，会导致某次渲染时链表指针错位，从而获取到错误的状态或引发崩溃。

**15. useState 的原理是什么？状态是怎么存储的？**
调用 `useState` 时，React 在当前 Fiber 节点的 `memoizedState` 链表中创建一个 Hook 对象。该对象包含 `memoizedState`（当前值）和 `queue`（更新队列，是一个环形链表）。`setState` 会创建一个 Update 对象加入队列，并在下次 Render 阶段遍历队列计算出最新状态。

**16. setState 是同步还是异步？React 18 的自动批处理有何变化？**
*   **React 17 及以前**：在合成事件中是异步且批处理的；但在 `setTimeout`、`Promise` 或原生事件中是同步且逐个渲染的。
*   **React 18**：引入了**自动批处理（Automatic Batching）**。无论在何处（包括 setTimeout、Promise、原生事件）调用 `setState`，React 都会将其收集起来，统一调度一次渲染，大幅提升性能。

**17. 为什么推荐用函数式更新 setState(prev => ...)？**
1.  **解决闭包陷阱**：直接读取 state 可能会读到旧闭包中的值，而函数式更新的参数 `prev` 保证是最新的状态。
2.  **批量更新安全**：当多个 `setState` 在同一个事件循环中被批处理时，函数式更新能确保每次更新都基于前一次的正确结果，而不是基于过时的初始值。

**18. 什么是 useState 的惰性初始化？**
当初始 state 需要通过复杂计算得出时，可以传入一个函数：`useState(() => expensiveComputation())`。这样该计算**只在组件首次渲染时执行一次**，后续重渲染会直接跳过该函数，避免性能浪费。

**19. useEffect 的执行时机？与 useLayoutEffect 有何区别？**
*   **useEffect**：在 Commit 阶段（DOM 更新）完成后，作为**异步任务**执行。不阻塞浏览器绘制，适用于数据请求、订阅等。
*   **useLayoutEffect**：在 Commit 阶段的 Layout 子阶段（DOM 已更新，但浏览器**尚未绘制**前）**同步**执行。适用于读取 DOM 布局（如宽高）或同步修改 DOM 以避免视觉闪烁。会阻塞渲染。

**20. useEffect 的依赖数组和清理函数怎么理解？**
*   **依赖数组**：决定 Effect 何时重新执行。只有当数组中的值发生浅比较变化时，Effect 才会重新运行。空数组 `[]` 表示仅在挂载和卸载时执行。
*   **清理函数（Return Function）**：在 Effect 重新执行前，或组件卸载时调用。用于清除副作用（如清除定时器、取消网络请求、移除事件监听），防止内存泄漏。

**21. 什么是闭包陷阱（Stale Closure）？如何解决？**
*   **本质**：函数组件每次渲染都有独立的闭包。如果 `useEffect` 或 `useCallback` 的依赖数组遗漏了某个 state，回调函数捕获的将是**首次渲染时的旧 state**。
*   **解决**：1) 严格使用 `eslint-plugin-react-hooks` 补全依赖；2) 使用 `useRef` 保存最新值（`ref.current` 可变且不依赖闭包）；3) 使用函数式更新 `setState(prev => ...)`；4) 改用 `useReducer`（`dispatch` 引用永远稳定）。

**22. useRef 有哪些用途？它和 useState 有何区别？**
*   **用途**：1) 获取 DOM 节点或类组件实例；2) 保存跨渲染周期的可变变量（修改 `ref.current` **不会触发重渲染**）。
*   **区别**：`useState` 更新会触发组件重渲染，且每次渲染有独立的闭包；`useRef` 更新不触发重渲染，且在整个组件生命周期内保持同一个对象引用。

**23. useMemo 和 useCallback 的区别？什么时候该用？**
*   **区别**：`useMemo` 缓存的是**计算结果**（值）；`useCallback(fn, deps)` 本质上是 `useMemo(() => fn, deps)`，缓存的是**函数引用**。
*   **使用时机**：仅在两种情况下使用：1) 计算非常昂贵，需要避免每次渲染都重新计算；2) 将该值/函数作为 props 传递给被 `React.memo` 包裹的子组件，以保持引用稳定，避免子组件不必要的重渲染。**切忌滥用**，因为 Hook 本身也有开销。

**24. useContext 有什么性能问题？如何优化？**
*   **问题**：当 Context 的 `value` 发生变化时，**所有**消费该 Context 的组件（无论其是否使用了 value 中改变的部分）都会强制重渲染。
*   **优化**：1) **拆分 Context**：将高频更新的状态和低频更新的状态拆分为不同的 Context；2) 结合 `useMemo` 缓存 Provider 的 `value` 对象，避免引用变化导致无谓更新；3) 对于复杂全局状态，考虑使用 Zustand/Jotai 等支持细粒度更新的库。

**25. useReducer 适合什么场景？和 useState 怎么选？**
*   **场景**：1) 状态逻辑复杂，包含多个子值；2) 下一个状态依赖于上一个状态；3) 需要集中管理复杂的业务逻辑（类似小型 Redux）。
*   **选择**：简单、独立的标量状态用 `useState`；复杂对象状态或复杂状态转换逻辑用 `useReducer`。

**26. useImperativeHandle 的作用是什么？**
配合 `forwardRef` 使用。允许子组件自定义暴露给父组件 `ref` 的实例对象。通常用于限制父组件只能调用子组件暴露的特定方法，而不是获取完整的 DOM 或组件实例，提高了封装性。

**27. useTransition 和 useDeferredValue 有什么用？（并发特性）**
两者都用于将非紧急更新标记为**低优先级**，保持 UI 响应。
*   **useTransition**：主动标记某段 `setState` 为过渡状态。在过渡期间，UI 保持响应（如输入框可继续打字），并可通过 `isPending` 显示 Loading。
*   **useDeferredValue**：被动延迟某个值的更新。适用于接收高频更新的 prop，先渲染旧值保持流畅，在后台空闲时再渲染新值（类似防抖，但不阻塞渲染）。

**28. useId 解决了什么问题？**
生成在 SSR（服务端渲染）和 CSR（客户端渲染）中**保持一致**的唯一 ID。解决了 React 18 并发渲染下，传统的自增 ID 在两端生成顺序可能不一致，从而导致 Hydration Mismatch（注水不匹配）的问题。常用于表单的 `label` 和 `input` 的 `htmlFor`/`id` 关联。

**29. 自定义 Hook 是什么？有什么约定和好处？**
*   **是什么**：以 `use` 开头的 JavaScript 函数，内部可以调用其他 Hook。
*   **好处**：实现**状态逻辑的复用**，且不会像 HOC 或 Render Props 那样增加组件嵌套层级（避免“嵌套地狱”）。
*   **约定**：1) 必须以 `use` 开头（便于 ESLint 检查 Hook 规则）；2) 只能在 React 函数组件或其他自定义 Hook 的顶层调用。

---

## 模块四：组件设计与模式

**30. 类组件的生命周期有哪些？分几个阶段？**
*   **挂载（Mount）**：`constructor` -> `static getDerivedStateFromProps` -> `render` -> `componentDidMount`
*   **更新（Update）**：`static getDerivedStateFromProps` -> `shouldComponentUpdate` -> `render` -> `getSnapshotBeforeUpdate` -> `componentDidUpdate`
*   **卸载（Unmount）**：`componentWillUnmount`
*   **错误处理**：`static getDerivedStateFromError`, `componentDidCatch`

**31. 哪些生命周期被废弃了？为什么？**
`componentWillMount`、`componentWillReceiveProps`、`componentWillUpdate` 被废弃（加 `UNSAFE_` 前缀）。
**原因**：在 Fiber 架构的异步 Render 阶段，组件的渲染可能会被中断并多次重试。这些生命周期如果在其中被调用，可能会导致**被多次执行**，若在其中发起网络请求或产生副作用，将引发严重的 Bug。

**32. 函数组件和类组件有什么区别？**
*   **类组件**：基于 ES6 Class，有实例（`this`），生命周期复杂，状态可变，**不支持并发特性**（中断恢复时实例状态可能不一致）。
*   **函数组件**：无实例，基于 Hooks，每次渲染都是独立的闭包（快照机制），代码更简洁，**完美支持并发渲染**。

**33. 组件间有哪些通信方式？**
1. 父子：Props 下发，回调函数上传。
2. 兄弟/跨级：状态提升、Context API。
3. 全局：Redux、Zustand 等状态管理库。
4. 任意：事件总线（EventEmitter）、URL 参数。

**34. 什么是状态提升（Lifting State Up）？**
当多个组件需要共享相同的变化数据时，将共享的状态**移动到它们最近的共同祖先组件**中管理。祖先组件通过 props 将状态和更新函数下发给子组件。这是 React 单向数据流的核心实践。

**35. forwardRef 是什么？解决了什么问题？**
默认情况下，函数组件不能接收 `ref` 属性。`forwardRef` 是一个高阶函数，它允许父组件将 `ref` **穿透**函数组件，直接绑定到其内部的 DOM 节点或子组件实例上，解决了函数组件无法暴露内部引用的问题。

**36. 什么是高阶组件（HOC）？有哪些坑？**
*   **是什么**：一个接收组件并返回新组件的函数（如 `connect`），用于复用组件逻辑。
*   **坑**：1) Props 来源不清晰（不知道 props 是哪里注入的）；2) 命名冲突（HOC 注入的 props 可能与组件原有 props 重名）；3) 嵌套地狱（多个 HOC 包裹导致调试困难，组件树过深）；4) 静态方法丢失。

**37. render props 模式是什么？和 HOC、Hooks 怎么对比？**
*   **是什么**：组件接收一个返回 React 元素的函数作为 prop（通常叫 `render` 或 `children`），并在其内部调用该函数来共享状态。
*   **对比**：比 HOC 解决了嵌套地狱和命名冲突问题，但仍会导致 JSX 层级过深。**Hooks 是目前最优解**，它既实现了逻辑复用，又保持了扁平的组件结构，且无额外性能开销。

**38. 什么是 Context？适合存什么、不适合存什么？**
*   **是什么**：提供一种在组件树中传递数据的方法，无需手动逐层传递 props。
*   **适合**：低频更新的全局数据（如主题 Theme、语言 Locale、当前认证用户）。
*   **不适合**：高频更新的状态（如表单输入、实时计数器），因为 Context 值改变会导致所有消费者无条件重渲染，引发性能问题。

---

## 模块五：性能优化

**39. React.memo 是什么？和 PureComponent、shouldComponentUpdate 的关系？**
它们的目的都是**避免不必要的重渲染**。
*   `shouldComponentUpdate`：类组件生命周期，手动返回 boolean 控制是否更新。
*   `PureComponent`：类组件，自动对 props 和 state 进行**浅比较**，无变化则跳过渲染。
*   `React.memo`：函数组件的高阶组件，作用同 `PureComponent`，默认对 props 进行浅比较。可传入自定义比较函数作为第二个参数。

**40. React 性能优化有哪些常用手段？**
1. 避免不必要的渲染（`React.memo`, `useCallback`, `useMemo`）。
2. 状态管理优化（状态下沉、拆分 Context）。
3. 列表优化（使用唯一 key、虚拟列表）。
4. 代码分割（`React.lazy` + `Suspense`）。
5. 避免内联对象/函数作为 props。
6. 将重度计算移至 Web Worker。

**41. 什么是状态下沉？为什么能优化性能？**
将状态从父组件**移动到真正需要它的子组件**内部。这样，当该状态更新时，只有该子组件会重渲染，而父组件和其他不需要该状态的兄弟组件不会受到牵连，从而减少了渲染范围。

**42. 虚拟列表（长列表优化）的原理是什么？**
对于成千上万条数据的列表，不一次性渲染所有 DOM。只渲染**可视区域**（及上下少量缓冲区）的 DOM 节点。通过监听滚动事件，动态计算当前可视范围，并使用 CSS `transform` 或 `padding` 来模拟整体列表的高度，从而将 DOM 节点数量控制在常数级别，解决卡顿。

**43. React.lazy 和 Suspense 如何实现代码分割？**
`React.lazy` 接收一个动态 `import()` 函数，返回一个 Promise，在组件首次渲染时才加载该组件的代码。`Suspense` 组件包裹 `lazy` 组件，在 Promise resolve（代码加载完成）之前，展示其 `fallback` 属性指定的 Loading UI。结合 Webpack/Vite 可实现按路由或按组件的代码分割。

**44. 为什么内联函数/对象作为 prop 会影响性能？**
每次组件渲染时，内联函数（如 `onClick={() => {}}`）或内联对象（如 `style={{ color: 'red' }}`）都会在内存中创建**全新的引用**。如果将其传给被 `React.memo` 包裹的子组件，浅比较会认为 props 发生了变化，从而导致子组件发生不必要的重渲染。

---

## 模块六：高级特性与边界

**45. 合成事件（SyntheticEvent）是什么？React 17 前后的事件委托有何变化？**
React 实现了跨浏览器的统一事件系统，事件对象是原生事件的包装器（合成事件），具有相同接口，并在事件回调结束后被池化回收（React 17 后已移除事件池化）。
*   **React 16 及以前**：所有事件委托绑定在 `document` 上。
*   **React 17+**：事件委托绑定在 **React 渲染的根容器（root）** 上。这使得 React 应用可以更安全地嵌入到其他框架（如 jQuery、Vue）中，避免了全局事件冲突。

**46. 严格模式 StrictMode 有什么作用？**
仅在开发环境生效。它通过**故意双重调用**组件的渲染函数、类组件的生命周期（如 `constructor`, `render`）以及某些 Hook（如 `useState`, `useEffect`），来帮助开发者发现不纯的渲染逻辑、意外的副作用以及过时的 API。

**47. 错误边界（Error Boundary）是什么？能捕获哪些错误？**
*   **是什么**：一种特殊的类组件，通过实现 `static getDerivedStateFromError()` 或 `componentDidCatch()` 来捕获子组件树中的 JavaScript 错误，并渲染降级 UI，防止整个应用白屏。
*   **能捕获**：渲染期间、生命周期方法中、构造函数中的错误。
*   **不能捕获**：事件处理函数中的错误、异步代码（setTimeout/Promise）中的错误、SSR 中的错误、错误边界自身抛出的错误。

**48. Portal 是什么？事件冒泡如何处理？**
*   **是什么**：`ReactDOM.createPortal` 允许将子组件渲染到 DOM 树中父组件之外的节点（如 `document.body`），常用于 Modal、Tooltip。
*   **事件冒泡**：尽管 DOM 节点在物理上脱离了父组件，但 React 的**事件冒泡依然遵循 React 组件树的结构**。即 Portal 内部的事件依然会冒泡到包含它的 React 父组件中。

**49. Suspense 除了懒加载还能做什么?**
在 React 18 的并发特性下，Suspense 被设计为处理**任何异步操作**的通用边界。结合支持 Suspense 的数据获取库（如 React Query 的 experimental 特性或 Relay），可以在数据请求“挂起（Suspend）”时，直接展示 fallback UI，实现声明式的数据加载状态管理。

**50. React 18 并发渲染（Concurrent Rendering）带来了什么？**
1. **可中断渲染**：Render 阶段可被高优先级任务打断。
2. **新的 Root API**：`createRoot` 替代 `ReactDOM.render`。
3. **自动批处理**：所有环境下的 `setState` 默认批处理。
4. **并发 Hooks**：`useTransition` 和 `useDeferredValue`，用于区分紧急和非紧急更新。
5. **Suspense 增强**：支持服务端组件和数据获取挂起。

---

## 模块七：状态管理生态

**51. Redux 的核心原理和三大原则是什么？**
*   **原则**：1) 单一数据源（Single Source of Truth）；2) State 是只读的，只能通过 dispatch action 修改；3) 使用纯函数（Reducer）来执行状态转换。
*   **原理**：组件 dispatch action -> 中间件拦截处理 -> Reducer 接收旧 state 和 action，返回新 state -> Store 更新并通知订阅者（组件）重新渲染。

**52. Redux 中间件的原理是什么？**
基于**洋葱模型**（函数组合 `compose`）。中间件包装了原生的 `dispatch` 方法。当 action 被 dispatch 时，它会依次穿过多个中间件（如 logger -> thunk -> saga），每个中间件可以访问 action、执行异步操作、修改 action，或决定是否将其传递给下一个中间件，最终到达 Reducer。

**53. redux-thunk 和 redux-saga 的区别？**
*   **redux-thunk**：允许 action creator 返回一个函数（而非对象）。该函数接收 `dispatch` 和 `getState`，适合处理简单的异步逻辑（如单个 API 请求）。
*   **redux-saga**：使用 ES6 Generator 函数（`function*`）来管理副作用。将异步流程视为同步代码编写，极其适合处理复杂的异步流（如并发请求、竞态条件取消、轮询、防抖）。

**54. Redux Toolkit（RTK）解决了什么问题？**
解决了传统 Redux **样板代码过多**、配置繁琐的问题。它内置了：1) `configureStore`（自动配置 Redux DevTools 和常用中间件）；2) `createSlice`（自动生成 action 和 reducer）；3) **Immer.js**（允许在 reducer 中编写“可变”代码，底层自动转换为不可变更新）。

**55. Zustand、Jotai、Recoil 各有什么特点？**
*   **Zustand**：极简主义，基于 Hooks，无需 Provider 包裹，API 简单，支持细粒度更新（组件只订阅其使用的 state 片段）。
*   **Jotai**：原子化（Atom）状态管理，**自下而上**的组合方式。状态派生自然，极度优化了细粒度渲染，适合复杂表单或图形编辑器。
*   **Recoil**：Meta 推出的原子化状态库，概念与 Jotai 类似，但 API 更重，且官方已宣布停止积极开发（归档），不推荐新项目使用。

**56. Context 能替代 Redux 吗？**
**不能完美替代**。Context 适合低频全局状态，但缺乏：1) 细粒度更新机制（会导致不必要的重渲染）；2) 强大的中间件生态；3) 时间旅行调试（Redux DevTools）；4) 处理复杂异步逻辑的标准模式。对于复杂应用，Redux/Zustand 仍是首选。

**57. 服务端状态和客户端状态的区别？为什么用 React Query / SWR？**
*   **区别**：客户端状态（如 UI 开关、表单输入）完全由前端控制；服务端状态（如 API 返回的数据）由服务器控制，前端只是缓存。
*   **为什么用 RQ/SWR**：它们专为服务端状态设计，开箱即用地提供了**缓存、后台静默重新验证（Revalidation）、焦点重新获取、分页、乐观更新**等功能。将它们从 Redux 中剥离，可大幅减少全局状态的复杂度和样板代码。

---

## 模块八：路由与 SSR/Next.js

**58. 前端路由的原理是什么？history 和 hash 两种模式有何区别？**
前端路由通过改变 URL 而不刷新页面来实现视图切换。
*   **Hash 模式**：URL 带 `#`（如 `/#/about`）。利用 `window.onhashchange` 事件监听变化。兼容性极好，无需后端配置。
*   **History 模式**：利用 HTML5 `history.pushState` 和 `replaceState` API 改变 URL（如 `/about`）。URL 更美观，但**需要后端配置**（如 Nginx），将所有未知路径重定向到 `index.html`，否则刷新会报 404。

**59. React Router 的核心实现机制是怎样的？**
底层依赖 `history` 库监听 URL 变化。当 URL 改变时，Router 组件更新其内部 state，触发重新渲染。`Route` 组件通过 `matchPath` 算法对比当前 URL 和配置的 `path`，若匹配则渲染其 `element`（v6 语法）。

**60. 动态路由、嵌套路由、路由守卫怎么实现？**
*   **动态路由**：路径中使用 `:id`（如 `/user/:id`），在组件内通过 `useParams()` 获取参数。
*   **嵌套路由**：父路由组件内部使用 `<Outlet />` 组件作为占位符，子路由匹配时，其元素将渲染在 `<Outlet />` 的位置。
*   **路由守卫**：
    *   *v5*：自定义 `<PrivateRoute>` 组件，判断权限后决定渲染 `<Route>` 还是 `<Navigate to="/login" />`。
    *   *v6.4+ (Data Router)*：在 `loader` 函数中检查权限，若无权限则 `throw new Response("", { status: 401 })`，配合 `errorElement` 或重定向处理。

**61. SSR、CSR、SSG、ISR 有什么区别？**
*   **CSR (客户端渲染)**：浏览器下载空 HTML 和 JS 包，JS 执行后请求数据并渲染 DOM。首屏慢，SEO 差。
*   **SSR (服务端渲染)**：服务器接收到请求时，实时拉取数据并生成完整的 HTML 返回。首屏快，SEO 好，但服务器压力大，TTFB（首字节时间）较长。
*   **SSG (静态站点生成)**：在**构建时（Build Time）** 预先拉取数据并生成静态 HTML 文件。部署到 CDN，访问速度极快，SEO 极好。适合内容不频繁变动的页面（如博客、文档）。
*   **ISR (增量静态再生)**：SSG 的升级版。允许在运行时，按设定的时间间隔（`revalidate`）在后台异步重新生成特定页面的静态 HTML，兼顾了 SSG 的速度和 SSR 的实时性。

**62. 什么是 Hydration（注水）？有哪些常见问题？**
*   **本质**：SSR 返回纯 HTML 后，客户端下载并执行 React JS。React 会生成虚拟 DOM，并与服务端下发的真实 DOM 进行对比。如果一致，React **不会重新创建 DOM**，而是直接为这些现有 DOM 节点**绑定事件监听器**，并激活组件的内部状态，使其变为可交互。
*   **常见问题（Hydration Mismatch）**：如果客户端首次渲染的虚拟 DOM 与服务端 HTML 不一致（例如在渲染时使用了 `window` 对象、`Date.now()` 或 `Math.random()`），React 会认为注水失败。为了保证 UI 正确性，React 会**丢弃服务端的 DOM**，在客户端重新执行一次完整的 CSR，并在控制台抛出 Warning。这会导致 SSR 丧失首屏性能优势。
*   **解决**：确保两端首次渲染输出绝对一致。将依赖浏览器环境的逻辑移至 `useEffect` 中，或使用 `useState` + `useEffect` 延迟渲染客户端专属组件。

**63. Next.js 的渲染模式和 getServerSideProps/getStaticProps 怎么用？**
*   **Pages Router (传统)**：
    *   `getServerSideProps`：在**每次请求时**于服务端执行，获取数据后作为 props 传给组件。适用于 SEO 要求高且数据实时性强的页面（SSR）。
    *   `getStaticProps`：在**构建时**执行，生成静态 HTML。可配合 `revalidate` 参数实现 ISR。适用于数据不常变的页面（SSG）。
*   **App Router (Next.js 13+)**：
    *   默认所有组件都是 **React Server Components (RSC)**。
    *   无需上述特殊函数，直接在异步组件中使用 `async/await` 获取数据（如直接查询数据库或 fetch API）。
    *   通过 `'use client'` 指令显式声明客户端组件（用于使用 Hooks 或事件监听）。这种架构极大减少了发送到客户端的 JS 体积。
 

**64. React 19 引入了哪些改变游戏规则的新特性？**
*   **Actions (表单与服务端动作)**：原生支持异步操作。`<form action={asyncFn}>` 会自动处理 pending 状态、错误处理和表单重置，无需手动写 `onSubmit` 和 `useState` 控制 loading。
*   **`use` Hook**：一个全新的通用 Hook，可以读取 Promise 或 Context 的值。它打破了 `useEffect` 获取数据的限制，允许在渲染过程中直接 `use(promise)`，配合 Suspense 实现更优雅的数据获取。
*   **`useActionState` (原 `useFormState`)**：专门用于处理表单提交的 Hook。接收一个异步 action 函数和初始状态，返回 `[state, formAction, isPending]`，极大简化了表单状态管理。
*   **`useFormStatus`**：在子组件中获取父级 `<form>` 的提交状态（如 `pending`），无需通过 props 逐层传递。
*   **React Compiler (原 React Forget)**：官方推出的自动编译优化插件。它能自动分析组件的依赖关系，**自动包裹 `useMemo` 和 `useCallback`**，开发者不再需要手动编写这些优化代码，彻底告别“依赖数组地狱”和过度优化。

**65. React 19 中 `use` Hook 和 `useEffect` 获取数据有什么本质区别？**
*   `useEffect` 获取数据会导致 **Waterfall（瀑布流）**：组件先渲染一次（展示 Loading），Effect 执行发起请求，请求回来后触发第二次渲染。
*   `use` Hook 允许在渲染阶段直接读取 Promise。如果 Promise 未 resolve，组件会 **Suspend（挂起）**，交由外层的 `<Suspense>` 捕获并展示 fallback。一旦数据就绪，直接渲染最终 UI，**只需一次渲染**，且能更好地配合 React 的并发调度和服务端组件。

---

## 模块二：React Server Components (RSC) 深度机制

**66. 什么是 RSC (React Server Components)？它与 SSR 有什么本质区别？**
*   **SSR (服务端渲染)**：在服务端生成 HTML 字符串发给客户端，**客户端仍需下载完整的 JS bundle** 来进行 Hydration（注水）和事件绑定。
*   **RSC**：组件**完全**在服务端运行。它**不会**被打包到客户端的 JS bundle 中。服务端直接将组件的渲染结果序列化为一种特殊的 JSON 格式（React Flight Protocol）发送给客户端，客户端直接复用这些结果。
*   **本质区别**：SSR 优化的是首屏 HTML 的到达时间（TTFB），但客户端 JS 体积依然很大；RSC 真正实现了 **Zero-Bundle-Size（零客户端体积）** 对于服务端组件，且可以直接在服务端安全地访问数据库、文件系统等后端资源。

**67. RSC 中 Server Component 和 Client Component 的边界与通信规则是什么？**
*   **规则 1**：Server Component 可以渲染 Client Component（通过 `children` props 传入，这叫 "Slot" 模式，避免了将 Client 组件序列化）。
*   **规则 2**：Client Component **不能**直接 import 并渲染 Server Component（会破坏边界）。
*   **规则 3**：两者之间传递的数据必须是**可序列化的**（如 JSON、Date、Map、Set 等 React 支持的类型），不能传递函数、类实例或包含循环引用的对象。
*   **规则 4**：Server Component 中不能使用任何 Hook（`useState`, `useEffect` 等）或浏览器 API。

**68. 什么是 React Flight Protocol (React 飞行协议)？**
这是 RSC 中服务端向客户端传输数据的底层格式。它不是纯 HTML，也不是纯 JSON，而是一种定制的、支持流式传输的序列化格式。它能够高效地传输 React 元素树、Promise 的引用（用于 Suspense 边界）以及服务端特有的数据类型，客户端接收到后由特殊的 Runtime 将其反序列化为虚拟 DOM 并复用。

---

## 模块三：Hooks 进阶与边缘场景

**69. `useDeferredValue` 和传统的 `debounce` (防抖) 有什么本质区别？**
*   **Debounce**：是**时间层面**的延迟。在延迟期间，UI **完全不会更新**（输入框可能看起来卡顿，或者旧数据一直显示），直到延迟时间结束才触发一次更新。
*   **useDeferredValue**：是**渲染优先级层面**的延迟。它会**立即**以高优先级更新紧急部分（如输入框的 value，保持用户打字流畅），同时将依赖该值的昂贵计算/渲染标记为低优先级。浏览器会在空闲时渲染低优先级部分。如果用户持续输入，React 会不断中断并重新开始低优先级渲染，保证 UI 始终响应。

**70. `useEffect` 的清理函数（Cleanup）在严格模式（Strict Mode）下为什么会执行两次？**
在 React 18+ 的开发环境中，Strict Mode 会模拟组件的 **卸载 -> 重新挂载** 过程。因此，`useEffect` 会在挂载时执行一次，紧接着执行其清理函数，然后再重新执行一次 `useEffect`。
**目的**：强制开发者编写健壮的清理逻辑，确保组件在频繁挂载/卸载（如快速切换 Tab、并发渲染中的中断恢复）时不会发生内存泄漏或状态错乱。

**71. 为什么 `useRef` 修改 `.current` 不会触发渲染，但某些情况下看起来“生效”了？**
`useRef` 的设计初衷就是“可变但不触发渲染”。如果你在 `useEffect` 或事件处理函数中修改了 `ref.current`，组件不会重新渲染。但如果这个 `ref` 被传递给了原生 DOM 节点，或者在**下一次**因为其他 state 变化触发的渲染中被读取，它会显示出最新的值。它只是一个附着在组件实例上的“储物柜”。

---

## 模块四：性能优化与工程化深度

**72. 什么是 Fast Refresh (快速刷新)？它和 Hot Module Replacement (HMR) 有什么区别？**
*   **HMR (Webpack)**：替换模块代码，但通常会导致组件状态丢失（页面重置）。
*   **Fast Refresh (React + 现代构建工具如 Vite/Next.js)**：React 专属的 HMR 增强版。它不仅替换代码，还能**智能地保留组件的本地状态（Hooks state）**。只要你不修改 Hook 的调用顺序或导出签名，刷新后输入框里的文字、展开的菜单都会保留，极大提升开发体验。

**73. 在 React 中，如何排查和解决“内存泄漏”？**
*   **常见原因**：1) `useEffect` 中订阅了事件或 WebSocket，但未在 cleanup 函数中取消订阅；2) 闭包引用了已卸载组件的大对象，导致垃圾回收（GC）无法释放；3) 使用了未清理的 `setInterval` 或 `setTimeout`。
*   **排查工具**：Chrome DevTools 的 **Memory (内存) 面板**，使用 "Heap snapshot" (堆快照) 对比组件挂载和卸载前后的内存差异，查找 "Detached HTML elements" (分离的 DOM 节点) 或保留的闭包引用。

**74. 为什么有时候 `React.memo` 反而会降低性能？**
`React.memo` 并非免费。每次渲染时，React 都需要对新旧 props 执行一次**浅比较（Shallow Compare）**。如果组件的 props 极其简单（如只传了一个 string），或者组件本身渲染开销极小，那么执行浅比较的开销可能会**大于**直接重新渲染该组件的开销。此外，如果父组件传递了内联函数/对象，导致浅比较永远返回 `false`，`React.memo` 就完全失效，白白增加了代码复杂度。

---

## 模块五：架构、微前端与测试

**75. React 在微前端架构（如 qiankun）中会遇到哪些特有坑点？**
*   **路由冲突**：多个 React 应用共用 History API，需要严格配置 `basename` 或基座统一接管路由。
*   **样式污染**：React 组件的 CSS 容易泄漏。需借助 CSS Modules、Shadow DOM 或微前端框架的样式隔离方案。
*   **全局变量/单例冲突**：如果多个子应用使用了不同版本的 React 或 Redux，可能会导致全局单例冲突。现代方案倾向于将 React/ReactDOM 作为外部依赖（Externals）由基座统一提供，或使用 Module Federation (模块联邦)。

**76. React Testing Library (RTL) 的核心测试哲学是什么？与 Enzyme 有何不同？**
*   **核心哲学**：**“测试你的软件如何被用户使用，而不是测试实现细节。”**
*   **具体表现**：RTL 鼓励通过 `getByRole`, `getByText` 等类似真实用户交互的方式查询 DOM，并触发 `fireEvent` 或 `userEvent`。它**不鼓励**直接访问组件实例、state 或调用内部方法（这正是旧版 Enzyme 的做法）。这保证了重构组件内部逻辑（如将 Class 改为 Function，或更换状态管理库）时，测试用例无需修改。

**77. 什么是“水合阻塞”（Hydration Blocking）？如何优化？**
当服务端返回的 HTML 极其庞大，或者客户端 JS bundle 过大时，浏览器下载并执行 JS 进行 Hydration 的过程会长时间占用主线程，导致页面虽然“看起来”渲染了，但**无法响应任何点击或滚动**（表现为长任务阻塞）。
*   **优化方案**：
    1. **代码分割**：按路由或组件懒加载 JS。
    2. **React 18 `useTransition` / `startTransition`**：将非紧急的 Hydration 标记为低优先级。
    3. **Selective Hydration (选择性注水)**：React 18 的新特性，如果用户在 Hydration 完成前点击了某个按钮，React 会优先注水该按钮所在的事件路径，使其立即响应，而不是等待整棵树注水完成。
    4. ** islands architecture (岛屿架构)**：如 Astro 框架，默认只发送静态 HTML，仅对需要交互的“岛屿”组件发送 JS 并进行注水。