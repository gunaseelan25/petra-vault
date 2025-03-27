import {
  Ed25519Account,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Hex,
  Network
} from '@aptos-labs/ts-sdk';
import { AccountInfo, NetworkInfo } from '@aptos-labs/wallet-standard';
import { Page } from '@playwright/test';

/**
 * IMPORTANT: This fixture requires that there be one navigation at the beginning of each test.
 * Calling `page.goto` multiple times will cause the wallets to be re-initialized leading to a
 * different set of accounts.
 */
export default class WalletFixture {
  constructor(private page: Page) {}

  /**
   * Initializes the wallet with the given account and network.
   *
   * IMPORTANT: This method must be called after `page.goto` has been called. You must only call
   * `page.goto` once for the duration of a single test or this method will return an account
   * from a different test.
   */
  async init(account: Ed25519Account, network: Network) {
    await this.setAccount(account);
    await this.setNetwork(network);
  }

  /**
   * Returns the current account.
   *
   * IMPORTANT: This method must be called after `page.goto` has been called. You must only call
   * `page.goto` once for the duration of a single test or this method will return an account
   * from a different test.
   *
   * @returns The current account.
   */
  async getAccount() {
    const account = await this.page.evaluate(async () =>
      window.mockPetraTransport.getAccount()
    );

    return new AccountInfo({
      address: account.address,
      publicKey: new Ed25519PublicKey(
        Hex.fromHexInput(account.publicKey).toUint8Array()
      )
    });
  }

  /**
   * Returns all accounts.
   *
   * IMPORTANT: This method must be called after `page.goto` has been called. You must only call
   * `page.goto` once for the duration of a single test or this method will return a different
   * set of accounts.
   */
  async getAccounts() {
    const accounts = await this.page.evaluate(async () =>
      window.mockPetraTransport.getAccounts()
    );

    return accounts.map(
      (account) =>
        new AccountInfo({
          address: account.address,
          publicKey: new Ed25519PublicKey(
            Hex.fromHexInput(account.publicKey).toUint8Array()
          )
        })
    );
  }

  /**
   * Returns the current signer.
   *
   * IMPORTANT: This method must be called after `page.goto` has been called. You must only call
   * `page.goto` once for the duration of a single test or this method will return a signer
   * from a different test.
   *
   * @returns The current signer.
   */
  async getSigner() {
    const privateKey = await this.page.evaluate(async () =>
      window.mockPetraTransport.getAccountPrivateKey()
    );

    return new Ed25519Account({
      privateKey: new Ed25519PrivateKey(privateKey)
    });
  }

  /**
   * Returns the current network.
   *
   * IMPORTANT: This method must be called after `page.goto` has been called. You must only call
   * `page.goto` once for the duration of a single test or this method will return a network
   * from a different test.
   *
   * @returns The current network.
   */
  async getNetwork() {
    const network = await this.page.evaluate(async () =>
      window.mockPetraTransport.getNetwork()
    );

    return {
      name: network.name,
      chainId: network.chainId,
      url: network.url
    } satisfies NetworkInfo;
  }

  async setAccount(account: Ed25519Account) {
    await this.page.evaluate(async (privateKey) => {
      await window.mockPetraTransport.setAccountWithPrivateKey(privateKey);
    }, account.privateKey.toAIP80String());
  }

  async setNetwork(name: Network) {
    await this.page.evaluate(async (name) => {
      await window.mockPetraTransport.setNetwork(name);
    }, name);
  }
}
