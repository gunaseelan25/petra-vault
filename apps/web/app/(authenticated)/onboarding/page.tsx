'use client';

import { useOnboarding } from '@/context/OnboardingProvider';
import OnboardingAddOrImport from '@/components/OnboardingAddOrImport';
import VerticalCutReveal from '@/components/ui/vertical-cut-reveal';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import OnboardingImportSetName from '@/components/OnboardingImportSetName';
import OnboardingSetConfig from '@/components/OnboardingSetConfig';
import OnboardingReview from '@/components/OnboardingReview';
export default function OnboardingPage() {
  const { page } = useOnboarding();

  const goBackRoutes = {
    'set-name': 'add-or-import',
    'set-config': 'add-or-import',
    review: 'set-config',
    'not-found': 'add-or-import'
  } as const;

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="max-w-lg w-full flex flex-col gap-2 items-center">
        <h1 className="font-display text-2xl font-bold">
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.02}
            staggerFrom="first"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 21
            }}
          >
            Welcome to Petra Vault
          </VerticalCutReveal>
        </h1>
        <p className="text-muted-foreground">
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.02}
            staggerFrom="first"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 21
            }}
          >
            Create or import a vault to get started
          </VerticalCutReveal>
        </p>
        <br />

        <div className="w-full">
          {page.current === 'add-or-import' ? (
            <OnboardingAddOrImport key="add-or-import" />
          ) : page.current === 'set-name' ? (
            <OnboardingImportSetName key="set-name" />
          ) : page.current === 'set-config' ? (
            <OnboardingSetConfig key="set-config" />
          ) : page.current === 'review' ? (
            <OnboardingReview key="review" />
          ) : (
            <div>
              <h1>Page not found</h1>
            </div>
          )}
        </div>

        {page.current in goBackRoutes && (
          <div className="w-full flex justify-start">
            <Button
              variant="ghost"
              onClick={() => {
                page.set(
                  goBackRoutes[page.current as keyof typeof goBackRoutes]
                );
              }}
            >
              <ArrowLeftIcon />
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
