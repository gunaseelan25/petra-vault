import { Event, WriteSetChange } from '@aptos-labs/ts-sdk';
import { SimulationContext } from '@/lib/simulations/parsers/SimulationParser';

export interface EventParser {
  parseEvent: (context: SimulationContext, event: Event) => boolean;
}

export interface WritesetParser {
  parseChange: (context: SimulationContext, change: WriteSetChange) => boolean;
}
