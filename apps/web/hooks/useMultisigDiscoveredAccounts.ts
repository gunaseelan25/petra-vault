import { NetworkInfo } from '@aptos-labs/js-pro';
import { useAptosCore } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseMultisigDiscoveredAccountResult = AccountAddress[];

interface UseMultisigDiscoveredAccountsParameters
  extends Omit<
    UseQueryOptions<UseMultisigDiscoveredAccountResult>,
    'queryFn' | 'queryKey'
  > {
  address?: string;
  network?: NetworkInfo;
}

export default function useMultisigDiscoveredAccounts({
  address,
  network,
  ...options
}: UseMultisigDiscoveredAccountsParameters) {
  const core = useAptosCore();

  const activeNetwork = network ?? core.network;

  const enabled = Boolean(address && (options.enabled ?? true));

  const query = useQuery<UseMultisigDiscoveredAccountResult>({
    staleTime: 1000 * 60 * 1,
    ...options,
    enabled,
    queryKey: ['multisig-discovered-accounts', address, activeNetwork],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');

      const { aptos } = core.client.getClients({ network });

      // TODO: Add pagination
      const events = await aptos.getEvents({
        options: {
          orderBy: [{ transaction_version: 'asc' }],
          where: {
            indexed_type: {
              _in: [
                '0x1::multisig_account::AddOwners',
                '0x1::multisig_account::RemoveOwners',
                '0x1::multisig_account::Vote'
              ]
            },
            _or: [
              {
                data: { _contains: { owners_added: [address] } }
              },
              {
                data: {
                  _contains: { owners_removed: [address] }
                }
              },
              { data: { _contains: { owner: address } } }
            ]
          }
        }
      });

      // TODO: Add pagination
      const creationTransactions = await core.client.fetchAccountTransactions({
        address,
        where: {
          user_transaction: {
            entry_function_id_str: {
              _eq: '0x1::multisig_account::create_with_owners'
            }
          }
        }
      });

      // TODO: Add pagination
      const creationMultisigRegisterEvents = await aptos.getEvents({
        options: {
          orderBy: [{ transaction_version: 'desc' }],
          where: {
            indexed_type: {
              _in: [
                '0x1::account::CoinRegister',
                '0x1::account::CoinRegisterEvent'
              ]
            },
            transaction_version: {
              _in: creationTransactions.transactions.map((t) =>
                Number(t.transactionVersion)
              )
            }
          }
        }
      });

      const discoveredAccounts: {
        [account: string]: { hasVoted: boolean };
      } = {};

      creationTransactions.transactions.forEach((transaction) => {
        const multisigRegisterEvent = creationMultisigRegisterEvents.find(
          (t) =>
            t.transaction_version === Number(transaction.transactionVersion)
        );

        if (!multisigRegisterEvent) return;

        discoveredAccounts[
          multisigRegisterEvent.data.account ??
            multisigRegisterEvent.account_address
        ] = { hasVoted: true };
      });

      events.forEach((event) => {
        if (event.indexed_type === '0x1::multisig_account::AddOwners') {
          discoveredAccounts[event.data.multisig_account] = {
            hasVoted: false
          };
        }

        if (event.indexed_type === '0x1::multisig_account::RemoveOwners') {
          delete discoveredAccounts[event.data.multisig_account];
        }

        if (event.indexed_type === '0x1::multisig_account::Vote') {
          discoveredAccounts[event.data.multisig_account] = {
            hasVoted: true
          };
        }
      });

      return Object.keys(discoveredAccounts).map((account) =>
        AccountAddress.from(account)
      );
    }
  });

  return query;
}
