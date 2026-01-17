import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Image,
  Music,
  Video,
  Home,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Eraser,
  User,
  Stamp,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import { ImageProcessor } from "@/pages/ImageProcessor";
import { AudioProcessor } from "@/pages/AudioProcessor";
import { VideoProcessor } from "@/pages/VideoProcessor";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Profile } from "@/pages/Profile";
import { Membership } from "@/pages/Membership";
import { cn } from "@/lib/utils";
import { ReCaptchaProvider } from "@/components/ReCaptchaProvider";

type Page = "home" | "image" | "audio" | "video";

const navItems = [
  { id: "home" as Page, label: "首页", icon: Home, path: "/" },
  {
    id: "image" as Page,
    label: "图片处理",
    icon: Image,
    color: "text-image",
    bgColor: "bg-image-light",
    path: "/image",
  },
  {
    id: "audio" as Page,
    label: "音频处理",
    icon: Music,
    color: "text-audio",
    bgColor: "bg-audio-light",
    path: "/audio",
  },
  {
    id: "video" as Page,
    label: "视频处理",
    icon: Video,
    color: "text-video",
    bgColor: "bg-video-light",
    path: "/video",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "智能识别",
    description: "自动识别文件类型，智能推荐处理方案",
    ariaLabel: "智能识别功能",
  },
  {
    icon: Zap,
    title: "快速处理",
    description: "本地处理，无需上传服务器，快速高效",
    ariaLabel: "快速处理功能",
  },
  {
    icon: Shield,
    title: "安全隐私",
    description: "文件不上传云端，保护您的隐私安全",
    ariaLabel: "安全隐私功能",
  },
];

const moduleCards = [
  {
    id: "image" as Page,
    title: "图片处理",
    icon: Image,
    color: "text-image",
    bgColor: "bg-image-light",
    borderColor: "border-image/30",
    hoverBg: "hover:bg-image/5",
    features: [
      { icon: Eraser, label: "背景移除" },
      { icon: User, label: "证件照制作" },
      { icon: Stamp, label: "印章处理" },
    ],
    formats: "JPG、PNG、WEBP、BMP",
    path: "/image",
  },
  {
    id: "audio" as Page,
    title: "音频处理",
    icon: Music,
    color: "text-audio",
    bgColor: "bg-audio-light",
    borderColor: "border-audio/30",
    hoverBg: "hover:bg-audio/5",
    features: [{ icon: RefreshCw, label: "格式转换" }],
    formats: "MP3、WAV、FLAC、AAC、M4A",
    path: "/audio",
  },
  {
    id: "video" as Page,
    title: "视频处理",
    icon: Video,
    color: "text-video",
    bgColor: "bg-video-light",
    borderColor: "border-video/30",
    hoverBg: "hover:bg-video/5",
    features: [{ icon: RefreshCw, label: "格式转换" }],
    formats: "MP4、AVI、MKV、MOV、WMV",
    path: "/video",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          智能文件处理平台
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient">FileHub</span>
          <br />
          <span className="text-foreground">智能文件处理工作站</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          支持图片、音频、视频等多种文件格式的智能处理，
          一站式满足您的所有文件处理需求
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate("/image")}>
            开始使用
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/membership")}>
            了解更多
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="text-center p-6 hover:shadow-lg transition-all duration-200 motion-reduce:transition-none"
            role="article"
            aria-label={feature.ariaLabel}>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Module Cards */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">功能模块</h2>
          <p className="text-muted-foreground mt-2">选择您需要的文件处理功能</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {moduleCards.map((module) => (
            <Card
              key={module.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none",
                module.borderColor,
                module.hoverBg
              )}
              onClick={() => navigate(module.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(module.path);
                }
              }}
              aria-label={`进入${module.title}`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      module.bgColor
                    )}>
                    <module.icon className={cn("w-6 h-6", module.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {module.formats}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {module.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                        module.bgColor,
                        module.color
                      )}>
                      <feature.icon className="w-3.5 h-3.5" />
                      {feature.label}
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className={cn("w-full justify-between", module.color)}>
                  进入处理
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getCurrentPage = (): Page => {
    const path = location.pathname;
    if (path === "/image") return "image";
    if (path === "/audio") return "audio";
    if (path === "/video") return "video";
    return "home";
  };

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
              aria-label="返回首页">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-gradient">FileHub</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    currentPage === item.id
                      ? item.bgColor
                        ? `${item.bgColor} ${item.color}`
                        : "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    注册
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                currentPage === item.id
                  ? item.color || "text-primary"
                  : "text-muted-foreground"
              )}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/image" element={<ImageProcessor />} />
          <Route path="/audio" element={<AudioProcessor />} />
          <Route path="/video" element={<VideoProcessor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership"
            element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-6 hidden md:block">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FileHub - 智能文件处理工作站 © 2026</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <ReCaptchaProvider>
            <AppLayout />
          </ReCaptchaProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
