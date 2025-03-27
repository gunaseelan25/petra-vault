import { expect } from '@playwright/test';
import { test } from './fixtures';
import {
  AccountAddressInput,
  Ed25519Account,
  Network
} from '@aptos-labs/ts-sdk';

test('create a new vault', async ({ onboarding }) => {
  const alice = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice]);
});

test('create two vaults', async ({ onboarding, navigation, wallet, vault }) => {
  const alice = Ed25519Account.generate();
  const vaultAddresses: AccountAddressInput[] = [];

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice], 1);

  vaultAddresses.push(await vault.getVaultAddress());

  await navigation.navigateToCreateVault();

  await onboarding.createNewVault([alice], 1);

  vaultAddresses.push(await vault.getVaultAddress());

  const network = await wallet.getNetwork();

  await vault.verifyVaultsExists(
    vaultAddresses.map((address) => ({ address, network: network.name }))
  );
});

test('create a new vault with a second owner', async ({ onboarding }) => {
  const alice = Ed25519Account.generate();
  const bob = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice, bob], 1);
});

test('create a new vault with a second owner with two signatures required', async ({
  onboarding
}) => {
  const alice = Ed25519Account.generate();
  const bob = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice, bob], 2);
});

test('download and import vaults from JSON', async ({
  onboarding,
  vault,
  page
}) => {
  const alice = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice], 1);

  const vaultAddress = await vault.getVaultAddress();

  const jsonFilePath = await vault.downloadVaultsJSON();

  await vault.deleteVault();

  await onboarding.importVaultsWithJSON(jsonFilePath);

  await page.getByTestId(`vault-row-${vaultAddress}`).click();

  await page.waitForURL(/\/vault\/devnet:/);

  expect(vaultAddress).toBe(await vault.getVaultAddress());
});
