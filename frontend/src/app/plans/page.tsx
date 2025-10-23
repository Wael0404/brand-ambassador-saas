'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, CreditCard, ArrowRight, Loader } from 'lucide-react';
import apiClient from '@/lib/api';
import { Plan, Subscription } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PlansPage() {
  const { user, register: registerUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<any>(null);

  useEffect(() => {
    const storedRegistration = localStorage.getItem('pendingRegistration');
    if (storedRegistration) {
      setPendingRegistration(JSON.parse(storedRegistration));
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subscriptionsRes] = await Promise.all([
        apiClient.get('/plans'),
        user ? apiClient.get(`/plans/subscriptions/${user.brand.id}`) : Promise.resolve({ data: [] })
      ]);
      
      setPlans(plansRes.data);
      setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setProcessing(planId);
    try {
      let currentUser = user;
      
      if (pendingRegistration && !user) {
        const registeredUser = await registerUser(pendingRegistration);
        localStorage.removeItem('pendingRegistration');
        setPendingRegistration(null);
        if (registeredUser != null) {
          currentUser = registeredUser;
        } else {
          toast.error('Registration failed. Please try again.');
          setProcessing(null);
          return;
        }
      }
      
      if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      }
      
      if (!currentUser?.brand?.id) {
        toast.error('Please complete registration first');
        setProcessing(null);
        return;
      }

      const response = await apiClient.post('/stripe/create-checkout-session', {
        brandId: currentUser.brand.id,
        planId: planId,
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      setProcessing(null);
    }
  };

  const getActivePlan = () => {
    return subscriptions.find(sub => sub.status === 'active')?.plan;
  };

  const isCurrentPlan = (planId: string) => {
    return getActivePlan()?.id === planId;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your brand ambassador program. 
            Upgrade or downgrade at any time.
          </p>
          
          {pendingRegistration && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-blue-800">
                <strong>Almost there!</strong> Complete your registration by selecting a plan below.
              </p>
            </div>
          )}
          
          <div className="mt-4">
            {user ? (
              <Link
                href={`/${user.brand.subdomain}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Registration
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.type === 'pro' ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {plan.type === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  €{plan.price}
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <p className="text-gray-600">Perfect for {plan.type === 'starter' ? 'small businesses' : plan.type === 'pro' ? 'growing companies' : 'large enterprises'}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Brand Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.brand.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ambassador Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.ambassador.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan(plan.id) || processing === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  isCurrentPlan(plan.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.type === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {processing === plan.id ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : isCurrentPlan(plan.id) ? (
                  'Current Plan'
                ) : (
                  <>
                    {plan.type === 'starter' ? 'Get Started' : 'Choose Plan'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {subscriptions.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{subscription.plan.name}</h4>
                    <p className="text-sm text-gray-600">
                      €{subscription.plan.price}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected 
                in your next billing cycle.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards through our secure Stripe payment processor. 
                All transactions are encrypted and secure.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                We offer a 14-day free trial for all new customers. No credit card required 
                to get started.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does billing work?</h3>
              <p className="text-gray-600">
                All plans are billed monthly in advance. You'll receive an invoice via email 
                and can view your billing history in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}