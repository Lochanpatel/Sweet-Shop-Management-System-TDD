import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Sweet, AuthResponse } from './types';

// --- MOCK API SERVICE ---
// Used when backend is unreachable (Demo Mode)

const MOCK_DB_SWEETS: Sweet[] = [
  { id: 1, name: 'Rainbow Lollipop', category: 'Hard Candy', price: 2.50, quantity: 50, imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Chocolate Frog', category: 'Chocolate', price: 4.00, quantity: 20 },
  { id: 3, name: 'Sour Worms', category: 'Gummy', price: 1.50, quantity: 100 },
  { id: 4, name: 'Licorice Wands', category: 'Hard Candy', price: 3.00, quantity: 0 },
];

const API_URL = 'http://localhost:3001/api';

const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AuthResponse['user'] | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const login = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
};

export default function App() {
  const { token, user, login, logout } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'register' | 'admin'>('home');
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  // Mock Mode State
  const [isMockMode, setIsMockMode] = useState(false);
  // Persistent mock data for the session
  const mockSweetsRef = useRef<Sweet[]>(MOCK_DB_SWEETS);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchSweets = useCallback(async () => {
    setLoading(true);
    
    // MOCK MODE LOGIC
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 600)); // Fake latency
      let data = [...mockSweetsRef.current];
      if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      if (category) data = data.filter(s => s.category === category);
      setSweets(data);
      setLoading(false);
      return;
    }

    // REAL BACKEND LOGIC
    try {
      const query = new URLSearchParams();
      if (search) query.append('name', search);
      if (category) query.append('category', category);

      const res = await fetch(`${API_URL}/sweets/search?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (!res.ok) throw new Error('Failed to fetch sweets.');
      const data = await res.json();
      setSweets(data);
      setBackendStatus('connected');
    } catch (err) {
      console.error(err);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, [search, category, token, isMockMode]);

  useEffect(() => {
    if (token || view === 'home' || view === 'admin') {
      fetchSweets();
    }
  }, [fetchSweets, token, view]);

  const handlePurchase = async (id: number) => {
    if (!token && !isMockMode) return setView('login');
    if (!token && isMockMode) return setView('login'); // Require login even in mock mode

    // MOCK MODE
    if (isMockMode) {
      mockSweetsRef.current = mockSweetsRef.current.map(s => 
        s.id === id ? { ...s, quantity: Math.max(0, s.quantity - 1) } : s
      );
      alert('Sweet purchased! (Demo Mode)');
      fetchSweets();
      return;
    }

    // REAL BACKEND
    try {
      const res = await fetch(`${API_URL}/sweets/${id}/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity: 1 })
      });
      if (!res.ok) throw new Error('Purchase failed');
      alert('Sweet purchased!');
      fetchSweets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleMockAdminActions = (action: 'add' | 'edit' | 'delete' | 'restock', payload: any) => {
     if (action === 'add') {
         const newSweet = { ...payload, id: Date.now(), createdAt: new Date().toISOString() };
         mockSweetsRef.current.push(newSweet);
         alert('Sweet added! (Demo Mode)');
     } else if (action === 'delete') {
         mockSweetsRef.current = mockSweetsRef.current.filter(s => s.id !== payload.id);
         alert('Sweet deleted! (Demo Mode)');
     } else if (action === 'edit') {
         mockSweetsRef.current = mockSweetsRef.current.map(s => s.id === payload.id ? { ...s, ...payload.data } : s);
         alert('Sweet updated! (Demo Mode)');
     } else if (action === 'restock') {
         mockSweetsRef.current = mockSweetsRef.current.map(s => s.id === payload.id ? { ...s, quantity: s.quantity + payload.quantity } : s);
         alert('Sweet restocked! (Demo Mode)');
     }
     fetchSweets();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-pink-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              <span className="text-2xl font-bold">🍬 SweetShop</span>
              {isMockMode && <span className="ml-2 text-xs bg-yellow-400 text-pink-900 px-2 py-1 rounded font-bold uppercase tracking-wider">Demo Mode</span>}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm bg-pink-700 px-3 py-1 rounded-full">
                    {user.name || user.email}
                  </span>
                  {user.role === UserRole.ADMIN && (
                     <button onClick={() => setView('admin')} className="hover:text-pink-200">Admin</button>
                  )}
                  <button onClick={logout} className="hover:text-pink-200">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => setView('login')} className="hover:text-pink-200">Login</button>
                  <button onClick={() => setView('register')} className="bg-white text-pink-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100">Register</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {backendStatus === 'disconnected' && !isMockMode && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex justify-between items-center" role="alert">
            <div>
              <strong className="font-bold">Backend Disconnected! </strong>
              <span className="block sm:inline">Run `npm run start` in the backend folder.</span>
            </div>
            <button 
              onClick={() => { setIsMockMode(true); setBackendStatus('unknown'); }}
              className="bg-red-700 text-white px-4 py-2 rounded font-bold hover:bg-red-800 transition"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
              <input 
                placeholder="Search sweets..." 
                className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-pink-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select 
                className="border p-2 rounded outline-none focus:ring-2 focus:ring-pink-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Chocolate">Chocolate</option>
                <option value="Gummy">Gummy</option>
                <option value="Hard Candy">Hard Candy</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                 <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-pink-600 rounded-full" role="status" aria-label="loading"></div>
                 <span className="block mt-2">Loading goodies...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sweets.map(sweet => (
                  <div key={sweet.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                    <div className="h-48 bg-gray-100 flex items-center justify-center text-4xl relative overflow-hidden group">
                      <img 
                        src={sweet.imageUrl || `https://picsum.photos/seed/${sweet.id}/400/300`} 
                        alt={sweet.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {sweet.quantity === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 font-bold transform -rotate-12">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-pink-600 font-bold uppercase tracking-wide">{sweet.category}</p>
                          <h3 className="text-lg font-bold text-gray-900 mt-1">{sweet.name}</h3>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                          ${typeof sweet.price === 'number' ? sweet.price.toFixed(2) : sweet.price}
                        </span>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center pt-4">
                        <span className={`text-sm ${sweet.quantity === 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          {sweet.quantity === 0 ? 'Out of Stock' : `${sweet.quantity} in stock`}
                        </span>
                        <button
                          onClick={() => handlePurchase(sweet.id)}
                          disabled={sweet.quantity === 0}
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {sweets.length === 0 && !loading && (
                   <div className="col-span-full text-center py-12 text-gray-500">
                     No sweets found. {user?.role === UserRole.ADMIN ? 'Add some in Admin panel!' : ''}
                   </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auth Forms */}
        {(view === 'login' || view === 'register') && (
          <AuthForm 
            mode={view} 
            isMock={isMockMode}
            onSuccess={(data) => {
              login(data);
              setView('home');
            }}
          />
        )}

        {/* Admin Panel */}
        {view === 'admin' && user?.role === UserRole.ADMIN && (
          <AdminPanel 
            token={token!} 
            isMock={isMockMode}
            sweets={sweets}
            refresh={fetchSweets}
            onAction={handleMockAdminActions}
            onBack={() => setView('home')} 
          />
        )}
      </main>
    </div>
  );
}

// --- Subcomponents ---

function AuthForm({ mode, isMock, onSuccess }: { mode: 'login' | 'register', isMock: boolean, onSuccess: (d: AuthResponse) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isMock) {
      // Mock Auth Logic
      setTimeout(() => {
        const mockUser = {
          id: 99,
          email,
          name: name || email.split('@')[0],
          role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER
        };
        onSuccess({ token: 'mock-jwt-token', user: mockUser });
      }, 500);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center capitalize">{mode}</h2>
      {isMock && <div className="mb-4 text-yellow-700 bg-yellow-100 p-2 rounded text-xs text-center">Demo Mode: Any credentials work. Use 'admin@test.com' for Admin access.</div>}
      {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
           <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 font-bold transition">
          {mode === 'register' ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

function AdminPanel({ token, onBack, isMock, onAction, sweets, refresh }: any) {
  const [formData, setFormData] = useState({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
  const [editMode, setEditMode] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState<{ [key: number]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ADD NEW
    if (editMode === null) {
      if (isMock) {
        onAction('add', formData);
        setFormData({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
        return;
      }
      try {
        const res = await fetch(`${API_URL}/sweets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if(res.ok) {
          alert('Sweet added!');
          setFormData({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
          refresh();
        } else {
           const data = await res.json();
           alert(data.message || 'Error adding sweet');
        }
      } catch (e) { alert('Error adding sweet'); }
    } 
    // UPDATE EXISTING
    else {
       if (isMock) {
        onAction('edit', { id: editMode, data: formData });
        setEditMode(null);
        setFormData({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
        return;
      }
      try {
        const res = await fetch(`${API_URL}/sweets/${editMode}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        if(res.ok) {
          alert('Sweet updated!');
          setEditMode(null);
          setFormData({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
          refresh();
        } else {
           const data = await res.json();
           alert(data.message || 'Error updating sweet');
        }
      } catch (e) { alert('Error updating sweet'); }
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Delete this sweet?')) return;
    if (isMock) {
      onAction('delete', { id });
      return;
    }
    try {
       const res = await fetch(`${API_URL}/sweets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
       if (res.ok) {
           refresh();
       } else {
           const data = await res.json();
           alert(data.message || data.error || 'Failed to delete');
       }
    } catch(e) { alert('Error deleting'); }
  };

  const handleRestock = async (id: number) => {
    const qty = parseInt(restockQty[id] || '0');
    if (qty <= 0) return alert('Enter valid quantity');
    
    if (isMock) {
      onAction('restock', { id, quantity: qty });
      setRestockQty({...restockQty, [id]: ''});
      return;
    }

    try {
      const res = await fetch(`${API_URL}/sweets/${id}/restock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: qty })
      });
      if (res.ok) {
          alert('Restocked!');
          setRestockQty({...restockQty, [id]: ''});
          refresh();
      } else {
          alert('Restock failed');
      }
    } catch(e) { alert('Error'); }
  };

  const startEdit = (sweet: any) => {
    setEditMode(sweet.id);
    setFormData({ name: sweet.name, category: sweet.category, price: sweet.price, quantity: sweet.quantity, imageUrl: sweet.imageUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={onBack} className="text-pink-600 hover:underline">&larr; Back to Shop</button>
      
      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editMode ? 'Edit Sweet' : 'Add New Sweet'}</h2>
          {editMode && <button onClick={() => { setEditMode(null); setFormData({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' }); }} className="text-sm text-gray-500 underline">Cancel Edit</button>}
          {isMock && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Demo Mode</span>}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
          <input className="border p-2 rounded" type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
          <input className="border p-2 rounded" type="number" placeholder="Qty" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required />
          
          <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sweet Image</label>
              <input 
                  type="file" 
                  accept="image/*"
                  className="w-full border p-2 rounded bg-gray-50" 
                  onChange={handleFileChange} 
              />
              {formData.imageUrl && (
                  <div className="mt-2 text-xs text-green-600 font-bold">Image loaded successfully!</div>
              )}
          </div>

          <button className={`col-span-2 ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'} text-white py-2 rounded font-bold transition`}>
            {editMode ? 'Update Sweet' : 'Add Inventory'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-bold p-4 bg-gray-50 border-b">Inventory Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sweets.map((sweet: any) => (
                <tr key={sweet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={sweet.imageUrl || `https://picsum.photos/seed/${sweet.id}/100`} alt="" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{sweet.name}</div>
                            <div className="text-sm text-gray-500">{sweet.category}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sweet.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {sweet.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sweet.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                     <input 
                       type="number" 
                       className="w-16 border rounded p-1 text-sm" 
                       placeholder="+Qty"
                       value={restockQty[sweet.id] || ''}
                       onChange={(e) => setRestockQty({...restockQty, [sweet.id]: e.target.value})}
                     />
                     <button onClick={() => handleRestock(sweet.id)} className="text-green-600 hover:text-green-900 text-sm font-bold">+</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => startEdit(sweet)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(sweet.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}