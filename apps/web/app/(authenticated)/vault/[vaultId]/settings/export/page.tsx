'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { useVaults } from '@/context/useVaults';
import { DownloadIcon } from '@radix-ui/react-icons';
import CodeBlock from '@/components/CodeBlock';
import { jsonStringify } from '@/lib/storage';
import CopyButton from '@/components/CopyButton';
import useAnalytics from '@/hooks/useAnalytics';
export default function ExportSettingsPage() {
  const trackEvent = useAnalytics();
  const { vaults } = useVaults();

  const exportVaultsJSON = jsonStringify(vaults);

  return (
    <div className="pb-6 md:py-6 flex flex-col gap-6">
      <Card className="grid md:grid-cols-2 md:px-8 border-0 md:border-1">
        <h3 className="font-display text-lg font-semibold tracking-wide px-2 md:px-0">
          Export Vaults
        </h3>
        <section className="px-2 md:px-6">
          <CardHeader className="px-0">
            <CardTitle className="font-medium">Export Backup File</CardTitle>
            <CardDescription>
              This backup file can be used to import all your vaults onto other
              devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 grid">
            <CodeBlock
              value={exportVaultsJSON}
              className="[&>pre]:!bg-transparent [&>pre]:p-2 bg-secondary border rounded-md mt-4 [&_code]:break-all overflow-scroll max-h-96"
            />
            <br />
            <div className="flex gap-2">
              <Button
                asChild
                data-testid="export-vaults-button"
                onClick={() => {
                  trackEvent('download_backup_file', {});
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
      <br />
    </div>
  );
}
