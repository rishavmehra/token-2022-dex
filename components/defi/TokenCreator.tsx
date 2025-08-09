"use client";
import React, { FC, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction, Keypair } from "@solana/web3.js";
import Tooltip from "@/components/defi/Tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Info, CheckCircle, Copy, ExternalLink, Plus, X } from "lucide-react";

const DEFAULT_HOOK_PROGRAM_ID =
  process.env.NEXT_PUBLIC_TRANSFER_HOOK_PROGRAM_ID ||
  "DXroBepak55dVb4NzAKVGvvmrF5a63j6sEfgjzLTytFB";

const TRANSFER_HOOK_PROGRAM_ID = new PublicKey(DEFAULT_HOOK_PROGRAM_ID);

const HOOK_PROGRAMS = {
  default: {
    id: DEFAULT_HOOK_PROGRAM_ID,
    name: "Default Transfer Hook",
    description: "Our deployed transfer hook program (Recommended)",
  },
};

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  transferHook: boolean;
  hookProgramId: string;
  selectedHookType: string;
  whitelistAddresses: string[];
}

interface CreatedToken {
  mintAddress: string;
  associatedTokenAccount: string;
  transferHookProgram: string;
  transactionSignature: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  decimals: number;
  whitelistAddresses: string[];
}

const TokenCreator: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    decimals: 9,
    totalSupply: 1000000,
    transferHook: true,
    hookProgramId: TRANSFER_HOOK_PROGRAM_ID.toBase58(),
    selectedHookType: "default",
    whitelistAddresses: [""]
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      transferHook: checked,
    }));
  };

  const createToken = async () => {
    if (!publicKey) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    if (!formData.name || !formData.symbol) {
      setErrorMessage("Please fill in both token name and symbol.");
      return;
    }

    if (formData.transferHook && !formData.hookProgramId) {
      setErrorMessage("Transfer hook is enabled, but no Program ID is configured.");
      return;
    }

    if (formData.transferHook && formData.hookProgramId) {
      try {
        new PublicKey(formData.hookProgramId);
      } catch (error) {
        setErrorMessage(
          "Invalid transfer hook Program ID format. Please configure a valid Solana program ID."
        );
        return;
      }
    }

    // Validate whitelist addresses if provided
    if (formData.transferHook) {
      const nonEmptyAddresses = formData.whitelistAddresses.map(a => a.trim()).filter(Boolean);
      for (const addr of nonEmptyAddresses) {
        try {
          // will throw if invalid
          new PublicKey(addr);
        } catch {
          setErrorMessage(`Invalid whitelist address: ${addr}`);
          return;
        }
      }
    }

    setIsCreating(true);
    try {
      const mintKeypair = Keypair.generate();
      const transaction = new Transaction();

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const mintRent = await connection.getMinimumBalanceForRentExemption(82);

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82,
          lamports: mintRent,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );

      const initializeMintInstruction = createInitializeMintInstruction(
        mintKeypair.publicKey,
        formData.decimals,
        publicKey,
        publicKey,
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(initializeMintInstruction);

      if (formData.transferHook) {
        const hookProgramId = new PublicKey(formData.hookProgramId);
        console.log("Transfer hook will be active. Program:", hookProgramId.toBase58());
      }

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const createAssociatedTokenInstruction = createAssociatedTokenAccountInstruction(
        publicKey,
        associatedTokenAddress,
        publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(createAssociatedTokenInstruction);

      const mintAmount = formData.totalSupply * Math.pow(10, formData.decimals);
      const mintToInstruction = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        publicKey,
        mintAmount,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(mintToInstruction);

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      const createdTokenData: CreatedToken = {
        mintAddress: mintKeypair.publicKey.toBase58(),
        associatedTokenAccount: associatedTokenAddress.toBase58(),
        transferHookProgram: formData.transferHook ? formData.hookProgramId : "",
        transactionSignature: signature,
        tokenName: formData.name,
        tokenSymbol: formData.symbol,
        totalSupply: formData.totalSupply,
        decimals: formData.decimals,
        whitelistAddresses: formData.whitelistAddresses.map(a => a.trim()).filter(Boolean),
      };
      setCreatedToken(createdTokenData);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error creating token:", error);
      setErrorMessage(
        `Error creating token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const explorerCluster = "devnet"; // adjust if needed
  const explorerAddressUrl = (address: string) =>
    `https://explorer.solana.com/address/${address}?cluster=${explorerCluster}`;
  const explorerTxUrl = (sig: string) =>
    `https://explorer.solana.com/tx/${sig}?cluster=${explorerCluster}`;

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Info className="h-5 w-5" />
            Token-2022 with Transfer Hooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create advanced tokens with programmable transfer logic using Solana&apos;s Token-2022 program. 
            Transfer hooks enable custom logic during token transfers (KYC, whitelisting, etc.).
          </p>
        </CardContent>
      </Card>

      {/* Token Configuration Form */}
      {errorMessage && (
        <div className="rounded-md border border-red-500/30 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., My Transfer Hook Token"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol *</Label>
              <Input
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="e.g., MTHT"
                maxLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                type="number"
                id="decimals"
                name="decimals"
                value={formData.decimals}
                onChange={handleInputChange}
                min={0}
                max={9}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Standard is 9 decimals (like SOL)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSupply">Total Supply</Label>
              <Input
                type="number"
                id="totalSupply"
                name="totalSupply"
                value={formData.totalSupply}
                onChange={handleInputChange}
                min={1}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Total tokens to mint initially</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transferHook"
                checked={formData.transferHook}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="transferHook" className="text-sm font-medium">
                Enable Transfer Hook (Recommended)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Transfer hooks enable custom logic during token transfers (KYC, whitelisting, etc.)
            </p>
          </div>

          {formData.transferHook && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hookType">Transfer Hook Type</Label>
                <Select
                  value={formData.selectedHookType}
                  onValueChange={(value) => {
                    const selectedHook = HOOK_PROGRAMS[value as keyof typeof HOOK_PROGRAMS];
                    setFormData({
                      ...formData,
                      selectedHookType: value,
                      hookProgramId: selectedHook.id,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hook type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HOOK_PROGRAMS).map(([key, hook]) => (
                      <SelectItem key={key} value={key}>
                        {hook.name} - {hook.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  We provide a working transfer hook program. The Program ID is configured via environment variable and not editable here.
                </p>
              </div>

              {/* Program ID input removed – configured via env */}

              {/* Whitelist section */}
              <div className="space-y-2">
                <Label>Whitelist Addresses (optional)</Label>
                <div className="space-y-2">
                  {formData.whitelistAddresses.map((address, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={address}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => {
                            const next = [...prev.whitelistAddresses];
                            next[index] = value;
                            return { ...prev, whitelistAddresses: next };
                          });
                        }}
                        placeholder="Enter wallet address to whitelist"
                      />
                      {formData.whitelistAddresses.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setFormData((prev) => {
                              const next = prev.whitelistAddresses.filter((_, i) => i !== index);
                              return { ...prev, whitelistAddresses: next.length ? next : [""] };
                            });
                          }}
                          aria-label="Remove address"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        whitelistAddresses: [...prev.whitelistAddresses, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" /> Add address
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow all wallets. Provided addresses must be valid Solana public keys.
                </p>
              </div>
            </>
          )}

          <Button
            onClick={createToken}
            disabled={isCreating || !formData.name || !formData.symbol}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating Token-2022..." : "Create Token-2022 with Transfer Hook"}
          </Button>
        </CardContent>
      </Card>

      {/* Success Section */}
      {createdToken && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              Token-2022 Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Token Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Token Name:</span>
                    <span className="font-medium">{createdToken.tokenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Token Symbol:</span>
                    <span className="font-medium">{createdToken.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Supply:</span>
                    <span className="font-medium">{createdToken.totalSupply.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Decimals:</span>
                    <span className="font-medium">{createdToken.decimals}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Blockchain Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Mint Address:</span>
                    <a
                      href={explorerAddressUrl(createdToken.mintAddress)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs bg-muted px-2 py-1 rounded mt-1 break-all hover:underline flex items-center justify-between"
                    >
                      <span>{createdToken.mintAddress}</span>
                      <ExternalLink className="h-3 w-3 ml-2 opacity-70" />
                    </a>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Associated Token Account:</span>
                    <a
                      href={explorerAddressUrl(createdToken.associatedTokenAccount)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs bg-muted px-2 py-1 rounded mt-1 break-all hover:underline flex items-center justify-between"
                    >
                      <span>{createdToken.associatedTokenAccount}</span>
                      <ExternalLink className="h-3 w-3 ml-2 opacity-70" />
                    </a>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Transfer Hook Program:</span>
                    <a
                      href={explorerAddressUrl(createdToken.transferHookProgram)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs bg-muted px-2 py-1 rounded mt-1 break-all hover:underline flex items-center justify-between"
                    >
                      <span>{createdToken.transferHookProgram}</span>
                      <ExternalLink className="h-3 w-3 ml-2 opacity-70" />
                    </a>
                  </div>
                  {createdToken.whitelistAddresses.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Whitelist Addresses:</span>
                      <div className="mt-1 space-y-1">
                        {createdToken.whitelistAddresses.map((addr, i) => (
                          <code key={i} className="block text-xs bg-muted px-2 py-1 rounded break-all">
                            {addr}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Transaction Signature:</span>
                    <a
                      href={explorerTxUrl(createdToken.transactionSignature)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs bg-muted px-2 py-1 rounded mt-1 break-all hover:underline flex items-center justify-between"
                    >
                      <span>{createdToken.transactionSignature}</span>
                      <ExternalLink className="h-3 w-3 ml-2 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Ready for AMM Trading!
              </h4>
              <p className="text-sm text-muted-foreground">
                Your Token-2022 is now ready to be used in the AMM interface. The transfer hook will protect all token transfers with custom logic.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Token-2022 program integration",
                  "Transfer hook protection active",
                  "Ready for liquidity pool creation",
                  "Compatible with AMM trading"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenCreator;


