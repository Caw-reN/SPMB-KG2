import React, { useState, useEffect, useRef } from 'react';
import { Sliders, LayoutTemplate, Save, Upload, Trash2, CheckCircle, XCircle, Image as ImageIcon, Loader2, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Pengaturan = () => {
  const [formData, setFormData] = useState({
    tahun_ajaran: '',
    gelombang: 1,
    target_siswa: 468,
    nama_sekolah: '',
    judul: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [carousels, setCarousels] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselError, setCarouselError] = useState('');
  const fileInputRef = useRef(null);

  const fetchCarousels = async () => {
    try {
      const res = await api.get('/carousels');
      setCarousels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchPengaturan = async () => {
      try {
        const res = await api.get('/admin/pengaturan');
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setFormData({
            tahun_ajaran: d.tahun_ajaran || '',
            gelombang: d.gelombang || 1,
            target_siswa: d.target_siswa || 0,
            nama_sekolah: d.nama_sekolah || '',
            judul: d.judul || '',
            deskripsi: d.deskripsi || '',
          });
        }
      } catch (err) {
        console.error('Failed to load pengaturan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPengaturan();
    fetchCarousels();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setCarouselError('');
    
    if (selectedFile) {
      // FE Validation: Type Check
      if (!selectedFile.type.startsWith('image/')) {
        setCarouselError('File harus berupa gambar (JPG, PNG, dll).');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // FE Validation: Size Check (Max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setCarouselError('Ukuran gambar maksimal 10MB.');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setCarouselLoading(true);
    setCarouselError('');
    try {
      await api.post('/admin/carousels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchCarousels();
    } catch (err) {
      setCarouselError('Gagal mengupload gambar.');
    } finally {
      setCarouselLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/carousels/${id}`, { is_active: !currentStatus });
      fetchCarousels();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCarousel = async (id) => {
    if (!window.confirm('Yakin ingin menghapus gambar ini?')) return;
    try {
      await api.delete(`/admin/carousels/${id}`);
      fetchCarousels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gelombang' || name === 'target_siswa' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put('/admin/pengaturan', formData);
      if (res.data.success) {
        toast.success('Pengaturan Tersimpan!');
      }
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
        <h2 className="text-2xl font-bold text-gray-700">Pengaturan Sistem</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-pulse">
              <div className="xl:col-span-5 bg-white p-8 rounded-xl border border-gray-100 space-y-8">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              <div className="xl:col-span-7 bg-white p-8 rounded-xl border border-gray-100 space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-40 bg-gray-200 rounded w-full"></div>
                  <div className="h-40 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Left Column: Form Settings */}
              <div className="xl:col-span-5">
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-8 sticky top-24">
                  {/* Section 1 */}
                  <div className="space-y-5">
                    <h3 className="font-bold text-gray-800 text-lg border-b pb-3 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-primary" /> Konfigurasi Pendaftaran
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Tahun Ajaran Aktif</label>
                        <input 
                          type="text" 
                          name="tahun_ajaran" 
                          value={formData.tahun_ajaran} 
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Gelombang Pendaftaran</label>
                        <select 
                          name="gelombang" 
                          value={formData.gelombang} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-shadow"
                        >
                          <option value={1}>Gelombang 1</option>
                          <option value={2}>Gelombang 2</option>
                          <option value={3}>Gelombang 3</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="space-y-5">
                    <h3 className="font-bold text-gray-800 text-lg border-b pb-3 flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-primary" /> Tampilan Formulir
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Judul Formulir</label>
                        <input 
                          type="text" 
                          name="judul" 
                          value={formData.judul} 
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Target Siswa</label>
                        <input 
                          type="number" 
                          name="target_siswa" 
                          value={formData.target_siswa} 
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Nama Sekolah</label>
                        <input 
                          type="text" 
                          name="nama_sekolah" 
                          value={formData.nama_sekolah} 
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Sub-Judul / Deskripsi</label>
                        <textarea 
                          name="deskripsi" 
                          rows={4} 
                          value={formData.deskripsi} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-6 py-3 w-full bg-primary text-white rounded-lg hover:bg-green-800 font-semibold flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Carousel */}
              <div className="xl:col-span-7">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="space-y-6">
                    <h3 className="font-bold text-gray-800 text-lg border-b pb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" /> Manajemen Gambar Utama (Carousel)
                    </h3>
                    
                    {carouselError && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 font-medium">{carouselError}</div>}
                    
                    <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200">
                      <h4 className="text-sm font-semibold mb-3 text-gray-700">Tambah Gambar Baru</h4>
                      
                      {previewUrl && (
                        <div className="mb-4 relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border border-gray-300 shadow-sm mx-auto sm:mx-0">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          {carouselLoading && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                              <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                              <span className="text-white font-medium text-sm tracking-wide shadow-sm">Mengupload...</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 w-full">
                          <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={carouselLoading}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-medium
                              file:bg-primary file:text-white
                              hover:file:bg-green-700 bg-white border border-gray-300 rounded-xl p-1 transition-colors disabled:opacity-50"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleUpload}
                          disabled={!file || carouselLoading}
                          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center font-medium transition-colors"
                        >
                          {carouselLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {carouselLoading ? 'Memproses...' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {carousels.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                          <div 
                            className="aspect-video bg-gray-100 relative cursor-pointer"
                            onClick={() => setModalImage(`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${item.image_path}`)}
                          >
                            <img 
                              src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${item.image_path}`} 
                              alt="Carousel" 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 font-medium tracking-wide drop-shadow-md transition-opacity">
                                Klik untuk memperbesar
                              </span>
                            </div>
                            {!item.is_active && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="text-white font-semibold bg-red-500 px-4 py-1.5 rounded-full text-sm shadow-lg tracking-wide">NONAKTIF</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3.5 flex justify-between items-center bg-gray-50 border-t border-gray-100 group-hover:bg-gray-100/50 transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleStatus(item.id, item.is_active)}
                              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                item.is_active 
                                  ? 'text-green-700 bg-green-100 hover:bg-green-200 shadow-sm' 
                                  : 'text-gray-600 bg-gray-200 hover:bg-gray-300 shadow-sm'
                              }`}
                            >
                              {item.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => deleteCarousel(item.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {carousels.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="font-medium">Belum ada gambar carousel.</p>
                          <p className="text-sm text-gray-400 mt-1">Silakan upload gambar untuk ditampilkan di halaman depan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Image Modal Preview */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-w-5xl w-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setModalImage(null);
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={modalImage} 
              alt="Preview Full" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Pengaturan;
