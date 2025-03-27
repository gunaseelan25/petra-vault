"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useVaults } from "@/context/useVaults";
import { DownloadIcon } from "@radix-ui/react-icons";
import CodeBlock from "@/components/CodeBlock";
import { jsonStringify } from "@/lib/storage";
import CopyButton from "@/components/CopyButton";
import useAnalytics from "@/hooks/useAnalytics";
export default function ExportSettingsPage() {
  const trackEvent = useAnalytics();
  const { vaults } = useVaults();

  const exportVaultsJSON = jsonStringify(vaults);

  return (
    <div className="py-6 flex flex-col gap-6">
      <Card className="grid grid-cols-2 px-8">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide">
            Export Vaults
          </h3>
        </div>
        <section>
          <CardHeader>
            <CardTitle className="font-medium">Export Backup File</CardTitle>
            <CardDescription>
              This backup file can be used to import all your vaults onto other
              devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto w-full p-2 border rounded-md text-xs mt-4 bg-secondary">
              <CodeBlock
                value={exportVaultsJSON}
                className="[&>pre]:!bg-transparent"
              />
            </div>
            <br />
            <div className="flex gap-2">
              <Button
                asChild
                data-testid="export-vaults-button"
                onClick={() => {
                  trackEvent("download_backup_file", {});
                }}
              >
                <a
                  href={`data:text/json;charset=utf-8,${exportVaultsJSON}`}
                  download="petra-vaults-export.json"
                >
                  <DownloadIcon />
                  Download Backup File
                </a>
              </Button>

              <CopyButton text={exportVaultsJSON} />
            </div>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
