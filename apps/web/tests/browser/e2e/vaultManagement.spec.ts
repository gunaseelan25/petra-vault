import { Ed25519Account, Network } from '@aptos-labs/ts-sdk';
import { test } from './fixtures';

test('add a second owner', async ({
  onboarding,
  vault,
  navigation,
  page,
  proposal
}) => {
  const alice = Ed25519Account.generate();
  const bob = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice]);

  await proposal.createAddOwnerProposal('Bob', bob.accountAddress);

  await navigation.navigateToPendingTransaction(1);

  await page.getByTestId('execute-transaction-button').click();

  await page.getByTestId('pending-transactions-empty').click();

  await vault.verifyOwnersAndSignaturesRequired([alice, bob], 1);
});

test('remove one of two owners', async ({
  onboarding,
  vault,
  navigation,
  page,
  proposal
}) => {
  const alice = Ed25519Account.generate();
  const bob = Ed25519Account.generate();

  await onboarding.connectWallet(alice, Network.DEVNET);

  await onboarding.createNewVault([alice, bob], 1);

  await proposal.createRemoveOwnerProposal(bob.accountAddress);

  await navigation.navigateToPendingTransaction(1);

  await page.getByTestId('execute-transaction-button').click();

  await page.getByTestId('pending-transactions-empty').click();

  await vault.verifyOwnersAndSignaturesRequired([alice], 1);
});
