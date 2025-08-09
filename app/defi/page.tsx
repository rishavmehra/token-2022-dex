"use client";
import React, { useState } from "react";
import WalletConnect from "@/components/defi/WalletConnect";
import TokenCreator from "@/components/defi/TokenCreator";
import AMMInterface from "@/components/defi/AMMInterface";
import JupiterIntegration from "@/components/defi/JupiterIntegration";

export default function DeFiPage() {
  const [activeTab, setActiveTab] = useState<"wallet" | "token" | "amm" | "jupiter">(
    "wallet"
  );

  return (
    <main className="w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl mx-auto py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Solana dApp Suite</h1>
        <p className="text-muted-foreground mt-2">Create tokens, manage pools, and trade with a delightful UX</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button className={`nav-tab ${activeTab === "wallet" ? "active" : ""}`} onClick={() => setActiveTab("wallet")}>
          Wallet
        </button>
        <button className={`nav-tab ${activeTab === "token" ? "active" : ""}`} onClick={() => setActiveTab("token")}>
          Create Token
        </button>
        <button className={`nav-tab ${activeTab === "amm" ? "active" : ""}`} onClick={() => setActiveTab("amm")}>
          AMM Trading
        </button>
        <button className={`nav-tab ${activeTab === "jupiter" ? "active" : ""}`} onClick={() => setActiveTab("jupiter")}>
          Jupiter Integration
        </button>
      </div>

      <div>
        {activeTab === "wallet" && <WalletConnect />}
        {activeTab === "token" && <TokenCreator />}
        {activeTab === "amm" && <AMMInterface />}
        {activeTab === "jupiter" && <JupiterIntegration />}
      </div>
    </main>
  );
}


