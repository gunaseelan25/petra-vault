/* eslint-disable react-hooks/rules-of-hooks */

import { test as baseTest } from "@playwright/test";
import { OnboardingFixture } from "./OnboardingFixture";
import WalletFixture from "./WalletFixture";
import { AptosFixture } from "./AptosFixture";
import path from "path";
import { NavigationFixture } from "./NavigationFixture";
import { VaultFixture } from "./VaultFixture";
import { ProposalFixture } from "./ProposalFixture";

export const test = baseTest.extend<{
  onboarding: OnboardingFixture;
  wallet: WalletFixture;
  navigation: NavigationFixture;
  aptos: AptosFixture;
  vault: VaultFixture;
  proposal: ProposalFixture;
}>({
  wallet: async ({ page }, use) => {
    await use(new WalletFixture(page));
  },
  onboarding: async ({ page, wallet, aptos, navigation, vault }, use) => {
    await use(new OnboardingFixture(page, wallet, aptos, navigation, vault));
  },
  aptos: async ({ page, wallet }, use) => {
    await use(new AptosFixture(page, wallet));
  },
  navigation: async ({ page }, use) => {
    await use(new NavigationFixture(page));
  },
  vault: async ({ page, aptos, navigation }, use) => {
    await use(new VaultFixture(page, aptos, navigation));
  },
  proposal: async ({ page, navigation }, use) => {
    await use(new ProposalFixture(page, navigation));
  },
});

test.beforeEach(async ({ page }) => {
  // IMPORTANT: When using `page.goto`, the script will reload causing a fresh set of wallet instances.
  // Please make sure to only call `page.goto` once for the duration of a single test.
  await page.addInitScript({
    path: path.join(process.cwd(), "tests/lib/injection/build/index.global.js"),
  });
});
