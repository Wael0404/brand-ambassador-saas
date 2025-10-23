'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Building, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Step1Data {
  companyName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface Step2Data {
  appName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  typography: string;
}


export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const step1Form = useForm<Step1Data>();
  const step2Form = useForm<Step2Data>();

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Next = async (data: Step2Data) => {
    if (!step1Data) {
      toast.error('Please complete step 1 first');
      return;
    }
    
    setStep2Data(data);
    setIsSubmitting(true);
    
    try {
      // Store the registration data in localStorage temporarily
      const registrationData = {
        ...step1Data,
        ...data,
      };
      
      localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
      
      // Redirect directly to plans page
      router.push('/plans');
    } catch (error) {
      toast.error('Failed to save registration data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 2 && (
                <div
                  className={`w-8 h-0.5 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {currentStep === 1 && 'Enterprise Information'}
            {currentStep === 2 && 'App Configuration'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Step 1: Enterprise Information */}
        {currentStep === 1 && (
          <form className="mt-8 space-y-6" onSubmit={step1Form.handleSubmit(handleStep1Next)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...step1Form.register('companyName', { required: 'Company name is required' })}
                    type="text"
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your company name"
                  />
                </div>
                {step1Form.formState.errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...step1Form.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                {step1Form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...step1Form.register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {step1Form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{step1Form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step1Form.register('firstName')}
                      type="text"
                      className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step1Form.register('lastName')}
                      type="text"
                      className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: App Configuration */}
        {currentStep === 2 && (
          <form className="mt-8 space-y-6" onSubmit={step2Form.handleSubmit(handleStep2Next)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
                  App Name *
                </label>
                <input
                  {...step2Form.register('appName', { required: 'App name is required' })}
                  type="text"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your app name"
                />
                {step2Form.formState.errors.appName && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.appName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  Primary Color *
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    {...step2Form.register('primaryColor', { required: 'Primary color is required' })}
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-12 h-10 border border-gray-300 rounded-md"
                  />
                  <input
                    {...step2Form.register('primaryColor', { required: 'Primary color is required' })}
                    type="text"
                    defaultValue="#3B82F6"
                    className="flex-1 appearance-none rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  Secondary Color *
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    {...step2Form.register('secondaryColor', { required: 'Secondary color is required' })}
                    type="color"
                    defaultValue="#10B981"
                    className="w-12 h-10 border border-gray-300 rounded-md"
                  />
                  <input
                    {...step2Form.register('secondaryColor', { required: 'Secondary color is required' })}
                    type="text"
                    defaultValue="#10B981"
                    className="flex-1 appearance-none rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="#10B981"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="typography" className="block text-sm font-medium text-gray-700">
                  Typography *
                </label>
                <input
                  {...step2Form.register('typography', { required: 'Typography is required' })}
                  type="text"
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Roboto, sans-serif"
                />
                {step2Form.formState.errors.typography && (
                  <p className="mt-1 text-sm text-red-600">{step2Form.formState.errors.typography.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleStep2Back}
                className="group relative flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </button>
              <button
                type="submit"
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}