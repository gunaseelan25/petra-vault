import { MockPetraTransport } from './MockPetraTransport';
import { MockPetraWallet } from './MockPetraWallet';
import { registerWallet } from '@aptos-labs/wallet-standard';

declare global {
  interface Window {
    mockPetra: MockPetraWallet;
    mockPetraTransport: MockPetraTransport;
  }
}

const wallet = new MockPetraWallet();

window.mockPetraTransport = new MockPetraTransport(wallet);

window.mockPetra = wallet;

registerWallet(wallet);
