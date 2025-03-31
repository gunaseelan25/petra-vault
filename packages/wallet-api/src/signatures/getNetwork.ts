export interface GetNetworkRequestSignature {
  args?: undefined;
  method: 'getNetwork';
}

export interface GetNetworkResponseArgs {
  chainId: string;
  name: string;
  url: string;
}
