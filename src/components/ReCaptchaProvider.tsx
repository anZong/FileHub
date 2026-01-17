import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface ReCaptchaProviderProps {
    children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
    // 如果没有配置 reCAPTCHA，直接返回 children
    if (!recaptchaSiteKey || recaptchaSiteKey === 'your_recaptcha_site_key') {
        console.warn('reCAPTCHA not configured. Please set VITE_RECAPTCHA_SITE_KEY in .env.local');
        return <>{children}</>;
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaSiteKey}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: 'head',
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
