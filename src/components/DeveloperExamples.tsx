/**
 * Developer Integration Examples
 * Shows code examples and API documentation for CrossBridge integration
 */
import React, { useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Code, Terminal, Globe, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface DeveloperExamplesProps {
  onBack: () => void;
}

const codeExamples = {
  webhook: {
    title: 'Webhook Integration',
    description: 'Handle real-time transaction updates',
    language: 'javascript',
    code: `// Express.js webhook handler
const crypto = require('crypto');

app.post('/api/webhooks/crossbridge', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-crossbridge-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CROSSBRIDGE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'transaction.completed':
      handleTransactionComplete(data);
      break;
    case 'deposit.confirmed':
      handleDepositConfirmed(data);
      break;
    case 'withdrawal.processed':
      handleWithdrawalProcessed(data);
      break;
  }
  
  res.status(200).json({ received: true });
});`
  },
  api: {
    title: 'API Integration',
    description: 'Send money via CrossBridge API',
    language: 'javascript',
    code: `// Node.js API integration
const axios = require('axios');

class CrossBridgeAPI {
  constructor(apiKey, environment = 'sandbox') {
    this.apiKey = apiKey;
    this.baseURL = environment === 'production' 
      ? 'https://api.crossbridge.com/v1'
      : 'https://sandbox-api.crossbridge.com/v1';
  }
  
  async sendMoney(params) {
    const response = await axios.post(\`\${this.baseURL}/transactions/send\`, {
      recipient_id: params.recipientId,
      amount: params.amount,
      currency: params.currency,
      recipient_currency: params.recipientCurrency,
      note: params.note,
      category: params.category
    }, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
  
  async getTransactionStatus(transactionId) {
    const response = await axios.get(
      \`\${this.baseURL}/transactions/\${transactionId}\`,
      {
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`
        }
      }
    );
    
    return response.data;
  }
}

// Usage
const crossbridge = new CrossBridgeAPI('your_api_key');

const transaction = await crossbridge.sendMoney({
  recipientId: 'user_123',
  amount: 100,
  currency: 'NGN',
  recipientCurrency: 'GBP',
  note: 'Family support',
  category: 'family_friends'
});`
  },
  ussd: {
    title: 'USSD Integration',
    description: 'Integrate with telecom providers for USSD functionality',
    language: 'javascript',
    code: `// USSD Integration with African telecom providers
const ussdHandler = {
  // MTN Nigeria Integration
  mtn: {
    endpoint: 'https://api.mtn.ng/ussd/v1',
    authenticate: async (credentials) => {
      // MTN API authentication
      const response = await axios.post(\`\${endpoint}/auth\`, credentials);
      return response.data.access_token;
    },
    
    initiateSession: async (phoneNumber, amount, token) => {
      return await axios.post(\`\${endpoint}/sessions\`, {
        msisdn: phoneNumber,
        ussd_code: \`*737*1*\${amount}*1234567890#\`,
        session_id: generateSessionId()
      }, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
    }
  },
  
  // Airtel Nigeria Integration  
  airtel: {
    endpoint: 'https://api.airtel.ng/ussd/v1',
    initiateSession: async (phoneNumber, amount) => {
      return await axios.post(\`\${endpoint}/sessions\`, {
        msisdn: phoneNumber,
        ussd_string: \`*432*1*\${amount}*1234567890#\`
      });
    }
  },
  
  // Glo Nigeria Integration
  glo: {
    endpoint: 'https://api.gloworld.com/ussd/v1',
    initiateSession: async (phoneNumber, amount) => {
      return await axios.post(\`\${endpoint}/sessions\`, {
        msisdn: phoneNumber,
        ussd_code: \`*805*\${amount}*1234567890#\`
      });
    }
  }
};

// CrossBridge USSD Integration
app.post('/api/ussd/initiate', async (req, res) => {
  const { phoneNumber, amount, provider } = req.body;
  
  try {
    const handler = ussdHandler[provider];
    if (!handler) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }
    
    const result = await handler.initiateSession(phoneNumber, amount);
    
    // Store session for tracking
    await storeUSSDSession({
      sessionId: result.session_id,
      phoneNumber,
      amount,
      provider,
      status: 'initiated'
    });
    
    res.json({
      success: true,
      sessionId: result.session_id,
      message: 'USSD session initiated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`
  },
  mobile: {
    title: 'Mobile SDK',
    description: 'React Native integration for mobile apps',
    language: 'javascript',
    code: `// React Native CrossBridge SDK
import CrossBridge from '@crossbridge/react-native-sdk';

// Initialize SDK
const crossbridge = new CrossBridge({
  apiKey: 'your_api_key',
  environment: 'sandbox' // or 'production'
});

// React Native Component
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

export default function SendMoneyScreen() {
  const [loading, setLoading] = useState(false);
  
  const handleSendMoney = async () => {
    setLoading(true);
    
    try {
      // Open CrossBridge payment sheet
      const result = await crossbridge.presentPaymentSheet({
        amount: 100,
        currency: 'NGN',
        recipientCurrency: 'GBP',
        recipient: {
          name: 'John Doe',
          phone: '+447123456789',
          country: 'GB'
        },
        metadata: {
          category: 'family_friends',
          note: 'Monthly allowance'
        }
      });
      
      if (result.status === 'completed') {
        Alert.alert(
          'Success', 
          \`Money sent successfully! Transaction ID: \${result.transactionId}\`
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Send Money with CrossBridge
      </Text>
      <Button 
        title={loading ? "Processing..." : "Send £100"}
        onPress={handleSendMoney}
        disabled={loading}
      />
    </View>
  );
}

// Handle webhook notifications in React Native
crossbridge.onNotification((notification) => {
  const { type, data } = notification;
  
  switch (type) {
    case 'transaction_completed':
      showInAppNotification('Transaction completed successfully');
      break;
    case 'deposit_confirmed':
      showInAppNotification('Deposit confirmed');
      break;
  }
});`
  },
  python: {
    title: 'Python SDK',
    description: 'Server-side integration with Python',
    language: 'python',
    code: `# Python CrossBridge SDK
import requests
import hmac
import hashlib
import json

class CrossBridgeAPI:
    def __init__(self, api_key, environment='sandbox'):
        self.api_key = api_key
        self.base_url = (
            'https://api.crossbridge.com/v1' if environment == 'production'
            else 'https://sandbox-api.crossbridge.com/v1'
        )
        
    def _make_request(self, method, endpoint, data=None):
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.request(method, url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    
    def send_money(self, recipient_id, amount, currency, recipient_currency, 
                   note=None, category=None):
        data = {
            'recipient_id': recipient_id,
            'amount': amount,
            'currency': currency,
            'recipient_currency': recipient_currency,
            'note': note,
            'category': category
        }
        
        return self._make_request('POST', '/transactions/send', data)
    
    def get_transaction(self, transaction_id):
        return self._make_request('GET', f'/transactions/{transaction_id}')
    
    def get_balance(self):
        return self._make_request('GET', '/wallet/balance')
    
    def verify_webhook(self, payload, signature, secret):
        """Verify webhook signature"""
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)

# Django webhook handler
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def crossbridge_webhook(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    signature = request.headers.get('X-CrossBridge-Signature')
    payload = request.body.decode('utf-8')
    
    # Initialize CrossBridge API
    api = CrossBridgeAPI('your_api_key')
    
    if not api.verify_webhook(payload, signature, settings.CROSSBRIDGE_WEBHOOK_SECRET):
        return JsonResponse({'error': 'Invalid signature'}, status=401)
    
    data = json.loads(payload)
    event = data.get('event')
    
    if event == 'transaction.completed':
        # Handle completed transaction
        transaction = data.get('data')
        # Update your database, send notifications, etc.
        
    return JsonResponse({'status': 'received'})`
  }
};

export function DeveloperExamples({ onBack }: DeveloperExamplesProps) {
  const [activeTab, setActiveTab] = useState('webhook');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const openDocumentation = () => {
    window.open('https://docs.crossbridge.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Developer Integration
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={openDocumentation}
          className="backdrop-blur-md bg-white/30 dark:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/30 dark:border-white/20"
        >
          <ExternalLink size={20} />
        </Button>
      </div>

      {/* Introduction */}
      <div className="px-6 mb-8">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-white/10 rounded-3xl p-6 border border-white/30 dark:border-white/20 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Code size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                CrossBridge API Integration Examples
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Complete code examples for integrating CrossBridge into your applications. 
                Supports webhooks, mobile SDKs, USSD integration, and server-side APIs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-1 mb-6">
            <TabsTrigger value="webhook" className="rounded-xl">
              <Globe size={16} className="mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="api" className="rounded-xl">
              <Terminal size={16} className="mr-2" />
              REST API
            </TabsTrigger>
            <TabsTrigger value="ussd" className="rounded-xl">
              <Smartphone size={16} className="mr-2" />
              USSD
            </TabsTrigger>
            <TabsTrigger value="mobile" className="rounded-xl">
              <Code size={16} className="mr-2" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="python" className="rounded-xl">
              <CheckCircle size={16} className="mr-2" />
              Python
            </TabsTrigger>
          </TabsList>

          {Object.entries(codeExamples).map(([key, example]) => (
            <TabsContent key={key} value={key}>
              <div className="backdrop-blur-xl bg-white/40 dark:bg-white/10 rounded-3xl border border-white/30 dark:border-white/20 shadow-lg overflow-hidden">
                {/* Example Header */}
                <div className="p-6 border-b border-white/30 dark:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {example.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {example.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(example.code)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Copy size={16} className="mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Code Block */}
                <div className="relative">
                  <pre className="p-6 text-sm overflow-x-auto">
                    <code className="text-gray-800 dark:text-gray-200 font-mono">
                      {example.code}
                    </code>
                  </pre>
                  
                  {/* Language Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      {example.language}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* API Endpoints Reference */}
      <div className="px-6 mt-8 mb-6">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-white/10 rounded-3xl p-6 border border-white/30 dark:border-white/20 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Quick API Reference
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { method: 'POST', endpoint: '/auth/login', desc: 'User authentication' },
              { method: 'POST', endpoint: '/transactions/send', desc: 'Send money' },
              { method: 'POST', endpoint: '/transactions/withdraw', desc: 'Withdraw to bank' },
              { method: 'GET', endpoint: '/wallet/balance', desc: 'Get wallet balance' },
              { method: 'POST', endpoint: '/banking/link-account', desc: 'Link bank account' },
              { method: 'GET', endpoint: '/analytics/summary', desc: 'Transaction analytics' },
              { method: 'POST', endpoint: '/ussd/initiate', desc: 'USSD integration' },
              { method: 'POST', endpoint: '/webhooks/endpoint', desc: 'Webhook receiver' }
            ].map((api, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white/30 dark:bg-white/5 rounded-xl border border-white/30 dark:border-white/20"
              >
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  api.method === 'GET' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {api.method}
                </span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {api.endpoint}
                </code>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {api.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Full Documentation
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Visit <code>docs.crossbridge.com</code> for complete API documentation, 
              authentication guides, and more integration examples.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
