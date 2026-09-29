import React, { useState, useEffect } from 'react';
import { 
  Info, Check, Printer, Search, Download, ChevronDown, Eye, SearchX 
} from 'lucide-react';
import api from '../../api/axios';
import ConfirmModal from '../../components/admin/ConfirmModal';
import EditModal from '../../components/admin/EditModal';
import toast from 'react-hot-toast';

const CetakKartuUjian = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  // Modals
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [verifyId, setVerifyId] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [jurusans, setJurusans] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/cetak-kartu?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setSiswaList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cetak-kartu list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await api.get('/jurusan');
        if (res.data.success) setJurusans(res.data.data);
      } catch (err) {
        console.error('Error fetching jurusans:', err);
      }
    };
    fetchJurusan();
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenVerify = (id) => {
    setVerifyId(id);
    setConfirmModalOpen(true);
  };

  const handleExecuteVerify = async () => {
    if (!verifyId) return;
    try {
      const res = await api.post(`/admin/pendaftar/${verifyId}/verify-formulir`);
      if (res.data.success) {
        toast.success('Berhasil! Status formulir siswa telah diverifikasi.');
        fetchData();
      }
    } catch (err) {
      toast.error('Gagal memverifikasi formulir.');
    } finally {
      setConfirmModalOpen(false);
      setVerifyId(null);
    }
  };

  const handleExportCbt = async (gelombang) => {
    try {
      const response = await api.get(`/admin/export/cbt-login?gelombang=${gelombang}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Data_Login_CBT_Gelombang_${gelombang}.xls`;
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (fileNameMatch && fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CBT data:', error);
      toast.error('Gagal mengekspor data.');
    }
    setExportOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
        <h2 className="text-2xl font-bold text-gray-700">Cetak Kartu Ujian</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-8">

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6 flex items-start gap-3 text-green-800">
          <Info className="mt-1 w-5 h-5 flex-shrink-0 text-green-600" />
          <div className="text-sm">
            <p className="font-bold">Alur Cetak Kartu:</p>
            <p>1. Klik tombol Ceklis <Check className="w-4 h-4 inline text-green-600" /> jika siswa sudah mengembalikan formulir fisik.</p>
            <p>2. Setelah diverifikasi, tombol Print <Printer className="w-4 h-4 inline text-green-600" /> akan muncul otomatis.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Cari Nama / No. Daftar / NISN..." 
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="relative">
              <button 
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800 text-sm transition-colors cursor-pointer outline-none"
              >
                <Download className="w-4 h-4" /> Export Excel
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {exportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-50">
                  <button 
                    type="button" 
                    onClick={() => handleExportCbt(1)}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-t-lg transition-colors"
                  >
                    Gelombang 1
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleExportCbt(2)}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                  >
                    Gelombang 2
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleExportCbt(3)}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-b-lg transition-colors"
                  >
                    Gelombang 3
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="siswa-card relative flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white animate-pulse">
                  <div className="space-y-3 pr-4 border-r border-dashed border-gray-300 w-full">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-24 mt-2"></div>
                  </div>
                  <div className="pl-4 flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : siswaList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siswaList.map((siswa) => {
                const isKembali = siswa.formulir_kembali !== 0;
                const borderClass = isKembali ? 'border-green-500 bg-green-50/30 shadow-md' : 'border-gray-200 bg-white';

                return (
                  <div 
                    key={siswa.id_pendaftar}
                    className={`siswa-card relative flex items-center justify-between p-5 rounded-xl border ${borderClass} card-transition`}
                  >
                    <div className="space-y-1 pr-4 border-r border-dashed border-gray-300 w-full">
                      <h3 className="text-lg font-bold text-gray-800">{siswa.nama_siswa}</h3>
                      <div className="text-sm text-gray-500 font-mono space-y-0.5">
                        <p><span className="text-gray-400 w-16 inline-block">No. Reg</span> : <span className="text-primary font-semibold">{siswa.no_pendaftaran}</span></p>
                        <p><span className="text-gray-400 w-16 inline-block">Kwitansi</span> : {siswa.no_kwitansi}</p>
                        <p><span className="text-gray-400 w-16 inline-block">NISN</span> : {siswa.nisn}</p>
                      </div>
                      <div className="mt-3">
                        {isKembali ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">Terverifikasi</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">Belum Verifikasi</span>
                        )}
                      </div>
                    </div>

                    <div className="pl-4 flex-shrink-0">
                      {!isKembali ? (
                        <button 
                          type="button" 
                          onClick={() => handleOpenVerify(siswa.id_pendaftar)}
                          className="group flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gray-100 hover:bg-green-100 border-2 border-gray-300 hover:border-green-500 transition-all duration-300" 
                          title="Klik untuk Verifikasi Formulir"
                        >
                          <Check className="w-8 h-8 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <button 
                            type="button"
                            onClick={() => {
                              setViewId(siswa.id_pendaftar);
                              setEditModalOpen(true);
                            }} 
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400 shadow-sm transition-all" 
                            title="Lihat Data"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a 
                            href={`/mlebu/print/kartu/${siswa.id_pendaftar}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg hover:bg-green-800 hover:scale-105 transition-all" 
                            title="Cetak Kartu"
                          >
                            <Printer className="w-5 h-5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-12 text-gray-400">
              <SearchX className="w-16 h-16 mb-4 opacity-50" />
              <p>Belum ada siswa yang lulus seleksi administrasi (Status: Diterima).</p>
            </div>
          )}
        </div>
      </main>

      {/* Confirm Verification Modal */}
      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Verifikasi Pengembalian Formulir"
        message="Apakah Anda yakin siswa ini telah mengembalikan formulir fisik? Status akan diverifikasi dan kartu ujian siap dicetak."
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteVerify}
      />

      {/* View/Edit Modal */}
      <EditModal 
        isOpen={editModalOpen}
        pendaftarId={viewId}
        jurusans={jurusans}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </>
  );
};

export default CetakKartuUjian;
