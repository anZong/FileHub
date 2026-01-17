import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
    .toLowerCase();
}

export function getFileType(
  filename: string
): "image" | "audio" | "video" | "document" | "archive" | "unknown" {
  const ext = getFileExtension(filename);

  const imageExts = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
    "ico",
    "tiff",
  ];
  const audioExts = ["mp3", "wav", "flac", "aac", "m4a", "ogg", "wma"];
  const videoExts = ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"];
  const documentExts = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "rtf",
    "csv",
  ];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2"];

  if (imageExts.includes(ext)) return "image";
  if (audioExts.includes(ext)) return "audio";
  if (videoExts.includes(ext)) return "video";
  if (documentExts.includes(ext)) return "document";
  if (archiveExts.includes(ext)) return "archive";
  return "unknown";
}
