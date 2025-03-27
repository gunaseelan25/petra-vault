import { Ed25519Account, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk';
import { MockPetraWallet } from './MockPetraWallet';

/**
 * This class can be stored in Window to transport non-serializable objects
 * like account and network objects from the MockPetraWallet instance.
 */
export class MockPetraTransport {
  constructor(private readonly wallet: MockPetraWallet) {}

  async getAccount() {
    const account = await this.wallet.getAccount();
    return {
      address: account.address.toString(),
      publicKey: account.publicKey.toString(),
      type: 'ed25519'
    };
  }

  async getAccounts() {
    return this.wallet.accounts.map((account) => ({
      address: account.address.toString(),
      publicKey: account.publicKey.toString(),
      type: 'ed25519'
    }));
  }

  async getNetwork() {
    const network = await this.wallet.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId,
      url: network.url
    };
  }

  async getAccountPrivateKey() {
    return this.wallet.getAccountPrivateKey();
  }

  async setAccountWithPrivateKey(privateKey: string) {
    await this.wallet.setAccount(
      new Ed25519Account({
        privateKey: new Ed25519PrivateKey(privateKey)
      })
    );
  }

  async setNetwork(network: Network) {
    await this.wallet.setNetwork(network);
  }
}
