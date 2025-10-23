'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  LayoutDashboard, 
  Gift, 
  CreditCard, 
  MessageSquare, 
  Megaphone, 
  DollarSign,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import apiClient from '@/lib/api';
import { Plan, Offer, Subscription } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BrandDashboardProps {
  params: Promise<{
    brandId: string;
  }>;
}

export default function BrandDashboardPage({ params }: BrandDashboardProps) {
  const resolvedParams = use(params);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showEditOffer, setShowEditOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', externalLink: '' });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [plansRes, offersRes, subscriptionsRes] = await Promise.all([
        apiClient.get('/plans'),
        apiClient.get('/offers'),
        apiClient.get(`/plans/subscriptions/${user?.brand.id}`)
      ]);
      
      setPlans(plansRes.data);
      setOffers(offersRes.data);
      setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const response = await apiClient.post('/offers', newOffer);
      setOffers([response.data, ...offers]);
      setNewOffer({ title: '', description: '', externalLink: '' });
      setShowCreateOffer(false);
      toast.success('Offer created successfully');
    } catch (error) {
      toast.error('Failed to create offer');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      await apiClient.delete(`/offers/${offerId}`);
      setOffers(offers.filter(offer => offer.id !== offerId));
      toast.success('Offer deleted successfully');
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      externalLink: offer.externalLink || ''
    });
    setShowEditOffer(true);
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer) return;
    
    try {
      const response = await apiClient.patch(`/offers/${editingOffer.id}`, {
        title: newOffer.title,
        description: newOffer.description,
        externalLink: newOffer.externalLink,
        isActive: editingOffer.isActive
      });
      
      setOffers(offers.map(offer => 
        offer.id === editingOffer.id ? response.data : offer
      ));
      
      setShowEditOffer(false);
      setEditingOffer(null);
      setNewOffer({ title: '', description: '', externalLink: '' });
      toast.success('Offer updated successfully');
    } catch (error) {
      toast.error('Failed to update offer');
    }
  };

  const getActivePlan = () => {
    return subscriptions.find(sub => sub.status === 'active')?.plan;
  };

  const getAvailableModules = () => {
    const activePlan = getActivePlan();
    return activePlan?.features.brand || [];
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      if (!user?.brand?.id) {
        toast.error('Brand information not found');
        return;
      }

      const response = await apiClient.post('/stripe/create-checkout-session', {
        brandId: user.brand.id,
        planId: planId,
      });
      
      if (response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to create upgrade session');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, available: true },
    { id: 'offers', label: 'Offer Management', icon: Gift, available: getAvailableModules().includes('Offer creation') },
    { id: 'plans', label: 'Plan Management', icon: CreditCard, available: getAvailableModules().includes('Plan management') },
    { id: 'chat', label: 'Chat', icon: MessageSquare, available: getAvailableModules().includes('Chat') },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, available: getAvailableModules().includes('Campaign management') },
    { id: 'payments', label: 'Payments', icon: DollarSign, available: getAvailableModules().includes('Ambassador payment management') },
    { id: 'settings', label: 'Settings', icon: Settings, available: true },
  ];

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
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm">
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900">{user?.brand.companyName}</h1>
              <p className="text-sm text-gray-500">/{resolvedParams.brandId}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getActivePlan()?.name || 'No Plan'}
                </span>
              </div>
            </div>
            <nav className="mt-6">
              {sidebarItems.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => item.available ? setActiveTab(item.id) : null}
                    className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : item.available
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!item.available}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {!item.available && (
                      <Link
                        href="/plans"
                        className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Upgrade
                      </Link>
                    )}
                  </button>
                </div>
              ))}
            </nav>
            <div className="absolute bottom-0 w-64 p-6">
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Offers</h3>
                    <p className="text-3xl font-bold text-blue-600">{offers.filter(o => o.isActive).length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
                    <p className="text-3xl font-bold text-green-600">{getActivePlan()?.name || 'No Plan'}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Offers</h3>
                    <p className="text-3xl font-bold text-purple-600">{offers.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Offers</h3>
                  {offers.slice(0, 5).map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900">{offer.title}</h4>
                        <p className="text-sm text-gray-500">{offer.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Offer Management</h2>
                  <button 
                    onClick={() => setShowCreateOffer(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Offer
                  </button>
                </div>

                {/* Create Offer Modal */}
                {showCreateOffer && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Offer</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                              type="text"
                              value={newOffer.title}
                              onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              placeholder="Offer title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              value={newOffer.description}
                              onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              rows={3}
                              placeholder="Offer description"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">External Link</label>
                            <input
                              type="url"
                              value={newOffer.externalLink}
                              onChange={(e) => setNewOffer({...newOffer, externalLink: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => setShowCreateOffer(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateOffer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Offer Modal */}
                {showEditOffer && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Offer</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                              type="text"
                              value={newOffer.title}
                              onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              placeholder="Offer title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              value={newOffer.description}
                              onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              rows={3}
                              placeholder="Offer description"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">External Link</label>
                            <input
                              type="url"
                              value={newOffer.externalLink}
                              onChange={(e) => setNewOffer({...newOffer, externalLink: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => {
                              setShowEditOffer(false);
                              setEditingOffer(null);
                              setNewOffer({ title: '', description: '', externalLink: '' });
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateOffer}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {offer.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {offer.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleEditOffer(offer)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Management</h2>
                
                {/* Current Subscription */}
                {subscriptions.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
                    {subscriptions.map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{subscription.plan.name}</h4>
                          <p className="text-sm text-gray-600">€{subscription.plan.price}/month</p>
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
                )}

                {/* Available Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-4">€{plan.price}/mo</div>
                      <div className="space-y-2 mb-6">
                        <h4 className="font-semibold text-gray-900">Brand Features:</h4>
                        {plan.features.brand.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={() => handleUpgradePlan(plan.id)}
                        disabled={getActivePlan()?.id === plan.id}
                      >
                        {getActivePlan()?.id === plan.id ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        defaultValue={user?.brand.companyName}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">App Name</label>
                      <input
                        type="text"
                        defaultValue={user?.brand.appName}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                      <input
                        type="color"
                        defaultValue={user?.brand.primaryColor || '#3B82F6'}
                        className="mt-1 block w-20 h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                      <input
                        type="color"
                        defaultValue={user?.brand.secondaryColor || '#10B981'}
                        className="mt-1 block w-20 h-10 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Mobile App Configuration */}
                <div className="bg-white p-6 rounded-lg shadow mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile App Configuration</h3>
                  <p className="text-gray-600 mb-4">
                    Download your mobile app configuration file for development.
                  </p>
                  <Link
                    href={`/${resolvedParams.brandId}/app-config.json`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Config
                  </Link>
                </div>
              </div>
            )}

            {/* Chat Section */}
            {activeTab === 'chat' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat</h2>
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Feature</h3>
                  <p className="text-gray-600 mb-4">
                    This feature will allow you to communicate with your brand ambassadors.
                  </p>
                  <p className="text-sm text-gray-500">
                    Coming soon in future updates.
                  </p>
                </div>
              </div>
            )}

            {/* Campaigns Section */}
            {activeTab === 'campaigns' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaigns</h2>
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <Megaphone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Management</h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage marketing campaigns for your brand ambassadors.
                  </p>
                  <p className="text-sm text-gray-500">
                    Coming soon in future updates.
                  </p>
                </div>
              </div>
            )}

            {/* Payments Section */}
            {activeTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments</h2>
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <DollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ambassador Payment Management</h3>
                  <p className="text-gray-600 mb-4">
                    Manage payments and commissions for your brand ambassadors.
                  </p>
                  <p className="text-sm text-gray-500">
                    Coming soon in future updates.
                  </p>
                </div>
              </div>
            )}

            {!sidebarItems.find(item => item.id === activeTab)?.available && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Not Available</h3>
                <p className="text-gray-600 mb-4">This feature is not included in your current plan.</p>
                <Link
                  href="/plans"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block"
                >
                  Upgrade Plan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
