import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { FileIcon, UploadIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface DropZoneProps {
  onFileUpload: (file: File) => void;
  title: string;
  description: string;
  className?: string;
  disabled?: boolean;
}

export default function DropZone({
  onFileUpload,
  title,
  description,
  className,
  disabled,
}: DropZoneProps) {
  const {
    acceptedFiles,
    getRootProps,
    isFocused,
    isDragActive,
    getInputProps,
    isDragReject,
  } = useDropzone({
    multiple: false,
    accept: { "application/json": [".json"] },
    onDropAccepted: (acceptedFiles) => {
      onFileUpload(acceptedFiles[0]!);
    },
    disabled,
  });

  const hasFile = acceptedFiles.length > 0 && acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center border border-dashed rounded-md p-4 py-8 gap-4 bg-secondary/20 transition-all",
        (isFocused || isDragActive) && "border-primary",
        className
      )}
    >
      <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
        <UploadIcon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center flex flex-col gap-1">
        <p className="font-semibold font-display">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <AnimatePresence mode="wait">
        {hasFile ? (
          <motion.div
            key={`has-file-${acceptedFiles[0]!.name}`}
            initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="outline" size="lg" disabled={disabled}>
              <FileIcon />
              {acceptedFiles[0]?.name}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="no-file"
            initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
          >
            <Button size="lg" disabled={disabled}>
              <UploadIcon />
              {hasFile ? "Replace JSON" : "Upload JSON"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {isDragReject && (
        <p className="text-sm text-destructive">
          Invalid file type. Please upload a JSON file.
        </p>
      )}
      <input
        {...getInputProps()}
        className="cursor-pointer hidden"
        data-testid="drop-zone"
      />
    </div>
  );
}
