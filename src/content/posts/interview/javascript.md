
---
title: javaScript
description: javaScript
pubDate: 2026-07-17
category: 前端
tags: ["javascript",  "面试"]
---


### JavaScript 有哪些数据类型？如何在内存中区分它们？
- **基础数据类型**：`number`、`boolean`、`string`、`null`、`undefined`、`bigint`、`symbol`
- **复杂数据类型**：`object`、`map`、`set`、`array`、`date`、`RegExp`、`function` 等

**内存区分**：
- **基本数据类型**：存在**栈（Stack）** 中，按值访问，大小固定，系统自动分配和释放。
- **复杂数据类型**：实体存在**堆（Heap）** 中，大小不固定；其在栈中仅存储指向堆内存的**引用地址（指针）**。

---

### 如何准确判断一个变量的类型？各方法的优劣是什么？

#### 1. `typeof`
- **原理**：根据底层二进制标签判断。
- **能判断**：所有基本数据类型（返回 `'number'`, `'string'`, `'boolean'`, `'undefined'`, `'symbol'`, `'bigint'`）以及函数（返回 `'function'`）。
- **不能判断**：
  - `null`：由于历史设计缺陷，底层二进制前三位为 0，`null` 全为 0，被误判为 `'object'`。
  - 除函数外的所有对象类型（Array, Date, RegExp 等）均返回 `'object'`，无法细分。

#### 2. `instanceof`
- **原理**：根据原型链（`__proto__`）查找构造函数的 `prototype` 是否在对象的原型链上。
- **能判断**：所有引用数据类型。
- **不能判断**：基本数据类型（除非用 `new Number(1)` 包装）；且存在跨 iframe 失效的问题。

#### 3. `Object.prototype.toString.call()` （**最准确推荐**）
- **原理**：每个对象内部都有一个 `[[Class]]` 属性，该方法能准确返回其内部类型。
```javascript
Object.prototype.toString.call(123)           // "[object Number]"
Object.prototype.toString.call(null)          // "[object Null]"
Object.prototype.toString.call(undefined)     // "[object Undefined]"
Object.prototype.toString.call([1, 2])        // "[object Array]"
Object.prototype.toString.call(new Date())    // "[object Date]"
```

#### 4. 其他专用方法
- `Array.isArray(value)`：判断数组的最安全方法（跨 iframe 有效）。
- `Number.isNaN(value)`：严格判断是否为 `NaN`（不会像全局 `isNaN` 那样发生隐式转换）。
- `Object.is(a, b)`：判断两个值是否绝对相等（修复了 `===` 中 `+0 === -0` 为 true，以及 `NaN === NaN` 为 false 的缺陷）。

---

### `==` 的隐式转换规则是什么？请说出完整流程。

#### 1. 类型相同（Same Type）
- `NaN`：`NaN` 不等于任何值（包括自身）。
- `+0` 和 `-0`：相等。
- 对象引用：引用地址一致则相同。
- 字符串/数字：内容一致则相同。

#### 2. `null` 和 `undefined` 的“专属规则”
- 如果一侧为 `null`，另一侧为 `undefined`，返回 `true`。
- 如果一侧为 `null` 或 `undefined`，另一侧是其他任何类型，返回 `false`。

#### 3. 类型不同时的转换规则
- **Number 与 String**：将 String 转为 Number（调用 `ToNumber`），再比较。
  - `1 == '1'` ➔ `1 == 1` ➔ `true`
  - `1 == 'ab'` ➔ `1 == NaN` ➔ `false`
- **Boolean 与任何类型**：只要有一方是 Boolean，永远先将 Boolean 转为 Number（`true`➔1, `false`➔0），再进行比较。
  - `true == 1` ➔ `1 == 1` ➔ `true`
  - `false == '0'` ➔ `0 == '0'` ➔ `true`
  - `true == 'true'` ➔ `1 == NaN` ➔ `false`
- **Object 与 基础类型**：Object 优先调用 `valueOf()`，若返回非原始值，则调用 `toString()` 转为原始值，然后再按上述规则比较。

#### 4. 经典“变态”面试题解析
- **`[] == ![]` 为什么是 true？**
  1. 右边 `![]`：`[]` 转为布尔值是 `true`，`!true` 是 `false`。式子变成 `[] == false`。
  2. Boolean 转 Number：`false` 转为 `0`。式子变成 `[] == 0`。
  3. Object 转原始值：`[]` 调用 `toString()` 变成 `""`（空字符串）。式子变成 `"" == 0`。
  4. String 转 Number：`""` 转为 `0`。式子变成 `0 == 0`。结果：`true`。
- **`0 == ''` 为什么是 true？** 
  空字符串 `''` 通过 `ToNumber` 转换为 `0`，`0 == 0` 为 `true`。
- **`'\n\n\n' == 0` 为什么是 true？**
  仅包含空白符的字符串通过 `ToNumber` 转换时，会被解析为 `0`，`0 == 0` 为 `true`。

---

### 实现一个完整的深拷贝（处理循环引用、特殊类型）

```javascript
const target = {
  // 基本类型
  num: 1, str: 'hello', bool: true, nul: null, undef: undefined, sym: Symbol('symbol'), 
  // 特殊内置对象
  date: new Date('2023-01-01'), reg: /test/gi, map: new Map([['mapKey', 'mapValue']]), set: new Set([1, 2, 3]),
  // 复杂结构
  arr: [1, 2, { inner: 'array' }], obj: { name: 'target' },
  // 无法被 JSON 拷贝的类型
  func: function() { return 'I am a function'; },
};
```

#### 1. 使用 `JSON.parse(JSON.stringify())`
- **缺点**：函数会丢失；`Date` 会变成字符串；`RegExp`、`Map`、`Set` 会变成空对象 `{}`；遇到循环引用会直接报错。

#### 2. 手写完整递归深拷贝
```javascript
function deepClone(target, hash = new WeakMap()) {
  // 1. 处理 null 或 非对象/函数
  if (target === null || typeof target !== 'object') return target;

  // 2. 处理特殊内置对象
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);
  
  // 3. 处理循环引用
  if (hash.has(target)) return hash.get(target);

  // 4. 初始化结果容器 (保持原型链)
  const cloneTarget = new target.constructor();
  hash.set(target, cloneTarget);

  // 5. 处理 Map
  if (target instanceof Map) {
    target.forEach((value, key) => {
      cloneTarget.set(key, deepClone(value, hash));
    });
    return cloneTarget;
  }

  // 6. 处理 Set
  if (target instanceof Set) {
    target.forEach(value => {
      cloneTarget.add(deepClone(value, hash));
    });
    return cloneTarget;
  }

  // 7. 递归遍历普通对象和数组
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      cloneTarget[key] = deepClone(target[key], hash);
    }
  }
  
  // 8. 拷贝 Symbol 属性 (Object.keys 无法获取)
  const symKeys = Object.getOwnPropertySymbols(target);
  symKeys.forEach(symKey => {
    cloneTarget[symKey] = deepClone(target[symKey], hash);
  });

  return cloneTarget;
}
```

---

### 解释栈内存与堆内存，以及它们与 GC 的关系。

#### 栈 (Stack)
“后进先出”的数据结构，内存是连续分配的，由操作系统自动分配和释放，存取速度快。

#### 堆 (Heap)
树状/图状的内存结构，内存是不连续分配的，大小不固定，需要垃圾回收机制（GC）来管理。

#### 内存分配过程示例
```javascript
function test() {
  let a = 10;             // 基本类型
  let obj = { name: 'JS' }; // 引用类型
}
test();
```
**分配过程**：
1. 调用 `test()`，在**栈**中压入一个执行上下文（栈帧）。
2. `let a = 10`：在栈中开辟空间，直接存入值 `10`。
3. `let obj = ...`：在**堆**中开辟一块空间，存入实体 `{ name: 'JS' }`（假设地址为 `0x1122`）；同时在**栈**中开辟空间存入变量 `obj`，其值为指针 `0x1122`。
4. `test()` 执行完毕，栈帧弹出。栈中的 `a` 和 `obj`（指针）瞬间销毁。
5. 此时，堆中的 `{ name: 'JS' }` 失去了栈中指针的引用，变成了“孤儿”，等待 GC 回收。

#### GC (垃圾回收机制)
- **引用计数法**：记录对象被引用的次数，为 0 则回收。**缺点**：无法解决循环引用导致的内存泄漏，现代 JS 引擎已弃用。
- **标记清除法**：从“根对象”（如 `window`）出发，遍历标记所有可达对象为“存活”，未标记的即为垃圾并清除。**缺点**：会产生内存碎片。
- **V8 垃圾回收（分代回收）**：
  - **新生代 (Scavenge 算法)**：空间小，存活时间短。采用“复制算法”，将存活对象从 From 空间复制到 To 空间，然后清空 From 空间，两者角色互换。
  - **老生代**：空间大，存活时间长。采用“标记-清除” + “标记-整理”（将存活对象向内存一端移动，消除碎片）。
  - **增量标记**：将标记过程拆分为小步骤，与 JS 主线程交替执行，减少 STW (Stop-The-World) 停顿时间。

---

### 闭包的本质是什么？请讲清它的原理与典型应用。

**本质**：函数与其词法环境的组合。内部函数能够访问并记住其外部函数作用域中的变量，即使外部函数已经执行完毕。

#### 闭包的作用：
1. **数据私有化**：模拟私有变量，避免全局污染。
2. **防抖节流**：利用闭包保存定时器 ID 或状态。
3. **函数柯里化**：保存部分参数，返回新函数。

#### 闭包的缺点：
闭包本身不会导致内存泄漏，但**使用不当**（如将包含大对象的闭包赋值给全局变量且不再使用）会导致变量无法被 GC 回收。解决方法：不需要时手动将引用置为 `null`。

---

### for 循环中用 var 注册回调，输出全是同一个值，为什么？如何修复？

**原因**：`var` 没有块级作用域（`{}` 对 `var` 无效），且 `setTimeout` 是异步的。当回调执行时，循环早已结束，共享的变量 `i` 已经变成了 3。

```javascript
for (var i = 0; i < 3; i++) {
    setTimeout(function() { console.log(i); }, 1000);
}
// 实际输出：3, 3, 3
```

#### 修复方案：
1. **使用 `let`**（推荐）：`let` 具有块级作用域，每次循环都会创建一个新的词法环境绑定当前的 `i`。
2. **IIFE 使用闭包**：每次循环创建一个新作用域，将当前的 `i` 作为参数传入并固定。
   ```javascript
   for (var i = 0; i < 3; i++) {
       ((j) => { setTimeout(function() { console.log(j); }, 1000); })(i);
   }
   ```
3. **setTimeout 传参数**：利用 API 特性传递参数。
   ```javascript
   for (var i = 0; i < 3; i++) {
       setTimeout(function(j) { console.log(j); }, 1000, i);
   }
   ```

---

### 什么是作用域和作用域链？JS 用的是哪种作用域？

#### 作用域
- **全局作用域**
- **函数作用域**（局部作用域）
- **块级作用域**（ES6 `let`/`const` 引入）

**作用域链**：JS 引擎查找变量的规则和路径。当前作用域中先查找，没找到会向上级作用域查找，一直找到全局作用域，没找到就抛出 `ReferenceError` 错误。

#### 词法作用域
JS 使用的是**词法作用域**（静态作用域），即变量的作用域在**代码书写（词法分析）时**就已确定，而非运行时决定。

---

### 变量提升是什么？let/const 的暂时性死区（TDZ）如何理解？

#### 变量提升
使用 `var` 定义的变量和 `function` 声明的函数，其声明部分会被提升到当前作用域顶部（`var` 初始化为 `undefined`）。

#### 暂时性死区 (TDZ)
`let` 和 `const` 也存在提升（进入 TDZ），但在代码执行到声明语句之前，访问该变量会抛出 `ReferenceError`。这保证了变量必须先声明后使用。

---

### this 的指向规则有哪些？请按优先级讲解。

在严格模式下 `this` 指向 `undefined`，非严格模式下，`this` 指向的是函数执行时的“上下文环境”。优先级从高到低：
1. **`new` 绑定**：构造函数调用，`this` 指向新创建的实例对象。
2. **显式绑定**：`call`、`apply`、`bind`，`this` 指向传入的第一个参数。
3. **隐式绑定**：作为对象方法调用（`obj.fn()`），`this` 指向调用该方法的对象 `obj`。
4. **默认绑定**：独立函数调用。严格模式下为 `undefined`，非严格模式下为全局对象（浏览器 `window`，Node `global`）。
5. **箭头函数**：**没有自己的 `this`**，其 `this` 继承自外层（定义时）的词法作用域，且不能被 `call/apply/new` 改变。

#### 手写 `new`
```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，并将其原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);
  // 2. 改变 this 指向并执行构造函数
  const result = Constructor.apply(obj, args);
  // 3. 如果构造函数返回了非 null 的对象，则返回该对象；否则返回新创建的 obj
  return (result !== null && typeof result === 'object') ? result : obj;
}
```

#### 手写实现 call、apply、bind
- **call**：立刻执行；参数逐个传递。
  ```javascript
  Function.prototype.myCall = function(context, ...args) {
      context = (context === null || context === undefined) ? globalThis : Object(context);
      const fnKey = Symbol('fn');
      context[fnKey] = this; // this 指向调用 myCall 的原函数
      const result = context[fnKey](...args);
      delete context[fnKey];
      return result;
  };
  ```
- **apply**：立刻执行；参数数组传递。
  ```javascript
  Function.prototype.myApply = function(context, argsArray) {
      context = (context === null || context === undefined) ? globalThis : Object(context);
      const fnKey = Symbol('fn');
      context[fnKey] = this;
      const args = Array.isArray(argsArray) ? argsArray : [];
      const result = context[fnKey](...args);
      delete context[fnKey];
      return result;
  };
  ```
- **bind**：返回一个改变 `this` 的新函数；参数逐个传递。
  ```javascript
  Function.prototype.myBind = function(context, ...bindArgs) {
      const self = this; // 保存原函数引用
      const boundFn = function(...callArgs) {
          const finalArgs = [...bindArgs, ...callArgs];
          // 核心难点：如果被 new 调用，this 应该指向 new 创建的实例
          if (this instanceof boundFn) {
              return self.apply(this, finalArgs);
          }
          return self.apply(context, finalArgs);
      };
      if (self.prototype) {
          boundFn.prototype = Object.create(self.prototype);
      }
      return boundFn;
  };
  ```

---

### 什么是原型、原型链？请描述查找过程。

| 角色 | 说明 | 存在位置 |
|---|---|---|
| `prototype` | 构造函数的属性，指向一个对象（原型对象） | 仅函数对象拥有 |
| `__proto__` | 实例对象的属性，指向创建它的构造函数的 `prototype` | 所有对象拥有 |
| `constructor` | 原型对象的属性，指回构造函数本身 | 原型对象上 |

**查找过程**：当访问 `obj.prop` 时，先查找 `obj` 自身；若无，通过 `obj.__proto__` 查找其构造函数的 `prototype`；若仍无，继续通过 `prototype.__proto__` 向上查找（如 `Object.prototype`）；最终到达 `Object.prototype.__proto__` (即 `null`)，若仍未找到，返回 `undefined`。

---

### JS 实现继承有哪些方式？为什么寄生组合继承最优？

#### 1. 原型链继承
`Child.prototype = new Parent();`
- **致命缺点**：父类中的引用类型属性会被所有子类实例共享；无法向父类构造函数传参。

#### 2. 构造函数继承
`Parent.call(this, name);`
- **致命缺点**：所有方法都在构造函数中定义，方法无法复用；且父类原型上的方法，子类访问不到。

#### 3. 组合继承
结合了上述两者，但**调用了两次父类构造函数**（一次 `call`，一次 `new`），导致子类原型上存在一份多余的父类实例属性，浪费内存。

#### 4. 寄生组合式继承（最优解）
**为什么最优**：只调用一次父类构造函数，避免了组合继承的属性冗余，且保持了原型链的完整和方法的复用。
```javascript
function Parent(name) { this.name = name; this.colors = ['red']; }
Parent.prototype.sayName = function() { console.log(this.name); };

function Child(name, age) {
  Parent.call(this, name); // 1. 借用构造函数：继承实例属性 (只调用一次)
  this.age = age;
}
// 2. 寄生式继承原型：继承原型方法，且不执行 Parent 构造函数
Child.prototype = Object.create(Parent.prototype);
// 3. 修正 constructor 指向
Child.prototype.constructor = Child;
```

---

### Symbol 有什么用？有哪些内置（well-known）Symbol？
- **作用**：创建独一无二的值。常用于作为对象属性名，避免属性名冲突；实现对象的私有属性。
- **内置 Symbol**：`Symbol.iterator` (定义迭代行为), `Symbol.toStringTag` (定制 `Object.prototype.toString` 输出), `Symbol.hasInstance` (自定义 `instanceof` 行为)。

---

### BigInt 解决了什么问题？使用时有哪些坑？
- **解决问题**：突破 Number 类型的安全整数范围 (`-(2^53 - 1)` 到 `2^53 - 1`)，用于高精度计算。
- **使用陷阱**：
  1. **不能与 Number 混合运算**：`1n + 1` 会报 `TypeError`，必须 `1n + 1n`。
  2. **相等性陷阱**：`1n == 1` 为 `true`，但 `1n === 1` 为 `false`。
  3. **不支持小数**：`BigInt(1.5)` 报错。除法直接截断小数 (`10n / 3n` 结果为 `3n`)。
  4. **JSON 序列化直接报错**：`JSON.stringify({ a: 1n })` 会报错，需自定义 `replacer` 转为字符串。
  5. **Math 对象不支持**：`Math.max(1n, 2n)` 报错，需自行实现比较逻辑。
  6. **位运算的差异**：BigInt 的位运算没有 32 位限制，而 Number 受限于 32 位。

---

### 严格模式 `'use strict'` 带来哪些行为变化？
- `this` 指向：全局执行上下文中，`this` 为 `undefined`（非严格模式为 `window`）。
- 禁止使用未声明的变量。
- 禁止删除不可删除的属性（如 `delete Object.prototype` 会报错）。
- 函数参数名不能重复。

---

### JS 内存泄漏的常见原因有哪些？如何排查？
**内存泄漏**：不再需要的对象，因依然存在“引用”，导致垃圾回收器无法识别它们为“垃圾”，从而无法回收。
1. **被遗忘的定时器与事件监听器**：`setInterval` 未 `clear`，或全局事件监听器未 `removeEventListener`。
2. **脱离 DOM 的引用（DOM 泄漏）**：JS 中保留了已被 `remove` 的 DOM 节点的引用。
3. **闭包使用不当**：闭包内引用了大对象，且该闭包被长期持有（如挂载在 `window` 上）。
4. **意外的全局变量**：未使用 `var/let/const` 声明的变量会自动挂载到全局对象上，永不回收。
- **排查工具**：Chrome DevTools 的 **Memory** 面板，使用 Heap Snapshot (堆快照) 对比，或 Allocation timeline 查找分离的 DOM 节点或持续增长的对象。

---

### 解释执行上下文与词法环境。
- **执行上下文 (Execution Context)**：JS 引擎为每段代码分配的“运行工作台”，包含变量环境、词法环境、`this` 绑定。
- **词法环境 (Lexical Environment)**：工作台上的“变量抽屉”和“查找地图”。由环境记录（存储变量）和对外部词法环境的引用（形成作用域链）组成。引擎通过不断压栈、出栈执行上下文，并沿着词法环境的外部引用查找变量，完成了 JavaScript 代码的动态执行。

---

### 0.1 + 0.2 !== 0.3，为什么？如何正确比较浮点数？
**原因**：0.1 和 0.2 在转二进制时是无限循环小数，受限于 IEEE 754 双精度 52 位尾数长度被截断，导致精度丢失。
**正确比较方法**：
1. **误差范围比较（推荐）**：`Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON`
2. **放大缩小法**：`(0.1 * 10 + 0.2 * 10) / 10 === 0.3`（适用于小数位数固定的场景）
3. **转为整数计算**：使用 `toFixed` 或 `toPrecision`（注意它们返回字符串，需用 `Number()` 转回）。
4. **第三方库**：在金融/高精度场景使用 `Decimal.js` 或 `big.js`。

---

### 描述浏览器的事件循环（Event Loop）及代码输出顺序
JavaScript 是单线程的。
- **调用栈 (Call Stack)**：“厨师的工作台”。同步代码排队执行，后进先出（LIFO）。
- **宏任务队列 (Macrotask Queue)**：“普通订单区”。存放 `setTimeout`、`setInterval`、DOM 事件回调。每次 Event Loop 只会取出**一个**任务执行。
- **微任务队列 (Microtask Queue)**：“VIP 加急订单区”。存放 `Promise.then/catch/finally`、`MutationObserver`、`queueMicrotask`。**规则**：在当前宏任务执行完毕后，必须立刻清空所有微任务，才能进入下一个宏任务或进行 DOM 渲染。

**经典输出顺序题**：
```javascript
console.log('1'); // 同步
setTimeout(() => console.log('2'), 0); // 宏任务
Promise.resolve().then(() => console.log('3')); // 微任务
console.log('4'); // 同步
// 输出顺序: 1 -> 4 -> 3 -> 2
```

---

### Node.js 的事件循环有哪些阶段？与浏览器有何不同？
- **Node.js 阶段**：`timers` (setTimeout/setInterval) ➔ `pending callbacks` ➔ `idle/prepare` ➔ `poll` (轮询 I/O) ➔ `check` (setImmediate) ➔ `close callbacks`。
- **核心区别**：
  1. 浏览器只有宏任务和微任务两个队列；Node.js 的宏任务被细分为多个阶段。
  2. Node.js 中 `process.nextTick` 的优先级**高于** Promise 微任务，且在**每个阶段切换时**都会优先清空 nextTick 队列。
  3. 浏览器中 `setTimeout(fn, 0)` 和 `setImmediate` 表现类似；但在 Node.js 的 I/O 循环中，`setImmediate` 总是优先于 `setTimeout` 执行。

---

### async/await 的本质是什么？它如何与事件循环配合？
- **本质**：Generator 函数 + 自动执行器（基于 Promise 封装的语法糖）。
- **配合机制**：遇到 `await` 时，async 函数会**暂停执行**，将 `await` 右侧的 Promise 决议后的后续代码，作为一个**微任务**推入微任务队列，并让出主线程。当主线程同步代码执行完毕并清空当前微任务队列时，才会恢复执行。

### 如何用 async/await 写出并发而非串行的代码？
```javascript
// ❌ 串行（总耗时 = A耗时 + B耗时）
const resA = await fetchA();
const resB = await fetchB();

// ✅ 并发 1：Promise.all（推荐）
const [resA, resB] = await Promise.all([fetchA(), fetchB()]);

// ✅ 并发 2：先触发，后 await（适用于需要单独处理错误）
const promiseA = fetchA();
const promiseB = fetchB();
const resA = await promiseA;
const resB = await promiseB;
```

### async/await 的错误处理有哪些方式与陷阱？
- **方式**：`try...catch` 块；或在 Promise 后链式调用 `.catch()`。
- **陷阱**：如果忘记写 `await`，函数会立即返回一个 Promise。若该 Promise 被 reject，外层的 `try...catch` **无法捕获**，会导致 `UnhandledPromiseRejection`。

---

### Generator 与 Iterator 是什么？有何应用？
- **Iterator (迭代器)**：一种接口，为不同数据结构提供统一的访问机制。调用 `next()` 返回 `{ value: any, done: boolean }`。
- **Generator (生成器)**：`function*` 声明的函数，执行后返回一个 Iterator 对象。通过 `yield` 关键字可以暂停和恢复函数执行。
- **应用**：自定义遍历逻辑、实现异步流程控制（如 `redux-saga` 的核心原理）、协程。

---

### queueMicrotask、setTimeout、requestAnimationFrame 有何区别？
| API | 类型 | 执行时机 | 适用场景 |
|---|---|---|---|
| `queueMicrotask` | 微任务 | 当前同步代码执行完毕后，**立即**执行 | 需要极高优先级、在 DOM 渲染前完成的状态更新 |
| `requestAnimationFrame` | 宏任务(特殊) | 下一次浏览器**重绘之前** (通常 60Hz, ~16.6ms) | 流畅的动画、高频视觉更新 |
| `setTimeout` | 宏任务 | 至少延迟指定毫秒后，放入宏任务队列等待执行 | 延迟执行、防抖节流、给主线程喘息机会 |

---

### 手写防抖（debounce）和节流（throttle）
```javascript
// 防抖：连续触发，只在最后一次触发后延迟执行（如搜索框输入）
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：连续触发，每隔固定时间执行一次（如滚动监听、按钮防连点）
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```

---

### 什么是柯里化？请手写一个通用柯里化函数。
**概念**：把接受多个参数的函数，变换成接受一个单一参数的函数，并返回接受余下参数的新函数。
```javascript
function curry(fn) {
  return function curried(...args) {
    // 如果传入的参数个数 >= 原函数需要的参数个数，直接执行
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 否则，返回一个新函数，继续收集参数
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}
```

---

### 实现函数组合 compose 与 pipe
- **compose**：右到左执行 `f(g(x))`。
- **pipe**：左到右执行 `g(f(x))`。
```javascript
const compose = (...fns) => (initialValue) => fns.reduceRight((acc, fn) => fn(acc), initialValue);
const pipe = (...fns) => (initialValue) => fns.reduce((acc, fn) => fn(acc), initialValue);
```

---

### 数组去重有哪些方法？各自的局限是什么？
1. `[...new Set(arr)]`：最简洁。**局限**：无法区分 `{}` 和 `{}`（引用不同），但能正确去重 `NaN`。
2. `filter + indexOf`：`arr.filter((item, index) => arr.indexOf(item) === index)`。**局限**：无法去重 `NaN`（因为 `indexOf(NaN)` 永远是 -1）。
3. `Map`：遍历数组，以元素为 key 存入 Map。**最优解**，可处理所有类型（包括 `NaN` 和对象引用去重）。

---

### 如何扁平化数组？请给出多种实现。
```javascript
const arr = [1, [2, [3, 4]]];
// 1. 原生方法 (ES10)
arr.flat(Infinity);

// 2. 递归 + reduce
function flatArray(arr) {
  return arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flatArray(val)) : acc.concat(val), []);
}

// 3. 栈 (Stack) 迭代实现 (避免递归调用栈溢出)
function flatWithStack(arr) {
  const stack = [...arr];
  const res = [];
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) stack.push(...next);
    else res.push(next);
  }
  return res.reverse(); // 因为 pop 是后进先出，需反转
}
```

---

### 如何实现真正随机的数组乱序（洗牌）？
**Fisher-Yates 洗牌算法**（唯一保证数学上真正随机且 O(n) 的方法）：
```javascript
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 随机索引 0 到 i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // 交换
  }
  return arr;
}
// ⚠️ 避免使用 arr.sort(() => Math.random() - 0.5)，不同浏览器引擎排序算法不同，会导致概率分布不均。
```

---

### 数组的常用方法中，哪些会改变原数组？
- **会改变 (Mutating)**：`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`。
- **不改变 (Non-mutating)**：`map`, `filter`, `reduce`, `slice`, `concat`, `join`, `find`, `includes`, 以及 ES2023 的 `toSorted`, `toReversed`, `toSpliced`。

---

### 字符串有哪些常用方法？模板字符串有什么高级用法？
- **常用方法**：`slice`, `substring`, `split`, `replace`/`replaceAll`, `trim`, `includes`, `startsWith`, `endsWith`, `padStart`/`padEnd`。
- **模板字符串高级用法**：
  1. 支持多行字符串。
  2. 变量插值：`` `Hello ${name}` ``。
  3. **标签模板 (Tagged Templates)**：`` function tag(strings, ...values) {} ``，可用于过滤 XSS、国际化 (i18n) 或 SQL 参数化查询（如 `sql`raw`...` ``）。

---

### 正则表达式有哪些常见用法？请举几个工程中的例子。
- **表单验证**：`/^\d{11}$/` (手机号)，`/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/` (邮箱)。
- **字符串提取/替换**：`'2023-10-01'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日')`。
- **修饰符**：`g` (全局), `i` (忽略大小写), `m` (多行), `s` (dotAll, 让 `.` 匹配换行符)。

---

### JSON.stringify 和 JSON.parse 有哪些容易忽视的细节？
- **stringify 的“坑”**：
  1. 忽略 `undefined`、`Function`、`Symbol`（在对象中直接消失，在数组中变为 `null`）。
  2. `NaN`、`Infinity` 会被转为 `null`。
  3. `Date` 对象会被转为 ISO 格式字符串。
  4. 包含循环引用的对象会直接抛出 `TypeError`。
- **parse 的“救赎”**：可传入 `reviver` 函数，用于在解析时恢复 `Date` 等特殊类型：
  `JSON.parse(str, (key, value) => key === 'date' ? new Date(value) : value)`

---

### JS 的错误处理机制是怎样的？如何自定义错误？
- **机制**：同步错误用 `try...catch`；异步错误（Promise）必须用 `.catch()` 或 `try...catch` 包裹 `await`；全局未捕获错误监听 `window.onerror` 和 `window.addEventListener('unhandledrejection', ...)`。
- **自定义错误**：
```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message); // 必须调用 super
    this.name = 'ValidationError'; // 保持正确的错误名称
    // V8 引擎修复堆栈跟踪的需要
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
```

---

### 什么是函数式编程？它有哪些核心概念？
- **核心概念**：
  1. **纯函数 (Pure Function)**：相同输入永远得到相同输出，且无副作用（不修改外部状态）。
  2. **不可变数据 (Immutability)**：数据一旦创建不可修改，修改操作返回新副本。
  3. **函数是一等公民**：函数可作为参数传递、作为返回值、赋值给变量。
  4. **声明式编程**：关注“做什么”而非“怎么做”（如用 `map` 替代 `for`）。

---

### 什么是不可变数据？在 JS 中如何实现？
- **概念**：状态不能被直接修改，任何变更都会生成一个新的对象/数组。
- **实现**：
  1. 浅层：`Object.freeze()`，或扩展运算符 `{ ...obj, newProp: 1 }`。
  2. 深层（生产环境推荐）：使用 `Immer` (基于 Proxy，支持草稿修改并生成新树) 或 `Immutable.js` (持久化数据结构)。

---

### 什么是尾调用优化（TCO）？JS 支持吗？
- **概念**：如果函数的最后一步是调用另一个函数（`return fn()`），引擎可以复用当前的调用栈帧，而不是创建新的，从而防止栈溢出 (Stack Overflow)。
- **JS 支持情况**：ES6 规范中**有**定义，但实际仅 **Safari (JavaScriptCore)** 在严格模式下实现了它。V8 (Chrome/Node.js) 因尾调用会破坏调用栈追踪（影响调试和 Error.stack），至今**未实现**。

---

## ES6+ 核心特性

### let、const、var 的区别有哪些？
| 特性 | `var` | `let` | `const` |
|---|---|---|---|
| 作用域 | 函数作用域 / 全局 | **块级作用域** `{}` | **块级作用域** `{}` |
| 变量提升 | 是 (初始化为 undefined) | 否 (存在暂时性死区 TDZ) | 否 (存在暂时性死区 TDZ) |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 初始化 | 可选 | 可选 | **必须** |
| 值可变性 | 可变 | 可变 | **基本类型不可变，引用类型地址不可变** |

---

### 解构赋值有哪些用法和注意点？
- **用法**：数组按位置解构 `[a, b] = [1, 2]`；对象按属性名解构 `{ name, age } = obj`。
- **注意点**：
  1. 默认值仅在严格等于 `undefined` 时触发：`let { a = 1 } = { a: null }` (a 为 null)。
  2. 重命名：`const { name: userName } = obj` (将 obj.name 赋值给 userName)。
  3. 嵌套解构：`const { user: { name } } = data`。

---

### 扩展运算符与 rest 参数的区别是什么？
- **扩展运算符 (Spread)**：在函数调用或数组/对象字面量中，**展开** iterable 或对象。如 `[...arr]`, `{ ...obj }`。
- **Rest 参数 (Rest)**：在函数参数列表或解构赋值中，**收集**剩余的元素到一个数组中。如 `function fn(a, ...args) {}` 或 `const { a, ...rest } = obj`。

---

### 可选链 `?.` 与空值合并 `??` 解决了什么问题？
- `?.`：安全访问深层嵌套属性。若左侧为 `null` 或 `undefined`，则短路返回 `undefined`，避免 `Cannot read properties of undefined` 报错。
- `??`：仅当左侧为 `null` 或 `undefined` 时，才返回右侧的默认值。解决了 `||` 会错误拦截 `0`、`''`、`false` 等合法 falsy 值的问题。

---

### Map 与普通对象 Object 有什么区别？
1. **键的类型**：Map 的键可以是**任意类型**（包括对象、函数）；Object 的键只能是 String 或 Symbol。
2. **顺序**：Map 严格保持**键值对的插入顺序**；Object 的键顺序规则复杂（数字键优先，然后按插入顺序）。
3. **大小获取**：Map 有 `size` 属性；Object 需用 `Object.keys().length`。
4. **迭代**：Map 原生可迭代 (`for...of`)，Object 需借助 `Object.keys/values/entries`。

---

### WeakMap、WeakSet 有什么特殊之处？
- **限制**：键（WeakMap）或值（WeakSet）**必须是对象**，不能是基本类型。
- **弱引用**：不会阻止垃圾回收。如果对象的其他引用都被清除，WeakMap/WeakSet 中的记录会自动消失。
- **不可迭代**：没有 `size` 属性，无法 `forEach` 或 `for...of`。
- **应用场景**：存储 DOM 节点的私有元数据、缓存，避免内存泄漏。

---

### Proxy 能做什么？常见拦截器（trap）有哪些？
- **作用**：在目标对象之前架设一层“拦截”，对外界的访问进行过滤和改写（Vue 3 响应式原理的核心）。
- **常见 trap**：`get` (读取), `set` (赋值), `has` (`in` 操作符), `deleteProperty` (`delete`), `apply` (函数调用), `construct` (`new` 调用)。

---

### Reflect 为什么存在？和 Proxy 是什么关系？
- **存在原因**：
  1. 将 Object 上一些明显属于语言内部的方法（如 `Object.defineProperty`）放到 `Reflect` 对象上，使语言特性更内聚。
  2. 修改某些 Object 方法的返回结果，让其变得更合理（如 `Reflect.defineProperty` 成功返回 `true`，失败返回 `false`，而不是抛错）。
- **与 Proxy 的关系**：`Reflect` 提供了与 `Proxy` traps **一一对应**的静态方法。在 Proxy 拦截器中，通常使用 `Reflect` 来执行默认行为，确保不破坏对象原有的语义（如正确传递 `receiver`）。

---

### CommonJS 与 ES Module 有哪些核心区别？
| 特性 | CommonJS (CJS) | ES Module (ESM) |
|---|---|---|
| 加载时机 | **运行时**动态加载 | **编译时**静态分析 |
| 输出内容 | 值的**拷贝**（修改不影响原模块） | 值的**引用**（实时同步） |
| 语法 | `require` / `module.exports` | `import` / `export` |
| 顶层 this | 指向 `module.exports` | `undefined` |
| 异步支持 | 不支持 | 支持 Top-level await |

---

### ESM 与 CJS 的循环依赖分别如何表现？
- **CJS**：因为是值的拷贝，循环依赖时，如果模块 A 还没执行完就去 require 模块 B，A 拿到的是 B 的**未初始化完的空对象 `{}`**。
- **ESM**：因为是值的引用，循环依赖时，只要不在模块初始化阶段（顶层）就去读取未赋值的变量，后续代码执行后，能**实时获取到更新后的值**。

---

### ES6 Class 与构造函数有哪些差异？私有字段如何实现？
- **差异**：
  1. Class 必须使用 `new` 调用，否则会报错；构造函数可以直接调用。
  2. Class 内部默认启用严格模式。
  3. Class 的方法默认**不可枚举**。
  4. Class 不存在变量提升。
- **私有字段**：ES2022 引入了 `#` 前缀。`class A { #privateField = 1; }`，只能在类内部访问，外部访问会报语法错误。

---

### 装饰器（Decorator）是什么？现状如何？
- **概念**：一种特殊的函数，用于在不修改原代码的情况下，动态地为类、方法、属性或参数添加元数据或包装逻辑（类似 Python 的 `@decorator`）。
- **现状**：TC39 提案已进入 **Stage 3**。目前需借助 Babel 或 TypeScript 使用。在 NestJS、Angular、MobX 等框架中被广泛使用。

---

### 模板字符串相比普通字符串有什么优势？
1. 支持多行字符串，无需使用 `\n` 拼接。
2. 支持变量和表达式插值：`` `Hello ${name}` ``。
3. 支持标签模板 (Tagged Templates)，可实现自定义解析逻辑（如防 XSS、i18n）。

---

### for...of、for...in、forEach 有什么区别？
- `for...in`：遍历对象**所有可枚举属性**（包括原型链上的）。遍历数组时顺序可能错乱，且会包含额外添加的属性，**不推荐用于数组**。
- `for...of`：遍历**可迭代对象**（Array, Map, Set, String, arguments）的**值**。支持 `break`、`continue` 和 `return`，支持 `await`。
- `forEach`：数组内置方法。无法使用 `break`/`continue`（只能用 `return` 跳过当前循环），且**不支持** `await`（会导致并发执行而非串行等待）。

---

### 如何让一个普通对象变成可迭代对象？
为对象添加 `[Symbol.iterator]` 方法，该方法必须返回一个包含 `next()` 函数的迭代器对象。
```javascript
const obj = { a: 1, b: 2 };
obj[Symbol.iterator] = function() {
  const keys = Object.keys(this);
  let index = 0;
  return {
    next: () => {
      if (index < keys.length) {
        return { value: this[keys[index++]], done: false };
      }
      return { value: undefined, done: true };
    }
  };
};
console.log([...obj]); // [1, 2]
```

---

### ES2020 至 ES2023 有哪些值得关注的新特性？
- **ES2020**：可选链 `?.`，空值合并 `??`，`BigInt`，`Promise.allSettled`，`globalThis`，动态 `import()`。
- **ES2021**：`String.prototype.replaceAll`，`Promise.any`，逻辑赋值运算符 (`??=`, `&&=`, `||=`)。
- **ES2022**：类私有字段 `#`，类的静态块 `static {}`，`Object.hasOwn` (替代 `hasOwnProperty`)，`Array.prototype.at()` (支持负数索引)。
- **ES2023**：不可变数组方法 `toSorted()`, `toReversed()`, `toSpliced()`, `with()`；以及 `findLast()`, `findLastIndex()`。

---

### Object.freeze、seal、preventExtensions 有何区别？
| 方法 | 添加新属性 | 删除现有属性 | 修改现有属性值 |
|---|---|---|---|
| `preventExtensions` | ❌ 禁止 | ✅ 允许 | ✅ 允许 |
| `seal` (密封) | ❌ 禁止 | ❌ 禁止 | ✅ 允许 |
| `freeze` (冻结) | ❌ 禁止 | ❌ 禁止 | ❌ 禁止 (浅冻结) |
*注：`freeze` 是浅层的，若属性值是对象，需递归冻结才能实现深度不可变。*

---

### 顶层 await（top-level await）解决了什么问题？要注意什么？
- **解决问题**：允许在 ES 模块的顶层直接使用 `await`，无需将其包裹在 `async` 函数中。极大简化了模块初始化时的异步依赖加载（如动态加载配置、数据库连接）。
- **注意事项**：包含顶层 `await` 的模块及其**所有依赖该模块的父模块**，在初始化时都会被阻塞，直到 Promise 决议。若使用不当，可能导致整个应用启动死锁或性能下降。