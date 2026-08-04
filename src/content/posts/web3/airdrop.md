---
title: 空投
description: 空投
pubDate: 2026-07-18
category: 区块链
tags: ["区块链", "智能合约"]
heroImage: /images/covers/web3-crypto-coins.jpg
---

### 空投 / 批量分发

- 数组用 `calldata`（少一次 memory 拷贝）
- 缓存 `length`，循环 `unchecked { ++i }`
- `custom error` 替代 `require` 字符串
- ETH 用 `call` 代替 `.transfer`（避免 2300 stipend 限制）

`disperseToken`：先 `transferFrom` 汇总进合约再逐个 `transfer`。  
`disperseTokenSimple`：对每个收款人直接 `transferFrom`（少一轮合约中转，通常更省 gas）。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

error LengthMismatch();
error TransferFailed();

contract Disperse {
    function disperseEther(address[] calldata recipients, uint256[] calldata values) external payable {
        uint256 length = recipients.length;
        if (length != values.length) revert LengthMismatch();

        for (uint256 i; i < length;) {
            (bool ok,) = recipients[i].call{value: values[i]}("");
            if (!ok) revert TransferFailed();
            unchecked {
                ++i;
            }
        }

        uint256 balance = address(this).balance;
        if (balance != 0) {
            (bool ok,) = msg.sender.call{value: balance}("");
            if (!ok) revert TransferFailed();
        }
    }

    function disperseToken(IERC20 token, address[] calldata recipients, uint256[] calldata values) external {
        uint256 length = recipients.length;
        if (length != values.length) revert LengthMismatch();

        uint256 total;
        for (uint256 i; i < length;) {
            total += values[i];
            unchecked {
                ++i;
            }
        }

        if (!token.transferFrom(msg.sender, address(this), total)) revert TransferFailed();

        for (uint256 i; i < length;) {
            if (!token.transfer(recipients[i], values[i])) revert TransferFailed();
            unchecked {
                ++i;
            }
        }
    }

    function disperseTokenSimple(IERC20 token, address[] calldata recipients, uint256[] calldata values)
        external
    {
        uint256 length = recipients.length;
        if (length != values.length) revert LengthMismatch();

        for (uint256 i; i < length;) {
            if (!token.transferFrom(msg.sender, recipients[i], values[i])) revert TransferFailed();
            unchecked {
                ++i;
            }
        }
    }
}
```

### 使用注意

1. 调用 `disperseToken` / `disperseTokenSimple` 前，对 Disperse 合约 `approve` 总额度
2. `recipients.length` 必须等于 `values.length`，否则 `LengthMismatch`
3. 大批量分发优先 `disperseTokenSimple`（少一次汇总进合约的中转）
