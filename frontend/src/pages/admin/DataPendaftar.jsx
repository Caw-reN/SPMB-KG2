import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Download, CheckCircle, Trash2, Printer, Pencil, SearchX, ChevronDown 
} from 'lucide-react';
import api from '../../api/axios';
import DeleteModal from '../../components/admin/DeleteModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import EditModal from '../../components/admin/EditModal';
import toast from 'react-hot-toast';

const CustomDropdown = ({ options, value, onChange, placeholder, className, small, up }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-gray-700 ${small ? 'px-2 py-1 text-sm' : 'px-4 py-2'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute z-20 w-full ${up ? 'bottom-full mb-1' : 'top-full mt-1'} bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors ${small ? 'text-xs' : 'text-sm'} ${String(value) === String(opt.value) ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DataPendaftar = () => {
  const [pendaftarList, setPendaftarList] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [loading, setLoading] = useState(false);
  const [jurusans, setJurusans] = useState([]);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedConfirmId, setSelectedConfirmId] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);

  const fetchData = async (p = page, q = search, l = limit, st = filterStatus, ju = filterJurusan) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/pendaftar?page=${p}&limit=${l}&search=${encodeURIComponent(q)}&status=${encodeURIComponent(st)}&jurusan=${encodeURIComponent(ju)}`);
      if (res.data.success) {
        setPendaftarList(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Error fetching pendaftar list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await api.get('/jurusan');
        if (res.data.success) {
          setJurusans(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching jurusans:', err);
      }
    };
    fetchJurusan();
  }, []);

  useEffect(() => {
    fetchData(page, search, limit, filterStatus, filterJurusan);
  }, [page, limit, filterStatus, filterJurusan]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, search, limit, filterStatus, filterJurusan);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/pendaftar', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Data_Pendaftar.xls';
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
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data.');
    }
  };

  // Actions
  const handleOpenConfirm = (id) => {
    setSelectedConfirmId(id);
    setConfirmModalOpen(true);
  };

  const handleExecuteConfirm = async () => {
    if (!selectedConfirmId) return;
    try {
      const res = await api.post(`/admin/pendaftar/${selectedConfirmId}/approve`);
      if (res.data.success) {
        toast.success('Siswa berhasil diverifikasi & Kwitansi diterbitkan.');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal verifikasi pendaftar.');
    } finally {
      setConfirmModalOpen(false);
      setSelectedConfirmId(null);
    }
  };

  const handleOpenDelete = (id) => {
    setSelectedDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      const res = await api.delete(`/admin/pendaftar/${selectedDeleteId}`);
      if (res.data.success) {
        toast.success('Data pendaftar berhasil dihapus (Soft Delete).');
        fetchData();
      }
    } catch (err) {
      toast.error('Gagal menghapus data pendaftar.');
    } finally {
      setDeleteModalOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const handleOpenEdit = (id) => {
    setSelectedEditId(id);
    setEditModalOpen(true);
  };

  const startRecord = (meta.current_page - 1) * meta.per_page + 1;
  const endRecord = Math.min(startRecord + meta.per_page - 1, meta.total);

  return (
    <>
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
        <h2 className="text-2xl font-bold text-gray-700">Data Pendaftar</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="Cari Siswa / No Daftar..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </form>
              <CustomDropdown 
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'Menunggu', label: 'Menunggu' },
                  { value: 'Diterima', label: 'Diterima' }
                ]}
                value={filterStatus}
                onChange={(val) => { setFilterStatus(val); setPage(1); }}
                placeholder="Semua Status"
                className="w-full md:w-40 z-20"
              />
              <CustomDropdown 
                options={[
                  { value: '', label: 'Semua Jurusan' },
                  ...jurusans.map(j => ({ value: j.id_jurusan, label: j.kode_jurusan }))
                ]}
                value={filterJurusan}
                onChange={(val) => { setFilterJurusan(val); setPage(1); }}
                placeholder="Semua Jurusan"
                className="w-full md:w-48 z-10"
              />
            </div>
            <div className="flex items-center justify-end w-full lg:w-auto">
              <button 
                type="button" 
                onClick={handleExport}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-800 text-sm transition-colors decoration-none"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-gray-50/50 md:bg-white rounded-xl md:rounded-none">
            <table className="w-full text-left border-collapse text-sm block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 text-gray-600 border-b uppercase text-xs tracking-wider">
                  <th className="p-4 w-12">No</th>
                  <th className="p-4">No. Daftar / Kwitansi</th>
                  <th className="p-4">Nama Siswa / NISN</th>
                  <th className="p-4">Asal Sekolah</th>
                  <th className="p-4">Jurusan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group md:divide-y md:divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="block md:table-row animate-pulse bg-white md:bg-gray-50/50 mb-4 md:mb-0 rounded-xl md:rounded-none border border-gray-100 md:border-none p-4 md:p-0 shadow-sm md:shadow-none">
                      {/* Mobile Skeleton */}
                      <td className="md:hidden block">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="h-6 bg-gray-200 rounded w-32"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      
                      {/* Desktop Skeletons */}
                      <td className="hidden md:table-cell p-4"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                      <td className="hidden md:table-cell p-4">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="hidden md:table-cell p-4">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="hidden md:table-cell p-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                      <td className="hidden md:table-cell p-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="hidden md:table-cell p-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                      <td className="hidden md:table-cell p-4"><div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div></td>
                    </tr>
                  ))
                ) : pendaftarList.length > 0 ? (
                  pendaftarList.map((row, idx) => {
                    const rowNumber = startRecord + idx;
                    return (
                      <tr key={row.id_pendaftar} className="block md:table-row border border-gray-200 md:border-none mb-4 md:mb-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none hover:bg-gray-50 transition-colors p-4 md:p-0">
                        {/* Mobile Compact Card */}
                        <td className="md:hidden block">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-800 text-base">{row.nama_siswa}</h3>
                              <div className="text-xs text-gray-500 mt-0.5">NISN: {row.nisn} • {row.no_pendaftaran}</div>
                              {row.no_kwitansi && (
                                <div className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-1.5 font-mono text-gray-600">
                                  {row.no_kwitansi}
                                </div>
                              )}
                            </div>
                            <div>
                              {row.status_pendaftaran === 'Diterima' ? (
                                <span className="px-2 py-1 bg-green-100 text-primary rounded text-[10px] font-bold uppercase tracking-wider">Terverifikasi</span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-[10px] font-bold uppercase tracking-wider">Menunggu</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-medium border border-gray-200">
                              {row.nama_sekolah}
                            </div>
                            <div className="bg-green-50 text-primary px-2.5 py-1 rounded text-xs font-bold border border-green-200">
                              {row.jurusan_label}
                            </div>
                          </div>

                          <div className="flex justify-end pt-3 border-t border-gray-100">
                            {row.status_pendaftaran === 'Menunggu' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenConfirm(row.id_pendaftar)}
                                  type="button"
                                  className="flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" /> Konfirmasi
                                </button>
                                
                                <button 
                                  onClick={() => handleOpenDelete(row.id_pendaftar)}
                                  type="button"
                                  className="text-red-500 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 w-full justify-between">
                                <a 
                                  href={`/admin/print/kwitansi/${row.id_pendaftar}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex justify-center items-center gap-1.5 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors"
                                  title="Cetak Kwitansi"
                                >
                                  <Printer className="w-4 h-4" /> Cetak Kwitansi
                                </a>
                                <div className="flex gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => handleOpenEdit(row.id_pendaftar)}
                                    className="text-yellow-600 p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors" 
                                    title="Edit Data"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleOpenDelete(row.id_pendaftar)}
                                    className="text-red-500 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                                    title="Hapus Data"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Desktop Cells */}
                        <td className="hidden md:table-cell p-4 text-gray-500 align-top">{rowNumber}</td>
                        <td className="hidden md:table-cell p-4 align-top">
                          <div className="font-medium text-primary">{row.no_pendaftaran}</div>
                          {row.no_kwitansi && (
                            <div className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-1 font-mono text-gray-600">
                              {row.no_kwitansi}
                            </div>
                          )}
                        </td>
                        <td className="hidden md:table-cell p-4 align-top">
                          <div className="font-bold text-gray-800">{row.nama_siswa}</div>
                          <div className="text-xs text-gray-500 mt-1">NISN: {row.nisn}</div>
                        </td>
                        <td className="hidden md:table-cell p-4 text-gray-600 align-top">{row.nama_sekolah}</td>
                        <td className="hidden md:table-cell p-4 text-gray-600 align-top">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold inline-block">
                            {row.jurusan_label}
                          </span>
                        </td>
                        <td className="hidden md:table-cell p-4 align-top">
                          <div>
                            {row.status_pendaftaran === 'Diterima' ? (
                              <span className="px-2 py-1 bg-green-100 text-primary rounded text-xs font-semibold inline-block">Terverifikasi</span>
                            ) : (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-semibold inline-block">Menunggu</span>
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell p-4 text-center align-top">
                          <div className="flex justify-center">
                            {row.status_pendaftaran === 'Menunggu' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenConfirm(row.id_pendaftar)}
                                  type="button"
                                  className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 text-xs font-medium transition-colors"
                                >
                                  <CheckCircle className="w-3 h-3" /> Konfirmasi
                                </button>
                                
                                <button 
                                  onClick={() => handleOpenDelete(row.id_pendaftar)}
                                  type="button"
                                  className="text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <a 
                                  href={`/admin/print/kwitansi/${row.id_pendaftar}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                                  title="Cetak Kwitansi"
                                >
                                  <Printer className="w-3 h-3" /> Cetak Kwitansi
                                </a>
                                <button 
                                  type="button" 
                                  onClick={() => handleOpenEdit(row.id_pendaftar)}
                                  className="text-yellow-600 p-1 hover:bg-yellow-50 rounded transition-colors" 
                                  title="Edit Data"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleOpenDelete(row.id_pendaftar)}
                                  className="text-red-500 p-1 hover:bg-red-50 rounded transition-colors" 
                                  title="Hapus Data"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="block md:table-row bg-white md:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none border border-gray-200 md:border-none">
                    <td colSpan={7} className="p-8 text-center text-gray-400 block md:table-cell">
                      <SearchX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Data tidak ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Control & Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Tampilkan:</span>
                <CustomDropdown 
                  options={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  value={limit}
                  onChange={(val) => { setLimit(val); setPage(1); }}
                  placeholder="10"
                  className="w-20"
                  small
                  up
                />
              </div>
              <p className="text-sm text-gray-500">
                Menampilkan <span className="font-bold">{startRecord}</span> - <span className="font-bold">{endRecord}</span> dari <span className="font-bold">{meta.total}</span> data
              </p>
            </div>

            {meta.last_page > 1 && (
              <div className="flex gap-1">
                {page > 1 && (
                  <button 
                    onClick={() => setPage(page - 1)}
                    type="button"
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                  >
                    Prev
                  </button>
                )}

                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pageNum) => {
                  const range = 2;
                  if (pageNum === 1 || pageNum === meta.last_page || (pageNum >= page - range && pageNum <= page + range)) {
                    if (pageNum === page) {
                      return (
                        <span key={pageNum} className="px-3 py-1 bg-primary text-white rounded text-sm font-medium border border-primary">
                          {pageNum}
                        </span>
                      );
                    }
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        type="button"
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - range - 1 || pageNum === page + range + 1) {
                    return <span key={pageNum} className="px-2 py-1 text-gray-400">...</span>;
                  }
                  return null;
                })}

                {page < meta.last_page && (
                  <button 
                    onClick={() => setPage(page + 1)}
                    type="button"
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      <DeleteModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleExecuteDelete}
      />

      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmModalOpen}
        title="Konfirmasi Pendaftaran"
        message="Apakah Anda yakin ingin memverifikasi siswa ini sebagai DITERIMA? Kwitansi akan diterbitkan otomatis."
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleExecuteConfirm}
      />

      {/* Edit Modal */}
      <EditModal 
        isOpen={editModalOpen}
        pendaftarId={selectedEditId}
        jurusans={jurusans}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          toast.success('Data siswa berhasil diperbarui.');
          fetchData();
        }}
      />
    </>
  );
};

export default DataPendaftar;
