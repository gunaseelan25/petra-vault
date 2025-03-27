export interface ModuleViewReturnTypeMap {
  '0x1::multisig_account::get_pending_transactions': [
    {
      creation_time_secs: string;
      creator: string;
      payload: { vec: string[] };
      payload_hash: { vec: string[] };
      votes: { data: { key: string; value: boolean }[] };
    }[]
  ];
  '0x1::multisig_account::last_resolved_sequence_number': [string];
  '0x1::multisig_account::get_transaction': [
    {
      creation_time_secs: string;
      creator: string;
      payload: { vec: string[] };
      payload_hash: { vec: string[] };
      votes: { data: { key: string; value: boolean }[] };
    }
  ];
  '0x1::multisig_account::can_be_executed': [boolean];
  '0x1::multisig_account::owners': [string[]];
  '0x1::multisig_account::num_signatures_required': [string];
}

export type ModuleViewReturnType<T extends keyof ModuleViewReturnTypeMap> =
  ModuleViewReturnTypeMap[T];
