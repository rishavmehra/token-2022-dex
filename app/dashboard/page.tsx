"use client";
import React, { useState } from "react";
import WalletConnect from "@/components/defi/WalletConnect";
import TokenCreator from "@/components/defi/TokenCreator";
import AMMInterface from "@/components/defi/AMMInterface";
import JupiterIntegration from "@/components/defi/JupiterIntegration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Wallet, Coins, Database, LineChart } from "lucide-react";

type Step = 1 | 2 | 3;

export default function Dashboard() {
  const [step, setStep] = useState<Step>(1);

  const steps = [
    {
      id: 1,
      title: "Create Token",
      description: "Mint Token-2022 with transfer hooks",
      icon: Coins,
      active: step === 1,
    },
    {
      id: 2,
      title: "Create Pool",
      description: "Launch liquidity pool with AMM",
      icon: Database,
      active: step === 2,
    },
    {
      id: 3,
      title: "Jupiter Integration",
      description: "Best-price routing across DEXs",
      icon: LineChart,
      active: step === 3,
    },
  ];

  return (
    <main className="container w-full max-w-screen-xl mx-auto py-8 space-y-8">
      {/* Header Section */}
      <Card className="bg-card border border-secondary shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold">DeFi Platform Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Follow the steps to launch and trade your Token-2022 with advanced AMM features.
              </p>
            </div>
            
            {/* Step Navigation */}
            <div className="flex items-center">
              <div className="flex gap-2 flex-wrap rounded-full px-2 py-2 border border-border/60 bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur supports-[backdrop-filter]:bg-black/10">
                {steps.map((stepItem) => {
                  const IconComponent = stepItem.icon;
                  const isActive = stepItem.active;
                  return (
                    <Button
                      key={stepItem.id}
                      size="sm"
                      onClick={() => setStep(stepItem.id as Step)}
                      aria-current={isActive ? "step" : undefined}
                      className={
                        `group h-10 flex items-center gap-2 rounded-full px-4 transition-all ` +
                        (isActive
                          ? "bg-gradient-to-r from-orange-500 to-primary text-white shadow-md ring-1 ring-white/20"
                          : "bg-transparent text-foreground/70 hover:text-foreground hover:bg-white/5")
                      }
                      variant="ghost"
                    >
                      <span className={`inline-flex items-center justify-center h-5 w-5 text-[11px] font-semibold rounded-full border ${isActive ? "border-white/40 bg-white/10 text-white" : "border-border/80 text-foreground/60"}`}>
                        {stepItem.id}
                      </span>
                      <IconComponent className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
                      <span className="hidden sm:inline whitespace-nowrap font-medium tracking-wide">{stepItem.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Left sidebar (wallet) + Right content (steps) */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left: Wallet Connect Section (sticky) */}
        <div className="lg:sticky lg:top-6 h-fit order-1">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </div>

        {/* Right: Step Content */}
        <div className="space-y-6 order-2">
          {/* Step 1: Create Token */}
          {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Step 1
              </Badge>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Create Token-2022
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Mint advanced tokens with programmable transfer hooks for enhanced security and compliance.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <TokenCreator />
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2"
              >
                Continue to Create Pool
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
          )}

          {/* Step 2: Create Pool */}
          {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Step 2
              </Badge>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Create Liquidity Pool
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Launch your token pool with automated market making and initial liquidity provision.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <AMMInterface />
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2"
              >
                Continue to Jupiter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
          )}

          {/* Step 3: Jupiter Integration */}
          {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Step 3
              </Badge>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Jupiter Integration
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Access best-price routing across 20+ DEXs for optimal trade execution.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <JupiterIntegration />
            <div className="flex justify-start">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
          )}

          {/* Progress Indicator */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Progress
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Step {step} of 3
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        stepNumber <= step 
                          ? "bg-primary" 
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


