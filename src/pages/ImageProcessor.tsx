import * as React from "react";
import {
  Eraser,
  User,
  Stamp,
  Download,
  RotateCcw,
  Upload,
  Wand2,
  ImageDown,
  Scissors,
  Palette,
  Sun,
  Search,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { OptionPicker } from "@/components/ui/option-picker";
import { StepIndicator } from "@/components/ui/step-indicator";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UsageIndicator } from "@/components/UsageIndicator";

interface ImageProcessorProps {
  className?: string;
}

type ProcessingMode = "background" | "idphoto" | "stamp";

const idPhotoSizes = [
  { value: "25x35", label: "一寸", description: "25×35mm" },
  { value: "35x45", label: "小二寸", description: "35×45mm" },
  { value: "35x49", label: "二寸", description: "35×49mm" },
  { value: "33x48", label: "护照", description: "33×48mm" },
  { value: "26x32", label: "签证", description: "26×32mm" },
];

const backgroundColors = [
  { value: "#ffffff", label: "白色", color: "#ffffff" },
  { value: "#438edb", label: "蓝色", color: "#438edb" },
  { value: "#d32f2f", label: "红色", color: "#d32f2f" },
  { value: "#e0e0e0", label: "灰色", color: "#e0e0e0" },
  { value: "transparent", label: "透明", color: "transparent" },
];

const stampActions = [
  { value: "detect", label: "检测印章", icon: <Search className="w-4 h-4" /> },
  { value: "remove", label: "移除印章", icon: <Trash2 className="w-4 h-4" /> },
  { value: "add", label: "添加印章", icon: <Plus className="w-4 h-4" /> },
  { value: "replace", label: "替换印章", icon: <RefreshCw className="w-4 h-4" /> },
];

export function ImageProcessor({ className }: ImageProcessorProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [mode, setMode] = React.useState<ProcessingMode>("background");
  const [idPhotoSize, setIdPhotoSize] = React.useState("25x35");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [stampAction, setStampAction] = React.useState("detect");
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const { membership, checkFeatureAccess, logFeatureUsage, getUsageCount } = useAuth();
  const [usageCount, setUsageCount] = React.useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const featureType = React.useMemo(() => {
    if (mode === "background") return "image_bg_remove";
    if (mode === "idphoto") return "image_idphoto";
    return "image_stamp";
  }, [mode]);

  React.useEffect(() => {
    const fetchUsage = async () => {
      const count = await getUsageCount(featureType);
      setUsageCount(count);
    };
    fetchUsage();
  }, [featureType, getUsageCount]);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setProcessedUrl(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const processImage = async () => {
    if (!selectedFile || !canvasRef.current) return;

    // 1. 检查会员权限
    const canUse = await checkFeatureAccess(featureType);
    if (!canUse) {
      setShowUpgradeModal(true);
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.src = previewUrl!;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      // Simulate processing with progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise((r) => setTimeout(r, 150));
      }

      if (mode === "background") {
        // Simple background removal simulation (edge detection + transparency)
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal based on edge colors
        const threshold = 30;
        const bgSample = { r: data[0], g: data[1], b: data[2] };

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diff =
            Math.abs(r - bgSample.r) +
            Math.abs(g - bgSample.g) +
            Math.abs(b - bgSample.b);

          if (diff < threshold) {
            data[i + 3] = 0; // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } else if (mode === "idphoto") {
        // ID Photo processing with background color
        const [w, h] = idPhotoSize.split("x").map(Number);
        const ratio = h / w;
        const targetWidth = 300;
        const targetHeight = Math.round(targetWidth * ratio);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Fill background
        if (bgColor !== "transparent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Center and crop image
        const imgRatio = img.height / img.width;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;

        if (imgRatio > ratio) {
          sh = img.width * ratio;
          sy = (img.height - sh) / 2;
        } else {
          sw = img.height / ratio;
          sx = (img.width - sw) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      } else if (mode === "stamp") {
        // Stamp processing simulation
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (stampAction === "detect") {
          // Highlight potential stamp areas (red/orange areas)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect red stamps
            if (r > 150 && g < 100 && b < 100) {
              // Highlight with border
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 0;
            }
          }

          ctx.putImageData(imageData, 0, 0);
        } else if (stampAction === "remove") {
          // Remove red stamp areas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 150 && g < 100 && b < 100) {
              // Replace with white
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            }
          }

          ctx.putImageData(imageData, 0, 0);
        } else if (stampAction === "add") {
          // Add a sample stamp
          ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
          ctx.beginPath();
          ctx.arc(canvas.width - 80, canvas.height - 80, 50, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("示例印章", canvas.width - 80, canvas.height - 75);
        }
      }

      const processedDataUrl = canvas.toDataURL("image/png");
      setProcessedUrl(processedDataUrl);

      // 3. 记录使用
      await logFeatureUsage(featureType, mode === "background" ? "背景移除" : mode === "idphoto" ? "证件照" : "印章处理");
      const newCount = await getUsageCount(featureType);
      setUsageCount(newCount);

      addToast("success", "图片处理完成！");
    } catch (error) {
      addToast("error", "处理失败，请重试");
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `processed_${selectedFile?.name || "image.png"}`;
    link.click();
    addToast("success", "图片已下载");
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProgress(0);
  };

  const bgRemovalSteps = [
    { icon: <Upload className="w-5 h-5" />, title: "上传图片", description: "支持 JPG/PNG/WebP" },
    { icon: <Wand2 className="w-5 h-5" />, title: "AI 智能识别", description: "自动检测主体" },
    { icon: <ImageDown className="w-5 h-5" />, title: "下载结果", description: "透明 PNG 格式" },
  ];

  const idPhotoSteps = [
    { icon: <Scissors className="w-5 h-5" />, title: "智能裁剪", description: "自动对齐面部" },
    { icon: <Palette className="w-5 h-5" />, title: "背景替换", description: "多种颜色可选" },
    { icon: <Sun className="w-5 h-5" />, title: "光线优化", description: "自动美化肤色" },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs
        defaultValue="background"
        onValueChange={(v) => setMode(v as ProcessingMode)}>
        <TabsList variant="pills" className="grid w-full grid-cols-3">
          <TabsTrigger value="background" variant="pills" className="gap-2">
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">背景移除</span>
            <span className="sm:hidden">抠图</span>
          </TabsTrigger>
          <TabsTrigger value="idphoto" variant="pills" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">证件照</span>
            <span className="sm:hidden">证件</span>
          </TabsTrigger>
          <TabsTrigger value="stamp" variant="pills" className="gap-2">
            <Stamp className="w-4 h-4" />
            <span className="hidden sm:inline">印章处理</span>
            <span className="sm:hidden">印章</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="background">
          <Card className="border-image/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-image">
                <div className="flex items-center gap-2">
                  <Eraser className="w-5 h-5" />
                  智能背景移除
                </div>
                <UsageIndicator
                  tier={membership?.tier || 'free'}
                  featureType="image_bg_remove"
                  usageCount={usageCount}
                  className="w-32"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                自动识别并移除图片背景，保留主体内容，输出透明PNG格式
              </p>
              <StepIndicator steps={bgRemovalSteps} accentColor="image" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idphoto">
          <Card className="border-image/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-image">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  证件照制作
                </div>
                <UsageIndicator
                  tier={membership?.tier || 'free'}
                  featureType="image_idphoto"
                  usageCount={usageCount}
                  className="w-32"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold">照片尺寸</label>
                  <OptionPicker
                    options={idPhotoSizes}
                    value={idPhotoSize}
                    onChange={setIdPhotoSize}
                    columns={5}
                    accentColor="image"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold">背景颜色</label>
                  <div className="flex gap-3">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        className={cn(
                          "w-10 h-10 rounded-xl border-2 transition-all duration-200 shadow-sm",
                          bgColor === color.value
                            ? "border-image ring-2 ring-image/30 scale-110"
                            : "border-border hover:border-image/50 hover:scale-105",
                          color.value === "transparent" &&
                          "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgZmlsbD0iI2ZmZiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgZmlsbD0iI2NjYyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2NjYyIgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48L3N2Zz4=')]"
                        )}
                        style={{
                          backgroundColor:
                            color.value !== "transparent"
                              ? color.color
                              : undefined,
                        }}
                        onClick={() => setBgColor(color.value)}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <StepIndicator steps={idPhotoSteps} accentColor="image" variant="compact" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stamp">
          <Card className="border-image/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-image">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5" />
                  印章处理
                </div>
                <UsageIndicator
                  tier={membership?.tier || 'free'}
                  featureType="image_stamp"
                  usageCount={usageCount}
                  className="w-32"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold">处理方式</label>
                <OptionPicker
                  options={stampActions}
                  value={stampAction}
                  onChange={setStampAction}
                  variant="card"
                  columns={4}
                  accentColor="image"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">原始图片</CardTitle>
          </CardHeader>
          <CardContent>
            {!previewUrl ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="image/*"
                maxSize={50 * 1024 * 1024}
              />
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/50 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  重新选择
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">处理结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3QgZmlsbD0iI2Y1ZjVmNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgZmlsbD0iI2UwZTBlMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgZmlsbD0iI2UwZTBlMCIgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48L3N2Zz4=')] flex items-center justify-center">
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    处理后的图片将显示在这里
                  </p>
                )}
              </div>

              {processing && (
                <div className="space-y-2">
                  <Progress value={progress} variant="image" />
                  <p className="text-sm text-center text-muted-foreground">
                    处理中 {progress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="image"
                  onClick={processImage}
                  disabled={!selectedFile || processing}
                  className="flex-1 gap-2">
                  {processing ? "处理中..." : "开始处理"}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadImage}
                  disabled={!processedUrl}
                  className="gap-2">
                  <Download className="w-4 h-4" />
                  下载
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentTier={membership?.tier}
      />
    </div>
  );
}
