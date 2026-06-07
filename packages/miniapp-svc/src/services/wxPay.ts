import crypto from 'crypto';

export interface PrepayInput {
  orderNo: string;
  description: string;
  amount: number;
  openid: string;
}

export interface PrepayResult {
  prepayId: string;
  wxClientParams: {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
  };
}

export interface CallbackPayload {
  out_trade_no: string;
  transaction_id: string;
  trade_state: string;
}

export async function createPrepay(input: PrepayInput): Promise<PrepayResult> {
  const prepayId = `mock_prepay_${input.orderNo}`;
  const timeStamp = String(Math.floor(Date.now() / 1000));
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const paySign = crypto
    .createHash('sha256')
    .update(`${input.orderNo}:${input.amount}:${input.openid}:${nonceStr}`)
    .digest('hex');

  return {
    prepayId,
    wxClientParams: {
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MOCK',
      paySign,
    },
  };
}

export async function verifyAndDecryptCallback(body: any): Promise<CallbackPayload> {
  if (!body?.out_trade_no) {
    throw new Error('支付回调缺少 out_trade_no');
  }

  return {
    out_trade_no: body.out_trade_no,
    transaction_id: body.transaction_id || `mock_tx_${Date.now()}`,
    trade_state: body.trade_state || 'SUCCESS',
  };
}
