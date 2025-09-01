// Tipos para o sistema de retenção UTI Games

export interface UTICoins {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CoinRule {
  id: string;
  action: string;
  amount: number;
  description: string;
  maxPerDay?: number;
  maxPerMonth?: number;
  isActive: boolean;
}

export interface UserLevel {
  id: string;
  name: string;
  minCoins: number;
  maxCoins: number;
  color: string;
  icon: string;
  benefits: string[];
  discountPercentage: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  reward: {
    coins: number;
    badge?: string;
    discount?: number;
  };
  requirements: {
    action: string;
    target: number;
    current?: number;
  }[];
  isActive: boolean;
}

export interface UserProgress {
  level: UserLevel;
  coins: UTICoins;
  badges: UserBadge[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  stats: {
    totalPurchases: number;
    totalSpent: number;
    reviewsWritten: number;
    referrals: number;
    daysActive: number;
  };
}

export interface Recommendation {
  id: string;
  productId: string;
  title: string;
  reason: string;
  confidence: number;
  category: string;
  price: number;
  imageUrl: string;
}

export interface PersonalizationData {
  favoriteCategories: string[];
  preferredPlatforms: string[];
  priceRange: {
    min: number;
    max: number;
  };
  lastVisited: string[];
  searchHistory: string[];
  wishlist: string[];
}

