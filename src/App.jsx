import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  CreditCard,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  LogOut,
  Bell,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  Heart,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  ShieldQuestion,
  Info,
  Star,
  Building2,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOTP, verifyOTP, updateProfile } from './services/api';
import asterImg from './assets/aster.jpeg';
import trustImg from './assets/Medical_Trust3.jpg';
import kimsImg from './assets/KIMS.jpg';
import kochiImg from './assets/kochi.jpg';
import tvmImg from './assets/trivandrum.jpg';
import kozImg from './assets/i-love-kozhikode.jpg';


// --- Constants & Mock Data ---
const DEPARTMENTS = [
  { id: 'ent', name: 'ENT Specialist', fee: 350, color: 'bg-blue-500', lightColor: 'bg-blue-50', icon: Stethoscope },
  { id: 'gastro', name: 'Gastroenterologist', fee: 500, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', icon: Heart },
  { id: 'ortho', name: 'Orthopedic Surgeon', fee: 450, color: 'bg-purple-500', lightColor: 'bg-purple-50', icon: ShieldCheck },
  { id: 'physician', name: 'General Physician', fee: 150, color: 'bg-orange-500', lightColor: 'bg-orange-50', icon: Users },
  { id: 'cardio', name: 'Cardiologist', fee: 500, color: 'bg-red-500', lightColor: 'bg-red-50', icon: Heart }
];

const LOCATIONS = [
  { id: 'kochi', name: 'Kochi', count: 4, image: kochiImg },
  { id: 'tvm', name: 'Trivandrum', count: 1, image: tvmImg },
  { id: 'koz', name: 'Kozhikode', count: 3, image: kozImg },
  { id: 'thr', name: 'Thrissur', count: 2, image: 'https://images.unsplash.com/photo-1596422846173-ade409ba8791?auto=format&fit=crop&q=80&w=400' }
];

const HOSPITALS = [
  {
    id: 'h1',
    name: 'Aster Medcity',
    location: 'kochi',
    distance: '1.2 km',
    rating: 4.8,
    address: 'Kochi, Kerala',
    image: asterImg,
    isNearest: true
  },
  {
    id: 'h2',
    name: 'KIMS Hospital',
    location: 'tvm',
    distance: '3.5 km',
    rating: 4.5,
    address: 'Anayara, Trivandrum',
    image: kimsImg
  },
  {
    id: 'h3',
    name: 'Meitra Hospital',
    location: 'koz',
    distance: '5.0 km',
    rating: 4.9,
    address: 'Kozhikode Bypass',
    image: 'https://images.unsplash.com/photo-1586773860418-d3b978ec0aa7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h4',
    name: 'Medical Trust',
    location: 'kochi',
    distance: '0.8 km',
    rating: 4.2,
    address: 'MG Road, Kochi',
    image: trustImg
  },
  {
    id: 'h5',
    name: 'Lakeshore Hospital',
    location: 'kochi',
    distance: '2.5 km',
    rating: 4.7,
    address: 'Nettoor, Kochi',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h6',
    name: 'Renai Medicity',
    location: 'kochi',
    distance: '4.1 km',
    rating: 4.6,
    address: 'Palarivattom, Kochi',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h7',
    name: 'Jubilee Mission',
    location: 'thr',
    distance: '1.5 km',
    rating: 4.4,
    address: 'East Fort, Thrissur',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h8',
    name: 'West Fort Hospital',
    location: 'thr',
    distance: '2.2 km',
    rating: 4.3,
    address: 'West Fort, Thrissur',
    image: 'https://images.unsplash.com/photo-1502740479091-6358875c8284?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h9',
    name: 'Baby Memorial',
    location: 'koz',
    distance: '3.2 km',
    rating: 4.8,
    address: 'Indira Gandhi Road, Kozhikode',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'h10',
    name: 'Aster MIMS',
    location: 'koz',
    distance: '4.8 km',
    rating: 4.7,
    address: 'Govindapuram, Kozhikode',
    image: 'https://images.unsplash.com/photo-1587350859728-117699f4a742?auto=format&fit=crop&q=80&w=400'
  }
];

const App = () => {
  const [view, setView] = useState('landing'); // landing, patient, doctor
  const [queue, setQueue] = useState([
    { id: 'REG001', name: 'Arjun Das', age: 28, gender: 'Male', deptId: 'ent', token: 1, status: 'consulted', paid: 350, bookingTime: '10:30 AM' },
    { id: 'REG002', name: 'Sarah Khan', age: 45, gender: 'Female', deptId: 'ent', token: 2, status: 'waiting', paid: 350, bookingTime: '10:45 AM' },
    { id: 'REG003', name: 'Leo Smith', age: 34, gender: 'Male', deptId: 'ortho', token: 1, status: 'consulting', paid: 450, bookingTime: '11:00 AM' },
  ]);

  const [activePatient, setActivePatient] = useState(null); // The user's active booking
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Auth States
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authStep, setAuthStep] = useState('phone'); // phone, otp, profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Helper Functions ---
  const addNotification = (msg, type = 'info') => {
    const id = Date.now();
    const newNotif = { id, msg, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getDeptQueue = (deptId) => queue.filter(q => q.deptId === deptId);

  const getNextToken = (deptId) => {
    const deptItems = getDeptQueue(deptId);
    return deptItems.length > 0 ? Math.max(...deptItems.map(p => p.token)) + 1 : 1;
  };

  const getCurrentToken = (deptId) => {
    const active = queue.find(p => p.deptId === deptId && p.status === 'consulting');
    if (active) return active.token;
    const lastConsulted = [...queue].filter(p => p.deptId === deptId && p.status === 'consulted').pop();
    return lastConsulted ? lastConsulted.token : 0;
  };

  // --- Actions ---
  const handleBooking = (dept, patientInfo) => {
    const newToken = getNextToken(dept.id);
    const booking = {
      ...patientInfo,
      deptId: dept.id,
      token: newToken,
      status: 'waiting',
      paid: dept.fee,
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setQueue(prev => [...prev, booking]);
    setActivePatient(booking);
    addNotification(`Booking confirmed for ${dept.name}. Token #${newToken}`, 'success');
  };

  const updatePatientStatus = (regId, newStatus) => {
    setQueue(prev => prev.map(p => {
      if (p.id === regId) {
        if (newStatus === 'cancelled') {
          addNotification(`Refund of ₹${p.paid} initiated for Patient ${p.id}`, 'info');
        }
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  // --- Auth Handlers ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      await sendOTP(cleanPhone);
      setAuthStep('otp');
      addNotification(`OTP sent to ${cleanPhone}`, 'info');
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const trimmedOtp = otp.trim();
      const { data } = await verifyOTP(cleanPhone, trimmedOtp);
      setAuthToken(data.token);
      setUser(data.user);
      if (!data.user.isProfileComplete) {
        setAuthStep('profile');
      } else {
        addNotification(`Welcome back, ${data.user.name}!`, 'success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid OTP. Please try again.";
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (profileData) => {
    setIsLoading(true);
    try {
      const { data } = await updateProfile(authToken, profileData);
      setUser(data.user);
      addNotification("Profile updated successfully!", 'success');
    } catch (err) {
      addNotification("Failed to update profile.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setAuthStep('phone');
    setView('landing');
    setActivePatient(null);
    setSelectedLocation(null);
    setSelectedHospital(null);
  };

  // Push Alert Logic: Check if it's the active patient's turn
  useEffect(() => {
    if (activePatient && activePatient.status === 'waiting') {
      const currentToken = getCurrentToken(activePatient.deptId);
      if (currentToken === activePatient.token) {
        addNotification("🔔 IT'S YOUR TURN! Please proceed to the doctor's cabin.", 'success');
      }
    }
  }, [queue, activePatient]);

  return (
    <div className="min-h-screen mesh-bg font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-600">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setView('landing')}
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <Stethoscope className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">MediLine</span>
            </motion.div>

            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Bell className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </div>
              {view !== 'landing' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> {user ? 'Logout' : 'Exit Portal'}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LandingView onSelect={setView} />
            </motion.div>
          )}
          {view === 'patient' && (
            <motion.div
              key="patient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {!user ? (
                <AuthView
                  step={authStep}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  otp={otp}
                  setOtp={setOtp}
                  onSendOTP={handleSendOTP}
                  onVerifyOTP={handleVerifyOTP}
                  isLoading={isLoading}
                />
              ) : !user.name ? (
                <ProfileCompletionView
                  onUpdate={handleProfileUpdate}
                  isLoading={isLoading}
                />
              ) : (
                <PatientDashboard
                  queue={queue}
                  activePatient={activePatient}
                  onBook={handleBooking}
                  getCurrentToken={getCurrentToken}
                  user={user}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  selectedHospital={selectedHospital}
                  setSelectedHospital={setSelectedHospital}
                />
              )}
            </motion.div>
          )}
          {view === 'doctor' && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DoctorDashboard
                queue={queue}
                onUpdateStatus={updatePatientStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Notification Toast */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100] max-w-md w-full sm:w-auto">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`bg-white border p-4 rounded-2xl shadow-2xl flex items-center gap-4 group ${n.type === 'error' ? 'border-red-100' :
                n.type === 'success' ? 'border-emerald-100' :
                  'border-blue-100'
                }`}
            >
              <div className={`p-2 rounded-xl group-hover:rotate-12 transition-transform ${n.type === 'error' ? 'bg-red-50 text-red-600' :
                n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                {n.type === 'error' ? <XCircle className="w-5 h-5" /> :
                  n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                    <Bell className="w-5 h-5" />}
              </div>
              <div className={`flex-1 text-sm font-semibold ${n.type === 'error' ? 'text-red-700' :
                n.type === 'success' ? 'text-emerald-700' :
                  'text-blue-700'
                }`}>{n.msg}</div>
              <button
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const LandingView = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -z-10"
    ></motion.div>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-48 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] -z-10"
    ></motion.div>

    <div className="max-w-4xl px-4">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-6xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight"
      >
        Wait comfortably, not in <span className="gradient-text underline decoration-blue-100/50">queues</span>.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium"
      >
        Track your live appointment status from your phone. Arrive just in time for your consultation.
        Zero physical waiting, 100% convenience.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('patient')}
          className="group p-10 bg-white border border-slate-200 rounded-[2.5rem] text-left shadow-xl shadow-slate-200/50 hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32" />
          </div>
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Patient Portal</h3>
          <p className="text-slate-500 font-medium mb-6">Book appointments, check live tokens, and get alerts.</p>
          <div className="flex items-center text-blue-600 font-bold gap-2">
            Proceed to Booking <ArrowRight className="w-4 h-4" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('doctor')}
          className="group p-10 bg-white border border-slate-200 rounded-[2.5rem] text-left shadow-xl shadow-slate-200/50 hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Stethoscope className="w-32 h-32" />
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Doctor Portal</h3>
          <p className="text-slate-500 font-medium mb-6">Manage queue, view patient details, and handle refunds.</p>
          <div className="flex items-center text-emerald-600 font-bold gap-2">
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </div>
        </motion.button>
      </div>
    </div>
  </div>
);

const LocationSelectionView = ({ onSelect }) => (
  <div className="space-y-12">
    <div className="text-center max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black mb-4"
      >
        Select Your Location
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 font-medium"
      >
        Find the best healthcare facilities in your city. Select a city to view available hospitals.
      </motion.p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {LOCATIONS.map((loc, index) => (
        <motion.div
          key={loc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -10 }}
          onClick={() => onSelect(loc)}
          className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-xl shadow-slate-200"
        >
          <img
            src={loc.image}
            alt={loc.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-2xl font-black mb-1">{loc.name}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">{loc.count} Hospitals</p>
          </div>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <MapPin className="text-white w-5 h-5" />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const HospitalSelectionView = ({ onSelect, selectedLocation }) => {
  const filteredHospitals = HOSPITALS.filter(h => h.location === selectedLocation.id);

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-4"
        >
          Hospitals in {selectedLocation.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 font-medium"
        >
          Found {filteredHospitals.length} facilities near your location. We recommend the nearest center for faster care.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {filteredHospitals.map((hospital, index) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => onSelect(hospital)}
            className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all group cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={hospital.image}
                alt={hospital.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {hospital.isNearest && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Navigation className="w-3 h-3" /> Nearest to you
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-slate-900 border border-white/50 flex items-center gap-1.5 shadow-sm">
                <Star className="w-3 h-3 text-orange-500 fill-orange-500" /> {hospital.rating}
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black text-slate-900">{hospital.name}</h3>
                <div className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg">{hospital.distance}</div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> {hospital.address}
              </p>
              <div className="flex items-center text-slate-900 font-black text-xs uppercase tracking-widest gap-2 group-hover:text-blue-600 transition-colors">
                Select This Hospital <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PatientDashboard = ({ queue, activePatient, onBook, getCurrentToken, user, selectedLocation, setSelectedLocation, selectedHospital, setSelectedHospital }) => {
  const [step, setStep] = useState(
    activePatient ? 'tracking' :
      selectedHospital ? 'selecting' :
        selectedLocation ? 'hospital' : 'location'
  );
  const [selectedDept, setSelectedDept] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    id: `REG${Math.floor(Math.random() * 9000) + 1000}`
  });

  if (step === 'location') {
    return <LocationSelectionView onSelect={(loc) => { setSelectedLocation(loc); setStep('hospital'); }} />;
  }

  if (step === 'hospital') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => { setSelectedLocation(null); setStep('location'); }}
          className="text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Change Location
        </button>
        <HospitalSelectionView
          selectedLocation={selectedLocation}
          onSelect={(h) => { setSelectedHospital(h); setStep('selecting'); }}
        />
      </div>
    );
  }

  if (activePatient || step === 'tracking') {
    const currentToken = getCurrentToken(activePatient?.deptId || '');
    const patientsLeft = activePatient ? (activePatient.token - currentToken) : 0;
    const isNext = patientsLeft === 1;
    const isActive = patientsLeft === 0;

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden"
        >
          {/* Status Badge */}
          <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-[2rem] font-black text-[10px] uppercase tracking-[0.2em] ${activePatient?.status === 'consulted' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
            }`}>
            {activePatient?.status}
          </div>

          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Live Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Your Token</span>
              <div className="text-6xl font-black text-blue-600">{activePatient?.token || '--'}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-center text-white shadow-xl shadow-blue-200">
              <span className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-2">Now Calling</span>
              <div className="text-6xl font-black leading-none">{currentToken || '0'}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <Stethoscope className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-lg font-bold">{DEPARTMENTS.find(d => d.id === activePatient?.deptId)?.name}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Department</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-900">₹{activePatient?.paid}</div>
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Paid & Verified</div>
              </div>
            </div>

            <motion.div
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 text-center ${isActive ? 'border-emerald-500 bg-emerald-50/50' : isNext ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50/50'
                }`}
            >
              {isActive ? (
                <>
                  <div className="bg-emerald-500 p-4 rounded-full text-white shadow-lg shadow-emerald-200">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-600 mb-1">It's Your Turn!</div>
                    <p className="text-sm text-emerald-600 font-medium opacity-80">Please proceed to the doctor's cabin immediately.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-200 p-4 rounded-full text-slate-500">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 mb-1">
                      {patientsLeft > 0 ? `${patientsLeft} ${patientsLeft === 1 ? 'person' : 'people'} ahead` : 'Doctor is ready'}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Estimated wait time: <span className="text-blue-600 font-bold">{patientsLeft * 10} minutes</span></p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Block A • Level 2 • Room 204</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Booked at {activePatient?.bookingTime}</span>
            </div>
          </div>
        </motion.div>

        <button
          onClick={() => { setStep('selecting'); setActivePatient(null); }}
          className="w-full py-4 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          Book Another consultation <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (step === 'booking') {
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100"
        >
          <button onClick={() => setStep('selecting')} className="text-blue-600 text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            &larr; Back to selection
          </button>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Patient Details</h2>
          <p className="text-slate-500 mb-10 font-medium">Scheduling for <span className="text-blue-600 font-bold">{selectedDept.name}</span>.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex. John Doe"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Age</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="24"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Gender</label>
                <select
                  className="input-field appearance-none"
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Consultation Fee</span>
                <span className="text-3xl font-black text-white">₹{selectedDept.fee}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!patientForm.name || !patientForm.age}
                onClick={() => onBook(selectedDept, patientForm)}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-900/40 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <CreditCard className="w-5 h-5" /> Pay & Generate Token
              </motion.button>
              <div className="flex items-center justify-center gap-4 mt-6 opacity-30">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">Secure Payment Gateway</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto relative">
        <button
          onClick={() => { setSelectedHospital(null); setStep('hospital'); }}
          className="mb-8 text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:text-blue-600 transition-colors mx-auto"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Hospital Selection
        </button>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
          <Building2 className="w-3 h-3" /> {selectedHospital?.name}
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-4"
        >
          Select Specialization
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 font-medium"
        >
          Choose a department at <span className="text-slate-900 font-bold">{selectedHospital?.name}</span> to view real-time availability.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEPARTMENTS.map((dept, index) => {
          const currentT = getCurrentToken(dept.id);
          const waitingCount = queue.filter(q => q.deptId === dept.id && q.status === 'waiting').length;

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center text-white ${dept.color} shadow-lg shadow-inherit`}>
                <dept.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-900">{dept.name}</h3>
              <p className="text-blue-600 font-black text-sm mb-8 uppercase tracking-widest">Fee: ₹{dept.fee}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Live Token</div>
                  <div className="text-2xl font-black text-slate-900">{currentT || '-'}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Waiting</div>
                  <div className="text-2xl font-black text-slate-900">{waitingCount}</div>
                </div>
              </div>

              <button
                onClick={() => { setSelectedDept(dept); setStep('booking'); }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs"
              >
                Book Consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const DoctorDashboard = ({ queue, onUpdateStatus }) => {
  const [selectedDeptId, setSelectedDeptId] = useState(DEPARTMENTS[0].id);

  const filteredQueue = useMemo(() =>
    queue.filter(p => p.deptId === selectedDeptId),
    [queue, selectedDeptId]
  );

  const stats = {
    total: filteredQueue.length,
    consulted: filteredQueue.filter(p => p.status === 'consulted').length,
    waiting: filteredQueue.filter(p => p.status === 'waiting').length,
    active: filteredQueue.find(p => p.status === 'consulting')
  };

  const nextPatient = filteredQueue.find(p => p.status === 'waiting');

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Clinician Control Panel</span>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Doctor Dashboard</h2>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Active Department: <span className="text-slate-900 font-bold">{DEPARTMENTS.find(d => d.id === selectedDeptId)?.name}</span>
          </p>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {DEPARTMENTS.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedDeptId === d.id ? 'bg-slate-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)]' : 'text-slate-400 hover:text-slate-900'
                }`}
            >
              {d.id}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Queue', value: stats.waiting, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Consulted Today', value: stats.consulted, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue Mock', value: `₹${filteredQueue.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.paid : 0), 0)}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6"
          >
            <div className={`${s.bg} ${s.color} p-5 rounded-2xl`}>
              <s.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Queue Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-xl text-slate-900">Patient Queue</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-6">Token</th>
                  <th className="px-8 py-6">Registration</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">No patients in queue for this department.</td>
                  </tr>
                ) : filteredQueue.map(p => (
                  <tr key={p.id} className={`group transition-all ${p.status === 'consulting' ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-8 py-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${p.status === 'consulting' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {p.token}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-base font-black text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {p.id} • {p.gender}, {p.age}y</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'consulted' ? 'bg-emerald-100 text-emerald-600' :
                        p.status === 'consulting' ? 'bg-blue-100 text-blue-600' :
                          p.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-slate-100 text-slate-400'
                        }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.status === 'waiting' && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => onUpdateStatus(p.id, 'consulting')}
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Start Consultation"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(p.id, 'cancelled')}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Cancel & Refund"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {p.status === 'consulting' && (
                        <button
                          onClick={() => onUpdateStatus(p.id, 'consulted')}
                          className="px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Next Panel */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]"></div>
            <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
              <Bell className="w-6 h-6 text-blue-400" /> Session
            </h3>

            {stats.active ? (
              <div className="space-y-8">
                <div>
                  <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Active Consultation</div>
                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <div className="text-xl font-black">{stats.active.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      Token #{stats.active.token} <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Room 204
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateStatus(stats.active.id, 'consulted')}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/40 uppercase tracking-widest text-sm"
                >
                  Mark Consulted
                </button>
              </div>
            ) : nextPatient ? (
              <div className="space-y-8">
                <div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Up Next In Queue</div>
                  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <div className="text-xl font-black">{nextPatient.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      Token #{nextPatient.token} <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span> From {nextPatient.bookingTime}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateStatus(nextPatient.id, 'consulting')}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  Call Patient #{nextPatient.token} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">
                Queue is clear
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40"
          >
            <h4 className="font-black mb-8 flex items-center gap-3 text-slate-900 uppercase tracking-widest text-[10px]">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Analytics Summary
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Avg Wait Time', value: '12 min', color: 'text-slate-900' },
                { label: 'Avg Session', value: '8 min', color: 'text-slate-900' },
                { label: 'Cancellations', value: filteredQueue.filter(p => p.status === 'cancelled').length, color: 'text-red-500' }
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{stat.label}</span>
                  <span className={`text-base font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Active Doctors Today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const AuthView = ({ step, phoneNumber, setPhoneNumber, otp, setOtp, onSendOTP, onVerifyOTP, isLoading }) => (
  <div className="max-w-md mx-auto">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100"
    >
      <div className="flex flex-col items-center text-center mb-10">
        <div className="bg-blue-100 p-4 rounded-3xl mb-6">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Patient Login</h2>
        <p className="text-slate-500 font-medium">
          {step === 'phone' ? "Enter your phone number to receive an verification code." : "Verify your identity with the 6-digit code sent to your phone."}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={onSendOTP} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
              <input
                type="tel"
                required
                className="input-field pl-16"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || phoneNumber.length < 10}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            {isLoading ? "Sending..." : "Send Verification Code"} <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      ) : (
        <form onSubmit={onVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Verification Code</label>
            <input
              type="text"
              maxLength="6"
              required
              className="input-field text-center tracking-[1em] font-black text-2xl"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || otp.length < 6}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            {isLoading ? "Verifying..." : "Verify & Continue"} <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            Didn't get the code? <button type="button" onClick={onSendOTP} className="text-blue-600 hover:underline">Resend</button>
          </p>
        </form>
      )}
    </motion.div>
  </div >
);

const ProfileCompletionView = ({ onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-emerald-100 p-4 rounded-3xl mb-6">
            <UserCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Complete Profile</h2>
          <p className="text-slate-500 font-medium">Please provide your basic details for better clinical care.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Age</label>
              <input
                type="number"
                required
                className="input-field"
                placeholder="24"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Gender</label>
              <select
                className="input-field appearance-none"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !formData.name || !formData.age}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            {isLoading ? "Saving..." : "Start Consultation"} <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default App;
