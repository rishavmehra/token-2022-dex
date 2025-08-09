"use client";
import React, { FC } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react";

const WalletConnect: FC = () => {
  const { connection } = useConnection();
  const { wallet, connected, publicKey } = useWallet();

  return (
    <div className="space-y-4">
      {connected ? (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              Wallet Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
              <dt className="text-sm font-medium text-muted-foreground whitespace-nowrap">Wallet</dt>
              <dd className="flex justify-between items-center">
                <Badge variant="secondary" className="whitespace-nowrap">{wallet?.adapter.name}</Badge>
              </dd>

              <dt className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status</dt>
              <dd className="flex justify-between items-center">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">Connected</Badge>
              </dd>

              <dt className="text-sm font-medium text-muted-foreground whitespace-nowrap">Network</dt>
              <dd className="flex justify-between items-center">
                <Badge variant="outline" className="whitespace-nowrap">Devnet</Badge>
              </dd>

              <dt className="text-sm font-medium text-muted-foreground whitespace-nowrap">Public Key</dt>
              <dd className="flex items-center gap-2 min-w-0">
                <code className="text-xs bg-muted px-2 py-1 rounded truncate min-w-0 max-w-[180px]">
                  {publicKey?.toBase58()}
                </code>
                <button
                  aria-label="Copy public key"
                  className="inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground h-7 w-7 shrink-0"
                  onClick={() => {
                    if (publicKey) navigator.clipboard.writeText(publicKey.toBase58());
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </dd>
            </dl>
            <Separator />
            <div className="flex">
              <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !px-4 !py-2 !w-full sm:!w-auto" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
              Wallet Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Please connect your wallet to access the DeFi platform features.
            </p>
            
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
            </div>

            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Supported Wallets:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {["Phantom", "Solflare", "Torus"].map((walletName) => (
                  <div key={walletName} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{walletName}</span>
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

export default WalletConnect;

