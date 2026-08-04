---
title: solidity
description: solidity
pubDate: 2026-07-18
category: 区块链
tags: ["区块链", "智能合约"]
heroImage: /images/covers/web3-code-terminal.jpg
---

`solidity` 适用于编写以太坊虚拟机(`EVM`)智能合约的编程语言

### 第一个智能合约

```solidity
// 开源许可协议 MIT
// SPDX-License-Identifier: MIT`

// 指定编译器版本
pragma solidity ^0.8.0;

// 合约
contract HelloWorld {
    // 状态变量
    string public greet = "Hello World!";
}
```

### 值类型

#### 1. 布尔型

布尔类型取值为 `true` 或 `false`

```solidity
bool public _bool = true;
```

布尔的运算符

- `!` 逻辑非
- `&&` 逻辑与，`"and"`
- `||` 逻辑或，`"or"`
- `==` 等于
- `!=` 不等于

### 整型

- `int` 有符号整型
- `uint` 无符号整型

```solidity
// 整型
int8 public _int = -1; // 整数，包括负数
uint8 public _uint = 1; // 无符号整数
uint256 public _number = 20220330; // 256位无符号整数
uint256 public max256 = type(uint256).max; // 256位无符号整数的最大值
uint8 public max8 = type(uint8).max;  // 8位无符号整数的最大值
```

运算符

- 比较运算符（返回布尔值）： `<=` `<` `==` `!=` `>=` `>`
- 算术运算符： `+` `-` `*` `/` `%（取余）` `**（幂）`

### 地址类型

地址类型(`address`)有两类

- 普通地址（`address`）: 存储一个 20 字节的值（以太坊地址的大小）
- `payable address`: 比普通地址多了 `transfer` 和 `send` 两个成员方法，用于接收转账

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract Deposit {

    event Deposit(address indexed from, uint amount);

    // 查询任意地址的原生代币余额
    function getBalanceOf(address account) external view returns (uint) {
        return account.balance; // 单位：wei
    }

    // 查询本合约自己的余额
    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }

    function deposit() external payable {
        require(msg.value > 0, "no eth");
        emit Deposit(msg.sender, msg.value);
    }

    // 也可用 receive 接收纯转账（不带 data）
    receive() external payable {}

}

```

### 函数

```solidity
function <function name>([parameter types[, ...]]) {internal|external|public|private} [pure|view|payable] [virtual|override] [<modifiers>]
[returns (<return types>)]{ <function body> }
```

- `function` 申明函数的关键字
- `<function name>` 函数名
- `([parameter types[, ...]])` 入函数的参数
- `{internal|external|public|private}` 函数可见性
- `public` 内部和外部均可见
- `private` 仅内部可见 继承合约不可用
- `external` 仅外部可见
- `external` internal
- `payable` 可接收转账
- `view` 纯函数，不能修改状态变量
- `pure` 纯函数，不能读取状态变量
- `returns (<return types>)` 返回值类型
- `<modifiers>` 函数修饰符
- `virtual` 虚函数，可被重写
- `override` 重写父合约的虚函数
- `<function body>` 函数体

#### pure和view

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contrract HelloWorld {
    string public greet = "Hello World!";

    // 只读函数
    function getGreet() public view returns (string memory) {
        return greet;
    }

    // 纯函数
    function count(uint a, uint b) public pure returns (uint result) {
        return a + b;
    }
}
```

#### payable

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract Deposit {

    event Deposit(address indexed from, uint amount);

    // 查询任意地址的原生代币余额
    function getBalanceOf(address account) external view returns (uint) {
        return account.balance; // 单位：wei
    }

    // 查询本合约自己的余额
    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }

    function deposit() external payable {
        require(msg.value > 0, "no eth");
        emit Deposit(msg.sender, msg.value);
    }

    // 也可用 receive 接收纯转账（不带 data）
    receive() external payable {}

}

```

#### 函数输出

- `returns` 返回的变量类型及变量名
- `return` 返回指定的变量

```solidity
// 返回多个变量
function returnMultiple() public pure returns(uint256, bool, uint256[3] memory){
    return(1, true, [uint256(1),2,5]);
}

// 命名式返回
function returnNamed() public pure returns(uint256 _number, bool _bool, uint256[3] memory _array){
    _number = 2;
    _bool = false;
    _array = [uint256(3),2,1];
}

// 解构式赋值

(uint256 _number, bool _bool, uint256[3] memory _array) = returnNamed();
```

### 变量数据存储和作用域

引用类型: 引用类型存储在链上，引用类型变量的赋值会改变变量的存储位置。

- 数组 `array`
- 结构体 `struct`

- `storage`：合约里的状态变量默认都是storage，存储在链上
- `memory`：函数里的参数和临时变量一般用memory，存储在内存中，不上链。
- `calldata`：与 `memory` 类似，但专门用于函数参数，不可修改

#### 变量的作用域

##### 1. 状态变量

状态变量是数据存储在链上的变量，所有合约内函数都可以访问，gas消耗高

```solidity
contract Variables {
    uint public x = 1;
    uint public y;
    string public z;
}
```

##### 2. 局部变量

```solidity
function bar() external pure returns(uint){
    uint count1 = 1;
    uint count2 = 2;
    return count1 + count2;
}
```

##### 3. 全局变量

```solidity
function global() external view returns(address, uint, bytes memory){
    address sender = msg.sender;
    uint blockNum = block.number;
    bytes memory data = msg.data;
    return(sender, blockNum, data);
}
```

- `blockhash(uint blockNumber)`: (`bytes32`) 给定区块的哈希值 – 只适用于最近的256个区块, 不包含当前区块。
- `block.coinbase`: (`address payable`) 当前区块矿工的地址
- `block.gaslimit`: (`uint`) 当前区块的`gaslimit`
- `block.number`: (`uint`) 当前区块的`number`
- `block.timestamp`: (`uint`) 当前区块的时间戳，为`unix`纪元以来的秒
- `gasleft()`: (`uint256`) 剩余 `gas`
- `msg.data`: (`bytes calldata) 完整`call data`
- `msg.sender`: (`address payable`) 消息发送者 (当前 `caller`)
- `msg.sig`: (`bytes4`) `calldata`的前四个字节 (`function identifier`)
- `msg.value`: (`uint`) 当前交易发送的 `wei` 值
- `block.blobbasefee`: (`uint`) 当前区块的blob基础费用。这是Cancun升级新增的全局变量。
- `blobhash(uint index)`: (`bytes32`) 返回跟当前交易关联的第 index 个blob的版本化哈希（第一个字节为版本号，当前为0x01，后面接KZG承诺的SHA256哈希的最后31个字节）。若当前交易不包含blob，则返回空字节。这是Cancun升级新增的全局变量。

#### 以太单位

- `wei`: 1 wei
- `kwei`: 1e3 wei
- `mwei`: 1e6 wei
- `gwei`: 1e9 wei
- `szabo`: 1e12 wei
- `finney`: 1e15 wei
- `ether`: 1e18 wei

### 数组

- 固定长度数组

```solidity
// 固定长度 Array
uint[8] array1;
bytes1[5] array2;
address[100] array3;
```

- 可变长度数组

```solidity
// 可变长度 Array
uint[] array4;
bytes1[] array5;
address[] array6;
bytes array7;
```

#### 数组成员

- `length`: 数组有一个包含元素数量的`length`成员，`memory`数组的长度在创建后是固定的。
- `push()`: 动态数组拥有`push()`成员，可以在数组最后添加一个0元素，并返回该元素的引用。
- `push(x)`: 动态数组拥有`push(x)`成员，可以在数组最后添加一个x元素。
- `pop()`: 动态数组拥有`pop()`成员，可以移除数组最后一个元素。

### 结构体 struct

```solidity
// 结构体
struct Student{
    uint256 id;
    uint256 score;
}
```

给结构体赋值的四种方法：

```solidity
方法1:在函数中创建一个storage的struct引用
function initStudent1() external{
    Student storage _student = student; // assign a copy of student
    _student.id = 11;
    _student.score = 100;
}
```

```solidity
// 方法2:直接引用状态变量的struct
function initStudent2() external{
    student.id = 1;
    student.score = 80;
}
```

```solidity
// 方法3:构造函数式
function initStudent3() external {
    student = Student(3, 90);
}
```

```solidity
// 方法4:key value
function initStudent4() external {
    student = Student({id: 4, score: 60});
}
```

### 映射Mapping

```solidity
mapping(uint256 => uint256) scores;
// 我们定义一个结构体 Struct
struct Student{
    uint256 id;
    uint256 score;
}
mapping(uint=>Student) public testVar;

```

### 变量初始值

- `boolean`: `false`
- `string`: ""
- `int`: 0
- `uint`: 0
- `enum`: 枚举中的第一个元素
- `address`: 0x0000000000000000000000000000000000000000 (或 address(0))
- `function`
  - `internal`: 空白函数
  - `external`: 空白函数

#### delete

`delete` 删除变量的值，将变量的值设置为初始值。

### constant和immutable

- `constant`: 只能在合约内部使用，不能在函数外部使用
- `immutable`: 只能在合约内部使用，不能在函数外部使用，只能在构造函数中赋值

```solidity

contract HelloWorld{
    uint256 public constant a = 1; // 声明赋值
    uint256 public immutable b; // 构造函数赋值
    constructor(uint256 _b){
        b = _b;
    }
}

```

### 控制流

- `if-else`

```solidity
function isAddressZero(address _address) public pure returns(bool){
    // 判断地址是否为0
    if(_address == address(0)){
        return true;
    }
    return false;
}
```

- `for循环`

```solidity

function forLoop(uint _b) public pure returns(uint256 count){
    count = 0;
    for(uint i = 0; i < _b; ++i){
        count += i;
    }
}

```

- `while循环`

```solidity
function whileLoop(uint _b) public pure returns(uint256 count){
    count = 0;
    uint i= 0;
    while(i <= _b){
        count += i;
        i++;
    }
}
```

- `do-while循环`

```solidity
 function whileLoop(uint _b) public pure returns(uint256 count){
    count = 0;
    uint i= 0;
    do{
        count += i;
        i++;
    }while(i <= _b);
}
```

- `三元运算符`

```solidity
function isAddressZero(address _address) public pure returns(bool){
    // 判断地址是否为0
    return _address == address(0) ? true : false;
}
```

### 构造函数

```solidity
address owner; // 定义owner变量
// 构造函数
constructor(address initialOwner) {
    owner = initialOwner; // 在部署合约的时候，将owner设置为传入的initialOwner地址
}
```

### 修饰器

```solidity
address owner; // 定义owner变量
// 构造函数
constructor(address initialOwner) {
    owner = initialOwner; // 在部署合约的时候，将owner设置为传入的initialOwner地址
}
// 定义modifier
modifier onlyOwner {
   require(msg.sender == owner); // 检查调用者是否为owner地址
   _; // 如果是的话，继续运行函数主体；否则报错并revert交易
}

function setOwner(address newOwner) public onlyOwner {
    owner = newOwner;
}
```

### 事件

`Solidity`中的事件（`event`）是`EVM`上日志的抽象，它具有两个特点：

- 响应 : 应用程序（ethers.js）可以通过RPC接口订阅和监听这些事件，并在前端做响应
- 经济 : 事件是EVM上比较经济的存储数据的方式，每个大概消耗2,000 gas；相比之下，链上存储一个新变量至少需要20,000 gas。

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

```solidity
// 定义_transfer函数，执行转账逻辑
function _transfer(
    address from,
    address to,
    uint256 amount
) external {
    _balances[from] -=  amount;
    _balances[to] += amount;
    emit Transfer(from, to, amount);
}
```

### 继承

- `virtual` 父合约中的函数，如果希望子合约重写，需要加上 `virtual` 关键字。

- `override` 子合约重写了父合约中的函数，需要加上 `override` 关键字

```solidity
// 定义_transfer函数，执行转账逻辑
function _transfer(
    address from,
    address to,
    uint256 amount
) external {
    _balances[from] -=  amount;
    _balances[to] += amount;
    emit Transfer(from, to, amount);
}
```

#### 简单继承

```solidity
contract Yeye {
    event Log(string msg);

    // 定义3个function: hip(), pop(), yeye()，Log值为Yeye。
    function hip() public virtual{
        emit Log("Yeye");
    }

    function pop() public virtual{
        emit Log("Yeye");
    }

    function yeye() public virtual {
        emit Log("Yeye");
    }
}
```

```solidity
contract Baba is Yeye{
    // 继承两个function: hip()和pop()，输出改为Baba。
    function hip() public virtual override{
        emit Log("Baba");
    }

    function pop() public virtual override{
        emit Log("Baba");
    }

    function baba() public virtual{
        emit Log("Baba");
    }
}

```

#### 多重继承

```solidity
contract Erzi is Yeye, Baba{
    // 继承两个function: hip()和pop()，输出值为Erzi。
    function hip() public virtual override(Yeye, Baba){
        emit Log("Erzi");
    }

    function pop() public virtual override(Yeye, Baba) {
        emit Log("Erzi");
    }
}
```

#### 修饰器的继承

```solidity
contract Base1 {
    modifier exactDividedBy2And3(uint _a) virtual {
        require(_a % 2 == 0 && _a % 3 == 0);
        _;
    }
}

contract Identifier is Base1 {

    //计算一个数分别被2除和被3除的值，但是传入的参数必须是2和3的倍数
    function getExactDividedBy2And3(uint _dividend) public exactDividedBy2And3(_dividend) pure returns(uint, uint) {
        return getExactDividedBy2And3WithoutModifier(_dividend);
    }

    //计算一个数分别被2除和被3除的值
    function getExactDividedBy2And3WithoutModifier(uint _dividend) public pure returns(uint, uint){
        uint div2 = _dividend / 2;
        uint div3 = _dividend / 3;
        return (div2, div3);
    }
}
```

### 抽象合约和接口

```solidity
abstract contract InsertionSort{
    function insertionSort(uint[] memory a) public pure virtual returns(uint[] memory);
}
```

#### 接口

接口类似于抽象合约，但它不实现任何功能。接口的规则：

- 不能包含状态变量
- 不能包含构造函数
- 不能继承除接口外的其他合约
- 所有函数都必须是external且不能有函数体
- 继承接口的非抽象合约必须实现接口定义的所有功能
- 虽然接口不实现任何功能，但它非常重要。接口是智能合约的骨架，定义了合约的功能以及如何触发它们：如果智能合约实现了某种接口（比如ERC20或ERC721），其他Dapps和智能合约就知道如何与它交互。因为接口提供了两个重要的信息：

合约里每个函数的bytes4选择器，以及函数签名函数名(每个参数类型）。

- 接口id（更多信息见EIP165）
- 另外，接口与合约ABI（Application Binary Interface）等价，可以相互转换：编译接口可以得到合约的ABI，利用abi-to-sol工具，也可以将ABI json文件转换为接口sol文件。

我们以ERC721接口合约IERC721为例，它定义了3个event和9个function，所有ERC721标准的NFT都实现了这些函数。我们可以看到，接口和常规合约的区别在于每个函数都以;代替函数体{ }结尾。

```solidity
interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;

    function getApproved(uint256 tokenId) external view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(address owner, address operator) external view returns (bool);

    function safeTransferFrom( address from, address to, uint256 tokenId, bytes calldata data) external;
}
```

#### IERC721事件

IERC721包含3个事件，其中`Transfer`和`Approval`事件在`ERC20`中也有。

- `Transfer`事件：在转账时被释放，记录代币的发出地址`from`，接收地址`to`和`tokenId`。
- `Approval`事件：在授权时被释放，记录授权地址`owner`，被授权地址`approved`和`tokenId`。
- `ApprovalForAll`事件：在批量授权时被释放，记录批量授权的发出地址`owner`，被授权地址`operator`和授权与否的`approved`

#### IERC721函数

- `balanceOf`：返回某地址的`NFT`持有量`balance`。
- `ownerOf`：返回某`tokenId`的主人`owner`。
- `transferFrom`：普通转账，参数为转出地址`from`，接收地址`to`和`tokenId`。
- `safeTransferFrom`：安全转账（如果接收方是合约地址，会要求实现`ERC721Receiver`接口）。参数为转出地址`from`，接收地址`to`和`tokenId`。
- `approve`：授权另一个地址使用你的`NFT`。参数为被授权地址`approve`和`tokenId`。
- `getApproved`：查询`tokenId`被批准给了哪个地址。
- `setApprovalForAll`：将自己持有的该系列`NFT`批量授权给某个地址`operator`。
- `isApprovedForAll`：查询某地址的`NFT`是否批量授权给了另一个`operator`地址。
- `safeTransferFrom`：安全转账的重载函数，参数里面包含了`data`。

### 异常

#### Error

```solidity
error TransferNotOwner(); // 自定义error
error TransferNotOwner(address sender); // 自定义的带参数的error
function transferOwner1(uint256 tokenId, address newOwner) public {
    if(_owners[tokenId] != msg.sender){
        revert TransferNotOwner();
        // revert TransferNotOwner(msg.sender);
    }
    _owners[tokenId] = newOwner;
}
```

#### Require

```solidity
function transferOwner2(uint256 tokenId, address newOwner) public {
    require(_owners[tokenId] == msg.sender, "Transfer Not Owner");
    _owners[tokenId] = newOwner;
}
```

#### Assert

```solidity
function transferOwner3(uint256 tokenId, address newOwner) public {
    assert(_owners[tokenId] == msg.sender);
    _owners[tokenId] = newOwner;
}
```

### 函数重载

名字相同但输入参数类型不同的函数可以同时存在，他们被视为不同的函数

```solidity
function saySomething() public pure returns(string memory){
    return("Nothing");
}

function saySomething(string memory something) public pure returns(string memory){
    return(something);
}
```

### 库合约

- 不能存在状态变量
- 不能够继承或被继承
- 不能接收以太币
- 不可以被销毁

```solidity
library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) public pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) public pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) public pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}
```

#### 使用库合约

- 1. 利用using for指令

```solidity
// 利用using for指令
using Strings for uint256;
function getString1(uint256 _number) public pure returns(string memory){
    // 库合约中的函数会自动添加为uint256型变量的成员
    return _number.toHexString();
}
```

- 2.通过库合约名称调用函数

```solidity
// 直接通过库合约名调用
function getString2(uint256 _number) public pure returns(string memory){
    return Strings.toHexString(_number);
}
```

### Import

```solidity
import '@openzeppelin/contracts/access/Ownable.sol';
```

### 接收ETH

#### 接收ETH函数 receive

```solidity
contract ReceiveEth {
    // 定义事件
    event Received(address Sender, uint Value);
    // 接收ETH时释放Received事件
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
```

#### 回退函数 fallback

```solidity
contract ReceiveEth {
    // 定义事件
    event fallbackCalled(address Sender, uint Value, bytes Data);

    // fallback
    fallback() external payable{
        emit fallbackCalled(msg.sender, msg.value, msg.data);
    }
}
```

#### receive和fallback的区别

```text
触发fallback() 还是 receive()?
           接收ETH
              |
         msg.data是空？
            /  \
          是    否
          /      \
receive()存在?   fallback()
        / \
       是  否
      /     \
receive()   fallback()

```

### 发送ETH

1. `transfer()`

```solidity
// 用transfer()发送ETH
function transferETH(address payable _to, uint256 amount) external payable{
    _to.transfer(amount);
}
```

2. `send()`

```solidity
error SendFailed(); // 用send发送ETH失败error
// send()发送ETH
function sendETH(address payable _to, uint256 amount) external payable{
    // 处理下send的返回值，如果失败，revert交易并发送error
    bool success = _to.send(amount);
    if(!success){
        revert SendFailed();
    }
}
```

3. `call()`

```solidity
error CallFailed(); // 用call发送ETH失败error
// call()发送ETH
function callETH(address payable _to, uint256 amount) external payable{
    // 处理下call的返回值，如果失败，revert交易并发送error
    (bool success,) = _to.call{value: amount}("");
    if(!success){
        revert CallFailed();
    }
}

```

### 调用其他合约

1. 目标合约

```solidity
contract OtherContract {
    uint256 private _x = 0; // 状态变量_x
    // 收到eth的事件，记录amount和gas
    event Log(uint amount, uint gas);

    // 返回合约ETH余额
    function getBalance() view public returns(uint) {
        return address(this).balance;
    }

    // 可以调整状态变量_x的函数，并且可以往合约转ETH (payable)
    function setX(uint256 x) external payable{
        _x = x;
        // 如果转入ETH，则释放Log事件
        if(msg.value > 0){
            emit Log(msg.value, gasleft());
        }
    }

    // 读取_x
    function getX() external view returns(uint x){
        x = _x;
    }
}
```

2. 调用合约

```solidity
contract CallOtherContract {

    function callSetX(address _Address, uint256 x) external{
        OtherContract(_Address).setX(x);
    }

    function callGetX(OtherContract _Address) external view returns(uint x){
        x = _Address.getX();
    }

    function callGetX2(address _Address) external view returns(uint x){
        OtherContract oc = OtherContract(_Address);
        x = oc.getX();
    }

    function setXTransferETH(address otherContract, uint256 x) payable external{
        OtherContract(otherContract).setX{value: msg.value}(x);
    }

}

```

### Call

`call` 是address类型的低级成员函数，它用来与其他合约交互。它的返回值为(bool, bytes memory)，分别对应call是否成功以及目标函数的返回值。

`encodeWithSignature` 函数用来将参数编码成bytes，以便传递给call函数。

```solidity
function callSetX(address payable _addr, uint256 x) public payable {
    // call setX()，同时可以发送ETH
    (bool success, bytes memory data) = _addr.call{value: msg.value}(
        abi.encodeWithSignature("setX(uint256)", x)
    );

    emit Response(success, data); //释放事件
}
```

### Delegatecall

`delegatecall`与`call`类似，是`Solidity`中地址类型的低级成员函数。`delegate`中是委托/代表的意思，那么`delegatecall`委托了什么？

当用户A通过合约B来`call`合约C的时候，执行的是合约C的函数，上下文(`Context`，可以理解为包含变量和状态的环境)也是合约C的：`msg.sender`是B的地址，并且如果函数改变一些状态变量，产生的效果会作用于合约C的变量上。

### create

```solidity
Contract x = new Contract{value: _value}(params)
// _value : 传递给合约的ETH数量
// params : 传递给合约构造函数的参数
```

#### 极简Uniswap

`Uniswap V2` 核心合约中包含两个合约

- `UniswapV2Pair`: 币对合约，用于管理币对地址、流动性、买卖。
- `UniswapV2Factory`: 工厂合约，用于创建新的币对，并管理币对地址。

##### `Pair` 合约

```solidity
contract Pair{
    address public factory; // 工厂合约地址
    address public token0; // 代币1
    address public token1; // 代币2

    constructor() payable {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // sufficient check
        token0 = _token0;
        token1 = _token1;
    }
}
```

##### `PairFactory` 合约

```solidity
contract PairFactory{
    mapping(address => mapping(address => address)) public getPair; // 通过两个代币地址查Pair地址
    address[] public allPairs; // 保存所有Pair地址

    function createPair(address tokenA, address tokenB) external returns (address pairAddr) {
        // 创建新合约
        Pair pair = new Pair();
        // 调用新合约的initialize方法
        pair.initialize(tokenA, tokenB);
        // 更新地址map
        pairAddr = address(pair);
        allPairs.push(pairAddr);
        getPair[tokenA][tokenB] = pairAddr;
        getPair[tokenB][tokenA] = pairAddr;
    }
}

```

### create2

#### CREATE如何计算地址?

智能合约可以由其他合约和普通账户利用`Create`操作码创建。

在这两种情况下，新合约的地址都以相同的方式计算：创造者地址(部署者钱包地址或合约地址)和`nonce`(该地址发起交易的总数，对于合约账户是创建的合约总数，每创建一个合约nonce+1)的哈希

```solidity
新地址 = hash(创建者地址, nonce)
```

#### CREATE2

```solidity
新地址 = hash("0xFF",创建者地址, salt, initcode)
```

```solidity
contract PairFactory2{
    mapping(address => mapping(address => address)) public getPair; // 通过两个代币地址查Pair地址
    address[] public allPairs; // 保存所有Pair地址

    function createPair2(address tokenA, address tokenB) external returns (address pairAddr) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES'); //避免tokenA和tokenB相同产生的冲突
        // 用tokenA和tokenB地址计算salt
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA); //将tokenA和tokenB按大小排序
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        // 用create2部署新合约
        Pair pair = new Pair{salt: salt}();
        // 调用新合约的initialize方法
        pair.initialize(tokenA, tokenB);
        // 更新地址map
        pairAddr = address(pair);
        allPairs.push(pairAddr);
        getPair[tokenA][tokenB] = pairAddr;
        getPair[tokenB][tokenA] = pairAddr;
    }
    // 提前计算pair合约地址
    function calculateAddr(address tokenA, address tokenB) public view returns(address predictedAddress){
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES'); //避免tokenA和tokenB相同产生的冲突
        // 计算用tokenA和tokenB地址计算salt
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA); //将tokenA和tokenB按大小排序
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        // 计算合约地址方法 hash()
        predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(type(Pair).creationCode)
            )))));
    }
}
```

### 删除合约

```solidity
selfdestruct(address payable _to)
// _to : 删除合约后，将合约的ETH和ERC20代币发送给该地址
```

```solidity
contract DeleteContract {

    uint public value = 10;

    constructor() payable {}

    receive() external payable {}

    function deleteContract() external {
        // 调用selfdestruct销毁合约，并把剩余的ETH转给msg.sender
        selfdestruct(payable(msg.sender));
    }

    function getBalance() external view returns(uint balance){
        balance = address(this).balance;
    }
}
```

### ABI编码解码

`ABI` (Application Binary Interface，应用二进制接口)是与以太坊智能合约交互的标准。数据基于他们的类型编码；并且由于编码后不包含类型信息，解码时需要注明它们的类型。

- `abi.encode` : 按 ABI 标准将参数编码为字节数组（每个参数 32 字节对齐填充）

```solidity
function encode() public view returns(bytes memory result) {
    result = abi.encode(x, addr, name, array);
}
```

- `abi.encodePacked` : 紧凑编码，将参数紧密打包为字节数组（不做填充；编码结果不含类型信息，动态类型拼接时可能产生哈希碰撞）

```solidity
function encodePacked() public view returns(bytes memory result) {
    result = abi.encodePacked(x, addr, name, array);
}
```

- `abi.encodeWithSignature` : 根据函数签名字符串计算选择器，再与参数一起编码（常用于构造 call data）

```solidity
function encodeWithSignature() public view returns(bytes memory result) {
    result = abi.encodeWithSignature("foo(uint256,address,string,uint256[2])", x, addr, name, array);
}
```

- `abi.encodeWithSelector` : 直接传入函数选择器，再与参数一起编码（常用于构造 call data）

```solidity
function encodeWithSelector() public view returns(bytes memory result) {
    result = abi.encodeWithSelector(bytes4(keccak256("foo(uint256,address,string,uint256[2])")), x, addr, name, array);
}
```

- `abi.decode` : 将字节数组按指定类型解码为参数

```solidity
function decode(bytes memory data) public pure returns(uint x, address addr, string memory name, uint[2] memory array) {
    (x, addr, name, array) = abi.decode(data, (uint, address, string, uint[2]));
}
```

### hash

- 生成数据唯一标识
- 加密签名
- 安全加密

```solidity
function hash() public view returns(bytes32 result) {
    result = keccak256(abi.encodePacked(x, addr, name, array));
}
```

### 选择器

调用智能合约时，本质上是向目标合约发送一段 `calldata`。`calldata` 前 4 个字节是 `selector`（函数选择器），后面是编码后的参数。

![选择器](/images/59470b621e98b18d1b6f8e6b3f49cc62.png)

#### msg.data

`msg.data` 是完整的 `calldata`（调用函数时传入的数据）。

```solidity
event Log(bytes data);

function mint(address to) external {
    emit Log(msg.data);
}
```

当参数为 `0x2c44b726ADF1963cA47Af88B284C06f30380fC78` 时，`calldata` 为：

```
0x6a6278420000000000000000000000002c44b726adf1963ca47af88b284c06f30380fc78
```

可分为两部分：

- 前 4 字节 `selector`：`0x6a627842`
- 后 32 字节参数：`0x0000000000000000000000002c44b726adf1963ca47af88b284c06f30380fc78`

#### method id、selector 和函数签名

- **函数签名**：`"函数名(逗号分隔的参数类型)"`，例如 `mint(address)`
- **method id**：函数签名做 `keccak256` 后取前 4 字节
- 当 `selector` 与某函数的 `method id` 匹配时，即调用该函数

注意：函数签名里 `uint` / `int` 要写成 `uint256` / `int256`。

```solidity
function mintSelector() external pure returns(bytes4 mSelector) {
    return bytes4(keccak256("mint(address)")); // 0x6a627842
}
```

也可用 `this.函数名.selector` 直接取选择器。

#### 不同参数类型的 method id

计算 `method id`：`bytes4(keccak256("函数名(参数类型1,参数类型2,...)"))`

**基础类型**（`uint256`、`bool`、`address` 等）：

```solidity
// elementaryParamSelector(uint256,bool) : 0x3ec37834
function elementaryParamSelector(uint256 param1, bool param2) external returns(bytes4) {
    return bytes4(keccak256("elementaryParamSelector(uint256,bool)"));
}
```

**固定长度类型**（如 `uint256[3]`）：

```solidity
// fixedSizeParamSelector(uint256[3]) : 0xead6b8bd
function fixedSizeParamSelector(uint256[3] memory param1) external returns(bytes4) {
    return bytes4(keccak256("fixedSizeParamSelector(uint256[3])"));
}
```

**可变长度类型**（如 `uint256[]`、`string`）：

```solidity
// nonFixedSizeParamSelector(uint256[],string) : 0xf0ca01de
function nonFixedSizeParamSelector(uint256[] memory param1, string memory param2) external returns(bytes4) {
    return bytes4(keccak256("nonFixedSizeParamSelector(uint256[],string)"));
}
```

**映射类型参数**（`contract`、`enum`、`struct`）：需转成 ABI 类型后再算签名。

| 原类型 | ABI 类型 |
|--------|----------|
| `contract` | `address` |
| `struct`（如 `(uint256,bytes)`） | `tuple`，写作 `(uint256,bytes)` |
| `enum` | `uint8` |

```solidity
// mappingParamSelector(address,(uint256,bytes),uint256[],uint8) : 0xe355b0ce
function mappingParamSelector(
    DemoContract demo,
    User memory user,
    uint256[] memory count,
    School mySchool
) external returns(bytes4) {
    return bytes4(keccak256("mappingParamSelector(address,(uint256,bytes),uint256[],uint8)"));
}
```

#### 使用 selector 调用函数

用 `abi.encodeWithSelector` 把 `method id` 和参数打包，再交给 `call`：

```solidity
function callWithSignature() external {
    // 调用 elementaryParamSelector(uint256,bool)
    (bool success, bytes memory data) = address(this).call(
        abi.encodeWithSelector(0x3ec37834, 1, 0)
    );
}
```

### trycatch

`try-catch` 用于处理智能合约中的异常，`Solidity` 0.6 起支持。**只能**用于外部调用（`external` / `public` 函数，或创建合约的 `constructor`）。

#### 基本语法

```solidity
try externalContract.f() {
    // 调用成功
} catch {
    // 调用失败
}
```

- 也可用 `this.f()`，同样视为外部调用，但**不能在构造函数中使用**（合约尚未创建完成）。
- 若被调函数有返回值，须在 `try` 后声明 `returns(returnType val)`；创建合约时返回值是新合约实例。

```solidity
try externalContract.f() returns(returnType val) {
    // 可用 val
} catch {
    // 失败
}
```

#### 捕获不同类型异常

```solidity
try externalContract.f() returns(returnType) {
    // 成功
} catch Error(string memory /*reason*/) {
    // revert("reason") / require(false, "reason")
} catch Panic(uint /*errorCode*/) {
    // assert 失败、溢出、除零、数组越界等
} catch (bytes memory /*lowLevelData*/) {
    // 上面两类都未匹配：如 revert()、require(false)、自定义 error
}
```

#### 实战：OnlyEven

```solidity
contract OnlyEven {
    constructor(uint a) {
        require(a != 0, "invalid number");
        assert(a != 1);
    }

    function onlyEven(uint256 b) external pure returns(bool success) {
        require(b % 2 == 0, "Ups! Reverting");
        success = true;
    }
}
```

- 构造函数：`a == 0` 触发 `require`；`a == 1` 触发 `assert`
- `onlyEven`：奇数时 `require` 失败

#### 处理外部函数调用异常

```solidity
event SuccessEvent();
event CatchEvent(string message);
event CatchByte(bytes data);

OnlyEven even;

constructor() {
    even = new OnlyEven(2);
}

function execute(uint amount) external returns (bool success) {
    try even.onlyEven(amount) returns(bool _success) {
        emit SuccessEvent();
        return _success;
    } catch Error(string memory reason) {
        emit CatchEvent(reason);
    }
}
```

- `execute(0)`：偶数，成功，触发 `SuccessEvent`
- `execute(1)`：奇数，失败，触发 `CatchEvent`

#### 处理合约创建异常

合约创建也视为外部调用，可用 `try-catch`：

```solidity
// executeNew(0) → CatchEvent（require）
// executeNew(1) → CatchByte（assert）
// executeNew(2) → SuccessEvent
function executeNew(uint a) external returns (bool success) {
    try new OnlyEven(a) returns(OnlyEven _even) {
        emit SuccessEvent();
        success = _even.onlyEven(a);
    } catch Error(string memory reason) {
        emit CatchEvent(reason);
    } catch (bytes memory reason) {
        emit CatchByte(reason);
    }
}
```

要点：

- 仅适用于外部调用和合约创建
- `try` 成功时，返回变量必须声明且类型匹配

