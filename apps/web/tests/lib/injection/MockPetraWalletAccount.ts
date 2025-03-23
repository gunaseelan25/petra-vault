import {
  AccountAddress,
  Ed25519PublicKey,
  PublicKey,
  SigningScheme,
} from "@aptos-labs/ts-sdk";
import {
  AccountInfo,
  APTOS_CHAINS,
  AptosWalletAccount,
} from "@aptos-labs/wallet-standard";

export default class MockPetraWalletAccount implements AptosWalletAccount {
  readonly chains = APTOS_CHAINS;

  get address() {
    return this.#address.toString();
  }

  get publicKey() {
    return this.#publicKey.toUint8Array();
  }

  get signingScheme() {
    if (this.#publicKey instanceof Ed25519PublicKey) {
      return SigningScheme.Ed25519;
    }
    throw new Error("Unsupported public key type");
  }

  readonly label?: string;

  readonly features = [];

  readonly #address: AccountAddress;

  readonly #publicKey: PublicKey;

  constructor({ address, ansName, publicKey }: AccountInfo) {
    this.#publicKey = publicKey;
    this.#address = address;
    this.label = ansName;
  }
}
