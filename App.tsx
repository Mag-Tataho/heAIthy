import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Utensils, MessageSquare, User, Activity, Droplets, 
  ChevronRight, Lock, Sparkles, TrendingUp, Scale, LogOut, 
  AlertCircle, CheckCircle2, Menu, X, Sun, Moon, Mail, Key, ArrowRight,
  Bell, Link, ArrowLeft, Shield, Crown
} from './components/Icons';
import { AdBanner } from './components/AdBanner';
import { WeightChart, MacroChart } from './components/Charts';
import { PaywallModal } from './components/PaywallModal';
import { generateMealPlan, generateNutritionAdvice } from './services/geminiService';
import { api } from './services/api';
import { 
  UserProfile, Gender, Goal, ActivityLevel, 
  DietaryPreference, DailyPlan, ChatMessage, PaymentStatus
} from './types';

// --- Default Data ---
const DEFAULT_USER: UserProfile = {
  name: '',
  email: '',
  age: 25,
  gender: Gender.Male,
  height: 175,
  weight: 70,
  goal: Goal.LoseWeight,
  activityLevel: ActivityLevel.Moderate,
  dietaryPreference: DietaryPreference.None,
  allergies: '',
  isPremium: false,
  paymentStatus: 'none',
  lastTransactionId: ''
};

const MOCK_WEIGHT_DATA = [
  { date: 'Mon', weight: 72.5 },
  { date: 'Tue', weight: 72.2 },
  { date: 'Wed', weight: 72.0 },
  { date: 'Thu', weight: 71.8 },
  { date: 'Fri', weight: 71.9 },
  { date: 'Sat', weight: 71.5 },
  { date: 'Sun', weight: 71.2 },
];

const getStaticPlan = (preference: DietaryPreference): DailyPlan => {
  switch (preference) {
    case DietaryPreference.Vegan:
      return {
        day: 'Vegan Sample',
        breakfast: { name: 'Tofu Scramble', description: 'Crumbled tofu with turmeric, spinach, and tomatoes.', calories: 320, macros: { protein: '22g', carbs: '15g', fats: '18g' } },
        lunch: { name: 'Quinoa Buddha Bowl', description: 'Quinoa, chickpeas, avocado, and tahini dressing.', calories: 450, macros: { protein: '18g', carbs: '55g', fats: '20g' } },
        dinner: { name: 'Lentil Curry', description: 'Red lentils simmered in coconut milk with basmati rice.', calories: 500, macros: { protein: '25g', carbs: '65g', fats: '15g' } },
        snack: { name: 'Apple & Almond Butter', description: 'Sliced apple with a tablespoon of almond butter.', calories: 200, macros: { protein: '4g', carbs: '25g', fats: '10g' } },
        totalMacros: { calories: 1470, protein: 69, carbs: 160, fats: 63 }
      };
    case DietaryPreference.Vegetarian:
      return {
        day: 'Vegetarian Sample',
        breakfast: { name: 'Greek Yogurt Parfait', description: 'Greek yogurt with honey, granola, and berries.', calories: 350, macros: { protein: '20g', carbs: '45g', fats: '8g' } },
        lunch: { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, basil, and balsamic glaze.', calories: 400, macros: { protein: '18g', carbs: '12g', fats: '30g' } },
        dinner: { name: 'Vegetable Stir-Fry', description: 'Mixed vegetables and tofu in soy ginger sauce.', calories: 450, macros: { protein: '25g', carbs: '50g', fats: '15g' } },
        snack: { name: 'Hummus & Carrots', description: 'Carrot sticks with creamy hummus.', calories: 180, macros: { protein: '6g', carbs: '20g', fats: '10g' } },
        totalMacros: { calories: 1380, protein: 69, carbs: 127, fats: 63 }
      };
    case DietaryPreference.Keto:
      return {
        day: 'Keto Sample',
        breakfast: { name: 'Bacon & Eggs', description: 'Two eggs fried in butter with bacon strips.', calories: 450, macros: { protein: '28g', carbs: '2g', fats: '35g' } },
        lunch: { name: 'Chicken Caesar Salad', description: 'Grilled chicken, parmesan, and caesar dressing (no croutons).', calories: 500, macros: { protein: '40g', carbs: '5g', fats: '35g' } },
        dinner: { name: 'Ribeye Steak & Asparagus', description: 'Seared ribeye steak with buttered asparagus.', calories: 650, macros: { protein: '50g', carbs: '4g', fats: '45g' } },
        snack: { name: 'Cheese Cubes', description: 'Cheddar cheese cubes.', calories: 200, macros: { protein: '14g', carbs: '1g', fats: '16g' } },
        totalMacros: { calories: 1800, protein: 132, carbs: 12, fats: 131 }
      };
    case DietaryPreference.Paleo:
      return {
        day: 'Paleo Sample',
        breakfast: { name: 'Fruit Salad & Nuts', description: 'Mixed seasonal berries with walnuts.', calories: 300, macros: { protein: '8g', carbs: '35g', fats: '18g' } },
        lunch: { name: 'Grilled Chicken Salad', description: 'Greens, grilled chicken, avocado, olive oil.', calories: 450, macros: { protein: '35g', carbs: '10g', fats: '28g' } },
        dinner: { name: 'Salmon & Sweet Potato', description: 'Baked salmon with roasted sweet potato wedges.', calories: 550, macros: { protein: '30g', carbs: '40g', fats: '25g' } },
        snack: { name: 'Hard Boiled Eggs', description: 'Two hard boiled eggs.', calories: 140, macros: { protein: '12g', carbs: '1g', fats: '10g' } },
        totalMacros: { calories: 1440, protein: 85, carbs: 86, fats: 81 }
      };
    case DietaryPreference.Halal:
        return {
        day: 'Halal Sample',
        breakfast: { name: 'Oatmeal with Dates', description: 'Oats cooked with milk and chopped dates.', calories: 380, macros: { protein: '10g', carbs: '70g', fats: '6g' } },
        lunch: { name: 'Grilled Chicken Kabob', description: 'Halal chicken breast skewers with rice.', calories: 500, macros: { protein: '45g', carbs: '50g', fats: '12g' } },
        dinner: { name: 'Beef Stew', description: 'Slow cooked halal beef chunks with carrots and potatoes.', calories: 600, macros: { protein: '40g', carbs: '35g', fats: '30g' } },
        snack: { name: 'Almonds & Raisins', description: 'Handful of almonds and raisins.', calories: 200, macros: { protein: '6g', carbs: '20g', fats: '14g' } },
        totalMacros: { calories: 1680, protein: 101, carbs: 175, fats: 62 }
        };
    default:
      return {
        day: 'Balanced Sample',
        breakfast: { name: 'Oatmeal with Berries', description: 'Rolled oats topped with fresh blueberries and honey.', calories: 350, macros: { protein: '12g', carbs: '60g', fats: '6g' } },
        lunch: { name: 'Grilled Chicken Salad', description: 'Mixed greens with grilled chicken breast and vinaigrette.', calories: 450, macros: { protein: '40g', carbs: '15g', fats: '20g' } },
        dinner: { name: 'Baked Salmon & Veggies', description: 'Salmon fillet with roasted asparagus and quinoa.', calories: 550, macros: { protein: '35g', carbs: '45g', fats: '25g' } },
        snack: { name: 'Greek Yogurt', description: 'Plain greek yogurt with a sprinkle of nuts.', calories: 150, macros: { protein: '15g', carbs: '8g', fats: '5g' } },
        totalMacros: { calories: 1500, protein: 102, carbs: 128, fats: 56 }
      };
  }
};

// --- Sub-Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  </div>
);

const FeatureLockOverlay = ({ onUpgrade, text }: { onUpgrade: () => void, text?: string }) => (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center rounded-xl">
    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-3">
      <Lock className="w-6 h-6 text-amber-500" />
    </div>
    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Premium Feature</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{text || "Unlock AI personalization and detailed tracking."}</p>
    <button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform active:scale-95 transition-all text-sm">
      Unlock Now
    </button>
  </div>
);

// --- Helper Functions ---

const formatMessageText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

// --- Main App Component ---

type AppView = 'auth' | 'onboarding' | 'app' | 'admin';
type AuthMode = 'login' | 'signup';
type ProfileView = 'menu' | 'edit_profile' | 'diet_preferences' | 'notifications' | 'integrations';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [userName, setUserName] = useState('');

  const [activeTab, setActiveTab] = useState<'home' | 'meals' | 'chat' | 'profile'>('home');
  const [profileView, setProfileView] = useState<ProfileView>('menu');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [generatedPlan, setGeneratedPlan] = useState<DailyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AI nutrition assistant. How can I help you reach your goals today?', timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Admin State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  
  const [notificationSettings, setNotificationSettings] = useState({
    mealReminders: true,
    waterReminders: true,
    weightReminders: false,
  });
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('heaithy_dark_mode');
    if (savedTheme) setIsDarkMode(JSON.parse(savedTheme));

    const savedUser = localStorage.getItem('heaithy_user');
    if (savedUser) {
       const p = JSON.parse(savedUser);
       // Check if saved session is admin
       if(p.isAdmin) {
         setCurrentView('admin');
         loadAdminData();
       } else {
         setUser(p);
         setCurrentView('app');
       }
    }
  }, []);

  useEffect(() => {
    // SYNC with Backend whenever user object changes
    if (user.email && currentView === 'app') {
      localStorage.setItem('heaithy_user', JSON.stringify(user));
      api.syncProfile(user.email, user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('heaithy_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const loadAdminData = async () => {
    const users = await api.getAdminUsers();
    setAdminUsers(users);
  };

  const handleProfileUpdate = (key: keyof UserProfile, value: any) => {
    setUser(prev => ({ ...prev, [key]: value }));
    if (key === 'dietaryPreference') {
      setGeneratedPlan(null);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    try {
      let response;
      if (authMode === 'signup') {
        if(!userName) { setAuthError('Name is required'); return; }
        response = await api.signup(userName, email, password);
        setCurrentView('onboarding');
        setUser(response.user);
        localStorage.setItem('heaithy_user', JSON.stringify(response.user));
      } else {
        response = await api.login(email, password);
        // Special Admin Handling
        if (response.user.isAdmin) {
          setCurrentView('admin');
          loadAdminData();
          localStorage.setItem('heaithy_user', JSON.stringify(response.user));
          return;
        }

        // Login Logic
        if (response.user.name) {
          setCurrentView('app');
        } else {
          setCurrentView('onboarding');
        }
        setUser(response.user);
        localStorage.setItem('heaithy_user', JSON.stringify(response.user));
      }
      
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('heaithy_user');
    setUser(DEFAULT_USER);
    setChatHistory([]);
    setActiveTab('home');
    setCurrentView('auth');
    setEmail('');
    setPassword('');
    setProfileView('menu');
  };

  const calculateBMI = () => {
    const heightM = user.height / 100;
    return (user.weight / (heightM * heightM)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 dark:text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500 dark:text-green-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500 dark:text-orange-400' };
    return { label: 'Obese', color: 'text-red-500 dark:text-red-400' };
  };

  const handlePaymentSubmit = async (transactionId: string) => {
    try {
      const res = await api.submitPayment(user.email, transactionId);
      setUser(res.user);
      setShowPaywall(false);
      alert("Payment submitted! An Admin has been notified.");
    } catch (err) {
      alert("Failed to submit payment. Is the server running?");
    }
  };

  const handleRedeemCode = (code: string): boolean => {
    api.redeemCode(user.email, code).then(res => {
      setUser(res.user);
      alert("Premium Activated Successfully!");
      setShowPaywall(false);
    }).catch(err => {
      alert(err.message || "Invalid Code");
    });
    return true; 
  };
  
  const handleAdminApprove = async (userEmail: string) => {
    await api.approveUser(userEmail);
    loadAdminData(); // Refresh list
  };

  const generateAIPlan = async () => {
    if (!user.isPremium) {
      setShowPaywall(true);
      return;
    }
    setIsGenerating(true);
    const plan = await generateMealPlan(user);
    if (plan) setGeneratedPlan(plan);
    else alert("Failed to generate plan. Please check your API key or connection.");
    setIsGenerating(false);
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!user.isPremium && chatHistory.length >= 5) {
      setShowPaywall(true);
      return;
    }
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setIsTyping(true);

    const responseText = await generateNutritionAdvice(updatedHistory, user);
    
    setIsTyping(false);
    setChatHistory(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    }]);
  };

  // --- Views ---

  const renderAdminDashboard = () => (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
       <div className="max-w-4xl mx-auto">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-green-600" />
              Admin Dashboard
            </h1>
            <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Log Out</button>
         </div>
         
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-medium">
               User Management ({adminUsers.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u, idx) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 dark:text-white">{u.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                         {u.lastTransactionId ? (
                           <span className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded select-all">{u.lastTransactionId}</span>
                         ) : (
                           <span className="text-gray-400 italic">None</span>
                         )}
                      </td>
                      <td className="p-4">
                         {u.isPremium ? (
                           <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">Premium</span>
                         ) : u.paymentStatus === 'pending' ? (
                           <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold animate-pulse">Pending Review</span>
                         ) : (
                           <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded text-xs">Free</span>
                         )}
                      </td>
                      <td className="p-4">
                        {!u.isPremium && (
                          <button 
                            onClick={() => handleAdminApprove(u.email)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
         </div>
         
         <div className="mt-4 text-center">
            <button onClick={loadAdminData} className="text-sm text-blue-600 hover:underline">Refresh List</button>
         </div>
       </div>
    </div>
  );

  const renderAuth = () => (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-sm rounded-3xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className="bg-green-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="text-green-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">heAIthy</h1>
            <p className="text-green-100 text-sm mt-1">Smart Diet & Meal Planner</p>
          </div>
        </div>

        {/* Auth Body */}
        <div className="p-8">
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setAuthMode('login'); setAuthError(''); }} 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setAuthError(''); }} 
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'signup' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            )}
            
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Name</label>
                <div className={`flex items-center border rounded-xl px-3 py-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all`}>
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-800 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Email</label>
              <div className={`flex items-center border rounded-xl px-3 py-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all`}>
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-800 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Password</label>
              <div className={`flex items-center border rounded-xl px-3 py-3 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all`}>
                <Key className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-800 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
            >
              <span>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={toggleDarkMode} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div className={`min-h-screen flex flex-col p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-green-600 dark:text-green-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Setup Profile</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Help us personalize your diet plan.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Name</label>
            <input 
              type="text" 
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              placeholder="Your name"
              value={user.name}
              onChange={(e) => handleProfileUpdate('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Age</label>
              <input type="number" className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.age} onChange={(e) => handleProfileUpdate('age', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Gender</label>
              <select className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.gender} onChange={(e) => handleProfileUpdate('gender', e.target.value)}>
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Height (cm)</label>
              <input type="number" className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.height} onChange={(e) => handleProfileUpdate('height', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Weight (kg)</label>
              <input type="number" className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.weight} onChange={(e) => handleProfileUpdate('weight', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Goal</label>
            <select className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.goal} onChange={(e) => handleProfileUpdate('goal', e.target.value)}>
              {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Dietary Preference</label>
            <select className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={user.dietaryPreference} onChange={(e) => handleProfileUpdate('dietaryPreference', e.target.value)}>
              {Object.values(DietaryPreference).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => setCurrentView('app')}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold mt-8 shadow-lg hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
          
          <button 
             onClick={handleLogout}
             className="w-full text-gray-500 py-2 text-sm"
          >
             Cancel & Log Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderHome = () => {
    const bmi = parseFloat(calculateBMI());
    const bmiStatus = getBMIStatus(bmi);
    
    return (
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hello, {user.name || 'User'} 👋</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Let's hit your calories today!</p>
          </div>
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
             <User className="text-gray-500 dark:text-gray-300 w-6 h-6" />
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current BMI</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{bmi}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-opacity-10 dark:bg-opacity-20 ${bmiStatus.color.replace('text', 'bg')} ${bmiStatus.color}`}>
              {bmiStatus.label}
            </span>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-green-100 dark:border-green-900 flex items-center justify-center relative">
            <Activity className="text-green-500 w-8 h-8" />
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-blue-50 dark:bg-gray-800 p-5 rounded-2xl border border-blue-100 dark:border-gray-700 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Droplets className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-white">Water Intake</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Goal: 8 glasses</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{waterCount}<span className="text-sm text-blue-400 dark:text-blue-500 font-normal">/8</span></span>
          </div>
          <div className="flex gap-2">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                onClick={() => setWaterCount(i + 1)}
                className={`h-8 flex-1 rounded-md transition-all cursor-pointer ${i < waterCount ? 'bg-blue-500' : 'bg-blue-200 dark:bg-gray-600 opacity-50'}`}
              />
            ))}
          </div>
        </div>

        {/* Weight Chart (Free) */}
        <div className="grid gap-4">
          <WeightChart data={MOCK_WEIGHT_DATA} isDarkMode={isDarkMode} />
        </div>

        {!user.isPremium && <AdBanner />}
      </div>
    );
  };

  const renderMeals = () => {
    // Select plan: Generated if available, otherwise specific static plan based on diet
    const plan = user.isPremium ? (generatedPlan || getStaticPlan(user.dietaryPreference)) : getStaticPlan(user.dietaryPreference);
    
    return (
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Meal Plan</h2>
          
          <button 
            onClick={generateAIPlan} 
            disabled={isGenerating}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
              user.isPremium 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
            }`}
          >
            {user.isPremium ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : (user.isPremium ? 'Regenerate' : 'Unlock AI Plan')}
          </button>
        </div>

        {/* Premium Teaser if Free */}
        {!user.isPremium && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-orange-100 dark:border-orange-900/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Personalized AI Plans</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Upgrade to generate meals based on your {user.dietaryPreference === 'None' ? 'preferences' : user.dietaryPreference} diet.</p>
            </div>
            <button onClick={() => setShowPaywall(true)} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md">
              Upgrade
            </button>
          </div>
        )}

        {/* Daily Macros - Locked for Free */}
        <div className="relative">
          <MacroChart macros={plan.totalMacros} isDarkMode={isDarkMode} />
          {!user.isPremium && (
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 dark:bg-gray-900/30 flex items-center justify-center rounded-xl z-10">
              <div className="text-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Smart Macro Tracking</p>
                <button onClick={() => setShowPaywall(true)} className="text-[10px] text-green-600 font-bold mt-1">Unlock Premium</button>
              </div>
            </div>
          )}
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => {
            const key = type.toLowerCase() as keyof DailyPlan;
            const meal = plan[key] as any;
            if (!meal || typeof meal !== 'object') return null;

            return (
              <div key={type} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 transition-colors">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 
                  ${type === 'Breakfast' ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400' : 
                    type === 'Lunch' ? 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400' : 
                    type === 'Dinner' ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                  <Utensils className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{type}</h4>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-0.5">{meal.name}</p>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{meal.calories} kcal</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{meal.description}</p>
                  
                  {/* Hide detailed macros for free users */}
                  {user.isPremium ? (
                    <div className="flex gap-3 mt-3">
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        <span className="block font-bold text-gray-600 dark:text-gray-300">{meal.macros.protein}</span> Protein
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        <span className="block font-bold text-gray-600 dark:text-gray-300">{meal.macros.carbs}</span> Carbs
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        <span className="block font-bold text-gray-600 dark:text-gray-300">{meal.macros.fats}</span> Fats
                      </div>
                    </div>
                  ) : (
                     <div className="flex gap-2 mt-3 items-center" onClick={() => setShowPaywall(true)}>
                       <Lock className="w-3 h-3 text-gray-400" />
                       <span className="text-[10px] text-gray-400">Detailed macros locked</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!user.isPremium && <AdBanner type="large" />}
      </div>
    );
  };

  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nutrition Assistant</h2>
        {!user.isPremium && (
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">Free Limit: 5 msgs</span>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col relative transition-colors">
        {!user.isPremium && chatHistory.length >= 5 && (
          <FeatureLockOverlay 
            onUpgrade={() => setShowPaywall(true)} 
            text="You've reached the free message limit." 
          />
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>
                {/* Parse Markdown for Bold text */}
                {formatMessageText(msg.text)}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-none flex gap-1">
                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150" />
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as any).elements.message;
              sendChatMessage(input.value);
              input.value = '';
            }}
            className="flex gap-2"
          >
            <input 
              name="message"
              type="text" 
              placeholder="Ask about food, macros..." 
              className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none border-none text-sm placeholder-gray-500 dark:placeholder-gray-400"
              autoComplete="off"
            />
            <button type="submit" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 shadow-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderHeaderWithBack = (title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <button 
        onClick={() => setProfileView('menu')} 
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
    </div>
  );

  const renderEditProfile = () => (
    <div className="space-y-6 pb-24">
      {renderHeaderWithBack('Edit Profile')}
      
      <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Name</label>
            <input 
              type="text" 
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              value={user.name}
              onChange={(e) => handleProfileUpdate('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Age</label>
              <input 
                type="number" 
                className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                value={user.age} 
                onChange={(e) => handleProfileUpdate('age', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Gender</label>
              <select 
                className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                value={user.gender} 
                onChange={(e) => handleProfileUpdate('gender', e.target.value)}
              >
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Height (cm)</label>
              <input 
                type="number" 
                className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                value={user.height} 
                onChange={(e) => handleProfileUpdate('height', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Weight (kg)</label>
              <input 
                type="number" 
                className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                value={user.weight} 
                onChange={(e) => handleProfileUpdate('weight', parseInt(e.target.value))} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Activity Level</label>
            <select 
              className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
              value={user.activityLevel} 
              onChange={(e) => handleProfileUpdate('activityLevel', e.target.value)}
            >
              {Object.values(ActivityLevel).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Goal</label>
            <select 
              className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
              value={user.goal} 
              onChange={(e) => handleProfileUpdate('goal', e.target.value)}
            >
              {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
      </div>
    </div>
  );

  const renderDietPreferences = () => (
    <div className="space-y-6 pb-24">
      {renderHeaderWithBack('Dietary Preferences')}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Primary Diet</label>
          <select 
            className={`w-full border rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
            value={user.dietaryPreference} 
            onChange={(e) => handleProfileUpdate('dietaryPreference', e.target.value)}
          >
            {Object.values(DietaryPreference).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            This will update your daily meal plan templates and AI suggestions.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 opacity-80 text-gray-700 dark:text-gray-300">Allergies / Intolerances</label>
          <textarea 
            className={`w-full border rounded-lg p-3 h-32 resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            placeholder="e.g. Peanuts, Shellfish, Gluten..."
            value={user.allergies}
            onChange={(e) => handleProfileUpdate('allergies', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 pb-24">
      {renderHeaderWithBack('Notifications')}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {[
          { id: 'mealReminders', label: 'Meal Reminders', desc: 'Get notified when it\'s time to eat.' },
          { id: 'waterReminders', label: 'Water Reminders', desc: 'Hydration alerts every 2 hours.' },
          { id: 'weightReminders', label: 'Weight Check-in', desc: 'Weekly reminder to log your weight.' }
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
            <button 
              onClick={() => setNotificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notificationSettings] }))}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6 pb-24">
      {renderHeaderWithBack('Integrations')}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Google Fit</h3>
            <p className="text-xs text-gray-500">Sync activity and calories burned.</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Connect to Google Fit to automatically import your daily step count and active calories to adjust your daily goals.
        </p>

        <button 
          onClick={() => setGoogleFitConnected(prev => !prev)}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            googleFitConnected 
              ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' 
              : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
          }`}
        >
          {googleFitConnected ? 'Disconnect Google Fit' : 'Connect Google Fit'}
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 text-center">
         <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">More integrations coming soon...</p>
         <div className="flex justify-center gap-2 mt-2 opacity-50">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
         </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    if (profileView === 'edit_profile') return renderEditProfile();
    if (profileView === 'diet_preferences') return renderDietPreferences();
    if (profileView === 'notifications') return renderNotifications();
    if (profileView === 'integrations') return renderIntegrations();

    return (
      <div className="space-y-6 pb-24">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profile & Settings</h2>

        {/* Premium Card */}
        <div className={`p-6 rounded-2xl relative overflow-hidden transition-all ${user.isPremium ? 'bg-gray-800 dark:bg-gray-950' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">{user.isPremium ? 'CURRENT PLAN' : 'FREE PLAN'}</p>
                <h3 className="text-2xl font-bold mt-1">{user.isPremium ? 'Premium Member' : 'Upgrade to Premium'}</h3>
              </div>
              {user.isPremium ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <Sparkles className="w-8 h-8 text-yellow-300" />}
            </div>
            
            {!user.isPremium && (
              <>
                <p className="mt-4 text-sm opacity-90">Unlock unlimited AI meal plans, detailed analytics, and remove all ads.</p>
                {user.paymentStatus === 'pending' ? (
                   <div className="mt-4 bg-yellow-500/20 border border-yellow-200/50 p-3 rounded-xl flex flex-col gap-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-yellow-100">Verification Pending</p>
                          <p className="text-xs text-yellow-50/80">We are checking your payment.</p>
                        </div>
                     </div>
                     {user.lastTransactionId && (
                       <div className="ml-11 mt-1 bg-black/20 p-2 rounded text-[10px] font-mono text-yellow-50 break-all">
                         Ref: {user.lastTransactionId}
                       </div>
                     )}
                   </div>
                ) : (
                  <button onClick={() => setShowPaywall(true)} className="mt-4 bg-white text-green-700 px-6 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-gray-50 transition-colors">
                    Upgrade Now - $4.99/mo
                  </button>
                )}
              </>
            )}
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full" />
          <div className="absolute bottom-0 right-10 w-20 h-20 bg-white opacity-10 rounded-full" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          
          {/* Dark Mode Toggle */}
          <div 
            onClick={toggleDarkMode}
            className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <Sun className="w-5 h-5 text-gray-500" />}
              <span className="text-gray-700 dark:text-gray-200 font-medium">Dark Mode</span>
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {[
            { id: 'edit_profile', label: 'Edit Profile', icon: User },
            { id: 'diet_preferences', label: 'Dietary Preferences', icon: Utensils },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'integrations', label: 'Integrations (Google Fit)', icon: Link },
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setProfileView(item.id as ProfileView)}
              className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer last:border-0"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>

        <button 
          onClick={handleLogout} 
          className="w-full text-red-500 font-medium p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>

        <div className="text-center text-xs text-gray-400 mt-8">
          heAIthy v1.1.0 (Web)
        </div>
      </div>
    );
  };

  // --- Main Render ---

  // Wrapper for class-based dark mode
  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onSubmitPayment={handlePaymentSubmit} 
        onRedeem={handleRedeemCode}
        paymentStatus={user.paymentStatus}
      />
      
      {currentView === 'auth' && renderAuth()}
      {currentView === 'onboarding' && renderOnboarding()}
      {currentView === 'admin' && renderAdminDashboard()}
      {currentView === 'app' && (
        <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden relative bg-gray-50 dark:bg-gray-900 transition-colors">
          <main className="p-6 h-full overflow-y-auto no-scrollbar">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'meals' && renderMeals()}
            {activeTab === 'chat' && renderChat()}
            {activeTab === 'profile' && renderProfile()}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 max-w-md w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'meals', icon: Utensils, label: 'Meals' },
              { id: 'chat', icon: MessageSquare, label: 'Assistant' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setProfileView('menu'); }}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current' : ''}`} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;