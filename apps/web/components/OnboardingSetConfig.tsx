import { Card, CardContent } from "./ui/card";
import MultisigConfigurationsForm from "./forms/VaultConfigurationsForm";
import { useOnboarding } from "@/context/OnboardingProvider";

export default function OnboardingSetConfig() {
  const { page, vaultSignaturesRequired, vaultSigners } = useOnboarding();

  return (
    <Card>
      <CardContent>
        <MultisigConfigurationsForm
          onSubmit={(values) => {
            vaultSigners.set(values.signers);
            vaultSignaturesRequired.set(values.signaturesRequired);
            page.set("review");
          }}
        />
      </CardContent>
    </Card>
  );
}
