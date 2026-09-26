import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHero from '../../components/public/PublicHero';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CustomSelect = ({ name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value == value);

  return (
    <div className="relative" ref={selectRef}>
      <input type="text" name={name} value={value || ''} required onChange={() => {}} tabIndex="-1" className="absolute opacity-0 w-full h-full -z-10 pointer-events-none" />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-3 bg-gray-50/50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'bg-white border-kg-green ring-2 ring-kg-green/50' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fas fa-chevron-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      <div className={`absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          {options.map((opt, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(opt.value)}
              className={`px-5 py-3 cursor-pointer transition-colors flex items-center justify-between ${value == opt.value ? 'bg-green-50 text-kg-green font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
              {value == opt.value && <i className="fas fa-check text-kg-green"></i>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [pengaturan, setPengaturan] = useState({
    judul: 'Sistem Penerimaan Murid Baru 2025',
    nama_sekolah: 'SMK Karya Guna 2 Bekasi',
    deskripsi: 'Ayo Bergabunglah bersama kami untuk masa depan yang lebih cerah.\nMulai langkah Anda dengan mengisi formulir pendaftaran.',
  });
  const [jurusans, setJurusans] = useState([]);
  const [carousels, setCarousels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nik: '',
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    agama: '',
    jurusan1: '',
    jurusan2: '',
    asal_smp: '',
    npsn: '',
    alamat_smp: '',
    nama_ayah: '',
    nama_ibu: '',
    'no_ortu-wali': '',
  });

  useEffect(() => {
    // Fetch Pengaturan & Jurusan
    const fetchData = async () => {
      try {
        const [resPengaturan, resJurusan, resCarousel] = await Promise.all([
          api.get('/pengaturan'),
          api.get('/jurusan'),
          api.get('/carousels?active_only=true')
        ]);
        if (resPengaturan.data.success && resPengaturan.data.data) {
          setPengaturan(resPengaturan.data.data);
        }
        if (resJurusan.data.success && resJurusan.data.data) {
          setJurusans(resJurusan.data.data);
        }
        if (resCarousel.data.data) {
          setCarousels(resCarousel.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'jurusan1' && value == prev.jurusan2) {
        newData.jurusan2 = '';
      }
      if (name === 'jurusan2' && value == prev.jurusan1) {
        newData.jurusan1 = '';
      }
      
      return newData;
    });
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
          } else if (elem.validity.patternMismatch) {
            errors[elem.name] = 'Format tidak sesuai.';
          } else if (elem.validity.tooShort || elem.validity.tooLong) {
            errors[elem.name] = 'Panjang karakter tidak sesuai.';
          } else {
            errors[elem.name] = 'Nilai tidak valid.';
          }
          if (!firstInvalid) firstInvalid = elem;
        }
      });
      
      setFieldErrors(errors);

      if (firstInvalid) {
        firstInvalid.focus();
        // Scroll slightly above the input for better view
        const rect = firstInvalid.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - 100, behavior: 'smooth' });
      }
      return;
    }

    setErrorMessage('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await api.post('/pendaftaran', formData);
      if (res.data.success) {
        navigate('/pendaftaran-sukses', {
          state: {
            no_pendaftaran: res.data.data.no_pendaftaran,
            nama_siswa: res.data.data.nama_siswa,
          },
        });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMessage('Terlalu banyak percobaan pendaftaran. Silakan tunggu beberapa saat sebelum mencoba lagi.');
      } else if (err.response?.data?.message) {
        const msg = err.response.data.message;
        if (msg.includes('sudah terdaftar')) {
          setFieldErrors({ nik: msg });
          const nikInput = document.getElementById('nik');
          if (nikInput) {
            nikInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => nikInput.focus(), 500);
          }
        } else {
          setErrorMessage(msg);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      } else {
        setErrorMessage('Terjadi kesalahan sistem saat menyimpan data. Silakan coba lagi atau hubungi panitia.');
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <PublicHero pengaturan={pengaturan} carousels={carousels} />

      {/* Formulir Pendaftaran */}
      <div className="container mx-auto px-4 mb-16 max-w-custom">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <header className="bg-kg-green py-6 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 pointer-events-none">
              <i className="fas fa-file-signature text-9xl text-white transform rotate-12"></i>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-white text-3xl font-bold tracking-wide mb-2">Formulir Pendaftaran</h2>
              <div className="flex justify-center items-center gap-2 text-green-100 text-sm font-light">
                <i className="fas fa-info-circle"></i>
                <span>Isi data diri dengan lengkap dan benar</span>
              </div>
            </div>
          </header>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="p-6 md:p-10 bg-white">
              
              {/* Section 1: Data Diri */}
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      <i className="fas fa-user"></i>
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Data Diri Calon Siswa</h3>
                      <p className="text-sm text-gray-500 font-medium">Lengkapi informasi identitas diri Anda</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="nik" className="block mb-2 font-semibold text-gray-700 text-sm">NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span></label>
                  <input 
                    name="nik" 
                    type="text" 
                    id="nik" 
                    placeholder="16 digit NIK" 
                    required 
                    maxLength={16} 
                    pattern="\d{16}"
                    value={formData.nik}
                    onChange={(e) => {
                      setFormData({...formData, nik: e.target.value.replace(/\D/g, '')});
                      setFieldErrors(prev => { const ne = {...prev}; delete ne['nik']; return ne; });
                    }}
                    className={`w-full px-5 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 transition-all ${formData.nik.length > 0 && formData.nik.length < 16 ? 'border-red-400 focus:border-red-400' : formData.nik.length === 16 ? 'border-green-500 focus:border-green-500' : 'border-gray-200 focus:border-kg-green'}`}
                  />
                  {fieldErrors['nik'] ? (
                    <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors['nik']}</p>
                  ) : formData.nik.length > 0 && formData.nik.length < 16 ? (
                    <p className="text-xs text-red-500 mt-2 font-medium">Kurang {16 - formData.nik.length} digit lagi.</p>
                  ) : formData.nik.length === 16 ? (
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                      <i className="fas fa-check"></i> Sesuai
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">Pastikan sesuai dengan Kartu Keluarga.</p>
                  )}
                </div>

                <div className="relative">
                  <label htmlFor="nisn" className="block mb-2 font-semibold text-gray-700 text-sm">NISN (Nomor Induk Siswa Nasional) <span className="text-red-500">*</span></label>
                  <input 
                    name="nisn" 
                    type="text" 
                    id="nisn" 
                    placeholder="10 digit NISN" 
                    required 
                    maxLength={10} 
                    pattern="\d{10}"
                    value={formData.nisn}
                    onChange={(e) => {
                      setFormData({...formData, nisn: e.target.value.replace(/\D/g, '')});
                      setFieldErrors(prev => { const ne = {...prev}; delete ne['nisn']; return ne; });
                    }}
                    className={`w-full px-5 py-3 bg-gray-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 transition-all ${formData.nisn.length > 0 && formData.nisn.length < 10 ? 'border-red-400 focus:border-red-400' : formData.nisn.length === 10 ? 'border-green-500 focus:border-green-500' : 'border-gray-200 focus:border-kg-green'}`}
                  />
                  {fieldErrors['nisn'] ? (
                    <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors['nisn']}</p>
                  ) : formData.nisn.length > 0 && formData.nisn.length < 10 ? (
                    <p className="text-xs text-red-500 mt-2 font-medium">Kurang {10 - formData.nisn.length} digit lagi.</p>
                  ) : formData.nisn.length === 10 ? (
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                      <i className="fas fa-check"></i> Sesuai
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Dapat dicek di rapor.
                    </p>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="nama_lengkap" className="block mb-2 font-semibold text-gray-700 text-sm">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input 
                    name="nama_lengkap" 
                    type="text" 
                    id="nama_lengkap" 
                    required
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['nama_lengkap'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['nama_lengkap']}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="jenis_kelamin" className="block mb-2 font-semibold text-gray-700 text-sm">Jenis Kelamin <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    name="jenis_kelamin" 
                    value={formData.jenis_kelamin}
                    onChange={handleChange}
                    placeholder="-- Pilih Jenis Kelamin --"
                    options={[
                      { value: 'L', label: 'Laki-laki' },
                      { value: 'P', label: 'Perempuan' }
                    ]}
                  />
                  {fieldErrors['jenis_kelamin'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['jenis_kelamin']}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="agama" className="block mb-2 font-semibold text-gray-700 text-sm">Agama <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    name="agama" 
                    value={formData.agama}
                    onChange={handleChange}
                    placeholder="-- Pilih Agama --"
                    options={[
                      { value: 'islam', label: 'Islam' },
                      { value: 'kristen', label: 'Kristen' },
                      { value: 'khatolik', label: 'Khatolik' },
                      { value: 'budha', label: 'Budha' },
                      { value: 'hindu', label: 'Hindu' },
                      { value: 'konghucu', label: 'Konghucu' }
                    ]}
                  />
                  {fieldErrors['agama'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['agama']}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="jurusan1" className="block mb-2 font-semibold text-gray-700 text-sm">Pilihan Jurusan 1 <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    name="jurusan1" 
                    value={formData.jurusan1}
                    onChange={handleChange}
                    placeholder="-- Pilih Jurusan Pertama --"
                    options={jurusans.filter(j => j.id_jurusan != formData.jurusan2).map(j => ({ value: j.id_jurusan, label: j.nama_jurusan }))}
                  />
                  {fieldErrors['jurusan1'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['jurusan1']}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="jurusan2" className="block mb-2 font-semibold text-gray-700 text-sm">Pilihan Jurusan 2 <span className="text-red-500">*</span></label>
                  <CustomSelect 
                    name="jurusan2" 
                    value={formData.jurusan2}
                    onChange={handleChange}
                    placeholder="-- Pilih Jurusan Kedua --"
                    options={jurusans.filter(j => j.id_jurusan != formData.jurusan1).map(j => ({ value: j.id_jurusan, label: j.nama_jurusan }))}
                  />
                  {fieldErrors['jurusan2'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['jurusan2']}</p>}
                </div>
              </div>

              <hr className="my-10 border-gray-200 border-dashed" />

              {/* Section 2: Data Sekolah Asal */}
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Data Sekolah Asal</h3>
                      <p className="text-sm text-gray-500 font-medium">Informasi SMP/MTs asal Anda</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="asal_smp" className="block mb-2 font-semibold text-gray-700 text-sm">Nama Sekolah Asal (SMP/MTs) <span className="text-red-500">*</span></label>
                  <input 
                    name="asal_smp" 
                    type="text" 
                    id="asal_smp" 
                    required
                    value={formData.asal_smp}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['asal_smp'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['asal_smp']}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="npsn_smp" className="block mb-2 font-semibold text-gray-700 text-sm">NPSN (Optional)</label>
                  <input 
                    name="npsn" 
                    type="text" 
                    id="npsn_smp" 
                    placeholder="8 digit NPSN" 
                    maxLength={8} 
                    pattern="\d{8}"
                    value={formData.npsn}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['npsn'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['npsn']}</p>}
                  <p className="text-xs text-gray-500 mt-2">Masukan Jika Berasal Dari MTs</p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="alamat_smp" className="block mb-2 font-semibold text-gray-700 text-sm">Alamat Lengkap SMP <span className="text-red-500">*</span></label>
                  <textarea 
                    name="alamat_smp" 
                    id="alamat_smp" 
                    rows={2} 
                    required
                    value={formData.alamat_smp}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  ></textarea>
                  {fieldErrors['alamat_smp'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['alamat_smp']}</p>}
                </div>
              </div>

              <hr className="my-10 border-gray-200 border-dashed" />

              {/* Section 3: Data Orang Tua */}
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      <i className="fas fa-user-friends"></i>
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">Data Orang Tua / Wali</h3>
                      <p className="text-sm text-gray-500 font-medium">Informasi kontak orang tua atau wali</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nama_ayah" className="block mb-2 font-semibold text-gray-700 text-sm">Nama Ayah <span className="text-red-500">*</span></label>
                  <input 
                    name="nama_ayah" 
                    type="text" 
                    id="nama_ayah"
                    required
                    value={formData.nama_ayah}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['nama_ayah'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['nama_ayah']}</p>}
                </div>

                <div>
                  <label htmlFor="nama_ibu" className="block mb-2 font-semibold text-gray-700 text-sm">Nama Ibu <span className="text-red-500">*</span></label>
                  <input 
                    name="nama_ibu" 
                    type="text" 
                    id="nama_ibu" 
                    required
                    value={formData.nama_ibu}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['nama_ibu'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['nama_ibu']}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="hp_ortu-wali" className="block mb-2 font-semibold text-gray-700 text-sm">No. HP/WhatsApp Orang Tua / Wali <span className="text-red-500">*</span></label>
                  <input 
                    name="no_ortu-wali" 
                    type="tel" 
                    id="hp_ortu-wali" 
                    placeholder="Contoh: 0812xxxxxx" 
                    maxLength={14} 
                    required 
                    pattern="08[0-9]{8,12}"
                    value={formData['no_ortu-wali']}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-kg-green/50 focus:border-kg-green transition-all"
                  />
                  {fieldErrors['no_ortu-wali'] && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors['no_ortu-wali']}</p>}
                </div>
              </div>

            <div className="mt-8 mb-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-kg-green to-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 text-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <><i className="fas fa-circle-notch fa-spin"></i> Memproses Pendaftaran...</>
                ) : (
                  <>Kirim Formulir Pendaftaran <i className="fas fa-paper-plane"></i></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
