import { AccountAddressInput, Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { Page } from "@playwright/test";
import WalletFixture from "./WalletFixture";

export class AptosFixture {
  constructor(
    private page: Page,
    private wallet: WalletFixture
  ) {}

  async getClient() {
    const network = await this.wallet.getNetwork();

    return new Aptos(new AptosConfig({ network: network.name }));
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
