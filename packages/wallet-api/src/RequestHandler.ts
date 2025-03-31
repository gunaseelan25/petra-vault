import { PetraApiResponse } from './response';

export interface RequestHandler {
  handleRequest(request: MessageEvent): Promise<PetraApiResponse | null>;
}
