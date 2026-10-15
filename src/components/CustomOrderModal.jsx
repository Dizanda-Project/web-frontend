import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { submitOrder, uploadReferenceImage } from '../lib/adminApi';

const ADONE_TYPES = ['Full Dummy', 'Partial Dummy', 'Full Real'];
const FLAVORS = ['Vanilla', 'Chocolate', 'Strawberry', 'Matcha', 'Caramel', 'Hazelnut', 'Lemon', 'Espresso'];
const FLOWER_OPTIONS = ['Fresh Flowers', 'Artificial Flowers', 'Sugar Flowers', 'Mix'];

const emptyForm = {
  cakeIdea: '',
  adoneType: ADONE_TYPES[0],
  flavor: FLAVORS[0],
  flowerChoice: FLOWER_OPTIONS[0],
  name: '',
  email: '',
  phone: '',
  uploadedFileName: '',
  uploadedFile: null,
  uploadedImageUrl: '',
};

export default function CustomOrderModal({ open, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate on the client side
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, WEBP or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError('');
    setForm(prev => ({ ...prev, uploadedFileName: file.name, uploadedFile: file, uploadedImageUrl: '' }));

    // Upload immediately so the user sees progress
    setUploading(true);
    try {
      const url = await uploadReferenceImage(file);
      setForm(prev => ({ ...prev, uploadedImageUrl: url }));
    } catch (err) {
      setError(err.message || 'Image upload failed. Please try again.');
      setForm(prev => ({ ...prev, uploadedFileName: '', uploadedFile: null }));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError('');
    }
  }, [open]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.name || !form.email) {
      setError('Please provide your name and email so we can reach you.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitOrder({
        source: 'custom',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.cakeIdea,
        customDetails: {
          adoneType: form.adoneType,
          flavor: form.flavor,
          flowerChoice: form.flowerChoice,
          uploadedFileName: form.uploadedFileName,
          uploadedImageUrl: form.uploadedImageUrl || '',
        },
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[100vw] sm:max-w-2xl bg-luxury-cream text-luxury-charcoal rounded-3xl shadow-2xl border border-luxury-sand overflow-hidden max-h-[calc(100vh-2rem)]"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-sand">
              <div>
                <p className="text-[10px] uppercase tracking-extreme text-luxury-muted mb-1">Custom Cake Request</p>
                <h2 className="text-2xl font-serif">Tell Us Your Cake Vision</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close custom order form"
                className="rounded-full p-2 text-luxury-charcoal hover:bg-luxury-sand/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-18rem)]">
              <div className="space-y-2">
                <label className="block text-sm font-medium uppercase tracking-[0.28em] text-luxury-muted">Cake Style Idea</label>
                <textarea
                  value={form.cakeIdea}
                  onChange={e => handleChange('cakeIdea', e.target.value)}
                  placeholder="Describe the shape, style, decoration or inspiration..."
                  className="w-full min-h-30 rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium uppercase tracking-[0.28em] text-luxury-muted">
                  Upload Cake Photo
                  <span className="block text-xs font-normal text-luxury-muted mt-1">Attach a reference image or inspiration photo.</span>
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-luxury-sand bg-white px-4 py-4">
                  {uploading ? (
                    <Loader2 size={24} className="text-luxury-champagne animate-spin" />
                  ) : form.uploadedImageUrl ? (
                    <CheckCircle2 size={24} className="text-green-600" />
                  ) : (
                    <UploadCloud size={24} className="text-luxury-champagne" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-luxury-charcoal">
                      {uploading ? 'Uploading…' : form.uploadedFileName || 'No file selected'}
                    </p>
                    <p className="text-xs text-luxury-muted">
                      {form.uploadedImageUrl ? 'Uploaded successfully' : 'JPEG, PNG, WEBP or GIF (max 5 MB)'}
                    </p>
                  </div>
                  <label className={`cursor-pointer rounded-full bg-luxury-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-luxury-cream transition-colors hover:bg-luxury-onyx ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {form.uploadedImageUrl ? 'Change' : 'Choose'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Adone Type</label>
                  <select
                    value={form.adoneType}
                    onChange={e => handleChange('adoneType', e.target.value)}
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  >
                    {ADONE_TYPES.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Flavor</label>
                  <select
                    value={form.flavor}
                    onChange={e => handleChange('flavor', e.target.value)}
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  >
                    {FLAVORS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Floral Finish</label>
                  <select
                    value={form.flowerChoice}
                    onChange={e => handleChange('flowerChoice', e.target.value)}
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  >
                    {FLOWER_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Name</label>
                  <input
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Contact Number</label>
                  <input
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-extreme text-luxury-muted mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="Email address"
                    className="w-full rounded-xl border border-luxury-sand bg-white px-4 py-3 text-sm text-luxury-charcoal outline-none focus:ring-2 focus:ring-luxury-champagne"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-luxury-charcoal px-6 py-3 text-sm uppercase tracking-[0.3em] text-luxury-charcoal transition-colors hover:bg-luxury-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex items-center justify-center gap-2 rounded-full bg-luxury-charcoal px-6 py-3 text-sm uppercase tracking-[0.3em] text-luxury-cream transition-colors hover:bg-luxury-onyx disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
