import { useState } from "react";
import DropZone from "../DropZone";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { storageOptionsSerializers } from "@/lib/storage";
import { Vault, VaultSchema } from "@/lib/types/vaults";
import { z, ZodError } from "zod";
import { useClients } from "@aptos-labs/react";
import { Button } from "../ui/button";

export interface UploadImportJSONModalProps {
  onImport: (vaults: Vault[]) => void;
}

export default function UploadImportJSONModal({
  onImport,
}: UploadImportJSONModalProps) {
  const { client } = useClients();

  const [file, setFile] = useState<File>();

  const {
    data: vaults,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["import-vaults", file?.name, file?.lastModified],
    queryFn: async () => {
      if (!file) throw new Error("File not found.");
      const rawJson = await file?.text();

      const parsedJson = JSON.parse(rawJson, storageOptionsSerializers.reviver);

      const vaults = z.array(VaultSchema).parse(parsedJson);

      // Check if all the vaults are MultisigAccount's
      try {
        await Promise.all(
          vaults.map((e) =>
            client.fetchResourceType<object>({
              resourceType: "0x1::multisig_account::MultisigAccount",
              accountAddress: e.address,
              network: { network: e.network },
            })
          )
        );
      } catch {
        throw new Error(
          "One or more accounts in the JSON is not a MultisigAccount"
        );
      }

      return vaults;
    },
    enabled: !!file,
    retry: 1,
  });

  const handleImport = () => {
    if (!vaults) return;
    onImport(vaults);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Import JSON</DialogTitle>
        <DialogDescription>
          Upload your JSON file to import your vaults.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center">
        <br />
        <DropZone
          title="Upload JSON"
          description="Upload your JSON file to import your vaults."
          onFileUpload={setFile}
          className="w-full"
        />
        <br />
        <DialogClose asChild>
          <Button
            className="w-full"
            disabled={!vaults}
            isLoading={isLoading}
            onClick={handleImport}
            data-testid="confirm-import-vaults-json-button"
          >
            {!vaults && "Upload a JSON File"}
            {vaults &&
              `Import ${vaults.length} vault${vaults.length > 1 ? "s" : ""}`}
          </Button>
        </DialogClose>
        {error && (
          <p className="text-destructive text-sm mt-4">
            {error instanceof ZodError
              ? "The JSON is not in a proper format."
              : error.message}
          </p>
        )}
      </div>
    </DialogContent>
  );
}
