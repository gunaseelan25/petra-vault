import {
  AccountAddress,
  Aptos,
  Ed25519PublicKey,
  NetworkToChainId,
  NetworkToNodeAPI
} from '@aptos-labs/ts-sdk';
import {
  ApprovalClient,
  ConnectResponseArgs,
  deserializeSignAndSubmitTransactionRequestArgs,
  GetAccountResponseArgs,
  GetNetworkResponseArgs,
  IsConnectedResponseArgs,
  isPetraVaultApiRequest,
  makePetraApiResponse,
  PetraApiError,
  PetraApiResponse,
  PetraApiResponseArgs,
  RequestHandler,
  SignAndSubmitTransactionRequestSignature,
  SignAndSubmitTransactionResponseArgs
} from '@aptos-labs/wallet-api';

interface PetraVaultRequestHandlerOptions {
  aptos: Aptos;
  vaultAddress: AccountAddress;
  approvalClient: ApprovalClient;
}

export class PetraVaultRequestHandler implements RequestHandler {
  constructor(readonly options: PetraVaultRequestHandlerOptions) {}

  async handleRequest(message: MessageEvent): Promise<PetraApiResponse | null> {
    const request = message.data;

    if (!isPetraVaultApiRequest(request) || message.origin === undefined) {
      return null;
    }

    try {
      let responseArgs: PetraApiResponseArgs;

      switch (request.method) {
        case 'connect':
          responseArgs = await this.connect();
          break;
        case 'getAccount':
          responseArgs = await this.getAccount();
          break;
        case 'getNetwork':
          responseArgs = await this.getNetwork();
          break;
        case 'isConnected':
          responseArgs = await this.isConnected();
          break;
        case 'signAndSubmitTransaction':
          responseArgs = await this.signAndSubmitTransaction(request);
          break;
        default:
          throw PetraApiError.UNSUPPORTED;
      }

      return makePetraApiResponse(request.id, responseArgs);
    } catch (error) {
      console.error(JSON.stringify(error));

      // Send back PetraApiErrors as-is
      if (error instanceof PetraApiError) {
        return makePetraApiResponse(request.id, error);
      }

      // Internal unexpected error.
      // We log it in the context of the server (hidden from the dapp) for debugging purposes
      // and send back a generic internal error.

      console.error(error);
      return makePetraApiResponse(request.id, PetraApiError.INTERNAL_ERROR);
    }
  }

  async isConnected(): Promise<IsConnectedResponseArgs> {
    return true;
  }

  async getAccount(): Promise<GetAccountResponseArgs> {
    return {
      address: this.options.vaultAddress.toString(),
      publicKey: new Ed25519PublicKey(new Uint8Array(32)).toString()
    };
  }

  async connect(): Promise<ConnectResponseArgs> {
    return {
      address: this.options.vaultAddress.toString(),
      publicKey: new Ed25519PublicKey(new Uint8Array(32)).toString()
    };
  }

  async getNetwork(): Promise<GetNetworkResponseArgs> {
    const networkName = this.options.aptos.config.network;
    return {
      chainId: (
        NetworkToChainId[this.options.aptos.config.network] ??
        (await this.options.aptos.getChainId())
      ).toString(),
      name: networkName.charAt(0).toUpperCase() + networkName.slice(1),
      url:
        NetworkToNodeAPI[this.options.aptos.config.network] ??
        this.options.aptos.config.fullnode ??
        'https://api.mainnet.aptoslabs.com/v1'
    };
  }

  async signAndSubmitTransaction(
    request: SignAndSubmitTransactionRequestSignature
  ): Promise<SignAndSubmitTransactionResponseArgs> {
    const args = deserializeSignAndSubmitTransactionRequestArgs(request.args);

    const response = await this.options.approvalClient.request({
      method: request.method,
      args
    });

    if (response.status === 'approved') {
      return response.args;
    } else if (
      response.status === 'rejected' ||
      response.status === 'dismissed'
    ) {
      throw PetraApiError.USER_REJECTION;
    } else if (response.status === 'timeout') {
      throw PetraApiError.TIMEOUT;
    }

    throw PetraApiError.INTERNAL_ERROR;
  }
}
