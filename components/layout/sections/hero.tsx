"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import SuperteamVN from "@/image.png";
import Link from "next/link";

export const HeroSection = () => {
  const { theme } = useTheme();
  return (
    <section className="container w-full">
      <div className="grid place-items-center lg:max-w-screen-xl gap-4 mx-auto py-10 md:py-20">
        <div className="text-center space-y-8">
          {/* Powered by Superteam Vietnam - glowing badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-orange-500/40 bg-black/20 px-5 py-2.5 text-base text-orange-100 shadow-[0_0_18px_rgba(255,115,0,0.35)] ring-1 ring-orange-500/30 backdrop-blur">
              <span className="opacity-80">Powered by</span>
              <Image
                src={SuperteamVN}
                alt="Superteam Vietnam"
                width={22}
                height={22}
                className="rounded-[6px] border border-orange-400/50"
              />
              <span className="font-semibold">Superteam Vietnam</span>
            </div>
          </div>

          <div className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>
              Build Your
              <span className="text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
                DeFi Empire
              </span>
              on Solana
            </h1>
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground">
            Create Token-2022 with transfer hooks, launch liquidity pools, and trade with best-price routing. 
            Everything you need to build and trade on Solana&apos;s most advanced AMM platform.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button asChild className="w-5/6 md:w-1/4 font-bold group/arrow">
              <Link href="/dashboard" aria-label="Open AMM dashboard">
                Launch Your DEX
                <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
