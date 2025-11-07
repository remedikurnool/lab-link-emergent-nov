'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save, MessageSquare, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [whatsappConfig, setWhatsappConfig] = useState({ enabled: false, business_phone: '', api_key: '', template_id: '' });
  const [razorpayConfig, setRazorpayConfig] = useState({ enabled: false, key_id: '', key_secret: '' });
  const [phonepeConfig, setPhonepeConfig] = useState({ enabled: false, merchant_id: '', salt_key: '', salt_index: '1' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*');
      
      data?.forEach((setting) => {
        if (setting.key === 'whatsapp_config') setWhatsappConfig(setting.value);
        if (setting.key === 'razorpay_config') setRazorpayConfig(setting.value);
        if (setting.key === 'phonepe_config') setPhonepeConfig(setting.value);
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <header className=\"bg-white border-b border-gray-200\">
        <div className=\"container mx-auto px-6 py-4\">
          <div className=\"flex items-center gap-4\">
            <Link href=\"/\" className=\"p-2 hover:bg-gray-100 rounded-lg\">
              <ArrowLeft className=\"w-5 h-5\" />
            </Link>
            <div>
              <h1 className=\"text-xl font-bold text-gray-900\">Integration Settings</h1>
              <p className=\"text-sm text-gray-600\">Configure payment & notification integrations</p>
            </div>
          </div>
        </div>
      </header>

      <main className=\"container mx-auto px-6 py-8 max-w-4xl\">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className=\"space-y-6\">
          {/* WhatsApp Business API */}
          <div className=\"bg-white rounded-xl p-6 border border-gray-200\">
            <div className=\"flex items-center gap-2 mb-4\">
              <MessageSquare className=\"w-6 h-6 text-green-600\" />
              <h2 className=\"text-lg font-bold text-gray-900\">WhatsApp Business API</h2>
            </div>
            
            <div className=\"space-y-4\">
              <label className=\"flex items-center gap-3\">
                <input
                  type=\"checkbox\"
                  checked={whatsappConfig.enabled}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
                  className=\"w-5 h-5 text-primary-600 rounded\"/>
                <span className=\"font-medium\">Enable WhatsApp Notifications</span>
              </label>

              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">Business Phone Number</label>
                  <input
                    type=\"text\"
                    value={whatsappConfig.business_phone}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, business_phone: e.target.value })}
                    placeholder=\"+91 XXXXXXXXXX\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">API Key</label>
                  <input
                    type=\"password\"
                    value={whatsappConfig.api_key}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_key: e.target.value })}
                    placeholder=\"Your API key\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('whatsapp_config', whatsappConfig)}
                disabled={saving}
                className=\"flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg\"
              >
                <Save className=\"w-4 h-4\" />
                Save WhatsApp Config
              </button>
            </div>
          </div>

          {/* Razorpay */}
          <div className=\"bg-white rounded-xl p-6 border border-gray-200\">
            <div className=\"flex items-center gap-2 mb-4\">
              <CreditCard className=\"w-6 h-6 text-blue-600\" />
              <h2 className=\"text-lg font-bold text-gray-900\">Razorpay Payment Gateway</h2>
            </div>
            
            <div className=\"space-y-4\">
              <label className=\"flex items-center gap-3\">
                <input
                  type=\"checkbox\"
                  checked={razorpayConfig.enabled}
                  onChange={(e) => setRazorpayConfig({ ...razorpayConfig, enabled: e.target.checked })}
                  className=\"w-5 h-5 text-primary-600 rounded\"
                />
                <span className=\"font-medium\">Enable Razorpay</span>
              </label>

              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">Key ID</label>
                  <input
                    type=\"text\"
                    value={razorpayConfig.key_id}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_id: e.target.value })}
                    placeholder=\"rzp_test_xxxxx\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">Key Secret</label>
                  <input
                    type=\"password\"
                    value={razorpayConfig.key_secret}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_secret: e.target.value })}
                    placeholder=\"Your secret key\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('razorpay_config', razorpayConfig)}
                disabled={saving}
                className=\"flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg\"
              >
                <Save className=\"w-4 h-4\" />
                Save Razorpay Config
              </button>
            </div>
          </div>

          {/* PhonePe */}
          <div className=\"bg-white rounded-xl p-6 border border-gray-200\">
            <div className=\"flex items-center gap-2 mb-4\">
              <CreditCard className=\"w-6 h-6 text-purple-600\" />
              <h2 className=\"text-lg font-bold text-gray-900\">PhonePe Payment Gateway</h2>
            </div>
            
            <div className=\"space-y-4\">
              <label className=\"flex items-center gap-3\">
                <input
                  type=\"checkbox\"
                  checked={phonepeConfig.enabled}
                  onChange={(e) => setPhonepeConfig({ ...phonepeConfig, enabled: e.target.checked })}
                  className=\"w-5 h-5 text-primary-600 rounded\"
                />
                <span className=\"font-medium\">Enable PhonePe</span>
              </label>

              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">Merchant ID</label>
                  <input
                    type=\"text\"
                    value={phonepeConfig.merchant_id}
                    onChange={(e) => setPhonepeConfig({ ...phonepeConfig, merchant_id: e.target.value })}
                    placeholder=\"MERCHANTUAT\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
                <div>
                  <label className=\"text-sm font-medium text-gray-700\">Salt Key</label>
                  <input
                    type=\"password\"
                    value={phonepeConfig.salt_key}
                    onChange={(e) => setPhonepeConfig({ ...phonepeConfig, salt_key: e.target.value })}
                    placeholder=\"Salt key\"
                    className=\"w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500\"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('phonepe_config', phonepeConfig)}
                disabled={saving}
                className=\"flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg\"
              >
                <Save className=\"w-4 h-4\" />
                Save PhonePe Config
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
