import React, { useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { auth, signInWithEmailAndPassword, isFirebaseConfigured } from '../services/firebase';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isFirebaseConfigured) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } catch (err: any) {
        console.error(err);
        setError('Invalid email or password.');
        setLoading(false);
      }
    } else {
      // Mock Login Behavior if no Firebase keys
      setTimeout(() => {
        if (email && password) {
          onLogin();
        } else {
          setError('Please enter any email and password for demo.');
          setLoading(false);
        }
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Activity className="text-white w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">MediScan Inventory</h1>
        <p className="text-slate-500 mt-2 text-center">Manage your medical device inventory with ease.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {!isFirebaseConfigured && (
           <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 text-xs text-orange-700">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Demo Mode:</strong> Firebase is not configured. Enter any email/password to login. 
                <br/>To enable real backend, add keys to <code>services/firebase.ts</code>.
              </div>
           </div>
        )}
        
        {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                {error}
            </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="nurse@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
                Remember me
            </label>
            <a href="#" className="text-sm text-blue-600 font-medium">Need help?</a>
        </div>

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      
      <p className="mt-8 text-xs text-gray-400">Prototype Version 0.2.0 (Firebase Enabled)</p>
    </div>
  );
};