import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is Token-2022 and why should I use it?",
    answer: "Token-2022 is Solana's advanced token standard that includes programmable transfer hooks, metadata extensions, and enhanced security features. It's the recommended standard for new DeFi projects as it provides better security, compliance capabilities, and extensibility compared to the original SPL Token standard.",
    value: "item-1",
  },
  {
    question: "How do transfer hooks work and what are they used for?",
    answer: "Transfer hooks are programmable functions that execute before every token transfer. They can be used for KYC verification, whitelisting, fee collection, or any custom logic you want to enforce. This makes tokens more secure and compliant with regulatory requirements.",
    value: "item-2",
  },
  {
    question: "What is the difference between AMM and traditional order book trading?",
    answer: "AMM (Automated Market Maker) uses mathematical formulas and liquidity pools to determine prices automatically, while traditional order books match buy/sell orders. AMMs provide continuous liquidity, lower fees, and are more suitable for DeFi applications. Our platform uses advanced AMM algorithms for optimal trading.",
    value: "item-3",
  },
  {
    question: "How does Jupiter integration improve my trading experience?",
    answer: "Jupiter aggregates liquidity from 20+ DEXs including Raydium, Orca, and others to find the best prices and routes for your trades. This ensures you get the most favorable rates and lowest slippage across the entire Solana ecosystem.",
    value: "item-4",
  },
  {
    question: "Is this platform suitable for production DeFi applications?",
    answer: "Yes! Our platform is built on audited libraries and follows Solana best practices. We support both devnet for testing and mainnet for production deployments. The modular architecture allows you to customize components for your specific needs.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          DeFi Platform Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
