export type MembershipTier = 'free' | 'premium' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  tier: MembershipTier;
  started_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface UsageLog {
  id: string;
  user_id: string;
  feature_type: string; // 'image_bg_remove', 'image_id_photo', 'audio_convert', etc.
  feature_name: string;
  used_at: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  membership: Membership | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>;
  checkFeatureAccess: (featureType: string) => Promise<boolean>;
  logFeatureUsage: (featureType: string, featureName: string) => Promise<void>;
  getUsageCount: (featureType: string) => Promise<number>;
}
