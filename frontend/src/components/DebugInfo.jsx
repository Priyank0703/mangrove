import { useState } from 'react';
import axios from 'axios';

const DebugInfo = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [loading, setLoading] = useState(false);

    const testBackendConnection = async () => {
        setLoading(true);
        try {
            // Test health endpoint
            const healthResponse = await axios.get('/api/health');
            console.log('Health check response:', healthResponse.data);

            // Test registration endpoint
            const testUserData = {
                username: 'testuser' + Date.now(),
                email: 'test' + Date.now() + '@example.com',
                password: 'testpass123',
                firstName: 'Test',
                lastName: 'User',
                role: 'community'
            };

            const registerResponse = await axios.post('/api/auth/register', testUserData);
            console.log('Registration test response:', registerResponse.data);

            setDebugInfo({
                health: '✅ Connected',
                registration: '✅ Working',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Debug test error:', error);
            setDebugInfo({
                health: error.response?.status === 404 ? '❌ Not Found' : '❌ Error',
                registration: '❌ Failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Debug Info</h3>
            <button
                onClick={testBackendConnection}
                disabled={loading}
                className="w-full mb-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Backend'}
            </button>

            <div className="text-xs space-y-1">
                <div><strong>Health:</strong> {debugInfo.health || 'Not tested'}</div>
                <div><strong>Registration:</strong> {debugInfo.registration || 'Not tested'}</div>
                {debugInfo.error && <div><strong>Error:</strong> {debugInfo.error}</div>}
                {debugInfo.timestamp && <div><strong>Time:</strong> {debugInfo.timestamp}</div>}
            </div>
        </div>
    );
};

export default DebugInfo;
