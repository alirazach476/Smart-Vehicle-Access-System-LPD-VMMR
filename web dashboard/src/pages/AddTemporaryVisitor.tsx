import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Upload, Image as ImageIcon, Edit2, Clock, User, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { vehicleManagementAPI, Vehicle } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { getUser } from '../utils/auth';

export default function AddTemporaryVisitor() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { showNotification } = useNotification();
  const currentUser = getUser();

  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    ownerName: '',
    notes: '',
    entryTime: '',
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
      const response = await vehicleManagementAPI.getVehicles({ accessType: 'temp' });
      // Filter to show only vehicles added by current user
      const userVehicles = (response.vehicles || []).filter(v => v.addedBy === currentUser?.id);
      setVehicles(userVehicles);
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

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification('system', 'Invalid file type. Please upload PNG, JPG, or WEBP images.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('system', 'File size exceeds 10MB limit.');
      return;
    }

    setSelectedImage(file);
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
          accessType: 'temp',
          entryTime: formData.entryTime,
          expiry: formData.expiry,
          photo: selectedImage,
        });
        showNotification('system', `Temporary visitor ${formData.licensePlate} updated successfully`);
      } else {
        // Add new temporary visitor
        await vehicleManagementAPI.addVehicle({
          licensePlate: formData.licensePlate,
          make: formData.make,
          model: formData.model,
          ownerName: formData.ownerName,
          notes: formData.notes,
          accessType: 'temp',
          entryTime: formData.entryTime,
          expiry: formData.expiry,
          photo: selectedImage,
        });
        showNotification('system', `Temporary visitor ${formData.licensePlate} added successfully`);
      }

      resetForm();
      setShowAddForm(false);
      loadVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      showNotification('system', error.response?.data?.error || error.message || 'Failed to save temporary visitor');
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
      entryTime: vehicle.entryTime ? new Date(vehicle.entryTime).toISOString().slice(0, 16) : '',
      expiry: vehicle.expiry ? new Date(vehicle.expiry).toISOString().slice(0, 16) : '',
    });
    if (vehicle.photo) {
      setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${vehicle.photo}`);
    }
    setShowAddForm(true);
  };

  const handleDeleteVehicle = async (id: number, plate: string) => {
    if (!confirm(`Delete temporary visitor ${plate}? This action cannot be undone.`)) return;

    try {
      await vehicleManagementAPI.deleteVehicle(id);
      showNotification('system', `Temporary visitor ${plate} deleted successfully`);
      loadVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      showNotification('system', error.response?.data?.error || 'Failed to delete temporary visitor');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Add Temporary Visitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage temporary visitor vehicles that will appear in Live Feed and Vehicle Logs
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              resetForm();
            }
          }}
          className="group/btn relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="relative w-5 h-5" />
          <span className="relative">{showAddForm ? 'Cancel' : 'Add Temporary Visitor'}</span>
        </motion.button>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 space-y-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingVehicle ? 'Edit Temporary Visitor' : 'Add New Temporary Visitor'}
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Owner Name"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Entry Time *
                </label>
                <input
                  type="datetime-local"
                  placeholder="Visitor Entry Date & Time *"
                  required
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
                  required
                  value={formData.expiry}
                  onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                  min={formData.entryTime || new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white font-medium shadow-sm transition-all duration-300"
                />
              </div>
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
                  id="visitor-image-upload"
                />
                <label
                  htmlFor="visitor-image-upload"
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
                    editingVehicle ? 'Update Visitor' : 'Add Visitor'
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

      {/* Vehicles List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10" />
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                My Temporary Visitors
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vehicles you've added will appear in Live Feed and Vehicle Logs when they arrive
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {vehicles.length}
              </span>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                No temporary visitors added yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Click "Add Temporary Visitor" to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Photo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Plate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Entry Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

