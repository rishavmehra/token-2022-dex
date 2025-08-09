import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "Coins",
    title: "Token-2022 Creation",
    description:
      "Mint advanced tokens with programmable transfer hooks for KYC, whitelisting, and custom logic.",
  },
  {
    icon: "Database",
    title: "Liquidity Pool Creation",
    description:
      "Create and bootstrap SOL/token pools with automated market making and liquidity provision.",
  },
  {
    icon: "ArrowLeftRight",
    title: "AMM Trading Engine",
    description:
      "Advanced automated market maker with real-time pricing, slippage protection, and multi-pool routing.",
  },
  {
    icon: "LineChart",
    title: "Jupiter Integration",
    description:
      "Best-price aggregation across Raydium, Orca, and 20+ DEXs for optimal trade execution.",
  },
  {
    icon: "Wallet",
    title: "Multi-Wallet Support",
    description:
      "Connect Phantom, Solflare, Torus and more via Solana Wallet Adapter with seamless UX.",
  },
  {
    icon: "ShieldCheck",
    title: "Security & Compliance",
    description:
      "Built on audited libraries with transfer hooks for policy enforcement and regulatory compliance.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Complete DeFi Infrastructure
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        From token creation to liquidity provision and trading - everything you need to build and scale your DeFi project on Solana.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
