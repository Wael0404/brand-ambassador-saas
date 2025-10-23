'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api';

export default function SuccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      
      const verifySession = async () => {
        try {
          const response = await apiClient.get(`/stripe/verify-session/${sessionIdParam}`);
          if (response.data.success) {
            toast.success('Payment successful! Your plan has been activated.');
          } else {
            toast.error('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          toast.error('Payment verification failed. Please contact support.');
        } finally {
          setLoading(false);
          
          setTimeout(() => {
            if (user?.brand?.subdomain) {
              router.push(`/${user.brand.subdomain}`);
            }
          }, 3000);
        }
      };
      
      verifySession();
    } else {
      setLoading(false);
    }
  }, [searchParams, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your subscription has been activated. You can now access all features of your plan.
          </p>
          
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  You will be automatically redirected to your dashboard in 3 seconds.
                </p>
              </div>
          
          {sessionId && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                Session ID: {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href={`/${user?.brand.subdomain}`}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href={`/${user?.brand.subdomain}?tab=plans`}
              className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Plan Details
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Access your brand dashboard</li>
            <li>• Start creating offers for your ambassadors</li>
            <li>• Configure your mobile app settings</li>
            <li>• Invite ambassadors to join your program</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
