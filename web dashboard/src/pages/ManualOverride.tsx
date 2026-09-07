import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DoorOpen, DoorClosed, Trash2, Shield, Users, X, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Edit2, Calendar, Clock, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { vehicleAPI, vehicleManagementAPI, Vehicle } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { useGate } from '../context/GateContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { isAdmin } from '../utils/auth';

export default function ManualOverride() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { gateStatus, setGateStatus } = useGate();
  const { showNotification } = useNotification();
  const admin = isAdmin();

  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    ownerName: '',
    notes: '',
    accessType: 'temp' as 'allow' | 'deny' | 'temp',
    entryTime: '', // Entry time for temporary visitors
    expiry: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleManagementAPI.getVehicles();
      setVehicles(response.vehicles || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      showNotification('system', error.response?.data?.error || 'Failed to load vehicles');
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PNG, JPG, WEBP)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('system', 'Please select a PNG, JPG, or WEBP image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('system', 'Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      make: '',
      model: '',
      ownerName: '',
      notes: '',
      accessType: 'temp',
      entryTime: '',
      expiry: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingVehicle(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entry time and expiry for temporary visitors
    if (formData.accessType === 'temp') {
      if (!formData.entryTime) {
        showNotification('system', 'Entry time is required for temporary visitors');
        return;
      }
      if (!formData.expiry) {
        showNotification('system', 'Expiry date is required for temporary visitors');
        return;
      }
      // Validate that expiry is after entry time
      const entryDate = new Date(formData.entryTime);
      const expiryDate = new Date(formData.expiry);
      if (expiryDate <= entryDate) {
        showNotification('system', 'Expiry time must be after entry time');
        return;
      }
    }

    try {
      setUploading(true);

      if (editingVehicle) {
        // Update existing vehicle
        await vehicleManagementAPI.updateVehicle(editingVehicle.id, {
          licensePlate: formData.licensePlate,
          make: formData.make,
          model: formData.model,
          ownerName: formData.ownerName,
          notes: formData.notes,
          accessType: formData.accessType,
          entryTime: formData.accessType === 'temp' ? formData.entryTime : null,
          expiry: formData.accessType === 'temp' ? formData.expiry : null,
          photo: selectedImage,
        });
        showNotification('system', `Vehicle ${formData.licensePlate} updated successfully`);
      } else {
        // Add new vehicle
        const vehicleResult =         await vehicleManagementAPI.addVehicle({
          licensePlate: formData.licensePlate,
          make: formData.make,
          model: formData.model,
          ownerName: formData.ownerName,
          notes: formData.notes,
          accessType: formData.accessType,
          entryTime: formData.accessType === 'temp' ? formData.entryTime : null,
          expiry: formData.accessType === 'temp' ? formData.expiry : null,
          photo: selectedImage,
        });
        
        // Create an event for permanent allow/deny vehicles (not temporary - they appear when they arrive)
        if (formData.accessType !== 'temp') {
          try {
            const weatherData = await vehicleAPI.getWeather();
            await vehicleAPI.createEvent({
              plate_number: formData.licensePlate,
              make: formData.make,
              model: formData.model,
              confidence: 0.98,
              weather_condition: weatherData.condition,
              status: formData.accessType === 'allow' ? 'allowed' : 'denied',
              image_url: vehicleResult.vehicle.photo || `/samples/vehicle_${Math.floor(Math.random() * 100) + 1}.jpg`,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error creating event for vehicle:', error);
            // Don't fail the whole operation if event creation fails
          }
        }
        
        showNotification('system', `Vehicle ${formData.licensePlate} added successfully`);
      }

      resetForm();
      setShowAddForm(false);
      loadVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      showNotification('system', error.response?.data?.error || error.message || 'Failed to save vehicle');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      ownerName: vehicle.ownerName || '',
      notes: vehicle.notes || '',
      accessType: vehicle.accessType,
      entryTime: vehicle.entryTime ? new Date(vehicle.entryTime).toISOString().slice(0, 16) : '',
      expiry: vehicle.expiry ? new Date(vehicle.expiry).toISOString().slice(0, 16) : '',
    });
    if (vehicle.photo) {
      setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${vehicle.photo}`);
    }
    setShowAddForm(true);
  };

  const handleDeleteVehicle = async (id: number, plate: string) => {
    if (!confirm(`Delete vehicle ${plate}? This action cannot be undone.`)) return;

    try {
      await vehicleManagementAPI.deleteVehicle(id);
      showNotification('system', `Vehicle ${plate} deleted successfully`);
      loadVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      showNotification('system', error.response?.data?.error || error.message || 'Failed to delete vehicle');
    }
  };

  const handleToggleGate = async () => {
    const newStatus = gateStatus === 'open' ? 'closed' : 'open';
    setGateStatus(newStatus);
    
    try {
      // Create override for gate action
      await vehicleAPI.createOverride(
        { plate: 'GATE', make: 'System', model: 'Gate Control' },
        newStatus === 'open' ? 'Open' : 'Close'
      );
      showNotification('system', `Gate ${newStatus === 'open' ? 'opened' : 'closed'} manually`);
    } catch (error) {
      console.error('Error toggling gate:', error);
      showNotification('system', `Gate ${newStatus === 'open' ? 'opened' : 'closed'} manually`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-3xl -z-10" />
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Manual Override
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Manage authorized vehicles and gate control</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-3xl -z-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Manual Override
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Manage authorized vehicles and gate control
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Gate Control Card */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`relative p-4 rounded-2xl shadow-lg ${
                gateStatus === 'open'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/50'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/50'
              }`}>
                {gateStatus === 'open' ? (
                  <DoorOpen className="w-6 h-6 text-white" />
                ) : (
                  <DoorClosed className="w-6 h-6 text-white" />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gate Control
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manual gate operation</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 border border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Current Status</span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2"
                >
                  {gateStatus === 'open' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50">
                      <CheckCircle2 className="w-4 h-4" />
                      Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/50">
                      <AlertCircle className="w-4 h-4" />
                      Closed
                    </span>
                  )}
                </motion.div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleGate}
                className={`group/btn relative overflow-hidden w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                  gateStatus === 'open'
                    ? 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/50'
                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                {gateStatus === 'open' ? (
                  <>
                    <DoorClosed className="relative w-6 h-6" />
                    <span className="relative">Close Gate</span>
                  </>
                ) : (
                  <>
                    <DoorOpen className="relative w-6 h-6" />
                    <span className="relative">Open Gate</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Premium Quick Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-60" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                <Users className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quick Stats
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">System overview</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Total Authorized</span>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {vehicles.filter(v => v.accessType === 'allow' || v.accessType === 'temp').length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Vehicles with access permissions
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Total Unauthorized</span>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                    {vehicles.filter(v => v.accessType === 'deny').length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Vehicles with denied access
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Authorized Vehicles Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Access Permission
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage vehicle access permissions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="group/btn relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <Plus className="relative w-5 h-5" />
              <span className="relative">Add Vehicle</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="mb-8 p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 space-y-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h3>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="License Plate *"
                      required
                      value={formData.licensePlate}
                      onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Make *"
                      required
                      value={formData.make}
                      onChange={e => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Model *"
                      required
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group/select"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 rounded-2xl blur-xl opacity-0 group-hover/select:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/select:opacity-100 transition-opacity duration-300" />
                    <select
                      required
                      value={formData.accessType}
                      onChange={e => setFormData({ ...formData, accessType: e.target.value as 'allow' | 'deny' | 'temp', expiry: e.target.value === 'temp' ? formData.expiry : '' })}
                      className="relative w-full px-5 py-3.5 pr-14 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 dark:text-gray-100 font-bold text-sm shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer z-10"
                    >
                      {admin && (
                        <>
                          <option value="allow" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Permanent Allow</option>
                          <option value="deny" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Permanent Deny</option>
                        </>
                      )}
                      <option value="temp" className="font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">Temporary Visitor (allow)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                    </div>
                  </motion.div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Owner Name"
                      value={formData.ownerName}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                    />
                  </div>
                  {formData.accessType === 'temp' && (
                    <>
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                          Entry Time *
                        </label>
                        <input
                          type="datetime-local"
                          placeholder="Visitor Entry Date & Time *"
                          required={formData.accessType === 'temp'}
                          value={formData.entryTime}
                          onChange={e => setFormData({ ...formData, entryTime: e.target.value })}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                          Expiry Time *
                        </label>
                        <input
                          type="datetime-local"
                          placeholder="Visitor Expiry Date & Time *"
                          required={formData.accessType === 'temp'}
                          value={formData.expiry}
                          onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                          min={formData.entryTime || new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                        />
                      </div>
                    </>
                  )}
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300 resize-none"
                  rows={3}
                />
                
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Vehicle Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="vehicle-image-upload"
                    />
                    <label
                      htmlFor="vehicle-image-upload"
                      className="group/upload relative flex items-center gap-3 px-6 py-4 bg-white/80 dark:bg-gray-900/80 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex-1"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover/upload:from-blue-500/30 group-hover/upload:to-purple-500/30 transition-all">
                        <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedImage ? selectedImage.name : 'Click to upload vehicle photo'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedImage ? `${(selectedImage.size / 1024).toFixed(1)} KB` : 'PNG, JPG, WEBP up to 10MB'}
                        </p>
                      </div>
                      {uploading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                      )}
                    </label>
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-500/50 shadow-lg"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={uploading}
                    whileHover={{ scale: uploading ? 1 : 1.02, y: uploading ? 0 : -2 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    className="group/btn relative overflow-hidden flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-2">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        editingVehicle ? 'Update Vehicle' : 'Add Vehicle'
                      )}
                    </span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Plate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Access Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Entry Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Added By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {vehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {vehicle.photo ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${vehicle.photo}`}
                            alt={vehicle.licensePlate}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{vehicle.licensePlate}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.make} {vehicle.model}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">{vehicle.ownerName || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          vehicle.accessType === 'allow' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : vehicle.accessType === 'deny'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {vehicle.accessType === 'allow' ? 'Permanent Allow' : 
                           vehicle.accessType === 'deny' ? 'Permanent Deny' : 
                           'Temporary Visitor'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {vehicle.entryTime ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(vehicle.entryTime).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {vehicle.expiry ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(vehicle.expiry).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          {vehicle.addedByInfo?.username || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(vehicle)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteVehicle(vehicle.id, vehicle.licensePlate)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-12 text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <Users className="w-16 h-16 text-gray-400 mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No vehicles yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Click "Add Vehicle" to get started
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
