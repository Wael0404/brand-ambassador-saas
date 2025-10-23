'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Download, Copy, Check } from 'lucide-react';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

interface AppConfig {
  brand: {
    id: string;
    companyName: string;
    appName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    typography: string;
  };
  plan: {
    type: string;
    name: string;
    features: {
      ambassador: string[];
      brand: string[];
    };
  } | null;
  modules: {
    ambassador: string[];
    brand: string[];
  };
}

export default function AppConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.brand.id) {
      fetchAppConfig();
    }
  }, [user]);

  const fetchAppConfig = async () => {
    try {
      const response = await apiClient.get(`/brands/${user?.brand.id}/app-config.json`);
      setConfig(response.data);
    } catch (error) {
      toast.error('Failed to fetch app configuration');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!config) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      toast.success('Configuration copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy configuration');
    }
  };

  const downloadConfig = () => {
    if (!config) return;
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-config-${user?.brand.subdomain}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration downloaded');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mobile App Configuration</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your brand's mobile app configuration is automatically generated based on your 
              current plan and settings. Use this JSON file to build your mobile application.
            </p>
          </div>

          {config && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Configuration for {config.brand.companyName}
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadConfig}
                      className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Configuration Details */}
          {config && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Company Name:</span>
                    <p className="text-gray-900">{config.brand.companyName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">App Name:</span>
                    <p className="text-gray-900">{config.brand.appName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Primary Color:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: config.brand.primaryColor }}
                      ></div>
                      <span className="text-gray-900">{config.brand.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Secondary Color:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: config.brand.secondaryColor }}
                      ></div>
                      <span className="text-gray-900">{config.brand.secondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Typography:</span>
                    <p className="text-gray-900">{config.brand.typography || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan & Features</h3>
                {config.plan ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current Plan:</span>
                      <p className="text-gray-900">{config.plan.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Plan Type:</span>
                      <p className="text-gray-900 capitalize">{config.plan.type}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Brand Features:</span>
                      <ul className="text-sm text-gray-600 mt-1">
                        {config.modules.brand.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Ambassador Features:</span>
                      <ul className="text-sm text-gray-600 mt-1">
                        {config.modules.ambassador.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No active plan found. Please subscribe to a plan to enable features.</p>
                )}
              </div>
            </div>
          )}

          {/* Integration Instructions */}
          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Integration Instructions</h3>
            <div className="text-blue-800 space-y-3">
              <p>
                <strong>1. Download the configuration:</strong> Use the download button above to get your brand's configuration file.
              </p>
              <p>
                <strong>2. Include in your mobile app:</strong> Place this file in your mobile app's assets or configuration directory.
              </p>
              <p>
                <strong>3. Parse the configuration:</strong> Load and parse this JSON file in your mobile app to apply your brand's settings.
              </p>
              <p>
                <strong>4. Update automatically:</strong> This configuration updates automatically when you change your plan or brand settings.
              </p>
            </div>
          </div>

          {/* API Endpoint */}
          <div className="mt-8 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint</h3>
            <p className="text-gray-600 mb-2">
              You can also fetch this configuration programmatically using our API:
            </p>
            <code className="bg-gray-900 text-gray-100 p-3 rounded block text-sm">
              GET /brands/{user?.brand.id}/app-config.json
            </code>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
