import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  selectedFile: File | null;
}

export function FileUpload({
  onFileSelect,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  selectedFile,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    onFileSelect(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        flex flex-col items-center justify-center mb-6 p-8 border-2 border-dashed 
        rounded-lg transition-colors duration-200
        ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".riv"
        onChange={handleFileChange}
        className="hidden"
        id="rive-file-input"
      />
      <div className="text-center mb-4">
        <FileIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <h3 className="font-medium text-lg">Drop your Rive file here</h3>
        <p className="text-sm text-gray-500">or</p>
      </div>
      <Button onClick={triggerFileInput} variant="default">
        <FileIcon className="mr-2 h-4 w-4" />
        Choose Rive File
      </Button>
      {selectedFile && (
        <p className="mt-4 text-sm">
          Selected: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}
    </div>
  );
}
