"use client";

import { cn } from "@/lib/utils";
import { WalletSelector } from "./WalletSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { connected, account } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected && account) {
      router.push("/");
    }
  }, [connected, router, account]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Get Started</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Connect your wallet to create a new Petra Vault or open an existing
          one
        </p>
      </div>
      <div className="flex items-centers justify-center">
        <WalletSelector />
      </div>
    </div>
  );
}
