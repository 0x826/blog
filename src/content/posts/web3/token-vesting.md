---
title: 线性释放
description: 线性释放
pubDate: 2026-07-18
category: 区块链
tags: ["区块链", "智能合约"]
---

### 线性释放

代币/ETH 按时间线性解锁给受益人，常见于团队、顾问、投资人归属（vesting）。


- 源码：[VestingWallet.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/finance/VestingWallet.sol)
- 文档：[OpenZeppelin VestingWallet](https://docs.openzeppelin.com/contracts/5.x/api/finance#VestingWallet)

### 机制

| 参数 | 含义 |
|------|------|
| `beneficiary` | 受益人（构造时设为 `Ownable` owner） |
| `start` | 开始时间戳 |
| `duration` | 释放总时长（秒） |

公式（`start <= t < end`）：

```text
vested = totalAllocation * (t - start) / duration
releasable = vested - alreadyReleased
```

- `t < start`：可释放为 0  
- `t >= end`：全部可释放  
- `duration == 0`：可当作到期一次解锁的时间锁用法

资产转入本合约后，按**从一开始就锁定**的假设参与归属；若归属已开始再转入，可能有一部分立刻可 `release`。

### VestingWallet（完整源码）

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (finance/VestingWallet.sol)
pragma solidity ^0.8.20;

import {IERC20} from "../token/ERC20/IERC20.sol";
import {SafeERC20} from "../token/ERC20/utils/SafeERC20.sol";
import {Address} from "../utils/Address.sol";
import {Context} from "../utils/Context.sol";
import {Ownable} from "../access/Ownable.sol";

/**
 * @dev A vesting wallet is an ownable contract that can receive native currency and ERC20 tokens, and release these
 * assets to the wallet owner, also referred to as "beneficiary", according to a vesting schedule.
 *
 * Any assets transferred to this contract will follow the vesting schedule as if they were locked from the beginning.
 * Consequently, if the vesting has already started, any amount of tokens sent to this contract will (at least partly)
 * be immediately releasable.
 *
 * By setting the duration to 0, one can configure this contract to behave like an asset timelock that hold tokens for
 * a beneficiary until a specified time.
 *
 * NOTE: Since the wallet is {Ownable}, and ownership can be transferred, it is possible to sell unvested tokens.
 * Preventing this in a smart contract is difficult, considering that: 1) a beneficiary address could be a
 * counterfactually deployed contract, 2) there is likely to be a migration path for EOAs to become contracts in the
 * near future.
 *
 * NOTE: When using this contract with any token whose balance is adjusted automatically (i.e. a rebase token), make
 * sure to account the supply/balance adjustment in the vesting schedule to ensure the vested amount is as intended.
 */
contract VestingWallet is Context, Ownable {
    event EtherReleased(uint256 amount);
    event ERC20Released(address indexed token, uint256 amount);

    uint256 private _released;
    mapping(address token => uint256) private _erc20Released;
    uint64 private immutable _start;
    uint64 private immutable _duration;

    /**
     * @dev Sets the sender as the initial owner, the beneficiary as the pending owner, the start timestamp and the
     * vesting duration of the vesting wallet.
     */
    constructor(address beneficiary, uint64 startTimestamp, uint64 durationSeconds) payable Ownable(beneficiary) {
        _start = startTimestamp;
        _duration = durationSeconds;
    }

    /**
     * @dev The contract should be able to receive Eth.
     */
    receive() external payable virtual {}

    /**
     * @dev Getter for the start timestamp.
     */
    function start() public view virtual returns (uint256) {
        return _start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() public view virtual returns (uint256) {
        return _duration;
    }

    /**
     * @dev Getter for the end timestamp.
     */
    function end() public view virtual returns (uint256) {
        return start() + duration();
    }

    /**
     * @dev Amount of eth already released
     */
    function released() public view virtual returns (uint256) {
        return _released;
    }

    /**
     * @dev Amount of token already released
     */
    function released(address token) public view virtual returns (uint256) {
        return _erc20Released[token];
    }

    /**
     * @dev Getter for the amount of releasable eth.
     */
    function releasable() public view virtual returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released();
    }

    /**
     * @dev Getter for the amount of releasable `token` tokens. `token` should be the address of an
     * IERC20 contract.
     */
    function releasable(address token) public view virtual returns (uint256) {
        return vestedAmount(token, uint64(block.timestamp)) - released(token);
    }

    /**
     * @dev Release the native token (ether) that have already vested.
     *
     * Emits a {EtherReleased} event.
     */
    function release() public virtual {
        uint256 amount = releasable();
        _released += amount;
        emit EtherReleased(amount);
        Address.sendValue(payable(owner()), amount);
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {ERC20Released} event.
     */
    function release(address token) public virtual {
        uint256 amount = releasable(token);
        _erc20Released[token] += amount;
        emit ERC20Released(token, amount);
        SafeERC20.safeTransfer(IERC20(token), owner(), amount);
    }

    /**
     * @dev Calculates the amount of ether that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(address(this).balance + released(), timestamp);
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(address token, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(token).balanceOf(address(this)) + released(token), timestamp);
    }

    /**
     * @dev Virtual implementation of the vesting formula. This returns the amount vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= end()) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }
}
```

### 使用方式

1. 部署：`beneficiary`、`startTimestamp`、`durationSeconds`
2. 向合约转入 ETH 或 ERC20
3. 任何人可调用 `release()` / `release(token)`，资产打给 `owner()`（受益人）
4. 用 `releasable()` / `vestedAmount` 查询

### 注意

1. Owner 可转移，等于可转让“未归属权益”——设计上需知情
2. Rebase / 扣费代币可能导致归属数量与预期不符
3. 与 `TokenTimelock`（到期一次全取）不同：本合约是**随时间线性**可取

### 小结

- 线性释放 = 按时间比例解锁
- 生产直接用 OZ `VestingWallet`；需要悬崖（cliff）可继承并重写 `_vestingSchedule`
