"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Alex Chen",
    userName: "DeFi Protocol Founder",
    comment:
      "This platform revolutionized our token launch. The Token-2022 creation with transfer hooks made our project compliant and secure from day one. The AMM integration was seamless!",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Maria Rodriguez",
    userName: "Smart Contract Developer",
    comment:
      "As a developer, I love how easy it is to create and deploy tokens with transfer hooks. The Jupiter integration ensures our users always get the best prices across all DEXs.",
    rating: 4.8,
  },

  {
    image: "https://github.com/shadcn.png",
    name: "David Kim",
    userName: "DeFi Investor",
    comment:
      "The liquidity pool creation process is incredibly user-friendly. I was able to launch my token and create a trading pool in under 30 minutes. The UI is intuitive and the features are comprehensive.",
    rating: 4.9,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah Thompson",
    userName: "Crypto Trader",
    comment:
      "The AMM trading interface is excellent. Real-time pricing, low slippage, and the Jupiter aggregation ensures I always get the best execution. This is exactly what DeFi should be.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Michael Chang",
    userName: "DeFi Researcher",
    comment:
      "The transfer hook functionality is game-changing for regulatory compliance. We can now enforce KYC and whitelisting without sacrificing decentralization. Brilliant implementation!",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lisa Wang",
    userName: "Blockchain Developer",
    comment:
      "The modular architecture and comprehensive documentation made it easy to customize the platform for our specific needs. The Solana integration is rock solid and performant.",
    rating: 4.9,
  },
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          Testimonials
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          What DeFi Builders Say
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem
              key={review.name}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card">
                <CardContent className="pt-6 pb-0">
                  <div className="flex gap-1 pb-6">
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/75042455?v=4"
                        alt="radix"
                      />
                      <AvatarFallback>SV</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
