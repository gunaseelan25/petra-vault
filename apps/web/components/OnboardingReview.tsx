import { useOnboarding } from "@/context/OnboardingProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { AptosAvatar } from "aptos-avatars-react";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";

export default function OnboardingReview() {
  const {
    vaultName,
    vaultSigners,
    vaultSignaturesRequired,
    createVault,
    isSigningAndSubmittingCreation,
    isWaitingForCreationTransaction,
  } = useOnboarding();

  return (
    <Card className="w-full">
      <CardHeader className="border-b-1 pb-4">
        <CardTitle>Review</CardTitle>
        <CardDescription>Review your vault configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-semibold font-display">Name</p>
            <p>{vaultName.current}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold font-display">Signers</p>
            <div className="grid grid-cols-2 gap-2">
              {vaultSigners.current.map((e) => (
                <div
                  key={e.address.toString()}
                  className="flex items-center gap-2 mt-2"
                >
                  <AptosAvatar value={e.address.toString()} size={20} />
                  <p className="font-display text-sm font-medium ml-1">
                    {truncateAddress(e.address.toString())}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold font-display">Signatures Required</p>
            <p>
              {vaultSignaturesRequired.current} signature
              {vaultSignaturesRequired.current === 1 ? "" : "s"} out of{" "}
              {vaultSigners.current.length} owner
              {vaultSigners.current.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col border-t-1 pt-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium font-display">Before we continue...</h2>
          <p className="text-sm text-muted-foreground">
            You will need to sign a transaction to create your vault. This will
            cost you some gas.
          </p>
        </div>
        <br />
        <Button
          onClick={createVault}
          className="w-full"
          isLoading={
            isSigningAndSubmittingCreation || isWaitingForCreationTransaction
          }
          data-testid="sign-and-submit-create-vault-button"
        >
          Create Vault
        </Button>
      </CardFooter>
    </Card>
  );
}
