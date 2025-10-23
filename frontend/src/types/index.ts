export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  brand: Brand;
}

export interface Brand {
  id: string;
  companyName: string;
  email: string;
  appName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  type: 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: {
    ambassador: string[];
    brand: string[];
  };
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  externalLink?: string;
  isActive: boolean;
  brandId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  brandId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  companyName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  appName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateOfferData {
  title: string;
  description: string;
  externalLink?: string;
}

export interface UpdateOfferData {
  title?: string;
  description?: string;
  externalLink?: string;
  isActive?: boolean;
}

export interface UpdateBrandConfigData {
  companyName?: string;
  email?: string;
}

export interface UpdateBrandAppConfigData {
  appName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: string;
}
