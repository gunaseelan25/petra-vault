import {
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Network
} from '@aptos-labs/ts-sdk';
import { Page } from '@playwright/test';
import WalletFixture from './WalletFixture';

export class AptosFixture {
  constructor(
    private page: Page,
    private wallet: WalletFixture
  ) {}

  async getClient() {
    const network = await this.wallet.getNetwork();

    const apiKey = (
      {
        [Network.DEVNET]: process.env.NEXT_PUBLIC_APTOS_DEVNET_API_KEY,
        [Network.TESTNET]: process.env.NEXT_PUBLIC_APTOS_TESTNET_API_KEY,
        [Network.MAINNET]: process.env.NEXT_PUBLIC_APTOS_MAINNET_API_KEY
      } as Record<Network, string | undefined>
    )[network.name];

    return new Aptos(
      new AptosConfig({
        network: network.name,
        clientConfig: {
          API_KEY: apiKey
        }
      })
    );
  }

  async fundAccount(address: AccountAddressInput, amount: number) {
    const aptos = await this.getClient();

    await aptos.faucet.fundAccount({ accountAddress: address, amount });
  }

  async getAccountAPTAmount(address: AccountAddressInput) {
    const aptos = await this.getClient();

    return await aptos.getAccountAPTAmount({ accountAddress: address });
  }

  async getAccountModules(address: AccountAddressInput) {
    const aptos = await this.getClient();

    return await aptos.getAccountModules({ accountAddress: address });
  }
}
