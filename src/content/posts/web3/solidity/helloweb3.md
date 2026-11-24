---
title: 常数
description: 常数
pubDate: 2026-07-18
category: Solidity
tags: ["Solidity"]
heroImage: /images/covers/web3-crypto-coins.jpg
---

### constant

声明时常量

```solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract A {

    int256 public constant num = 12;
    uint private constant age =18;
}

```


### immutable

声明时常量或构造函数时常量


声明时常量

```solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract A {

    int public immutable a;

    constructor(){
        a = 12;
    } 
}

```
