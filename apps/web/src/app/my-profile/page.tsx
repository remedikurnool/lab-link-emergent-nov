'use client';

import { useState, useEffect } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useAuth } from '@/hooks/use-auth';
import { usePartnerProfile } from '@/hooks/use-supabase-queries';
import { updatePartnerProfile } from '@/lib/supabase-functions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Briefcase, MapPin, CreditCard, LogOut, Loader2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ProfileFormData {
  full_name: string;
  phone: string;
  partner_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
}

export default function MyProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: partnerProfile, isLoading, error } = usePartnerProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form data from partner profile or defaults
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    partner_type: 'pharmacist',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  });

  // Update form data when partner profile loads
  useEffect(() => {
    if (partnerProfile) {
      setFormData({
        full_name: partnerProfile.full_name || '',
        phone: partnerProfile.phone || '',
        partner_type: partnerProfile.partner_type || 'pharmacist',
        address: partnerProfile.address || '',
        city: partnerProfile.city || '',
        state: partnerProfile.state || '',
        pincode: partnerProfile.pincode || '',
        bank_name: partnerProfile.bank_name || '',
        account_number: partnerProfile.account_number || '',
        ifsc_code: partnerProfile.ifsc_code || '',
        upi_id: partnerProfile.upi_id || '',
      });
    }
  }, [partnerProfile]);

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: updatePartnerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled by onError callback
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile
    if (partnerProfile) {
      setFormData({
        full_name: partnerProfile.full_name || '',
        phone: partnerProfile.phone || '',
        partner_type: partnerProfile.partner_type || 'pharmacist',
        address: partnerProfile.address || '',
        city: partnerProfile.city || '',
        state: partnerProfile.state || '',
        pincode: partnerProfile.pincode || '',
        bank_name: partnerProfile.bank_name || '',
        account_number: partnerProfile.account_number || '',
        ifsc_code: partnerProfile.ifsc_code || '',
        upi_id: partnerProfile.upi_id || '',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Error state
  if (error && !partnerProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load profile. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const displayName = formData.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-600">Manage your account details</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-600 capitalize">
                  {formData.partner_type?.replace('_', ' ') || 'Partner'}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  if (isEditing) {
                    handleCancel();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium text-sm"
                disabled={updateMutation.isPending}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partner_type">Partner Type</Label>
                    <select
                      id="partner_type"
                      value={formData.partner_type}
                      onChange={(e) => handleInputChange('partner_type', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="pharmacist">Pharmacist</option>
                      <option value="nurse">Nurse</option>
                      <option value="asha_worker">ASHA Worker</option>
                      <option value="technician">Technician</option>
                      <option value="medical_representative">Medical Representative</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="Shop No. 12, Medical Complex"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Hyderabad"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Telangana"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="500034"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Payment Details (for payouts)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => handleInputChange('account_number', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      type={isEditing ? 'text' : 'password'}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifsc_code">IFSC Code</Label>
                    <Input
                      id="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="HDFC0001234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upi_id">UPI ID</Label>
                    <Input
                      id="upi_id"
                      value={formData.upi_id}
                      onChange={(e) => handleInputChange('upi_id', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="yourname@paytm"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
