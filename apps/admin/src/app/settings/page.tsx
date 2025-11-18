'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save, MessageSquare, CreditCard, Mail, Phone } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

function SettingsPageContent() {
  const [whatsappConfig, setWhatsappConfig] = useState({ 
    enabled: false, 
    provider: 'twilio',
    business_phone: '', 
    api_key: '', 
    account_sid: '',
    auth_token: '',
    template_id: '' 
  });
  const [razorpayConfig, setRazorpayConfig] = useState({ enabled: false, key_id: '', key_secret: '' });
  const [phonepeConfig, setPhonepeConfig] = useState({ enabled: false, merchant_id: '', salt_key: '', salt_index: '1' });
  const [smsConfig, setSmsConfig] = useState({ 
    enabled: false, 
    provider: 'twilio',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    msg91_auth_key: '',
    msg91_sender_id: '',
    msg91_template_id: ''
  });
  const [emailConfig, setEmailConfig] = useState({ 
    enabled: false, 
    provider: 'resend',
    resend_api_key: '',
    resend_from_email: '',
    sendgrid_api_key: '',
    sendgrid_from_email: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*');
      
      data?.forEach((setting) => {
        if (setting.key === 'whatsapp_config') setWhatsappConfig({ ...whatsappConfig, ...setting.value });
        if (setting.key === 'razorpay_config') setRazorpayConfig(setting.value);
        if (setting.key === 'phonepe_config') setPhonepeConfig(setting.value);
        if (setting.key === 'sms_config') setSmsConfig({ ...smsConfig, ...setting.value });
        if (setting.key === 'email_config') setEmailConfig({ ...emailConfig, ...setting.value });
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
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Settings</h2>
        <p className="text-gray-600">Configure payment & notification integrations</p>
      </div>
      <div className="max-w-4xl">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* WhatsApp Business API */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">WhatsApp Business API</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={whatsappConfig.enabled}
                  onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"/>
                <span className="font-medium">Enable WhatsApp Notifications</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Business Phone Number</label>
                  <input
                    type="text"
                    value={whatsappConfig.business_phone}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, business_phone: e.target.value })}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    value={whatsappConfig.api_key}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_key: e.target.value })}
                    placeholder="Your API key"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('whatsapp_config', whatsappConfig)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save WhatsApp Config
              </button>
            </div>
          </div>

          {/* Razorpay */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Razorpay Payment Gateway</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={razorpayConfig.enabled}
                  onChange={(e) => setRazorpayConfig({ ...razorpayConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="font-medium">Enable Razorpay</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Key ID</label>
                  <input
                    type="text"
                    value={razorpayConfig.key_id}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_id: e.target.value })}
                    placeholder="rzp_test_xxxxx"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Key Secret</label>
                  <input
                    type="password"
                    value={razorpayConfig.key_secret}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_secret: e.target.value })}
                    placeholder="Your secret key"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('razorpay_config', razorpayConfig)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Razorpay Config
              </button>
            </div>
          </div>

          {/* PhonePe */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">PhonePe Payment Gateway</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={phonepeConfig.enabled}
                  onChange={(e) => setPhonepeConfig({ ...phonepeConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="font-medium">Enable PhonePe</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Merchant ID</label>
                  <input
                    type="text"
                    value={phonepeConfig.merchant_id}
                    onChange={(e) => setPhonepeConfig({ ...phonepeConfig, merchant_id: e.target.value })}
                    placeholder="MERCHANTUAT"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Salt Key</label>
                  <input
                    type="password"
                    value={phonepeConfig.salt_key}
                    onChange={(e) => setPhonepeConfig({ ...phonepeConfig, salt_key: e.target.value })}
                    placeholder="Salt key"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => saveSetting('phonepe_config', phonepeConfig)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save PhonePe Config
              </button>
            </div>
          </div>

          {/* SMS Configuration */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">SMS Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={smsConfig.enabled}
                  onChange={(e) => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="font-medium">Enable SMS Notifications</span>
              </label>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Provider</label>
                <select
                  value={smsConfig.provider || 'twilio'}
                  onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="twilio">Twilio</option>
                  <option value="msg91">MSG91</option>
                </select>
              </div>

              {smsConfig.provider === 'twilio' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account SID</label>
                    <input
                      type="text"
                      value={smsConfig.twilio_account_sid || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, twilio_account_sid: e.target.value })}
                      placeholder="ACxxxxxxxxxxxxx"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auth Token</label>
                    <input
                      type="password"
                      value={smsConfig.twilio_auth_token || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, twilio_auth_token: e.target.value })}
                      placeholder="Your auth token"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={smsConfig.twilio_phone_number || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, twilio_phone_number: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auth Key</label>
                    <input
                      type="password"
                      value={smsConfig.msg91_auth_key || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, msg91_auth_key: e.target.value })}
                      placeholder="Your MSG91 auth key"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sender ID</label>
                    <input
                      type="text"
                      value={smsConfig.msg91_sender_id || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, msg91_sender_id: e.target.value })}
                      placeholder="LABLINK"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Template ID</label>
                    <input
                      type="text"
                      value={smsConfig.msg91_template_id || ''}
                      onChange={(e) => setSmsConfig({ ...smsConfig, msg91_template_id: e.target.value })}
                      placeholder="Template ID (optional)"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={() => saveSetting('sms_config', smsConfig)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save SMS Config
              </button>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Email Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={emailConfig.enabled}
                  onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="font-medium">Enable Email Notifications</span>
              </label>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Provider</label>
                <select
                  value={emailConfig.provider || 'resend'}
                  onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="resend">Resend</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              {emailConfig.provider === 'resend' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="password"
                      value={emailConfig.resend_api_key || ''}
                      onChange={(e) => setEmailConfig({ ...emailConfig, resend_api_key: e.target.value })}
                      placeholder="re_xxxxxxxxxxxxx"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">From Email</label>
                    <input
                      type="email"
                      value={emailConfig.resend_from_email || ''}
                      onChange={(e) => setEmailConfig({ ...emailConfig, resend_from_email: e.target.value })}
                      placeholder="noreply@lablink.com"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="password"
                      value={emailConfig.sendgrid_api_key || ''}
                      onChange={(e) => setEmailConfig({ ...emailConfig, sendgrid_api_key: e.target.value })}
                      placeholder="SG.xxxxxxxxxxxxx"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">From Email</label>
                    <input
                      type="email"
                      value={emailConfig.sendgrid_from_email || ''}
                      onChange={(e) => setEmailConfig({ ...emailConfig, sendgrid_from_email: e.target.value })}
                      placeholder="noreply@lablink.com"
                      className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={() => saveSetting('email_config', emailConfig)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Email Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SettingsPage() {
  return <SettingsPageContent />;
}
