export interface Order {
  id: number;
  tokenBuy: string;
  amountBuy: string;
  tokenSell: string;
  amountSell: string;
  nonce: number;
  hash: string;
  user: string;
  filled: null;
  feeDiscount: string;
  rewardsMultiple: string;
  cancelled: null;
  createdAt: string;
  updatedAt: string;
  amountBuyRemaining: string;
  amountSellRemaining: string;
}

export interface Cancel {
  orderHash: string;
  hash?: string;
}

export interface Trade {
  tid: number;
  date: string;
  amount: string;
  amountWei: string;
  tokenBuy: string;
  tokenSell: string;
  type: 'sell' | 'buy';
  total: string;
  price: string;
  orderHash: string;
  uuid: string;
  buyerFee: string;
  sellerFee: string;
  gasFee: string;
  timestamp: number;
  maker: string;
  taker: string;
  transactionHash: string;
  usdValue: string;
}
