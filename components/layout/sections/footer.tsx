import { Separator } from "@/components/ui/separator";
import { ChevronsDownIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SuperteamVN from "@/image.png";

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex font-bold items-center">
              <ChevronsDownIcon className="w-9 h-9 mr-2 bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg border border-secondary" />

              <h3 className="text-2xl">DeFi Platform</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Platform</h3>
            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                Create Token
              </Link>
            </div>

            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                Launch Pool
              </Link>
            </div>

            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                Trade Tokens
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">DeFi Services</h3>
            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                AMM Trading
              </Link>
            </div>
            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                Jupiter Integration
              </Link>
            </div>
            <div>
              <Link href="/dashboard" className="opacity-60 hover:opacity-100">
                Transfer Hooks
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Resources</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Documentation
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                API Reference
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Tutorials
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Community</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Discord
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Twitter
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                GitHub
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Support</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Help Center
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Contact Us
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Bug Report
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="w-full flex items-center justify-center gap-3 text-sm md:text-base mb-4">
          <Image
            src={SuperteamVN}
            alt="Superteam Vietnam"
            width={28}
            height={28}
            className="rounded-md border border-secondary"
          />
          <span className="opacity-80">
            Powered by the <span className="font-semibold">Superteam Vietnam</span>
          </span>
        </div>

        <section className="">
          <h3 className="">
            &copy; 2024 DeFi Platform - Built on Solana AMM/DEX components
            <Link
              target="_blank"
              href="https://github.com/rishavmehra"
              className="text-primary transition-all border-primary hover:border-b-2 ml-1"
            >
              by Rishav Mehra
            </Link>
          </h3>
        </section>
      </div>
    </footer>
  );
};
