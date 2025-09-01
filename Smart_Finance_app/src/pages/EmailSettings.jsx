import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaCheck, FaTimes, FaSpinner, FaCog, FaFlask } from 'react-icons/fa';
import api from '../services/api';

const EmailSettings = () => {
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchEmailStatus();
  }, []);

  const fetchEmailStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/emails/status');
      setEmailStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching email status:', error);
      setEmailStatus({ configured: false, connectionStatus: { success: false } });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    try {
      setTestLoading(true);
      const response = await api.post('/emails/test', { testEmail });
      setTestResult({
        success: true,
        message: response.data.message,
        messageId: response.data.messageId
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send test email'
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading email settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <FaEnvelope className="text-2xl text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
              <p className="text-gray-600">Manage email notifications and settings</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Service Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2" />
              Email Service Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configuration Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Configuration</p>
                  <p className="text-sm text-gray-600">Email service setup</p>
                </div>
                <div className="flex items-center">
                  {emailStatus?.configured ? (
                    <>
                      <FaCheck className="text-green-500 mr-2" />
                      <span className="text-green-600 font-medium">Configured</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-500 mr-2" />
                      <span className="text-red-600 font-medium">Not Configured</span>
                    </>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Connection</p>
                  <p className="text-sm text-gray-600">SMTP server connection</p>
                </div>
                <div className="flex items-center">
                  {emailStatus?.connectionStatus?.success ? (
                    <>
                      <FaCheck className="text-green-500 mr-2" />
                      <span className="text-green-600 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-500 mr-2" />
                      <span className="text-red-600 font-medium">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!emailStatus?.configured && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Setup Required:</strong> Email service is not configured. 
                  Please set up your SMTP credentials in the server environment variables.
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>EMAIL_USER: Your email address</li>
                  <li>EMAIL_PASSWORD: Your app password</li>
                  <li>EMAIL_HOST: SMTP server (default: smtp.gmail.com)</li>
                  <li>EMAIL_PORT: SMTP port (default: 587)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Available Templates */}
          {emailStatus?.availableTemplates && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Email Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {emailStatus.availableTemplates.map((template) => (
                  <div key={template} className="bg-white rounded-lg border p-4 text-center">
                    <FaEnvelope className="text-indigo-600 text-2xl mx-auto mb-2" />
                    <p className="font-medium text-gray-900 capitalize">
                      {template.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Email */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaFlask className="mr-2" />
              Test Email Service
            </h2>
            
            <form onSubmit={handleTestEmail} className="space-y-4">
              <div>
                <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <div className="flex gap-4">
                  <input
                    type="email"
                    id="testEmail"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email to test..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={testLoading || !emailStatus?.configured}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {testLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaFlask className="mr-2" />
                        Send Test
                      </>
                    )}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <FaTimes className="text-red-500 mr-2" />
                    )}
                    <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                      {testResult.message}
                    </p>
                  </div>
                  {testResult.messageId && (
                    <p className="text-sm text-green-600 mt-1">
                      Message ID: {testResult.messageId}
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Email Configuration Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Email Configuration Help
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>For Gmail:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use your Gmail address as EMAIL_USER</li>
                <li>Generate an App Password for EMAIL_PASSWORD (not your regular password)</li>
                <li>Go to Google Account Settings → Security → 2-Step Verification → App passwords</li>
                <li>Use smtp.gmail.com as EMAIL_HOST and 587 as EMAIL_PORT</li>
              </ul>
              <p className="mt-3"><strong>Security Note:</strong> Never commit email credentials to version control. Use environment variables.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
