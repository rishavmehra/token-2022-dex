"use client";
import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface JupiterSwapData {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage: number;
}

interface PoolData {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  liquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
}

const JupiterIntegration: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"swap" | "pools" | "analytics">("swap");
  const [tokenList, setTokenList] = useState<Array<{ address: string; symbol: string; name: string; decimals: number }>>([]);
  const [isFindingRoute, setIsFindingRoute] = useState(false);
  const [isCheckingRoute, setIsCheckingRoute] = useState(false);
  const [quote, setQuote] = useState<any | null>(null);
  const [status, setStatus] = useState<
    | { type: "success" | "error" | "info"; title: string; lines: string[] }
    | null
  >(null);
  const [swapData, setSwapData] = useState<JupiterSwapData>({
    inputMint: "So11111111111111111111111111111111111111112",
    outputMint: "",
    amount: 0.1,
    slippage: 1,
  });

  const [pools, setPools] = useState<PoolData[]>([
    {
      poolAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNy3TaS4",
      tokenA: "SOL",
      tokenB: "USDC",
      liquidity: 2500000,
      volume24h: 150000,
      fees24h: 2500,
      apr: 12.5,
    },
    {
      poolAddress: "JUP7iWkZxGErugozss4qWuGKvqsQt2xS5VjfB2J42X2E",
      tokenA: "SOL",
      tokenB: "RAY",
      liquidity: 1800000,
      volume24h: 95000,
      fees24h: 1800,
      apr: 10.8,
    },
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSwapData((prev) => ({
      ...prev,
      [name]: name === "amount" || name === "slippage" ? parseFloat(value) : value,
    }));
  };

  const simulateJupiterSwap = async () => {
    if (!publicKey) {
      setStatus({ type: "error", title: "Wallet not connected", lines: ["Please connect your wallet first."] });
      return;
    }
    if (!swapData.outputMint) {
      setStatus({ type: "error", title: "Missing output mint", lines: ["Please enter a token mint address (44 chars)."] });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const inputLabel =
        swapData.inputMint === "So11111111111111111111111111111111111111112" ? "SOL" : "Token";
      setStatus({
        type: "success",
        title: "Jupiter Integration Demo",
        lines: [
          `Input: ${inputLabel}`,
          `Output: ${swapData.outputMint}`,
          `Amount: ${swapData.amount}`,
          `Slippage: ${swapData.slippage}%`,
          "This would execute a real swap across multiple DEXs!",
          "Best price aggregation from Raydium, Orca, Serum",
          "Automatic route optimization",
          "Slippage protection enabled",
        ],
      });
    } catch (error) {
      console.error("Jupiter simulation error", error);
      setStatus({ type: "error", title: "Simulation error", lines: ["Error simulating Jupiter integration."] });
    } finally {
      setIsLoading(false);
    }
  };

  // Real Jupiter swap on devnet
  const executeJupiterSwap = async () => {
    if (!publicKey) {
      setStatus({ type: "error", title: "Wallet not connected", lines: ["Please connect your wallet first."] });
      return;
    }
    if (!swapData.outputMint) {
      setStatus({ type: "error", title: "Missing output mint", lines: ["Please enter a token mint address (44 chars)."] });
      return;
    }
    setIsLoading(true);
    try {
      // For a reliable demo, we currently support native SOL as input
      const inputMint = "So11111111111111111111111111111111111111112";

      const decimals = 9; // SOL decimals; extend later if custom input is used
      const amount = Math.round(swapData.amount * Math.pow(10, decimals));

      const quoteUrl = new URL("https://quote-api.jup.ag/v6/quote");
      quoteUrl.searchParams.set("inputMint", inputMint);
      quoteUrl.searchParams.set("outputMint", swapData.outputMint);
      quoteUrl.searchParams.set("amount", String(amount));
      quoteUrl.searchParams.set("slippageBps", String(Math.round(swapData.slippage * 100)));
      quoteUrl.searchParams.set("swapMode", "ExactIn");
      quoteUrl.searchParams.set("onlyDirectRoutes", "false");
      quoteUrl.searchParams.set("asLegacyTransaction", "false");
      // environment can help Jupiter route to devnet pools
      quoteUrl.searchParams.set("environment", "devnet");

      const quoteRes = await fetch(quoteUrl.toString());
      if (!quoteRes.ok) {
        const txt = await quoteRes.text();
        throw new Error(`Quote error: ${quoteRes.status} ${txt}`);
      }
      const quoteResponse = await quoteRes.json();
      if (!quoteResponse || !quoteResponse.routePlan) throw new Error("No route found for the selected pair on devnet.");

      const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: { maxBps: Math.round(swapData.slippage * 100) },
        }),
      });
      if (!swapRes.ok) {
        const txt = await swapRes.text();
        throw new Error(`Swap build error: ${swapRes.status} ${txt}`);
      }
      const { swapTransaction } = await swapRes.json();
      const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, "base64"));

      const sig = await sendTransaction(tx, connection, { preflightCommitment: "confirmed" });
      await connection.confirmTransaction(sig, "confirmed");

      setStatus({
        type: "success",
        title: "Swap executed on devnet",
        lines: [
          `Input: SOL`,
          `Output: ${swapData.outputMint}`,
          `Amount: ${swapData.amount}`,
          `Signature: ${sig}`,
          `Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`,
        ],
      });
    } catch (e: any) {
      const message = String(e?.message || e);
      const suggestions: string[] = [];
      if (message.includes("Quote error") || message.includes("No route")) {
        suggestions.push(
          "Tip: Use a supported devnet token like USDC (4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU) as output."
        );
      }
      setStatus({ type: "error", title: "Swap failed", lines: [message, ...suggestions] });
    } finally {
      setIsLoading(false);
    }
  };

  const hasRoute = async (outputMint: string): Promise<boolean> => {
    try {
      const inputMint = "So11111111111111111111111111111111111111112";
      const amount = Math.round(0.01 * 1e9); // probe with 0.01 SOL
      const url = new URL("https://quote-api.jup.ag/v6/quote");
      url.searchParams.set("inputMint", inputMint);
      url.searchParams.set("outputMint", outputMint);
      url.searchParams.set("amount", String(amount));
      url.searchParams.set("slippageBps", "100");
      url.searchParams.set("swapMode", "ExactIn");
      url.searchParams.set("onlyDirectRoutes", "false");
      url.searchParams.set("asLegacyTransaction", "false");
      url.searchParams.set("environment", "devnet");
      const res = await fetch(url.toString());
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && data.routePlan && data.routePlan.length);
    } catch {
      return false;
    }
  };

  const findTradableToken = async () => {
    if (isFindingRoute || tokenList.length === 0) return;
    setIsFindingRoute(true);
    try {
      for (const t of tokenList.slice(0, 30)) {
        // skip SOL as output
        if (t.address === "So11111111111111111111111111111111111111112") continue;
        const ok = await hasRoute(t.address);
        if (ok) {
          setSwapData((p) => ({ ...p, outputMint: t.address }));
          setStatus({ type: "info", title: "Route found", lines: [`Selected ${t.symbol} (${t.address.slice(0,6)}...)`] });
          return;
        }
      }
      setStatus({ type: "error", title: "No tradable tokens found", lines: ["Devnet routing may be limited at the moment. Try again later."] });
    } finally {
      setIsFindingRoute(false);
    }
  };

  const simulateCreatePool = async () => {
    if (!publicKey) {
      setStatus({ type: "error", title: "Wallet not connected", lines: ["Please connect your wallet first."] });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const newPool: PoolData = {
        poolAddress: `JUP${Math.random().toString(36).substr(2, 40)}`,
        tokenA: "SOL",
        tokenB: "Custom Token",
        liquidity: 1000000,
        volume24h: 0,
        fees24h: 0,
        apr: 8.5,
      };
      setPools((prev) => [newPool, ...prev]);
      setStatus({
        type: "success",
        title: "Jupiter Pool Created",
        lines: [
          `Pool Address: ${newPool.poolAddress}`,
          `Token Pair: SOL / Custom Token`,
          `Initial Liquidity: ${newPool.liquidity.toLocaleString()}`,
          `APR: ${newPool.apr}%`,
          "Pool would be created on Jupiter's infrastructure",
          "Liquidity providers can earn fees",
          "Pool available for trading across all DEXs",
        ],
      });
    } catch (error) {
      console.error("Pool creation error", error);
      setStatus({ type: "error", title: "Pool error", lines: ["Error creating pool."] });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAddLiquidity = async (poolAddress: string) => {
    if (!publicKey) {
      setStatus({ type: "error", title: "Wallet not connected", lines: ["Please connect your wallet first."] });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus({
        type: "success",
        title: "Liquidity Added",
        lines: [
          `Pool: ${poolAddress}`,
          "Amount: 1000 SOL + 50000 USDC",
          "LP Tokens: 1000 JUP-LP",
          "You now earn fees from this pool",
          "Liquidity position tracked",
          "Can withdraw anytime",
        ],
      });
    } catch (error) {
      console.error("Add liquidity error", error);
      setStatus({ type: "error", title: "Liquidity error", lines: ["Error adding liquidity."] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!status) return;
    const id = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(id);
  }, [status]);

  // Load devnet token list to help users pick a tradable output
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const res = await fetch("https://quote-api.jup.ag/v6/tokens?environment=devnet");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data
            .filter((t: any) => t?.address && t?.symbol)
            .map((t: any) => ({ address: t.address, symbol: t.symbol, name: t.name || t.symbol, decimals: t.decimals || 9 }));
          setTokenList(mapped);
        }
      } catch {
        // ignore
      }
    };
    loadTokens();
  }, []);

  // Devnet-only: continuously check for a route and surface a live preview
  useEffect(() => {
    const controller = new AbortController();
    const doCheck = async () => {
      if (!swapData.outputMint) {
        setQuote(null);
        return;
      }
      setIsCheckingRoute(true);
      try {
        const inputMint = "So11111111111111111111111111111111111111112";
        const decimals = 9;
        const amount = Math.round((swapData.amount || 0) * Math.pow(10, decimals));
        if (amount <= 0) {
          setQuote(null);
          return;
        }
        const url = new URL("https://quote-api.jup.ag/v6/quote");
        url.searchParams.set("inputMint", inputMint);
        url.searchParams.set("outputMint", swapData.outputMint);
        url.searchParams.set("amount", String(amount));
        url.searchParams.set("slippageBps", String(Math.round(swapData.slippage * 100)));
        url.searchParams.set("swapMode", "ExactIn");
        url.searchParams.set("onlyDirectRoutes", "false");
        url.searchParams.set("asLegacyTransaction", "false");
        url.searchParams.set("environment", "devnet");
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) {
          setQuote(null);
          return;
        }
        const data = await res.json();
        if (data && data.routePlan && data.routePlan.length) {
          setQuote(data);
        } else {
          setQuote(null);
        }
      } catch {
        setQuote(null);
      } finally {
        setIsCheckingRoute(false);
      }
    };
    const id = setTimeout(doCheck, 500); // debounce inputs
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [swapData.outputMint, swapData.amount, swapData.slippage]);

  // Auto-refresh every 15s when no route (devnet liquidity fluctuates)
  useEffect(() => {
    if (!swapData.outputMint) return;
    if (quote) return; // route already present
    const id = setInterval(() => {
      setSwapData((p) => ({ ...p })); // trigger check effect without changing values
    }, 15000);
    return () => clearInterval(id);
  }, [quote, swapData.outputMint]);

  return (
    <div className="space-y-4">
      {status && (
        <div
          className={`rounded-md border p-3 text-sm ${
            status.type === "success"
              ? "border-green-500/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : status.type === "error"
              ? "border-red-500/30 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              : "border-blue-500/30 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          }`}
        >
          <div className="font-medium">{status.title}</div>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            {status.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <h3 className="text-center font-semibold">Jupiter Integration Demo</h3>
        <div className="flex-1 flex justify-end text-muted-foreground text-sm items-center gap-1">
          <Info className="h-4 w-4" />
          <span>DEX aggregator preview</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant={activeTab === "swap" ? "default" : "secondary"} onClick={() => setActiveTab("swap")}>
          🪐 Swap
        </Button>
        <Button size="sm" variant={activeTab === "pools" ? "default" : "secondary"} onClick={() => setActiveTab("pools")}>
          🏊 Pools
        </Button>
        <Button size="sm" variant={activeTab === "analytics" ? "default" : "secondary"} onClick={() => setActiveTab("analytics")}>
          📊 Analytics
        </Button>
      </div>

      {activeTab === "swap" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jupiter DEX Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inputMint">Input Token</Label>
                <Select value={swapData.inputMint} onValueChange={(v) => setSwapData((prev) => ({ ...prev, inputMint: v }))}>
                  <SelectTrigger id="inputMint">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="So11111111111111111111111111111111111111112">SOL (Native)</SelectItem>
                    <SelectItem value="custom">Custom Token</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Token you want to swap from</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputMint">Output Token Mint Address</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Input id="outputMint" name="outputMint" value={swapData.outputMint} onChange={handleInputChange} placeholder="Enter token mint address (44 chars)" className="min-w-[220px] flex-1" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSwapData((p) => ({ ...p, outputMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" }))}
                      title="Use USDC (devnet)"
                      className="w-full sm:w-auto"
                    >
                      USDC (devnet)
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={findTradableToken} disabled={isFindingRoute} title="Auto-pick a tradable token" className="w-full sm:w-auto">
                      {isFindingRoute ? "Finding…" : "Find tradable"}
                    </Button>
                  </div>
                  {tokenList.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">or pick:</span>
                      <div className="flex flex-wrap gap-2">
                        {tokenList.slice(0, 8).map((t) => (
                          <Button key={t.address} size="sm" variant="outline" onClick={() => setSwapData((p) => ({ ...p, outputMint: t.address }))}>
                            {t.symbol}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Use a supported devnet token. If a token is not tradable on devnet right now, select another from the list above.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Swap Amount</Label>
                <Input id="amount" type="number" name="amount" value={swapData.amount} onChange={handleInputChange} min={0.01} step={0.01} />
                <p className="text-xs text-muted-foreground">Amount to swap</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                <Input id="slippage" type="number" name="slippage" value={swapData.slippage} onChange={handleInputChange} min={0.1} max={10} step={0.1} />
                <p className="text-xs text-muted-foreground">Maximum price slippage allowed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={simulateJupiterSwap} disabled={isLoading || !swapData.outputMint} className="mt-2">
                {isLoading ? "🧪 Simulating..." : "🧪 Simulate"}
              </Button>
              <Button onClick={executeJupiterSwap} disabled className="mt-2" title="Disabled on devnet when no route is available">
                🪐 Execute Swap (devnet)
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {isCheckingRoute ? "Checking route on devnet…" : quote ? "Route available – will auto-enable when ready" : "No route yet – we refresh every 15s. Try Find tradable or a different token."}
            </div>
            {quote && (
              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <div className="font-medium mb-1">Route preview</div>
                <div>In: SOL {swapData.amount}</div>
                <div>Out est: {quote?.outAmount ? (Number(quote.outAmount) / Math.pow(10, 6)).toFixed(6) : "—"}</div>
                <div className="text-muted-foreground">If this route disappears, we’ll keep checking.</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "pools" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jupiter Pool Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={simulateCreatePool} disabled={isLoading}>
              {isLoading ? "🏊 Creating Pool..." : "🏊 Create New Pool"}
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{pool.tokenA} / {pool.tokenB}</CardTitle>
                      <Badge variant="secondary">{pool.apr}% APR</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Liquidity</span>
                        <div className="font-medium">${pool.liquidity.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">24h Volume</span>
                        <div className="font-medium">${pool.volume24h.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">24h Fees</span>
                        <div className="font-medium">${pool.fees24h.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pool</span>
                        <div className="font-mono text-xs">{pool.poolAddress.slice(0, 8)}...{pool.poolAddress.slice(-8)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => simulateAddLiquidity(pool.poolAddress)} disabled={isLoading}>💧 Add Liquidity</Button>
                      <Button size="sm" variant="secondary">📊 View Analytics</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jupiter Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">🪐 Total Volume</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">$2,450,000</div>
                  <div className="text-xs text-muted-foreground">Last 24 hours</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">🏊 Active Pools</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{pools.length}</div>
                  <div className="text-xs text-muted-foreground">Liquidity pools</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">💰 Total Fees</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">$4,300</div>
                  <div className="text-xs text-muted-foreground">Last 24 hours</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📈 Avg APR</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">11.65%</div>
                  <div className="text-xs text-muted-foreground">Across all pools</div>
                </CardContent>
              </Card>
            </div>
            <div className="rounded-md border p-4">
              <h4 className="text-sm font-medium mb-2">📊 Volume Chart (24h)</h4>
              <div className="h-48 rounded-md bg-gradient-to-br from-primary to-purple-500 grid place-items-center text-primary-foreground font-semibold">
                📈 Real-time Volume Chart
              </div>
              <p className="text-xs text-muted-foreground mt-2">This would show real-time trading volume data from Jupiter&apos;s aggregated DEXs</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JupiterIntegration;


