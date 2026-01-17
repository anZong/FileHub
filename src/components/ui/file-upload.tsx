import * as React from "react";
import {
  Upload,
  X,
  FileIcon,
  Image,
  Music,
  Video,
  FileText,
  Archive,
} from "lucide-react";
import { cn, formatFileSize, getFileType } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  multiple = false,
  maxSize = 100 * 1024 * 1024,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => file.size <= maxSize);
    setSelectedFiles(validFiles);
    onFileSelect(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file.name);
    const iconProps = { className: "w-8 h-8" };
    switch (type) {
      case "image":
        return <Image {...iconProps} className="w-8 h-8 text-image" />;
      case "audio":
        return <Music {...iconProps} className="w-8 h-8 text-audio" />;
      case "video":
        return <Video {...iconProps} className="w-8 h-8 text-video" />;
      case "document":
        return <FileText {...iconProps} className="w-8 h-8 text-document" />;
      case "archive":
        return <Archive {...iconProps} className="w-8 h-8 text-archive" />;
      default:
        return (
          <FileIcon {...iconProps} className="w-8 h-8 text-muted-foreground" />
        );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn("upload-zone", isDragging && "active")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">
            拖拽文件到此处或 <span className="text-primary">点击上传</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            支持最大 {formatFileSize(maxSize)} 的文件
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
