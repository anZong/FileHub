import * as React from "react";
import {
  Video,
  Download,
  RefreshCw,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { OptionPicker } from "@/components/ui/option-picker";
import { useToast } from "@/components/ui/toast";
import { cn, formatFileSize } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageIndicator } from "@/components/UsageIndicator";

interface VideoProcessorProps {
  className?: string;
}

const videoFormats = [
  { value: "mp4", label: "MP4", description: "通用格式" },
  { value: "webm", label: "WebM", description: "网页格式" },
  { value: "avi", label: "AVI", description: "传统格式" },
  { value: "mkv", label: "MKV", description: "高清格式" },
  { value: "mov", label: "MOV", description: "Apple格式" },
];

const resolutions = [
  { value: "2160", label: "4K", description: "2160p" },
  { value: "1080", label: "1080p", description: "全高清" },
  { value: "720", label: "720p", description: "高清" },
  { value: "480", label: "480p", description: "标清" },
  { value: "360", label: "360p", description: "流畅" },
];

const bitrateOptions = [
  { value: "8000", label: "8 Mbps", description: "最高质量" },
  { value: "5000", label: "5 Mbps", description: "高质量" },
  { value: "2500", label: "2.5 Mbps", description: "标准" },
  { value: "1000", label: "1 Mbps", description: "普通" },
];

export function VideoProcessor({ className }: VideoProcessorProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [targetFormat, setTargetFormat] = React.useState("mp4");
  const [resolution, setResolution] = React.useState("1080");
  const [bitrate, setBitrate] = React.useState("5000");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const { membership, checkFeatureAccess, logFeatureUsage, getUsageCount } = useAuth();
  const [usageCount, setUsageCount] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const featureType = "video_convert";

  React.useEffect(() => {
    const fetchUsage = async () => {
      const count = await getUsageCount(featureType);
      setUsageCount(count);
    };
    fetchUsage();
  }, [getUsageCount]);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const convertVideo = async () => {
    if (!selectedFile) return;

    // 1. 检查会员权限
    const canUse = await checkFeatureAccess(featureType);
    if (!canUse) {
      setShowUpgradeModal(true);
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate conversion process (slower than audio)
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise((r) => setTimeout(r, 100));
      }

      // 3. 记录使用
      await logFeatureUsage(featureType, "视频转换");
      const newCount = await getUsageCount(featureType);
      setUsageCount(newCount);

      addToast("success", `视频已转换为 ${targetFormat.toUpperCase()} 格式！`);
    } catch (error) {
      addToast("error", "转换失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl || !selectedFile) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${originalName}.${targetFormat}`;
    link.click();
    addToast("success", "视频已下载");
  };

  const reset = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-video/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-video">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              视频格式转换
            </div>
            <UsageIndicator
              tier={membership?.tier || 'free'}
              featureType={featureType}
              usageCount={usageCount}
              className="w-32"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            支持多种视频格式之间的转换，可自定义分辨率和码率
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">上传视频</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="video/*"
                maxSize={500 * 1024 * 1024}
              />
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-secondary/50">
                  {videoUrl && (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full aspect-video object-contain bg-foreground/5"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onClick={togglePlay}
                    />
                  )}
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={togglePlay}>
                    <div className="w-16 h-16 rounded-full bg-video flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-primary-foreground" />
                      ) : (
                        <Play className="w-8 h-8 text-primary-foreground ml-1" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Button variant="video" size="icon" onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <Progress
                        value={duration ? (currentTime / duration) * 100 : 0}
                        variant="video"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="w-4 h-4" />
                    <span className="truncate">{selectedFile.name}</span>
                    <span>•</span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={reset}
                  className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  重新选择
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              转换设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold">目标格式</label>
                <OptionPicker
                  options={videoFormats}
                  value={targetFormat}
                  onChange={setTargetFormat}
                  columns={5}
                  accentColor="video"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">分辨率</label>
                <OptionPicker
                  options={resolutions}
                  value={resolution}
                  onChange={setResolution}
                  columns={5}
                  accentColor="video"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">码率</label>
                <OptionPicker
                  options={bitrateOptions}
                  value={bitrate}
                  onChange={setBitrate}
                  columns={4}
                  accentColor="video"
                />
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4 text-video" />
                  <span className="font-medium">输出信息</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">输出格式:</div>
                  <div className="font-medium">
                    {targetFormat.toUpperCase()}
                  </div>
                  <div className="text-muted-foreground">分辨率:</div>
                  <div className="font-medium">{resolution}p</div>
                  <div className="text-muted-foreground">码率:</div>
                  <div className="font-medium">
                    {parseInt(bitrate) / 1000} Mbps
                  </div>
                  <div className="text-muted-foreground">编码器:</div>
                  <div className="font-medium">H.264</div>
                </div>
              </div>

              {processing && (
                <div className="space-y-2">
                  <Progress value={progress} variant="video" />
                  <p className="text-sm text-center text-muted-foreground">
                    转换中 {progress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="video"
                  onClick={convertVideo}
                  disabled={!selectedFile || processing}
                  className="flex-1 gap-2">
                  {processing ? "转换中..." : "开始转换"}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadVideo}
                  disabled={!selectedFile || processing}
                  className="gap-2">
                  <Download className="w-4 h-4" />
                  下载
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentTier={membership?.tier}
      />
    </div>
  );
}
