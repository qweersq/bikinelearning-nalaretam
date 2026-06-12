import crypto from "crypto";

const BASE_URL   = process.env.TRIPAY_BASE_URL!;
const API_KEY    = process.env.TRIPAY_API_KEY!;
const PRIV_KEY   = process.env.TRIPAY_PRIVATE_KEY!;
const MERCHANT   = process.env.TRIPAY_MERCHANT_CODE!;

export interface TripayItem {
  name: string;
  price: number;
  quantity: number;
}

export async function createTransaction(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: TripayItem[];
}) {
  const signature = crypto
    .createHmac("sha256", PRIV_KEY)
    .update(`${MERCHANT}${params.orderId}${params.amount}`)
    .digest("hex");

  const body = {
    method: "QRIS2",
    merchant_ref: params.orderId,
    amount: params.amount,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    order_items: params.items,
    callback_url: process.env.TRIPAY_CALLBACK_URL,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
    expired_time: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    signature,
  };

  const res = await fetch(`${BASE_URL}/transaction/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message ?? "Tripay error");
  return data.data as { reference: string; checkout_url: string; pay_url: string };
}

export function verifyCallback(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", PRIV_KEY)
    .update(body)
    .digest("hex");
  return expected === signature;
}
