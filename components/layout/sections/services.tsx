import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

enum ProService {
  YES = 1,
  NO = 0,
}
interface ServiceProps {
  title: string;
  pro: ProService;
  description: string;
}
const serviceList: ServiceProps[] = [
  {
    title: "Token-2022 Minting",
    description: "Create advanced tokens with transfer hooks, metadata, and programmable logic in minutes.",
    pro: 1,
  },
  {
    title: "Liquidity Pool Creation",
    description: "Launch SOL/token pools with automated market making and initial liquidity seeding.",
    pro: 1,
  },
  {
    title: "AMM Trading Interface",
    description: "Advanced trading with real-time pricing, slippage protection, and multi-pool routing.",
    pro: 1,
  },
  {
    title: "Jupiter DEX Aggregation",
    description: "Best-price routing across 20+ DEXs including Raydium, Orca, and more for optimal execution.",
    pro: 1,
  },
  {
    title: "Wallet Integration",
    description: "Seamless connection with Phantom, Solflare, Torus and other Solana wallets.",
    pro: 1,
  },
  {
    title: "Transfer Hook Security",
    description: "Programmable transfer logic for KYC, whitelisting, and regulatory compliance.",
    pro: 1,
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Services
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Professional DeFi Solutions
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Enterprise-grade infrastructure for token creation, liquidity provision, and automated market making on Solana.
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-[80%] mx-auto">
        {serviceList.map(({ title, description, pro }) => (
          <Card
            key={title}
            className="bg-muted/60 dark:bg-card h-full relative"
          >
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <Badge
              data-pro={ProService.YES === pro}
              variant="secondary"
              className="absolute -top-2 -right-3 data-[pro=false]:hidden"
            >
              PRO
            </Badge>
          </Card>
        ))}
      </div>
    </section>
  );
};
