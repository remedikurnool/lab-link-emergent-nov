'use client';

import Link from 'next/link';
import { ArrowLeft, UserCheck, UserX, Edit, Phone, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { usePartners } from '@/hooks/use-supabase-queries';

function PartnersPageContent() {
  const { data: partners = [], isLoading: loading } = usePartners();

  const togglePartnerStatus = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('partners')
        .update({ is_active: !currentStatus })
        .eq('id', partnerId);

      if (error) throw error;
      // The hook will automatically refetch data due to real-time subscription
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partners Management</h2>
        <p className="text-gray-600">Manage healthcare partners</p>
      </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {partners.length} Partners
                </h2>
              </div>
            </div>

            {partners.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500">No partners found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {partner.full_name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {partner.full_name}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {partner.partner_type?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{partner.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{partner.city || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Commission: </span>
                            <span className="font-semibold text-gray-900">
                              {partner.commission_percentage}%
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Joined: </span>
                            <span className="font-semibold text-gray-900">
                              {formatDate(partner.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => togglePartnerStatus(partner.id, partner.is_active)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            partner.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {partner.is_active ? (
                            <>
                              <UserX className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                            partner.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {partner.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </AdminLayout>
  );
}

export default function PartnersPage() {
  return <PartnersPageContent />;
}
