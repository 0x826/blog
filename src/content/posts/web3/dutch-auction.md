---
title: 荷兰拍卖
description: 荷兰拍卖
pubDate: 2026-07-18
category: 区块链
tags: ["区块链", "智能合约"]
---

### 荷兰拍卖是什么

荷兰拍卖（Dutch Auction）又称减价拍卖：从高价开始，随时间阶梯降价，买家按**当时价格**买入成交。

Azuki、World of Women 等项目用它发售 NFT。项目方常见动机：

1. **定价发现 / 收入**：愿出高价的人先买，整体收入通常好于一口价
2. **拉长销售窗口**：拍卖持续数小时，减轻开售瞬间 gas war

### 线上价格曲线（Azuki 实参）

| 参数 | 值 | 含义 |
|------|-----|------|
| `AUCTION_START_PRICE` | `1 ether` | 起拍最高价 |
| `AUCTION_END_PRICE` | `0.15 ether` | 地板价 |
| `AUCTION_PRICE_CURVE_LENGTH` | `340 minutes` | 价格曲线总时长 |
| `AUCTION_DROP_INTERVAL` | `20 minutes` | 每隔多久降一次 |
| `AUCTION_DROP_PER_STEP` | 自动计算 | 每步降幅 |

```text
DROP_PER_STEP = (1e18 - 0.15e18) / (340 / 20)
```

`getAuctionPrice(startTime)`：

- `now < start` → `1 ETH`
- `now >= start + 340min` → `0.15 ETH`
- 中间 → `1 ETH - steps * DROP_PER_STEP`

### 发售阶段（完整线上流程）

```text
荷兰拍卖 auctionMint
    ↓ owner: endAuctionAndSetupNonAuctionSaleInfo
白名单 allowlistMint（可选）
    ↓
公售 publicSaleMint（需 publicSaleKey）
```

| 能力 | 作用 |
|------|------|
| `callerIsUser` | `tx.origin == msg.sender`，禁止合约代 mint |
| `maxPerAddressDuringMint` | 单地址 mint 上限 |
| `amountForAuctionAndDev` | 拍卖 + 开发者预留总量上限 |
| `amountForDevs` | 团队 `devMint` 上限 |
| `allowlist` | 白名单额度 |
| `refundIfOver` | 多付 ETH 退回 |
| `withdrawMoney` | owner 提款，带 `nonReentrant` |

### Azuki 主网完整合约

依赖：`./ERC721A.sol`、OpenZeppelin `Ownable` / `ReentrancyGuard` / `Strings`。

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Azuki is Ownable, ERC721A, ReentrancyGuard {
  uint256 public immutable maxPerAddressDuringMint;
  uint256 public immutable amountForDevs;
  uint256 public immutable amountForAuctionAndDev;

  struct SaleConfig {
    uint32 auctionSaleStartTime;
    uint32 publicSaleStartTime;
    uint64 mintlistPrice;
    uint64 publicPrice;
    uint32 publicSaleKey;
  }

  SaleConfig public saleConfig;

  mapping(address => uint256) public allowlist;

  constructor(
    uint256 maxBatchSize_,
    uint256 collectionSize_,
    uint256 amountForAuctionAndDev_,
    uint256 amountForDevs_
  ) ERC721A("Azuki", "AZUKI", maxBatchSize_, collectionSize_) {
    maxPerAddressDuringMint = maxBatchSize_;
    amountForAuctionAndDev = amountForAuctionAndDev_;
    amountForDevs = amountForDevs_;
    require(
      amountForAuctionAndDev_ <= collectionSize_,
      "larger collection size needed"
    );
  }

  modifier callerIsUser() {
    require(tx.origin == msg.sender, "The caller is another contract");
    _;
  }

  function auctionMint(uint256 quantity) external payable callerIsUser {
    uint256 _saleStartTime = uint256(saleConfig.auctionSaleStartTime);
    require(
      _saleStartTime != 0 && block.timestamp >= _saleStartTime,
      "sale has not started yet"
    );
    require(
      totalSupply() + quantity <= amountForAuctionAndDev,
      "not enough remaining reserved for auction to support desired mint amount"
    );
    require(
      numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint,
      "can not mint this many"
    );
    uint256 totalCost = getAuctionPrice(_saleStartTime) * quantity;
    _safeMint(msg.sender, quantity);
    refundIfOver(totalCost);
  }

  function allowlistMint() external payable callerIsUser {
    uint256 price = uint256(saleConfig.mintlistPrice);
    require(price != 0, "allowlist sale has not begun yet");
    require(allowlist[msg.sender] > 0, "not eligible for allowlist mint");
    require(totalSupply() + 1 <= collectionSize, "reached max supply");
    allowlist[msg.sender]--;
    _safeMint(msg.sender, 1);
    refundIfOver(price);
  }

  function publicSaleMint(uint256 quantity, uint256 callerPublicSaleKey)
    external
    payable
    callerIsUser
  {
    SaleConfig memory config = saleConfig;
    uint256 publicSaleKey = uint256(config.publicSaleKey);
    uint256 publicPrice = uint256(config.publicPrice);
    uint256 publicSaleStartTime = uint256(config.publicSaleStartTime);
    require(
      publicSaleKey == callerPublicSaleKey,
      "called with incorrect public sale key"
    );

    require(
      isPublicSaleOn(publicPrice, publicSaleKey, publicSaleStartTime),
      "public sale has not begun yet"
    );
    require(totalSupply() + quantity <= collectionSize, "reached max supply");
    require(
      numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint,
      "can not mint this many"
    );
    _safeMint(msg.sender, quantity);
    refundIfOver(publicPrice * quantity);
  }

  function refundIfOver(uint256 price) private {
    require(msg.value >= price, "Need to send more ETH.");
    if (msg.value > price) {
      payable(msg.sender).transfer(msg.value - price);
    }
  }

  function isPublicSaleOn(
    uint256 publicPriceWei,
    uint256 publicSaleKey,
    uint256 publicSaleStartTime
  ) public view returns (bool) {
    return
      publicPriceWei != 0 &&
      publicSaleKey != 0 &&
      block.timestamp >= publicSaleStartTime;
  }

  uint256 public constant AUCTION_START_PRICE = 1 ether;
  uint256 public constant AUCTION_END_PRICE = 0.15 ether;
  uint256 public constant AUCTION_PRICE_CURVE_LENGTH = 340 minutes;
  uint256 public constant AUCTION_DROP_INTERVAL = 20 minutes;
  uint256 public constant AUCTION_DROP_PER_STEP =
    (AUCTION_START_PRICE - AUCTION_END_PRICE) /
      (AUCTION_PRICE_CURVE_LENGTH / AUCTION_DROP_INTERVAL);

  function getAuctionPrice(uint256 _saleStartTime)
    public
    view
    returns (uint256)
  {
    if (block.timestamp < _saleStartTime) {
      return AUCTION_START_PRICE;
    }
    if (block.timestamp - _saleStartTime >= AUCTION_PRICE_CURVE_LENGTH) {
      return AUCTION_END_PRICE;
    } else {
      uint256 steps = (block.timestamp - _saleStartTime) /
        AUCTION_DROP_INTERVAL;
      return AUCTION_START_PRICE - (steps * AUCTION_DROP_PER_STEP);
    }
  }

  function endAuctionAndSetupNonAuctionSaleInfo(
    uint64 mintlistPriceWei,
    uint64 publicPriceWei,
    uint32 publicSaleStartTime
  ) external onlyOwner {
    saleConfig = SaleConfig(
      0,
      publicSaleStartTime,
      mintlistPriceWei,
      publicPriceWei,
      saleConfig.publicSaleKey
    );
  }

  function setAuctionSaleStartTime(uint32 timestamp) external onlyOwner {
    saleConfig.auctionSaleStartTime = timestamp;
  }

  function setPublicSaleKey(uint32 key) external onlyOwner {
    saleConfig.publicSaleKey = key;
  }

  function seedAllowlist(address[] memory addresses, uint256[] memory numSlots)
    external
    onlyOwner
  {
    require(
      addresses.length == numSlots.length,
      "addresses does not match numSlots length"
    );
    for (uint256 i = 0; i < addresses.length; i++) {
      allowlist[addresses[i]] = numSlots[i];
    }
  }

  // For marketing etc.
  function devMint(uint256 quantity) external onlyOwner {
    require(
      totalSupply() + quantity <= amountForDevs,
      "too many already minted before dev mint"
    );
    require(
      quantity % maxBatchSize == 0,
      "can only mint a multiple of the maxBatchSize"
    );
    uint256 numChunks = quantity / maxBatchSize;
    for (uint256 i = 0; i < numChunks; i++) {
      _safeMint(msg.sender, maxBatchSize);
    }
  }

  string private _baseTokenURI;

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string calldata baseURI) external onlyOwner {
    _baseTokenURI = baseURI;
  }

  function withdrawMoney() external onlyOwner nonReentrant {
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Transfer failed.");
  }

  function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
    _setOwnersExplicit(quantity);
  }

  function numberMinted(address owner) public view returns (uint256) {
    return _numberMinted(owner);
  }

  function getOwnershipData(uint256 tokenId)
    external
    view
    returns (TokenOwnership memory)
  {
    return ownershipOf(tokenId);
  }
}
```

`ERC721A.sol` 全文见 Etherscan 同源验证代码，或 [chiru-labs/ERC721A](https://github.com/chiru-labs/ERC721A)。

### 关键函数

#### `auctionMint`

1. 拍卖已开始（`auctionSaleStartTime != 0` 且时间到达）
2. `totalSupply + quantity <= amountForAuctionAndDev`
3. 单地址累计 mint ≤ `maxPerAddressDuringMint`
4. `_safeMint`（ERC721A 批量 mint）后 `refundIfOver`

#### `getAuctionPrice`

按真实 340 分钟曲线计算当前单价；前端展示价与上链价可能因出块时间略有偏差，用户通常多付，合约退差额。

#### `endAuctionAndSetupNonAuctionSaleInfo`

结束拍卖（把 `auctionSaleStartTime` 置 0），写入白名单价、公售价与公售开始时间。

#### `allowlistMint` / `publicSaleMint`

拍卖结束后的后续销售；公售还要求正确的 `publicSaleKey`，降低脚本扫链抢跑的便利性。

#### `devMint`

团队预留；`quantity` 必须是 `maxBatchSize` 的倍数，按 chunk 调用 `_safeMint`。

#### `withdrawMoney`

`onlyOwner` + `nonReentrant`，用 `call` 提取合约全部 ETH。

### 部署与运营顺序（线上）

1. 部署：传入 `maxBatchSize`、`collectionSize`、`amountForAuctionAndDev`、`amountForDevs`
2. `setBaseURI` 设置元数据
3. （可选）`seedAllowlist`、`setPublicSaleKey`
4. `setAuctionSaleStartTime` 设定开拍时间
5. 用户 `auctionMint`
6. 拍卖结束后 `endAuctionAndSetupNonAuctionSaleInfo`，进入白名单 / 公售
7. `withdrawMoney` 提取募集资金
8. （可选）`setOwnersExplicit` 优化后续 `ownerOf` 查询 gas

### 安全与设计要点

1. **`callerIsUser`**：防合约批量代打；不能防 EOA 多地址
2. **先 mint 再退款**：状态已更新；提款路径另有 `nonReentrant`
3. **供应切分**：拍卖额度与 `devMint` 额度分开，避免团队与公售抢同一池子时逻辑含糊
4. **ERC721A**：批量 mint 相对 OZ ERC721 循环 `_mint` 显著省 gas，这是 Azuki 能扛高并发公售的关键

### 小结

- 荷兰拍卖只是发售第一阶段；完整产品还包括白名单、公售、限额、团队 mint 与提款
- 复用时需一并部署对应版本的 `ERC721A`，并按项目参数调整供应量与价格曲线
