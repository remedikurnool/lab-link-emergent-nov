'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, UserCheck, UserX, Edit, Phone, Mail } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePartnerStatus = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: !currentStatus })
        .eq('id', partnerId);

      if (error) throw error;
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Partners Management</h1>
              <p className="text-sm text-gray-600">Manage healthcare partners</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}
