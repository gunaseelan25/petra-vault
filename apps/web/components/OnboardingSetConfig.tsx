import { Card, CardContent } from './ui/card';
import MultisigConfigurationsForm from './forms/VaultConfigurationsForm';
import { useOnboarding } from '@/context/OnboardingProvider';
import useAnalytics from '@/hooks/useAnalytics';

export default function OnboardingSetConfig() {
  const trackEvent = useAnalytics();

  const { page, vaultSignaturesRequired, vaultSigners } = useOnboarding();

  return (
    <Card className="pb-12">
      <CardContent>
        <MultisigConfigurationsForm
          onSubmit={(values) => {
            vaultSigners.set(values.signers);
            vaultSignaturesRequired.set(values.signaturesRequired);
            page.set('review');
            trackEvent('set_vault_config', {
              signatures_required: values.signaturesRequired,
              owners: values.signers.length
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
