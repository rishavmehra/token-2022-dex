"use client";
import React, { FC, useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
// Tooltip not needed here anymore; we keep UI minimal inside Cards
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Info, Wallet as WalletIcon, X, Copy, ExternalLink, TrendingDown, TrendingUp } from "lucide-react";

interface Pool {
  poolAddress: string;
  poolKeypair: Keypair;
  tokenMint: string;
  tokenName: string;
  tokenSymbol: string;
  solAmount: number;
  tokenAmount: number;
  totalVolume: number;
  tradeCount: number;
  createdAt: Date;
  hookProgramId: string;
}

interface Trade {
  id: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  timestamp: Date;
  transactionSignature: string;
  poolAddress: string;
}

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

const AMMInterface: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [pools, setPools] = useState<Pool[]>([]);
  const [walletBalances, setWalletBalances] = useState({
    sol: 0,
    tokens: {} as Record<string, number>,
  });
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [manualTokenMint, setManualTokenMint] = useState("");
  const [tradeInputs, setTradeInputs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    | { type: "success" | "error" | "info"; message: string; href?: string; hrefLabel?: string }
    | null
  >(null);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  const [poolForm, setPoolForm] = useState({
    tokenMint: "",
    tokenAmount: 0,
    solAmount: 0,
    poolName: "",
    description: "",
  });

  const [solAmountInput, setSolAmountInput] = useState("");
  const isFormValid =
    poolForm.tokenMint.trim().length > 0 &&
    poolForm.tokenAmount > 0 &&
    poolForm.solAmount > 0;
  const estimatedPricePerToken =
    poolForm.tokenAmount > 0 ? poolForm.solAmount / poolForm.tokenAmount : 0;

  const fetchWalletBalances = async () => {
    if (!publicKey) return;
    try {
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceInSol = solBalance / LAMPORTS_PER_SOL;
      const tokenBalances: { [mint: string]: number } = {};
      for (const pool of pools) {
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            {
              mint: new PublicKey(pool.tokenMint),
            }
          );
          if (tokenAccounts.value.length > 0) {
            const balance =
              tokenAccounts.value[0].account.data.parsed.info.tokenAmount
                .uiAmount;
            tokenBalances[pool.tokenMint] = balance || 0;
          } else {
            const allTokenAccounts =
              await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: new PublicKey(
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                ),
              });
            const matchingAccount = allTokenAccounts.value.find(
              (account) => account.account.data.parsed.info.mint === pool.tokenMint
            );
            if (matchingAccount) {
              const balance = matchingAccount.account.data.parsed.info.tokenAmount.uiAmount;
              tokenBalances[pool.tokenMint] = balance || 0;
            } else {
              tokenBalances[pool.tokenMint] = 0;
            }
          }
        } catch (error) {
          console.log(
            `Error fetching balance for token ${pool.tokenMint}:`,
            error
          );
          tokenBalances[pool.tokenMint] = 0;
        }
      }
      setWalletBalances({ sol: solBalanceInSol, tokens: tokenBalances });
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    }
  };

  useEffect(() => {
    fetchWalletBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, pools]);

  const createPool = async () => {
    if (!publicKey) {
      setStatus({ type: "error", message: "Please connect your wallet first." });
      return;
    }
    if (!poolForm.tokenMint || poolForm.tokenAmount <= 0 || poolForm.solAmount <= 0) {
      setStatus({ type: "error", message: "Please fill in all required fields with valid values." });
      return;
    }
    setIsCreatingPool(true);
    try {
      const poolKeypair = Keypair.generate();
      const transaction = new Transaction();
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: poolKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL * poolForm.solAmount,
        space: 1024,
        programId: SystemProgram.programId,
      });
      transaction.add(createAccountInstruction);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: poolKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL * poolForm.solAmount,
      });
      transaction.add(transferInstruction);

      const poolData: Pool = {
        poolAddress: poolKeypair.publicKey.toString(),
        poolKeypair,
        tokenMint: poolForm.tokenMint,
        tokenName: "Custom Token",
        tokenSymbol: "CT",
        solAmount: poolForm.solAmount,
        tokenAmount: poolForm.tokenAmount,
        totalVolume: 0,
        tradeCount: 0,
        createdAt: new Date(),
        hookProgramId: "Default",
      };

      const signature = await sendTransaction(transaction, connection, {
        preflightCommitment: "confirmed",
        signers: [poolKeypair],
      });

      setPools((prev) => [...prev, poolData]);
      setPoolForm({ tokenMint: "", tokenAmount: 0, solAmount: 0, poolName: "", description: "" });
      setSolAmountInput("");
      setStatus({
        type: "success",
        message: "Pool created successfully!",
        href: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        hrefLabel: "View on Solana Explorer",
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      setStatus({ type: "error", message: `Error creating pool: ${error}` });
    } finally {
      setIsCreatingPool(false);
    }
  };

  const executeTrade = async (
    pool: Pool,
    tradeType: "buy" | "sell",
    tradeAmount: number
  ) => {
    if (!publicKey) {
      setStatus({ type: "error", message: "Please connect your wallet first." });
      return;
    }
    if (tradeType === "buy" && walletBalances.sol < tradeAmount) {
      setStatus({
        type: "error",
        message: `Insufficient SOL balance. You have ${walletBalances.sol.toFixed(4)} SOL, but need ${tradeAmount} SOL`,
      });
      return;
    }
    if (
      tradeType === "sell" &&
      (!walletBalances.tokens[pool.tokenMint] ||
        walletBalances.tokens[pool.tokenMint] < tradeAmount * 1000)
    ) {
      setStatus({ type: "error", message: "Insufficient token balance for selling." });
      return;
    }
    setIsExecutingTrade(true);
    try {
      const transaction = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const tradeAmountLamports = tradeAmount * LAMPORTS_PER_SOL;
      if (tradeType === "buy") {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: pool.poolKeypair.publicKey,
            lamports: tradeAmountLamports,
          })
        );
      } else {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: publicKey,
            lamports: 1000,
          })
        );
      }
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1000,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      const tokenAmount = tradeType === "buy" ? tradeAmount * 1000 : tradeAmount * 1000;
      const price = tradeAmount / (tokenAmount / 1000);
      setPools((prev) =>
        prev.map((p) =>
          p.poolAddress === pool.poolAddress
            ? {
                ...p,
                solAmount: tradeType === "buy" ? p.solAmount + tradeAmount : p.solAmount - tradeAmount,
                totalVolume: p.totalVolume + tradeAmount,
                tradeCount: p.tradeCount + 1,
              }
            : p
        )
      );
      setWalletBalances((prev) => ({
        sol: tradeType === "buy" ? prev.sol - tradeAmount : prev.sol + tradeAmount,
        tokens: {
          ...prev.tokens,
          [pool.tokenMint]:
            tradeType === "buy"
              ? (prev.tokens[pool.tokenMint] || 0) + tokenAmount
              : (prev.tokens[pool.tokenMint] || 0) - tokenAmount,
        },
      }));
      const newTrade: Trade = {
        id: Date.now().toString(),
        type: tradeType,
        amount: tradeAmount,
        price,
        timestamp: new Date(),
        transactionSignature: signature,
        poolAddress: pool.poolAddress,
      };
      setTradeHistory((prev) => [newTrade, ...prev]);
      setPriceData((prev) => [
        ...prev,
        { timestamp: Date.now(), price, volume: tradeAmount },
      ]);
      setStatus({
        type: "success",
        message: `Trade executed successfully (${tradeType}) – ${tradeAmount} SOL`,
        href: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        hrefLabel: "View transaction",
      });
    } catch (error) {
      console.error("Error executing trade:", error);
      setStatus({ type: "error", message: "Error executing trade. Please try again." });
    } finally {
      setIsExecutingTrade(false);
    }
  };

  const addManualToken = () => {
    if (manualTokenMint.trim()) {
      setWalletBalances((prev) => ({
        ...prev,
        tokens: {
          ...prev.tokens,
          [manualTokenMint.trim()]: 1000000,
        },
      }));
      setManualTokenMint("");
      setStatus({ type: "success", message: "Token added successfully to balances." });
    }
  };

  const removeToken = (mint: string) => {
    setWalletBalances((prev) => {
      const newTokens = { ...prev.tokens };
      delete newTokens[mint];
      return { ...prev, tokens: newTokens };
    });
  };

  const getPoolAnalytics = (pool: Pool) => {
    const trades = tradeHistory.filter((t) => t.poolAddress === pool.poolAddress);
    const totalVolume = trades.reduce((sum, t) => sum + t.amount, 0);
    const avgPrice = trades.length > 0 ? trades.reduce((sum, t) => sum + t.price, 0) / trades.length : 0;
    const priceChange =
      priceData.length > 1
        ? (((priceData[priceData.length - 1]?.price || 0) - (priceData[0]?.price || 0)) /
            (priceData[0]?.price || 1)) * 100
        : 0;
    return { totalVolume, avgPrice, priceChange, tradeCount: trades.length, lastTrade: trades[0] || null };
  };

  const getPriceChartData = () => {
    if (priceData.length === 0) return [] as Array<{ time: string; price: number; volume: number }>;
    return priceData.map((data) => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      price: data.price,
      volume: data.volume,
    }));
  };

  const copyPoolAddress = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setStatus({ type: "success", message: "Pool address copied to clipboard." });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setStatus({ type: "error", message: "Failed to copy address." });
      });
  };

  const explorerCluster = "devnet"; // adjust cluster as needed
  const explorerAddressUrl = (address: string) =>
    `https://explorer.solana.com/address/${address}?cluster=${explorerCluster}`;
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  // Auto-dismiss status after a few seconds
  useEffect(() => {
    if (!status) return;
    const id = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(id);
  }, [status]);

  // Simple local price bot: randomly buys/sells small amounts on a random pool
  useEffect(() => {
    if (!isAutoTrading || pools.length === 0) return;
    const id = setInterval(async () => {
      const pool = pools[Math.floor(Math.random() * pools.length)];
      const tradeType: "buy" | "sell" = Math.random() > 0.5 ? "buy" : "sell";
      const amount = Number((Math.random() * 0.02 + 0.01).toFixed(3)); // 0.01 - 0.03 SOL
      try {
        await executeTrade(pool, tradeType, amount);
      } catch {
        // ignore; executeTrade already surfaces status
      }
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoTrading, pools]);

  return (
    <div className="amm-interface space-y-6">
      {status && (
        <div
          className={`rounded-md border p-3 text-sm flex items-center justify-between ${
            status.type === "success"
              ? "border-green-500/30 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : status.type === "error"
              ? "border-red-500/30 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              : "border-blue-500/30 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          }`}
        >
          <span>{status.message}</span>
          {status.href && (
            <a
              href={status.href}
              target="_blank"
              rel="noreferrer"
              className="ml-4 underline hover:no-underline"
            >
              {status.hrefLabel || "View"}
            </a>
          )}
        </div>
      )}
      {publicKey && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <WalletIcon className="h-5 w-5" /> Wallet Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">SOL</span>
                <span className="font-medium">{walletBalances.sol.toFixed(4)}</span>
              </div>
              {Object.entries(walletBalances.tokens).map(([mint, balance]) => (
                <div key={mint} className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{mint.slice(0, 8)}...{mint.slice(-4)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{balance.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeToken(mint)}
                      title="Remove token"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
              <div className="space-y-1">
                <Label htmlFor="manualMint" className="text-xs">Add Token Manually</Label>
                <Input
                  id="manualMint"
                  placeholder="Token Mint Address"
                  value={manualTokenMint}
                  onChange={(e) => setManualTokenMint(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full sm:w-auto" onClick={addManualToken}>Add Token</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Step 2</Badge>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Database className="h-5 w-5" /> Create Liquidity Pool
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Launch a pool for your Token-2022 with initial SOL and token liquidity. You can adjust advanced parameters later.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint">Token Mint Address *</Label>
                <Input
                  id="mint"
                  placeholder="Enter token mint address"
                  value={poolForm.tokenMint}
                  onChange={(e) => setPoolForm({ ...poolForm, tokenMint: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Use the mint of the token you created in Step 1.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenAmount">Token Amount *</Label>
                  <Input
                    id="tokenAmount"
                    type="number"
                    placeholder="e.g., 1000"
                    value={poolForm.tokenAmount === 0 ? "" : poolForm.tokenAmount}
                    onChange={(e) =>
                      setPoolForm({ ...poolForm, tokenAmount: parseFloat(e.target.value) || 0 })
                    }
                    min={0}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solAmount">SOL Amount *</Label>
                  <Input
                    id="solAmount"
                    type="number"
                    placeholder="e.g., 0.1"
                    value={solAmountInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSolAmountInput(value);
                      setPoolForm({ ...poolForm, solAmount: parseFloat(value) || 0 });
                    }}
                    min={0}
                    step={0.0001}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poolName">Pool Name</Label>
                <Input
                  id="poolName"
                  placeholder="Optional, displayed in your dashboard"
                  value={poolForm.poolName}
                  onChange={(e) => setPoolForm({ ...poolForm, poolName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Pool Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional notes for your pool"
                  value={poolForm.description}
                  onChange={(e) => setPoolForm({ ...poolForm, description: e.target.value })}
                />
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Info className="h-4 w-4" /> Pool Preview
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token Mint</span>
                  <code className="text-xs">
                    {poolForm.tokenMint ? `${poolForm.tokenMint.slice(0, 6)}...${poolForm.tokenMint.slice(-6)}` : "—"}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token Amount</span>
                  <span className="font-medium">{poolForm.tokenAmount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SOL Amount</span>
                  <span className="font-medium">{poolForm.solAmount || 0}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Est. Price / Token</span>
                  <span className="font-medium">{estimatedPricePerToken ? estimatedPricePerToken.toFixed(6) : "—"} SOL</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  This preview is indicative. Actual price depends on on-chain math and fees.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Button
              onClick={createPool}
              disabled={isCreatingPool || !isFormValid}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isCreatingPool ? "Creating Pool..." : "Create Pool"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            >
              {showAdvancedFeatures ? "Hide" : "Show"} Advanced Features
            </Button>
          </div>
        </CardContent>
      </Card>

      {pools.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Liquidity Pools</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={isAutoTrading ? "secondary" : "outline"} onClick={() => setIsAutoTrading((v) => !v)} title="Simulate buys/sells locally to move price">
                {isAutoTrading ? "Stop price bot" : "Start price bot (local)"}
              </Button>
              <Badge variant="outline" className="text-xs">{pools.length}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pools.map((pool) => {
              const analytics = getPoolAnalytics(pool);
              const tradeValue = tradeInputs[pool.poolAddress] || "";
              return (
                <Card key={pool.poolAddress} className="bg-card border border-secondary/70 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base font-semibold">
                        {pool.tokenName} <span className="text-muted-foreground">({pool.tokenSymbol})</span>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Copy pool address"
                          className="h-7 w-7"
                          onClick={() => copyPoolAddress(pool.poolAddress)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                          <a href={explorerAddressUrl(pool.poolAddress)} target="_blank" rel="noreferrer" title="Open in Explorer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {shortenAddress(pool.poolAddress)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border bg-muted/40 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">SOL</div>
                        <div className="font-medium text-sm">{pool.solAmount.toFixed(4)}</div>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Tokens</div>
                        <div className="font-medium text-sm">{pool.tokenAmount.toLocaleString()}</div>
                      </div>
                      <div className="rounded-md border bg-muted/40 p-2">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Trades</div>
                        <div className="font-medium text-sm">{analytics.tradeCount}</div>
                      </div>
                    </div>
                    {showAdvancedFeatures && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-md border bg-muted/30 p-2">
                          <div className="text-muted-foreground">Volume</div>
                          <div className="font-medium">{analytics.totalVolume.toFixed(4)} SOL</div>
                        </div>
                        <div className="rounded-md border bg-muted/30 p-2">
                          <div className="text-muted-foreground">Avg Price</div>
                          <div className="font-medium">${analytics.avgPrice.toFixed(6)}</div>
                        </div>
                        <div className="rounded-md border bg-muted/30 p-2">
                          <div className="text-muted-foreground">Change</div>
                          <div className={`font-medium inline-flex items-center gap-1 ${analytics.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {analytics.priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {analytics.priceChange.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )}
                    <Separator />
                    {analytics.lastTrade && (
                      <div className="text-xs text-muted-foreground -mt-1">
                        <span>Last tx: </span>
                        <a
                          href={`https://explorer.solana.com/tx/${analytics.lastTrade.transactionSignature}?cluster=${explorerCluster}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          {analytics.lastTrade.transactionSignature.slice(0, 8)}...
                        </a>
                        <span className="ml-2">{analytics.lastTrade.type.toUpperCase()} {analytics.lastTrade.amount} SOL</span>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`trade-amount-${pool.poolAddress}`} className="text-xs whitespace-nowrap">Amount (SOL)</Label>
                        <Input
                          id={`trade-amount-${pool.poolAddress}`}
                          type="number"
                          placeholder="e.g., 0.01"
                          value={tradeValue}
                          onChange={(e) =>
                            setTradeInputs((prev) => ({ ...prev, [pool.poolAddress]: e.target.value }))
                          }
                          min={0}
                          step={0.0001}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(tradeInputs[pool.poolAddress] || "0");
                          if (amount > 0) executeTrade(pool, "buy", amount);
                        }}
                        disabled={isExecutingTrade}
                        className="shrink-0"
                      >
                        Buy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const amount = parseFloat(tradeInputs[pool.poolAddress] || "0");
                          if (amount > 0) executeTrade(pool, "sell", amount);
                        }}
                        disabled={isExecutingTrade}
                        className="shrink-0"
                      >
                        Sell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {showAdvancedFeatures && (
        <>
          {priceData.length > 0 && (
            <div className="section">
              <h3>Price Chart</h3>
              <div className="price-chart">
                <div className="chart-container">
                  {getPriceChartData().map((data, index, arr) => (
                    <div key={index} className="chart-bar">
                      <div
                        className="bar"
                        style={{
                          height: `${(data.price / Math.max(...arr.map((d) => d.price))) * 100}%`,
                        }}
                      ></div>
                      <span className="price">${data.price.toFixed(6)}</span>
                      <span className="time">{data.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tradeHistory.length > 0 && (
            <div className="section">
              <h3>Trade History</h3>
              <div className="trade-history">
                {tradeHistory.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="trade-item">
                    <div className="trade-info">
                      <span className={`trade-type ${trade.type}`}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="trade-amount">{trade.amount} SOL</span>
                      <span className="trade-price">${trade.price.toFixed(6)}</span>
                      <span className="trade-time">
                        {trade.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <a
                      href={`https://explorer.solana.com/tx/${trade.transactionSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transaction-link"
                    >
                      View Transaction →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AMMInterface;


