"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bitcoin, Loader2, DollarSign, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useActors } from "@/hooks/useActors";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { sanitizeDecimalInput, safeStringify } from "@/lib/utils";
import { Principal } from "@dfinity/principal";
import { Principal as PrincipalType } from "@dfinity/principal";
import { isAddress as isEvmAddress } from "ethers";

export function WithdrawCollateral() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { mainCanister, ckbtcLedger, ckusdc, ckbtcMinter, ckethMinter } =
    useActors();
  const { identity } = useAuth();
  const { toast } = useToast();

  const onWithdraw = async () => {
    if (!identity) {
      toast({ title: "Not authenticated", description: "Please sign in." });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive ckBTC amount.",
      });
      return;
    }
    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ""] = val.split(".");
      const fp = (f + "0".repeat(decimals)).slice(0, decimals);
      return BigInt(w || "0") * 10n ** BigInt(decimals) + BigInt(fp || "0");
    };
    const amt = toNat(amount, 8);

    setLoading(true);
    try {
      const res = await (mainCanister as any).withdrawCollateral(amt);
      if ("Err" in res) {
        toast({ title: "Withdraw failed", description: String(res.Err) });
      } else {
        toast({
          title: "Collateral withdrawn",
          description: `Block index: ${String(res.Ok)}`,
        });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  // ---- Send tokens (ckBTC or ckUSDC) to another wallet ----
  const [sendToken, setSendToken] = useState<"ckBTC" | "ckUSDC">("ckBTC");
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  const onSend = async () => {
    if (!identity) {
      toast({ title: "Not authenticated", description: "Please sign in." });
      return;
    }
    if (!sendAmount || Number(sendAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive amount.",
      });
      return;
    }
    let toPrincipal: Principal;
    try {
      toPrincipal = Principal.fromText(recipient.trim());
    } catch {
      toast({
        title: "Invalid recipient",
        description: "Enter a valid principal ID.",
      });
      return;
    }

    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ""] = val.split(".");
      const fp = (f + "0".repeat(decimals)).slice(0, decimals);
      return BigInt(w || "0") * 10n ** BigInt(decimals) + BigInt(fp || "0");
    };
    const amt = toNat(sendAmount, sendToken === "ckBTC" ? 8 : 6);

    setSending(true);
    try {
      const arg = {
        to: { owner: toPrincipal, subaccount: [] as any },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: amt,
      } as any;

      const res =
        sendToken === "ckBTC"
          ? await (ckbtcLedger as any).icrc1_transfer(arg)
          : await (ckusdc as any).icrc1_transfer(arg);

      if ("Err" in res) {
        toast({ title: "Transfer failed", description: String(res.Err) });
      } else {
        toast({
          title: "Transfer succeeded",
          description: `Block index: ${String(res.Ok)}`,
        });
        setSendAmount("");
        setRecipient("");
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      const hint = msg.includes("canister_not_found")
        ? "Check your CANISTER_ID_* values match the current network."
        : undefined;
      toast({ title: "Error", description: hint ? `${msg} — ${hint}` : msg });
    } finally {
      setSending(false);
    }
  };

  // ---- Withdraw BTC on-chain (burn ckBTC) ----
  const [btcAddress, setBtcAddress] = useState("");
  const [btcAmount, setBtcAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [feeInfo, setFeeInfo] = useState<{
    minter_fee: bigint;
    bitcoin_fee: bigint;
  } | null>(null);

  const estimateFee = async () => {
    try {
      const toNat = (val: string, decimals: number): bigint => {
        const [w, f = ""] = val.split(".");
        const fp = (f + "0".repeat(decimals)).slice(0, decimals);
        return BigInt(w || "0") * 10n ** BigInt(decimals) + BigInt(fp || "0");
      };
      const amt = btcAmount ? toNat(btcAmount, 8) : undefined;
      const res = await (ckbtcMinter as any).estimate_withdrawal_fee({
        amount: amt ? [amt] : [],
      });
      if (res && typeof res.minter_fee !== "undefined") {
        setFeeInfo({
          minter_fee: BigInt(res.minter_fee),
          bitcoin_fee: BigInt(res.bitcoin_fee),
        });
      }
    } catch (e) {
      // Silent fail
    }
  };

  const onWithdrawBTC = async () => {
    if (!identity) {
      toast({ title: "Not authenticated", description: "Please sign in." });
      return;
    }
    if (!btcAddress || !btcAmount || Number(btcAmount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Enter a BTC address and positive amount.",
      });
      return;
    }
    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ""] = val.split(".");
      const fp = (f + "0".repeat(decimals)).slice(0, decimals);
      return BigInt(w || "0") * 10n ** BigInt(decimals) + BigInt(fp || "0");
    };
    const amt = toNat(btcAmount, 8);

    setWithdrawing(true);
    try {
      // Approve spender = ckBTC Minter canister
      const minterIdStr =
        (process.env.CANISTER_ID_CKBTC_MINTER as string) ||
        (process.env.CANISTER_ID_MOCK_BTC_MINTER as string);
      if (!minterIdStr) throw new Error("Minter canister ID not configured");
      const minterPrincipal = Principal.fromText(minterIdStr);
      const approveRes = await (ckbtcLedger as any).icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: amt,
        expected_allowance: [],
        expires_at: [],
        spender: {
          owner: minterPrincipal as unknown as PrincipalType,
          subaccount: [],
        },
      });
      if ("Err" in approveRes) {
        toast({
          title: "Approve failed",
          description: safeStringify(approveRes.Err),
        });
        setWithdrawing(false);
        return;
      }

      // Call minter to withdraw BTC to on-chain address
      const res = await (ckbtcMinter as any).retrieve_btc_with_approval({
        from_subaccount: [],
        address: btcAddress.trim(),
        amount: amt,
      });
      if ("Err" in res) {
        toast({
          title: "Withdraw failed",
          description: safeStringify(res.Err),
        });
      } else {
        toast({
          title: "Withdrawal submitted",
          description: `Block index: ${String(res.Ok?.block_index ?? res.Ok)}`,
        });
        setBtcAmount("");
        setBtcAddress("");
        setFeeInfo(null);
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      const hint = msg.includes("canister_not_found")
        ? "Check CANISTER_ID_CKBTC_MINTER for this network."
        : undefined;
      toast({ title: "Error", description: hint ? `${msg} — ${hint}` : msg });
    } finally {
      setWithdrawing(false);
    }
  };

  // ---- Withdraw ckUSDC to EVM USDC (via ckETH minter) ----
  const [evmAddress, setEvmAddress] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [withdrawingUsdc, setWithdrawingUsdc] = useState(false);

  const onWithdrawUSDC = async () => {
    if (!identity) {
      toast({ title: "Not authenticated", description: "Please sign in." });
      return;
    }
    if (!ckethMinter) {
      toast({
        title: "Config error",
        description: "ETH minter canister not configured for this network.",
      });
      return;
    }
    const addr = evmAddress.trim();
    if (!addr || !isEvmAddress(addr)) {
      toast({
        title: "Invalid address",
        description: "Enter a valid 0x EVM address.",
      });
      return;
    }
    if (!usdcAmount || Number(usdcAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive USDC amount.",
      });
      return;
    }
    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ""] = val.split(".");
      const fp = (f + "0".repeat(decimals)).slice(0, decimals);
      return BigInt(w || "0") * 10n ** BigInt(decimals) + BigInt(fp || "0");
    };
    const amt = toNat(usdcAmount, 6);

    setWithdrawingUsdc(true);
    try {
      // Approve ETH minter to burn ckUSDC on our behalf
      const ethMinterId =
        (process.env.CANISTER_ID_CKETH_MINTER as string) ||
        (process.env.CANISTER_ID_ETH_MINTER as string) ||
        (process.env.DFX_NETWORK === "ic"
          ? "sv3dd-oaaaa-aaaar-qacoa-cai"
          : undefined);
      if (!ethMinterId)
        throw new Error("ETH minter canister ID not configured");
      const spender = Principal.fromText(ethMinterId);
      const approveRes = await (ckusdc as any).icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: amt,
        expected_allowance: [],
        expires_at: [],
        spender: { owner: spender, subaccount: [] },
      });
      if ("Err" in approveRes) {
        toast({
          title: "Approve failed",
          description: safeStringify(approveRes.Err),
        });
        setWithdrawingUsdc(false);
        return;
      }

      // Call minter to withdraw ERC-20 USDC to EVM address
      const ledgerId = Principal.fromText(
        process.env.CANISTER_ID_CKUSDC as string
      );
      const result = await (ckethMinter as any).withdrawErc20({
        address: addr,
        amount: amt,
        ledgerCanisterId: ledgerId,
        fromCkEthSubaccount: undefined,
        fromCkErc20Subaccount: undefined,
      });
      toast({
        title: "USDC withdrawal submitted",
        description: `Burn index: ${String(
          result.ckerc20_block_index
        )}; ckETH tx idx: ${String(result.cketh_block_index)}`,
      });
      setUsdcAmount("");
      setEvmAddress("");
    } catch (e: any) {
      const msg = String(e?.message || e);
      const hint = msg.includes("canister_not_found")
        ? "Check CKETH minter and CKUSDC ledger IDs for this network."
        : undefined;
      toast({ title: "Error", description: hint ? `${msg} — ${hint}` : msg });
    } finally {
      setWithdrawingUsdc(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="body-small">Back to Dashboard</span>
        </Link>
        <h1 className="heading-large text-text-primary mb-2">
          Withdraw Collateral
        </h1>
        <p className="body-regular text-text-secondary">
          Withdraw ckBTC collateral (subject to LTV constraints)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="card-container h-fit">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-yellow/20 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-accent-yellow" />
              </div>
              <div>
                <p className="body-regular font-medium text-text-primary">
                  ckBTC
                </p>
                <p className="body-tiny text-text-muted">Bitcoin</p>
              </div>
            </div>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) =>
                setAmount(sanitizeDecimalInput(e.target.value, 8))
              }
              placeholder="0.0000"
              className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
            />
          </div>
          <button
            disabled={loading || !amount}
            onClick={onWithdraw}
            className={`mt-6 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              !amount
                ? "bg-bg-tertiary text-text-muted cursor-not-allowed"
                : "bg-accent-pink text-text-inverse hover:bg-accent-pink/90"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              "Withdraw"
            )}
          </button>
        </div>

        {/* Send tokens card */}
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <p className="body-regular font-medium text-text-primary">
                  Send Tokens
                </p>
                <p className="body-tiny text-text-muted">
                  Transfer to another ICP wallet
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  sendToken === "ckBTC"
                    ? "bg-accent-yellow/20 text-accent-yellow"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
                onClick={() => setSendToken("ckBTC")}
              >
                ckBTC
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  sendToken === "ckUSDC"
                    ? "bg-accent-teal/20 text-accent-teal"
                    : "bg-bg-tertiary text-text-secondary"
                }`}
                onClick={() => setSendToken("ckUSDC")}
              >
                ckUSDC
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    sendToken === "ckBTC"
                      ? "bg-accent-yellow/20"
                      : "bg-accent-teal/20"
                  }`}
                >
                  {sendToken === "ckBTC" ? (
                    <Bitcoin className="w-5 h-5 text-accent-yellow" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-accent-teal" />
                  )}
                </div>
                <div>
                  <p className="body-regular font-medium text-text-primary">
                    {sendToken}
                  </p>
                  <p className="body-tiny text-text-muted">
                    {sendToken === "ckBTC" ? "Bitcoin" : "USD Coin"}
                  </p>
                </div>
              </div>
              <input
                inputMode="decimal"
                value={sendAmount}
                onChange={(e) =>
                  setSendAmount(
                    sanitizeDecimalInput(
                      e.target.value,
                      sendToken === "ckBTC" ? 8 : 6
                    )
                  )
                }
                placeholder={sendToken === "ckBTC" ? "0.00000000" : "0.00"}
                className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
              />
            </div>

            <div>
              <label className="body-small text-text-muted mb-2 block">
                Recipient Principal
              </label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="aaaaa-aa..."
                className="w-full bg-bg-tertiary rounded-xl px-4 py-3 text-text-primary outline-none"
              />
            </div>

            <button
              disabled={sending || !sendAmount || !recipient}
              onClick={onSend}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !sendAmount || !recipient
                  ? "bg-bg-tertiary text-text-muted cursor-not-allowed"
                  : "bg-white/10 text-text-primary hover:bg-white/15"
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
        {/* Withdraw BTC on-chain */}
        <div className="card-container ">
          <div className="mb-4">
            <p className="body-regular font-medium text-text-primary">
              Withdraw BTC on-chain
            </p>
            <p className="body-tiny text-text-muted">
              Burn ckBTC to send native BTC to a Bitcoin address
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow/20 rounded-xl flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-accent-yellow" />
                </div>
                <div>
                  <p className="body-regular font-medium text-text-primary">
                    ckBTC → BTC
                  </p>
                  <p className="body-tiny text-text-muted">
                    Withdraw to on-chain address
                  </p>
                </div>
              </div>
              <input
                inputMode="decimal"
                value={btcAmount}
                onChange={(e) => {
                  setBtcAmount(sanitizeDecimalInput(e.target.value, 8));
                }}
                onBlur={estimateFee}
                placeholder={"0.00000000"}
                className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
              />
            </div>

            <div>
              <label className="body-small text-text-muted mb-2 block">
                BTC Address
              </label>
              <input
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="bc1... or 1... or 3..."
                className="w-full bg-bg-tertiary rounded-xl px-4 py-3 text-text-primary outline-none"
              />
            </div>

            {feeInfo && (
              <div className="bg-bg-tertiary rounded-xl p-3 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Minter fee</span>
                  <span>{Number(feeInfo.minter_fee) / 1e8} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Bitcoin fee</span>
                  <span>{Number(feeInfo.bitcoin_fee) / 1e8} BTC</span>
                </div>
              </div>
            )}

            <button
              disabled={withdrawing || !btcAmount || !btcAddress}
              onClick={onWithdrawBTC}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !btcAmount || !btcAddress
                  ? "bg-bg-tertiary text-text-muted cursor-not-allowed"
                  : "bg-accent-yellow text-black hover:bg-accent-yellow/90"
              }`}
            >
              {withdrawing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Withdrawing...
                </>
              ) : (
                "Withdraw BTC"
              )}
            </button>
          </div>
        </div>

        {/* Withdraw ckUSDC to EVM USDC */}
        <div className="card-container  ">
          <div className="mb-4">
            <p className="body-regular font-medium text-text-primary">
              Withdraw USDC to EVM
            </p>
            <p className="body-tiny text-text-muted">
              Burn ckUSDC and send native USDC (ERC-20) to an EVM address
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-teal/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <p className="body-regular font-medium text-text-primary">
                    ckUSDC → USDC
                  </p>
                  <p className="body-tiny text-text-muted">
                    Withdraw to EVM wallet
                  </p>
                </div>
              </div>
              <input
                inputMode="decimal"
                value={usdcAmount}
                onChange={(e) =>
                  setUsdcAmount(sanitizeDecimalInput(e.target.value, 6))
                }
                placeholder={"0.00"}
                className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
              />
            </div>

            <div>
              <label className="body-small text-text-muted mb-2 block">
                EVM Address
              </label>
              <input
                value={evmAddress}
                onChange={(e) => setEvmAddress(e.target.value)}
                placeholder="0x… (Ethereum/compatible)"
                className="w-full bg-bg-tertiary rounded-xl px-4 py-3 text-text-primary outline-none"
              />
            </div>

            <button
              disabled={withdrawingUsdc || !usdcAmount || !evmAddress}
              onClick={onWithdrawUSDC}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !usdcAmount || !evmAddress
                  ? "bg-bg-tertiary text-text-muted cursor-not-allowed"
                  : "bg-accent-teal text-text-inverse hover:bg-accent-teal/90"
              }`}
            >
              {withdrawingUsdc ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Withdrawing...
                </>
              ) : (
                "Withdraw to EVM"
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
