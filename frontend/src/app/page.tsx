'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Zap, Shield } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Brand Ambassador SaaS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Brand Ambassadors
            <span className="block text-blue-600">Like Never Before</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automatically generate your brand dashboard and mobile app to manage ambassadors 
            with powerful tools for offers, campaigns, and payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Everything You Need to Manage Ambassadors
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ambassador Management</h3>
              <p className="text-gray-600">
                Create and manage offers, track ambassador performance, and handle all communications 
                from one centralized dashboard.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated Workflows</h3>
              <p className="text-gray-600">
                Set up automated campaigns, payment processing, and notifications to streamline 
                your ambassador program operations.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Scalable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with multi-tenant architecture. Scale from startup 
                to enterprise with our flexible plans.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">€99<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Offer consultation
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Account management
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Basic dashboard
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold text-center block"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">€199<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Everything in Starter
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Chat functionality
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Campaign management
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center block"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">€299<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Payment management
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Advanced analytics
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold text-center block"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
