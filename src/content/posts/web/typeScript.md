---
title: typescript
description: typescript
pubDate: 2026-07-17
category: 前端
tags: ["typescript", "面试", "前端"]
heroImage: /images/covers/code-screen-close.jpg
---

### 为什么要用 TypeScript？相比 JS 有哪些核心优势？
1. **静态类型检查**：在编译期发现潜在错误，减少线上 Bug。
2. **强大的 IDE 支持**：提供精准的代码补全、跳转、重构提示，提升开发效率。
3. **增强代码可读性与可维护性**：类型即文档，降低团队协作和接手老项目的成本。
4. **更好的工程化**：配合现代构建工具，支持更高级的语法和模块化。

### TypeScript 有哪些基础类型？
- **基本类型**：`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`。
- **引用类型**：`object`, `array` (或 `type[]`), `tuple` (元组), `enum` (枚举)。
- **特殊类型**：`any`, `unknown`, `never`, `void`, `object`。

### interface 与 type 有什么区别？
| 特性 | `interface` | `type` (类型别名) |
|---|---|---|
| **扩展方式** | `extends` (接口继承) | `&` (交叉类型) |
| **声明合并** | ✅ 支持（同名接口会自动合并） | ❌ 不支持（会报重复定义错误） |
| **表达能力** | 只能描述对象/函数形状 | 更强大：支持联合类型、元组、映射类型等 |
| **报错提示** | 更友好，直接指出接口名 | 有时展开后较难阅读 |
| **使用建议** | 定义对象结构、类、公共 API | 定义联合类型、工具类型、复杂组合类型 |

### 联合类型与交叉类型的区别？
- **联合类型 (`|`)**：表示“或”的关系。变量可以是其中**任意一种**类型。访问属性时只能访问共有属性。
- **交叉类型 (`&`)**：表示“且”的关系。将多种类型合并为一种，变量必须**同时满足**所有类型的约束（常用于组合 Mixin）。

### 字面量类型有什么用？
将类型限制为**具体的值**（如 `'success' | 'error'`，`42`）。
**作用**：配合联合类型，可以构建极其精确的**状态机**或**配置项**，杜绝非法值传入。

### 枚举 enum 与 const enum 有什么区别？编译产物如何？
- **普通 `enum`**：编译后会生成一个**真实的 JS 对象**（双向映射，既可通过键取值，也可通过值取键）。
- **`const enum`**：编译时**完全内联**（不生成对象），在使用的地方直接替换为字面量值。
- **注意**：`const enum` 在隔离编译（如 Babel、ts-node）中不支持，**现代 TS 开发中已不推荐使用**，推荐用 `as const` 断言联合类型替代。

### any、unknown、never、void 有什么区别？
- **`any`**：放弃类型检查，可以赋值给任何类型，也可以访问任何属性（**极度危险，应避免**）。
- **`unknown`**：**安全的 `any`**。可以接收任何类型，但**必须经过类型收窄（Narrowing）后**才能使用。
- **`never`**：表示**永远不存在**的值。常用于：1. 永远抛出异常的函数返回值；2. 永远死循环的函数返回值；3. 联合类型过滤（如 `Exclude` 的底层原理）。
- **`void`**：表示**没有返回值**（通常用于函数）。

### 类型断言 `as` 与非空断言 `!` 的使用与风险？
- **`as` (类型断言)**：告诉编译器“我比你更懂这个变量的类型”。**风险**：如果断言错误，运行时会导致属性访问崩溃。
- **`!` (非空断言)**：告诉编译器“这个值绝对不是 `null` 或 `undefined`”。**风险**：如果实际运行中该值为空，会抛出 `TypeError`。

### 类型收窄（Narrowing）是什么？有哪些方式？
TS 编译器通过**控制流分析**，在特定代码块中将宽泛的类型缩小为更精确的类型。
**方式**：
1. `typeof` (针对基本类型)
2. `instanceof` (针对类实例)
3. `in` 操作符 (针对对象属性)
4. 相等性检查 (`===`, `!==`)
5. **自定义类型守卫 (Type Guard)**

### type guard（类型守卫）有哪几种？如何写自定义守卫？
自定义守卫用于让 TS 理解复杂的业务逻辑判断。
```typescript
// 1. 使用 `is` 关键字 (最常用)
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

// 2. 使用 `asserts` 关键字 (断言守卫，用于校验失败抛错的场景)
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') throw new Error('Not a string!');
}
```

### 协变、逆变、双变是什么？在 TS 中如何体现？
描述**父子类型在复杂结构（如函数、数组）中的兼容性方向**。
- **协变 (Covariance)**：子类型可以赋值给父类型（如 `Dog`  assignable to `Animal`，数组元素默认协变）。
- **逆变 (Contravariance)**：父类型可以赋值给子类型（**TS 中函数的参数默认是逆变的**，开启 `strictFunctionTypes` 后严格逆变）。
- **双变 (Bivariance)**：父子类型可以互相赋值（TS 中方法语法 `method(): void` 默认双变，为了兼容旧代码）。

### 泛型是什么？约束、默认值、多泛型如何使用？
泛型是**类型的变量**，用于在定义函数/接口/类时不预先指定具体类型，在使用时再传入。
```typescript
// 约束 (extends)、默认值 (=)、多泛型
function getProperty<T, K extends keyof T = 'id'>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### 手写常用工具类型（内置 Utility Types）
```typescript
// Partial: 将所有属性变为可选
type Partial<T> = { [P in keyof T]?: T[P] };

// Required: 将所有属性变为必选
type Required<T> = { [P in keyof T]-?: T[P] }; // -? 移除可选修饰符

// Pick: 挑选部分属性
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// Omit: 剔除部分属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Record: 构造键值对类型
type Record<K extends keyof any, T> = { [P in K]: T };
```

### 条件类型与 infer 是什么？
- **条件类型**：`T extends U ? X : Y`，类似三元运算符。
- **`infer`**：用于在条件类型的 `extends` 子句中**声明并推导一个类型变量**。
```typescript
// 推导 Promise 内部的类型
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

// 推导函数的返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

### 映射类型详解（key remapping / 修饰符）
- **映射类型**：基于旧类型创建新类型，如 `[K in keyof T]`。
- **键重映射 (Key Remapping)**：使用 `as` 子句修改键名。
  ```typescript
  // 将所有键加上 'Prefix'
  type AddPrefix<T> = { [K in keyof T as `Prefix${Capitalize<string & K>}`]: T[K] };
  ```
- **修饰符**：`+` (添加，默认), `-` (移除)。如 `-?` 移除可选，`-readonly` 移除只读。

### 模板字面量类型有什么用？
使用 `` `${T}` `` 语法操作字符串类型。常用于**动态生成联合类型**或**解析路由路径**。
```typescript
type EventName = 'click' | 'focus';
type Handlers = `on${Capitalize<EventName>}`; // 'onClick' | 'onFocus'
```

### keyof、typeof、索引访问类型分别是什么？
- **`keyof T`**：获取 T 所有键名组成的**联合类型**。
- **`typeof v`**：获取变量/对象 `v` 的**类型**（常用于获取 JS 对象的类型）。
- **`T[K]` (索引访问)**：获取 T 中键 K 对应的**属性类型**（类似 JS 的 `obj[key]`）。

### 类型兼容性为什么是「结构化类型」？
TS 采用**结构化类型系统 (Structural Type System)**（又称鸭子类型）：只要两个类型的**形状（属性结构）相同**，就被认为是兼容的，**不关心它们的名字是否相同**。（对比 Java/C# 的名义类型系统 Nominal）。

### 装饰器（Decorator）是什么？
一种特殊语法（`@decorator`），用于在**不修改原代码**的情况下，动态为类、方法、属性、参数添加元数据或包装逻辑（类似 AOP 面向切面编程）。TS 实现了 Stage 3 提案。

### 声明文件 `.d.ts` 与 `declare` 的作用？
- **`.d.ts`**：为没有 TS 源码的 JS 库提供类型声明，让 TS 编译器知道该库的 API 形状。
- **`declare`**：用于声明全局变量、模块或环境（如 `declare global {}`，`declare module 'xxx'`），告诉编译器“这些东西在运行时存在，你别报错”。

### 命名空间 namespace 与 ES 模块如何选择？
- **`namespace`**：TS 特有的内部模块机制，用于组织全局代码。**已不推荐**，正逐渐被淘汰。
- **ES Module (`import/export`)**：语言标准，支持 Tree Shaking，**绝对的首选**。

### 函数重载与泛型函数如何取舍？
- **函数重载**：适用于入参和出参类型**强相关且离散**的场景（如 `createElement('div')` 返回 `HTMLDivElement`）。
- **泛型函数**：适用于入参和出参类型**需要保持一致传递**的场景（如 `identity<T>(val: T): T`）。

### 一道类型体操：实现 DeepReadonly 和 元组转联合
```typescript
// 1. DeepReadonly (递归映射)
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 2. 元组转联合 (利用索引访问)
type TupleToUnion<T extends any[]> = T[number]; 
// 例: TupleToUnion<[1, 2, 3]> => 1 | 2 | 3
```

### tsconfig 中 strict 系列、target、module、paths 等关键配置
- **`strict`**：开启所有严格类型检查（包含 `strictNullChecks`, `noImplicitAny` 等），**生产环境必须开启**。
- **`target`**：编译输出的 JS 版本（如 `ES2015`, `ESNext`），影响语法降级（如 `class` 转 `function`）。
- **`module`**：编译输出的模块系统（如 `CommonJS`, `ESNext`, `NodeNext`）。
- **`paths`**：配置路径别名（如 `@/*` 映射到 `src/*`），需配合构建工具（Webpack/Vite）的 alias 使用。

### 为什么类型只在编译期存在？运行时如何保证类型安全？
- **原因**：TS 是 JS 的超集，编译时会进行**类型擦除 (Type Erasure)**，生成的纯 JS 不包含任何类型信息，以保证运行性能和体积。
- **运行时保证**：必须引入**运行时校验库**（如 **Zod**, **Yup**, **Joi**），在数据进入系统（如 API 响应、表单提交）时进行动态校验。

💡 **【补充高频考点】**
- **`satisfies` 操作符 (TS 4.9+)**：验证表达式是否匹配某种类型，但**保留推导出的最精确类型**（解决了 `as` 丢失类型或 `:` 限制过死的问题）。
- **`as const` 断言**：将变量断言为**只读的字面量类型**（常用于定义常量配置、路由表，配合 `typeof` 提取类型）。

---

# 🛠️ 构建工具 (Webpack / Vite / Rollup)

### webpack 的核心概念有哪些？
- **Entry**：入口，构建依赖图的起点。
- **Output**：出口，打包产物的路径和文件名。
- **Loader**：模块转换器，让 Webpack 能处理非 JS 文件（如 CSS, 图片, TS）。
- **Plugin**：插件，扩展 Webpack 功能（如打包优化、资源管理、注入环境变量），监听生命周期钩子。
- **Module / Chunk**：Module 是单个文件；Chunk 是 Webpack 打包后输出的代码块。

### loader 与 plugin 的区别？
- **Loader**：**翻译官**。负责将特定类型的文件转换为 Webpack 能理解的模块（如 `babel-loader`, `css-loader`）。在 `module.rules` 中配置，链式调用（从右到左/从下到上）。
- **Plugin**：**大管家**。参与 Webpack 的整个生命周期，可以修改编译结果、注入资源、执行自定义任务（如 `HtmlWebpackPlugin`, `MiniCssExtractPlugin`）。

### webpack 的构建流程是怎样的？
1. **初始化参数**：解析配置文件和 Shell 参数，合并出最终配置。
2. **开始编译**：创建 Compiler 对象，加载所有 Plugin。
3. **确定入口**：根据 Entry 找出所有依赖模块。
4. **编译模块**：从入口出发，调用 Loader 对模块进行翻译，找出依赖，递归编译。
5. **完成模块编译**：得到每个模块翻译后的最终代码和依赖关系。
6. **输出资源**：根据依赖关系，组装成 Chunk，转换为文件。
7. **输出完成**：根据 Output 配置，将文件写入文件系统。

### HMR（热模块替换）的原理是什么？
1. Webpack Dev Server 与浏览器通过 **WebSocket** 建立长连接。
2. 本地文件修改后，Webpack 重新编译受影响的模块，生成新的 hash。
3. Dev Server 将 hash 发送给浏览器。
4. 浏览器发现 hash 不同，通过 Ajax 请求新的模块 JS 文件。
5. 浏览器拿到新模块后，**替换掉内存中对应的旧模块**，并执行更新回调，实现不刷新页面的热更新。

### Tree Shaking 的原理与生效条件？
- **原理**：依赖 ES Module 的**静态语法结构**（`import/export`），在编译阶段分析出哪些导出的变量未被使用（Dead Code），在压缩阶段（Terser）将其剔除。
- **生效条件**：
  1. 必须使用 **ESM**（`import/export`），不能用 CJS（`require` 是动态的）。
  2. `mode` 必须为 `production`。
  3. 代码的副作用必须可控（配置 `package.json` 的 `"sideEffects": false`，或保留有副作用的文件如 CSS/Polyfill）。

### 代码分割（Code Splitting）与 splitChunks 如何配置？
- **动态导入**：使用 `import()` 语法，Webpack 会自动将其打包为独立的 Chunk。
- **`splitChunks`**：提取公共依赖，避免重复打包。
  ```javascript
  optimization: {
    splitChunks: {
      chunks: 'all', // 同步和异步 chunk 都提取
      cacheGroups: {
        vendors: { test: /[\\/]node_modules[\\/]/, name: 'vendors' },
        commons: { minChunks: 2, name: 'commons' }
      }
    }
  }
  ```

### webpack 构建速度如何优化？
1. **缩小范围**：配置 `include/exclude`，限制 Loader 处理范围。
2. **持久化缓存**：Webpack 5 开启 `cache: { type: 'filesystem' }`（**最有效**）。
3. **多线程**：使用 `thread-loader` 或 `HappyPack`（Webpack 5 后收益降低）。
4. **升级工具**：使用 `esbuild-loader` 替代 `babel-loader` 进行转译。
5. **减少 Resolve**：配置 `resolve.extensions` 和 `resolve.alias`，减少文件查找时间。

### 产物体积如何优化？
1. **Tree Shaking** 剔除死代码。
2. **代码分割** (SplitChunks) 和 **路由懒加载**。
3. **压缩**：使用 `TerserPlugin` (JS) 和 `CssMinimizerPlugin` (CSS)。
4. **图片优化**：小图转 Base64，大图使用 WebP，配合 `image-minimizer-webpack-plugin`。
5. **开启 Gzip / Brotli** 压缩（配合 Nginx 或 `compression-webpack-plugin`）。

### source map 有哪些类型？如何选择？
- **开发环境**：推荐 `eval-cheap-module-source-map`（重构速度快，能定位到源码行列）。
- **生产环境**：推荐 `hidden-source-map`（生成 map 文件但不包含引用注释，配合错误监控平台使用，**不暴露源码给普通用户**）或直接关闭。

### Babel 的原理是什么？AST 在其中的作用？
1. **Parsing（解析）**：将源码字符串解析为 **AST（抽象语法树）**。
2. **Transformation（转换）**：遍历 AST，根据插件规则进行修改（如将 `class` 转为 `function`，将 JSX 转为 `React.createElement`）。
3. **Generation（生成）**：将修改后的 AST 重新生成源码字符串。
**AST 的作用**：它是代码的结构化表示，让 Babel 能够像操作 JSON 一样精准地修改代码逻辑。

### polyfill 与 core-js、@babel/preset-env 的关系？
- **polyfill**：垫片，用于在老浏览器中补齐新 API（如 `Promise`, `Array.from`）。
- **core-js**：JavaScript 标准库的 polyfill 实现。
- **`@babel/preset-env`**：Babel 的智能预设。配合 `browserslist` 和 `useBuiltIns: 'usage'`，它能**按需**自动引入 `core-js` 中缺失的 polyfill，避免全量引入导致体积爆炸。

### Vite 为什么快？开发与生产模式有何不同？
- **开发环境快**：
  1. **原生 ESM**：浏览器原生支持 `<script type="module">`，Vite 无需打包，**按需编译**，只编译当前请求的模块。
  2. **esbuild 预构建**：使用 Go 编写的 esbuild 将第三方依赖（如 React, Lodash）预构建为 ESM 格式，速度比 Babel 快 10-100 倍。
- **生产环境**：使用 **Rollup** 进行打包（因为 Rollup 的 Tree Shaking 和产物体积优化比 esbuild 更好）。

### Vite 与 webpack 的核心对比？
| 特性 | Vite | Webpack |
|---|---|---|
| **开发启动速度** | 极快（按需编译，O(1)） | 慢（需全量打包，O(N)） |
| **HMR 速度** | 极快（仅更新修改的模块） | 随项目体积增大而变慢 |
| **生产构建** | Rollup（生态较好，但配置不如 Webpack 灵活） | 原生（极其强大，生态最丰富） |
| **适用场景** | 中小型项目、Vue/React 现代框架项目 | 大型复杂项目、需要深度定制构建流程的项目 |

### Rollup 和 esbuild 各自的定位？
- **Rollup**：专注于 **JS 库**的打包。Tree Shaking 能力极强，产物干净，支持多种输出格式（UMD, ESM, CJS）。不适合复杂的应用级打包（如代码分割、HMR）。
- **esbuild**：用 Go 编写的**极速打包/转译工具**。定位是替代 Babel 和 Terser，速度极快，但功能相对基础，不支持部分 JS 特性（如 `const enum`）和复杂的插件生态。

💡 **【补充高频考点】**
- **Vite 的依赖预构建 (Pre-bundling)**：第三方库通常是 CJS 或 UMD 格式，浏览器 ESM 加载会发出几百个请求。Vite 在启动时用 esbuild 将它们转为 ESM 并缓存到 `node_modules/.vite`，大幅减少请求数。
- **Webpack 持久化缓存 (Filesystem Cache)**：Webpack 5 引入，将编译过程中的 AST、Module 信息序列化到磁盘。第二次构建时直接反序列化，跳过大量解析工作，使冷启动速度提升数倍。

---

# 📦 模块化与包管理

### CommonJS、AMD、UMD、ESM 有什么区别？
- **CommonJS (CJS)**：Node.js 标准。**同步**加载，运行时解析，输出的是**值的拷贝**。
- **AMD**：RequireJS 推广。**异步**加载，浏览器端早期方案，回调地狱。
- **UMD**：通用模块定义。兼容 CJS 和 AMD 的“缝合怪”，通过判断 `module` 和 `define` 存在与否来切换。
- **ES Module (ESM)**：语言标准。**静态**编译，支持 Tree Shaking，输出的是**值的引用**。

### npm、yarn、pnpm 有什么区别？
- **npm**：默认采用**扁平化** `node_modules`（依赖提升），容易产生幽灵依赖。
- **yarn (v1)**：类似 npm，但引入了 lock 文件和并行安装。yarn v2+ 引入了 PnP（Plug'n'Play），彻底抛弃 `node_modules`。
- **pnpm**：采用**硬链接 + 符号链接**机制，全局 store 共享，极致节省磁盘空间，且**严格隔离**，彻底解决幽灵依赖。

### pnpm 的硬链接 + 符号链接机制详解，为什么能省空间且避免幽灵依赖？
- **省空间**：pnpm 维护一个全局的 `store` 目录。安装依赖时，将文件通过**硬链接 (Hard Link)** 链接到项目的 `node_modules/.pnpm` 目录。同一份文件在磁盘上只存一份。
- **避免幽灵依赖**：`.pnpm` 目录是扁平的，但项目的根 `node_modules` 是**非扁平**的。只有 `package.json` 中显式声明的依赖，才会通过**符号链接 (Symlink)** 提升到根 `node_modules`。未声明的依赖被锁在 `.pnpm` 深处，代码中 `require` 会直接报错。

### 语义化版本（SemVer）与 lock 文件的意义？
- **SemVer**：`主版本号.次版本号.修订号` (如 `1.2.3`)。
  - `^1.2.3`：允许 minor 和 patch 更新（`>=1.2.3 <2.0.0`）。
  - `~1.2.3`：仅允许 patch 更新（`>=1.2.3 <1.3.0`）。
- **Lock 文件 (`package-lock.json` / `pnpm-lock.yaml`)**：锁定**精确的版本号**和**完整的依赖树结构**。确保团队所有成员和 CI/CD 环境安装的依赖**绝对一致**，避免“在我电脑上明明可以”的惨剧。

### Monorepo 是什么？turborepo、lerna 的作用？
- **Monorepo**：单一代码仓库，包含多个相互关联的子包（如 UI 库、Utils、App）。
- **Lerna**：早期的 Monorepo 管理工具，负责依赖提升、版本发布。现多被 pnpm workspaces 替代。
- **Turborepo**：现代的**构建编排工具**。核心优势是**智能任务缓存**（本地/远程）和**并行执行**，极大加速 Monorepo 的构建和 Lint 速度。

### Babel 与 ESLint、Prettier 的职责边界？
- **Babel**：**转译器**。将新语法/TS 转为老版本 JS，不关心代码对错。
- **ESLint**：**代码质量检查**。发现语法错误、潜在 Bug、不符合团队规范的代码（如未使用的变量）。
- **Prettier**：**代码格式化**。统一代码风格（缩进、引号、换行），无脑覆盖，不关心逻辑。

### CI/CD 是什么？前端项目常见流水线？
- **CI (持续集成)**：代码合并后自动触发 Lint、Test、Build，尽早发现集成错误。
- **CD (持续交付/部署)**：将构建产物自动部署到测试/生产环境。
- **前端流水线**：`Checkout` -> `Install Dependencies` -> `Lint & Type Check` -> `Unit Test` -> `Build` -> `Deploy (OSS/CDN)`。

### 微前端是什么？qiankun、micro-app、Module Federation 原理对比？
| 方案 | 核心原理 | 优点 | 缺点 |
|---|---|---|---|
| **qiankun** | 基于 single-spa，**JS 沙箱** (Proxy/快照) + **CSS 隔离** (Shadow DOM/strictStyleIsolation) | 生态成熟，接入成本低，框架无关 | 改造老项目有一定成本，CSS 隔离不完美 |
| **micro-app** | 借鉴 WebComponent 思想，通过 **CustomElement** 渲染子应用，内部使用 JS 沙箱 | 接入极简（像用 `<iframe>` 一样），无侵入 | 相对较新，复杂场景下的边界问题仍在完善 |
| **Module Federation** | Webpack 5 原生支持，**运行时模块共享**，打破应用边界 | 真正的模块级复用，无 JS 沙箱开销，性能最好 | 强依赖 Webpack 5/Vite 插件，对技术栈有要求 |

### 组件库如何实现按需加载？
1. **早期 (Babel 插件)**：使用 `babel-plugin-import`，在编译时将 `import { Button } from 'lib'` 转换为 `import Button from 'lib/es/button'`。
2. **现代 (ESM + Tree Shaking)**：组件库直接输出 ESM 格式，利用构建工具的 Tree Shaking 自动剔除未使用的组件（如 Ant Design 5.x, Element Plus）。

### SSR 工程涉及哪些关键问题？
1. **Hydration (注水)**：服务端返回 HTML 后，客户端 JS 需要重新绑定事件并接管 DOM，此过程若不一致会导致报错或闪烁。
2. **数据预取**：在路由匹配后、渲染前，获取组件所需数据（如 `getServerSideProps`）。
3. **路由同构**：前后端需共享路由配置。
4. **内存泄漏**：Node 端是单例，全局变量或闭包未清理会导致内存泄漏。
5. **环境差异**：浏览器 API（`window`, `document`）在 Node 端不存在，需做兼容判断。

### Git 常用命令与协作工作流？
- **常用命令**：`rebase` (变基，保持提交线整洁), `cherry-pick` (摘取特定 commit), `stash` (暂存), `reset` (回退并丢弃), `revert` (生成新 commit 抵消旧 commit)。
- **工作流**：
  - **Git Flow**：适合版本发布周期长的项目（`main`, `develop`, `feature`, `release`, `hotfix`）。
  - **GitHub Flow**：适合持续部署的项目（只有 `main`，所有开发在 `feature` 分支，合并即部署）。

💡 **【补充高频考点】**
- **`peerDependencies` 的作用**：声明“我的包运行需要宿主环境提供这些依赖”（如 React 组件库声明 `react` 为 peerDep）。防止打包时出现多个 React 实例导致 Hooks 报错。
- **Yarn PnP (Plug'n'Play)**：彻底抛弃 `node_modules` 目录，通过生成 `.pnp.cjs` 文件，拦截 Node.js 的 `require` 解析逻辑，直接从 Zip 压缩包中读取依赖，解决幽灵依赖并提升安装速度。

---

# 🚀 工程化进阶

### 为什么需要 browserslist？它影响哪些工具？
`browserslist` 是一个**统一的目标环境配置**（如 `> 1%, last 2 versions`）。
**影响的工具**：Babel (决定需要转译哪些语法)、Autoprefixer (决定需要加哪些 CSS 前缀)、ESLint (决定启用哪些环境特定的规则)。

### ESLint flat config 与传统 `.eslintrc` 有什么区别？
- **传统 `.eslintrc`**：基于对象嵌套，配置合并逻辑复杂（`extends` 覆盖规则不直观），不支持原生 ESM。
- **Flat Config (`eslint.config.js`)**：ESLint v9 默认。基于**数组**配置，合并逻辑清晰（后项覆盖前项），原生支持 ESM，彻底解决了配置文件嵌套和全局变量污染的痛点。

### monorepo 中如何做版本管理与发布？changesets 的作用？
- **Changesets**：一个管理 Monorepo 版本和 Changelog 的工具。
- **工作流**：开发者在 PR 中运行 `changeset` 命令，记录本次修改影响的包及版本变更类型（major/minor/patch）。CI 合并时，Changesets 自动计算版本号、更新 `package.json`、生成 Changelog 并触发发布。

### 什么是幽灵依赖（phantom dependency）？危害与解决？
- **定义**：代码中 `import` 了一个包，但该包**并未在 `package.json` 中声明**。由于 npm 的扁平化机制，它恰好被提升到了 `node_modules` 根目录，导致代码能侥幸运行。
- **危害**：一旦依赖树改变（如升级某个包），该幽灵依赖可能突然消失，导致线上崩溃。
- **解决**：使用 **pnpm** 或 **Yarn PnP**，它们的严格隔离机制会直接报 `Module not found` 错误。

### tsc、Babel、swc、esbuild 在转译 TS 上有什么区别？
| 工具 | 语言 | 速度 | TS 特性支持 | 适用场景 |
|---|---|---|---|---|
| **tsc** | TS | 慢 | 100% 支持（包括 `const enum`, `namespace`） | 需要生成 `.d.ts` 声明文件，或使用了冷门 TS 特性。 |
| **Babel** | JS | 中 | 剥离类型，不支持部分 TS 特性（如 `const enum`） | 需要结合庞大的 Babel 插件生态（如 JSX 转换、Polyfill）。 |
| **swc** | Rust | 极快 | 仅做类型擦除（剥离类型） | 替代 Babel 进行极速转译，Vite/Webpack 常用。 |
| **esbuild** | Go | 极快 | 仅做类型擦除 | 替代 Babel/Terser，Vite 预构建和极速打包的核心。 |

### 长期缓存（long-term caching）如何通过 hash 实现？
在 Webpack 的 `output.filename` 中使用 `[contenthash]`（如 `app.[contenthash:8].js`）。
**原理**：只要文件**内容不变**，生成的 hash 就不变。配合 Nginx 设置 `Cache-Control: max-age=31536000`（强缓存），浏览器会直接读取本地缓存；内容改变时 hash 改变，浏览器会请求新文件，完美解决缓存更新问题。

### 动态 import() 与魔法注释有什么作用？
- **动态 `import()`**：实现**路由懒加载**和**代码分割**，返回一个 Promise。
- **魔法注释**：Webpack 特有的注释，用于控制分包行为。
  ```javascript
  import(
    /* webpackChunkName: "lodash" */ 
    /* webpackPrefetch: true */ // 浏览器空闲时预拉取
    'lodash'
  )
  ```

### 如何分析与优化首屏性能（构建侧）？
1. **分析**：使用 `webpack-bundle-analyzer` 分析产物体积，找出大文件。
2. **优化**：
   - 路由懒加载，拆分 Chunk。
   - 提取公共 CSS/JS，避免重复加载。
   - 使用 `html-webpack-plugin` 内联关键 CSS (Critical CSS)。
   - 图片优化（WebP、小图 Base64、大图 CDN）。
   - 开启 Gzip/Brotli。
   - 考虑 SSR 或 SSG（预渲染）。

### esbuild/swc 为什么比 Babel/webpack 快这么多？
1. **语言优势**：使用 Go / Rust 编写，天生支持**多线程**并发，内存管理高效。
2. **AST 优化**：重写了 AST 解析和遍历逻辑，避免了 JS 引擎的 GC 开销。
3. **功能克制**：esbuild/swc 仅做“语法降级”和“类型擦除”，**不做复杂的类型检查**（类型检查交给 tsc），大幅减少工作量。

### 如何为没有类型的第三方库补充类型？
1. **优先寻找**：`npm install @types/xxx -D`（DefinitelyTyped 社区维护）。
2. **自己声明**：在项目的 `typings` 目录下创建 `xxx.d.ts`：
   ```typescript
   declare module 'untyped-library' {
     export function doSomething(): void;
   }
   ```

### CSS 工程化：CSS Modules、CSS-in-JS、原子化 CSS 对比？
| 方案 | 原理 | 优点 | 缺点 |
|---|---|---|---|
| **CSS Modules** | 构建时生成哈希类名，实现局部作用域 | 零运行时开销，学习成本低，CSS 独立 | 无法在 JS 中动态计算样式，跨组件复用需抽离变量 |
| **CSS-in-JS** | 在 JS 中写 CSS (如 Styled-components) | 动态样式极强，与组件逻辑强绑定，无全局污染 | 运行时开销大，SSR 配置复杂，包体积增加 |
| **原子化 (Tailwind)** | 提供预定义的 utility class | 开发极快，无需命名，按需生成体积极小 | HTML 中 class 冗长，复杂动画/伪类维护困难 |

### 如何设计一个可发布的 npm 库（打包与导出）？
1. **`package.json` 核心字段**：
   - `main`: CJS 入口。
   - `module`: ESM 入口（供 Webpack/Rollup Tree Shaking）。
   - `types`: TS 声明文件入口。
   - `exports`: 现代 Node.js 的条件导出（精确控制不同环境加载不同文件）。
   - `files`: 指定发布到 npm 的文件（通常是 `dist`）。
2. **构建工具**：使用 **Rollup** 或 **tsup**（基于 esbuild）打包，同时输出 CJS、ESM 和 `.d.ts`。

### 什么是 Web Vitals？工程上如何持续监控与防劣化？
- **核心指标**：
  - **LCP** (Largest Contentful Paint)：最大内容绘制，衡量**加载性能**（< 2.5s）。
  - **INP** (Interaction to Next Paint)：交互到下一帧绘制，衡量**交互响应延迟**（< 200ms，替代了 FID）。
  - **CLS** (Cumulative Layout Shift)：累积布局偏移，衡量**视觉稳定性**（< 0.1）。
- **监控与防劣化**：
  1. 使用 `web-vitals` 库在客户端采集数据，上报至监控平台（如 Sentry, 自建平台）。
  2. **防劣化**：在 CI/CD 流水线中集成 **Lighthouse CI**，设置性能阈值（Budget），若 LCP 或 CLS 超标则**阻断合并/发布**。

💡 **【补充高频考点】**
- **前端监控体系**：分为**错误监控**（JS 报错 `window.onerror`、Promise 未捕获 `unhandledrejection`、资源加载失败）、**性能监控**（Web Vitals、FCP、TTFB）、**行为监控**（PV/UV、点击流、停留时长）。
- **Sentry 原理**：通过 SDK 拦截全局错误，收集错误堆栈、Source Map（将压缩代码映射回源码）、用户环境信息，上报至服务端进行去重、聚合和告警。
- **BFF (Backend For Frontend)**：Node.js 中间层。用于聚合多个微服务接口、裁剪数据、处理 SSR、实现鉴权前置，减轻前端请求压力，解耦前后端。