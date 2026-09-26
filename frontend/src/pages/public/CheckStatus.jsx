import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PublicHero from '../../components/public/PublicHero';
import api from '../../api/axios';

const CheckStatus = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNisn = searchParams.get('nisn') || '';

  const [nisn, setNisn] = useState(initialNisn);
  const [siswa, setSiswa] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pengaturan, setPengaturan] = useState({});
  const [carousels, setCarousels] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pengaturanRes, carouselsRes] = await Promise.all([
          api.get('/pengaturan'),
          api.get('/carousels')
        ]);
        if (pengaturanRes.data.success) setPengaturan(pengaturanRes.data.data);
        if (carouselsRes.data.success) setCarousels(carouselsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  const checkNisn = async (searchNisn) => {
    if (!searchNisn || !searchNisn.trim()) {
      setErrorMessage('Harap masukkan NISN Anda untuk mengecek status.');
      setSiswa(null);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSiswa(null);

    try {
      const res = await api.get(`/cek-status/${encodeURIComponent(searchNisn.trim())}`);
      if (res.data.success) {
        setSiswa(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMessage('Terlalu banyak permintaan pengecekan status. Silakan tunggu 1 menit sebelum mencoba kembali.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Data pendaftar tidak ditemukan atau terjadi kesalahan koneksi.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNisn) {
      checkNisn(initialNisn);
    }
  }, [initialNisn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ nisn: nisn.trim() });
    checkNisn(nisn.trim());
  };

  // Status badge logic matching original PHP
  const getStatusBadge = (status = 'Menunggu') => {
    const s = (status || '').toLowerCase();
    if (s === 'diterima' || s === 'lulus') {
      return {
        badgeClass: 'bg-green-100 text-green-700 border border-green-200',
        label: 'SELAMAT! ANDA DITERIMA',
        icon: 'fa-check-circle',
      };
    } else if (s === 'tidak lulus' || s === 'ditolak') {
      return {
        badgeClass: 'bg-red-100 text-red-700 border border-red-200',
        label: 'MAAF, ANDA BELUM DITERIMA',
        icon: 'fa-times-circle',
      };
    } else if (s === 'cadangan') {
      return {
        badgeClass: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        label: 'MASUK DAFTAR CADANGAN',
        icon: 'fa-hourglass-half',
      };
    }
    return {
      badgeClass: 'bg-gray-100 text-gray-600',
      label: 'MENUNGGU VERIFIKASI',
      icon: 'fa-clock',
    };
  };

  const badgeInfo = siswa ? getStatusBadge(siswa.status_pendaftaran) : null;

  return (
    <>
      {/* Hero Section */}
      {pengaturan && Object.keys(pengaturan).length > 0 && (
        <PublicHero pengaturan={pengaturan} carousels={carousels} />
      )}

      {/* Check Status Form */}
      <div className="container mx-auto px-4 my-12 mb-20 max-w-custom min-h-[60vh]">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-kg-dark mb-4">
            Cek Status <span className="text-kg-green">Pendaftaran</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Masukan Nomor Induk Siswa Nasional (NISN) Anda untuk melihat status pendaftaran.
          </p>

          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400 group-focus-within:text-kg-green transition-colors"></i>
                </div>
                <input 
                  type="text" 
                  name="nisn" 
                  value={nisn} 
                  onChange={(e) => setNisn(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kg-green focus:border-transparent shadow-sm transition-all text-lg" 
                  placeholder="Contoh: 0012345678" 
                  required 
                  maxLength={10}
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 bg-kg-green hover:bg-green-800 text-white font-medium rounded-full px-6 transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Mengecek...' : 'Cek'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {errorMessage && (
          <div className="max-w-xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5"></i>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="bg-gray-300 h-16 w-full"></div>
              <div className="p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="h-10 bg-gray-200 rounded-full w-64 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="border-b border-gray-50 pb-2">
                    <div className="h-3 bg-gray-200 w-24 mb-2"></div>
                    <div className="h-5 bg-gray-300 w-48"></div>
                  </div>
                  <div className="border-b border-gray-50 pb-2">
                    <div className="h-3 bg-gray-200 w-24 mb-2"></div>
                    <div className="h-5 bg-gray-300 w-32"></div>
                  </div>
                  <div className="border-b border-gray-50 pb-2">
                    <div className="h-3 bg-gray-200 w-24 mb-2"></div>
                    <div className="h-5 bg-gray-300 w-56"></div>
                  </div>
                  <div className="border-b border-gray-50 pb-2">
                    <div className="h-3 bg-gray-200 w-24 mb-2"></div>
                    <div className="h-5 bg-gray-300 w-40"></div>
                  </div>
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <div className="h-3 bg-gray-200 w-32 mb-3"></div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 h-16"></div>
                      <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 h-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : siswa && (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-kg-green px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">
                  <i className="fas fa-user-graduate me-2 mr-2"></i> Data Pendaftar
                </h3>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  {siswa.gelombang ? `Gelombang ${siswa.gelombang}` : 'Gelombang 1'}
                </span>
              </div>

              <div className="p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center px-5 py-2 rounded-full font-bold text-sm md:text-base ${badgeInfo.badgeClass}`}>
                    <i className={`fas ${badgeInfo.icon} me-2 mr-2`}></i> {badgeInfo.label}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="border-b border-gray-50 pb-2">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</span>
                    <span className="text-gray-800 font-medium text-lg">{siswa.nama_siswa}</span>
                  </div>

                  <div className="border-b border-gray-50 pb-2">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">NISN</span>
                    <span className="text-gray-800 font-medium text-lg">{siswa.nisn}</span>
                  </div>

                  <div className="border-b border-gray-50 pb-2">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sekolah Asal</span>
                    <span className="text-gray-800 font-medium text-lg">{siswa.nama_sekolah}</span>
                  </div>

                  <div className="border-b border-gray-50 pb-2">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">No. Pendaftaran</span>
                    <span className="text-gray-800 font-medium text-lg tracking-wide">
                      {siswa.no_pendaftaran || '-'}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pilihan Jurusan</span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block">Pilihan 1</span>
                        <span className="font-semibold text-kg-green">
                          {siswa.nama_jurusan_1 || '-'}
                        </span>
                      </div>
                      {siswa.nama_jurusan_2 && siswa.nama_jurusan_2 !== '-' && (
                        <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                          <span className="text-xs text-gray-500 block">Pilihan 2</span>
                          <span className="font-semibold text-gray-700">
                            {siswa.nama_jurusan_2}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/" className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <i className="fas fa-arrow-left me-2 mr-2"></i> Kembali
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckStatus;
