import React, { useState, useEffect } from 'react';
import { UserCog, X, User, BookOpen, GraduationCap, Users, Hash } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EditModal = ({ isOpen, pendaftarId, jurusans = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    no_pendaftaran: '',
    no_kwitansi: '',
    nik: '',
    nisn: '',
    nama_siswa: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
    jurusan_1: '',
    jurusan_2: '',
    nama_sekolah: '',
    npsn: '',
    alamat_smp: '',
    nama_ayah: '',
    nama_ibu: '',
    no_orangtua_wali: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState({});

  useEffect(() => {
    if (isOpen && pendaftarId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/admin/pendaftar/${pendaftarId}`);
          if (res.data.success && res.data.data) {
            const d = res.data.data;
            setFormData({
              no_pendaftaran: d.no_pendaftaran || '',
              no_kwitansi: d.no_kwitansi || '-',
              nik: d.nik || '',
              nisn: d.nisn || '',
              nama_siswa: d.nama_siswa || '',
              jenis_kelamin: d.jenis_kelamin || 'L',
              agama: d.agama || 'Islam',
              jurusan_1: d.jurusan_1 || '',
              jurusan_2: d.jurusan_2 || '',
              nama_sekolah: d.nama_sekolah || '',
              npsn: d.npsn || '',
              alamat_smp: d.alamat_smp || '',
              nama_ayah: d.nama_ayah || '',
              nama_ibu: d.nama_ibu || '',
              no_orangtua_wali: d.no_orangtua_wali || '',
            });
          }
        } catch (err) {
          console.error('Failed to load student detail:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, pendaftarId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormError((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      const errors = {};
      const elements = Array.from(form.elements);
      let firstInvalid = null;
      
      elements.forEach(elem => {
        if (elem.name && !elem.validity.valid) {
          if (elem.validity.valueMissing) {
            errors[elem.name] = 'Mohon isi kolom ini.';
          } else {
            errors[elem.name] = 'Nilai tidak valid.';
          }
          if (!firstInvalid) firstInvalid = elem;
        }
      });
      
      setFormError(errors);

      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    setFormError({});
    setSaving(true);
    try {
      const res = await api.put(`/admin/pendaftar/${pendaftarId}`, formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Gagal menyimpan perubahan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 bg-gray-50 text-gray-700 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
  const selectClass = "mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 bg-gray-50 text-gray-700 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">
            
            {/* Header */}
            <div className="bg-white px-6 py-5 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-primary">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">Edit Data Siswa</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Perbarui informasi detail pendaftar</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                type="button" 
                className="p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="p-20 text-center text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="font-medium">Memuat data pendaftar...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="max-h-[75vh] overflow-y-auto custom-scrollbar">

                <div className="px-6 py-6 space-y-8">
                  
                  {/* Info Pendaftaran */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-gray-700 text-sm">INFO PENDAFTARAN</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>No. Pendaftaran</label>
                        <input 
                          type="text" 
                          value={formData.no_pendaftaran} 
                          readOnly 
                          className="mt-1 block w-full rounded-lg border border-transparent px-4 py-2.5 bg-gray-100 text-gray-500 font-mono font-bold text-sm cursor-not-allowed" 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>No. Kwitansi</label>
                        <input 
                          type="text" 
                          value={formData.no_kwitansi} 
                          readOnly 
                          className="mt-1 block w-full rounded-lg border border-transparent px-4 py-2.5 bg-gray-100 text-gray-500 font-mono font-bold text-sm cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section A: Data Pribadi */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <User className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-gray-800">A. Data Pribadi</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>NIK</label>
                        <input 
                          type="text" 
                          name="nik" 
                          maxLength={16} 
                          value={formData.nik} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Masukkan 16 digit NIK"
                        />
                        {formError['nik'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nik']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>NISN</label>
                        <input 
                          type="text" 
                          name="nisn" 
                          maxLength={10} 
                          value={formData.nisn} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Masukkan 10 digit NISN"
                        />
                        {formError['nisn'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nisn']}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Nama Lengkap *</label>
                        <input 
                          type="text" 
                          name="nama_siswa" 
                          value={formData.nama_siswa} 
                          onChange={handleChange}
                          required
                          className={inputClass} 
                          placeholder="Nama lengkap sesuai ijazah"
                        />
                        {formError['nama_siswa'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nama_siswa']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Jenis Kelamin</label>
                        <select 
                          name="jenis_kelamin" 
                          value={formData.jenis_kelamin} 
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                        {formError['jenis_kelamin'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['jenis_kelamin']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Agama</label>
                        <select 
                          name="agama" 
                          value={formData.agama} 
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                        {formError['agama'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['agama']}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section B: Minat Jurusan */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-gray-800">B. Minat Jurusan</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Pilihan Jurusan 1 *</label>
                        <select 
                          name="jurusan_1" 
                          value={formData.jurusan_1} 
                          onChange={handleChange}
                          required
                          className={selectClass}
                        >
                          <option value="">-- Pilih Jurusan 1 --</option>
                          {jurusans.map((j) => (
                            <option key={j.id_jurusan} value={j.id_jurusan}>{j.nama_jurusan}</option>
                          ))}
                        </select>
                        {formError['jurusan_1'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['jurusan_1']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Pilihan Jurusan 2</label>
                        <select 
                          name="jurusan_2" 
                          value={formData.jurusan_2 || '0'} 
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="0">- Tidak Ada -</option>
                          {jurusans.map((j) => (
                            <option key={j.id_jurusan} value={j.id_jurusan}>{j.nama_jurusan}</option>
                          ))}
                        </select>
                        {formError['jurusan_2'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['jurusan_2']}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section C: Asal Sekolah */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-gray-800">C. Asal Sekolah</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Nama Sekolah</label>
                        <input 
                          type="text" 
                          name="nama_sekolah" 
                          value={formData.nama_sekolah} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Nama SMP/MTs asal"
                        />
                        {formError['nama_sekolah'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nama_sekolah']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>NPSN</label>
                        <input 
                          type="text" 
                          name="npsn" 
                          value={formData.npsn} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="NPSN Sekolah"
                        />
                        {formError['npsn'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['npsn']}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Alamat Sekolah</label>
                        <textarea 
                          name="alamat_smp" 
                          rows={2} 
                          value={formData.alamat_smp} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Alamat lengkap sekolah asal"
                        ></textarea>
                        {formError['alamat_smp'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['alamat_smp']}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section D: Data Orang Tua */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-gray-800">D. Data Orang Tua</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Nama Ayah</label>
                        <input 
                          type="text" 
                          name="nama_ayah" 
                          value={formData.nama_ayah} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Nama Ayah Kandung"
                        />
                        {formError['nama_ayah'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nama_ayah']}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Nama Ibu</label>
                        <input 
                          type="text" 
                          name="nama_ibu" 
                          value={formData.nama_ibu} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Nama Ibu Kandung"
                        />
                        {formError['nama_ibu'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['nama_ibu']}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>No. Handphone Orang Tua / Wali</label>
                        <input 
                          type="text" 
                          name="no_orangtua_wali" 
                          value={formData.no_orangtua_wali} 
                          onChange={handleChange}
                          className={inputClass} 
                          placeholder="Contoh: 08123456789"
                        />
                        {formError['no_orangtua_wali'] && <p className="text-red-500 text-xs mt-1 font-medium">{formError['no_orangtua_wali']}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50/80 px-6 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="inline-flex justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all w-full sm:w-auto"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="inline-flex justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-green-800 hover:shadow-lg transition-all w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
