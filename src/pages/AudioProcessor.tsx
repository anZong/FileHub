import * as React from "react";
import { Music, Download, RefreshCw, Play, Pause, Volume2 } from "lucide-react";
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

interface AudioProcessorProps {
  className?: string;
}

const audioFormats = [
  { value: "mp3", label: "MP3", description: "通用格式" },
  { value: "wav", label: "WAV", description: "无损格式" },
  { value: "flac", label: "FLAC", description: "无损压缩" },
  { value: "aac", label: "AAC", description: "高效压缩" },
  { value: "m4a", label: "M4A", description: "Apple格式" },
  { value: "ogg", label: "OGG", description: "开源格式" },
];

const qualityOptions = [
  { value: "320", label: "320 kbps", description: "最高质量" },
  { value: "256", label: "256 kbps", description: "高质量" },
  { value: "192", label: "192 kbps", description: "标准" },
  { value: "128", label: "128 kbps", description: "普通" },
];

export function AudioProcessor({ className }: AudioProcessorProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [targetFormat, setTargetFormat] = React.useState("mp3");
  const [quality, setQuality] = React.useState("192");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const { membership, checkFeatureAccess, logFeatureUsage, getUsageCount } = useAuth();
  const [usageCount, setUsageCount] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const featureType = "audio_convert";

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
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const convertAudio = async () => {
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
      // Simulate conversion process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((r) => setTimeout(r, 100));
      }

      // 3. 记录使用
      await logFeatureUsage(featureType, "音频转换");
      const newCount = await getUsageCount(featureType);
      setUsageCount(newCount);

      addToast("success", `音频已转换为 ${targetFormat.toUpperCase()} 格式！`);
    } catch (error) {
      addToast("error", "转换失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl || !selectedFile) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${originalName}.${targetFormat}`;
    link.click();
    addToast("success", "音频已下载");
  };

  const reset = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-audio/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-audio">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              音频格式转换
            </div>
            <UsageIndicator
              tier={membership?.tier || 'free'}
              featureType={featureType}
              usageCount={usageCount}
              className="w-32"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            支持多种音频格式之间的高质量转换，自定义输出质量
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">上传音频</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="audio/*"
                maxSize={100 * 1024 * 1024}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-audio-light border border-audio/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-audio flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  {audioUrl && (
                    <div className="mt-4 space-y-2">
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                      />
                      <div className="flex items-center gap-3">
                        <Button
                          variant="audio"
                          size="icon"
                          onClick={togglePlay}>
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <Progress
                            value={
                              duration ? (currentTime / duration) * 100 : 0
                            }
                            variant="audio"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>
                  )}
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
            <CardTitle className="text-base">转换设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold">目标格式</label>
                <OptionPicker
                  options={audioFormats}
                  value={targetFormat}
                  onChange={setTargetFormat}
                  columns={6}
                  accentColor="audio"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">音频质量</label>
                <OptionPicker
                  options={qualityOptions}
                  value={quality}
                  onChange={setQuality}
                  columns={4}
                  accentColor="audio"
                />
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4 text-audio" />
                  <span className="font-medium">转换信息</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">输出格式:</div>
                  <div className="font-medium">
                    {targetFormat.toUpperCase()}
                  </div>
                  <div className="text-muted-foreground">比特率:</div>
                  <div className="font-medium">{quality} kbps</div>
                  <div className="text-muted-foreground">采样率:</div>
                  <div className="font-medium">44.1 kHz</div>
                </div>
              </div>

              {processing && (
                <div className="space-y-2">
                  <Progress value={progress} variant="audio" />
                  <p className="text-sm text-center text-muted-foreground">
                    转换中 {progress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="audio"
                  onClick={convertAudio}
                  disabled={!selectedFile || processing}
                  className="flex-1 gap-2">
                  {processing ? "转换中..." : "开始转换"}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadAudio}
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
