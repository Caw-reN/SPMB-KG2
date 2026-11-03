import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const PrintKwitansi = () => {
  const { id } = useParams();
  const [siswa, setSiswa] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/pendaftar/${id}/kwitansi`);
        if (res.data.success && res.data.data) {
          setSiswa(res.data.data);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Gagal memuat data kwitansi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (siswa) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [siswa]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border border-red-200 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Dapat Mencetak Kwitansi</h3>
          <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
          <button 
            type="button"
            onClick={() => window.close()} 
            className="px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  if (!siswa) {
    return <div className="p-8 text-center text-red-600">Data pendaftar tidak ditemukan.</div>;
  }

  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <style>{`
        @page {
          size: 215mm 330mm; 
          margin: 0;
        }
        @media print {
          body > header,
          body > footer,
          .no-print {
            display: none !important;
          }
        }
        .f4-page-wrapper {
          width: 215mm;
          height: 330mm;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
          page-break-after: always;
          font-family: 'Lexend', sans-serif;
          background-color: #ffffff;
        }
        .print-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          object-fit: cover;
        }
        .data-container {
          position: absolute;
          top: 7mm;
          left: 0;
          width: 100%;
          height: calc(100% - 7mm);
          z-index: 10;
        }
        .data-overlay {
          position: absolute;
          padding: 2px 5px;
          font-size: 11pt;
          color: #000;
          font-weight: 600;
        }
        #data-no-daftar,
        #data-no-kwitansi,
        #data-gelombang {
          font-size: 12pt;
          font-weight: 800;
          line-height: 1.2;
        }
        #data-no-daftar { top: 19.8%; left: 13.5%; width: 20%; }
        #data-no-kwitansi { top: 19.8%; left: 41.2%; width: 20%; }
        #data-gelombang { top: 19.8%; left: 69.7%; width: 20%; }

        #data-nama-siswa { top: 27.6%; left: 41.5%; }
        #data-nik { top: 29.4%; left: 41.5%; }
        #data-nisn { top: 31.25%; left: 41.5%; }
        #data-asal-sekolah { top: 32.9%; left: 41.5%; }

        #data-nama-ayah { top: 39.5%; left: 41.5%; }
        #data-nama-ibu { top: 41.2%; left: 41.5%; }
        #data-no-hp { top: 43.0%; left: 41.5%; }

        #data-jurusan-1 { top: 50.3%; left: 41.5%; }
        #data-jurusan-2 { top: 52.0%; left: 41.5%; }

        #data-tanggal { top: 56.8%; left: 36.7%; font-weight: bold; }
      `}</style>

      <div className="f4-page-wrapper">
        <img src="/assets/img/background.png?v=2728" alt="Bukti Pendaftaran" className="print-image" />

        <div className="data-container">
          <div id="data-no-daftar" className="data-overlay">{siswa.no_pendaftaran}</div>
          <div id="data-no-kwitansi" className="data-overlay">{siswa.no_kwitansi}</div>
          <div id="data-gelombang" className="data-overlay">Gelombang {siswa.gelombang || '1'}</div>

          <div id="data-nama-siswa" className="data-overlay">{siswa.nama_siswa}</div>
          <div id="data-nik" className="data-overlay">{siswa.nik}</div>
          <div id="data-nisn" className="data-overlay">{siswa.nisn}</div>
          <div id="data-asal-sekolah" className="data-overlay">{siswa.nama_sekolah}</div>

          <div id="data-nama-ayah" className="data-overlay">{siswa.nama_ayah}</div>
          <div id="data-nama-ibu" className="data-overlay">{siswa.nama_ibu}</div>
          <div id="data-no-hp" className="data-overlay">{siswa.no_orangtua_wali}</div>

          <div id="data-jurusan-1" className="data-overlay">{siswa.nama_jurusan_1 || (siswa.jurusan_satu ? siswa.jurusan_satu.nama_jurusan : (siswa.jurusanSatu ? siswa.jurusanSatu.nama_jurusan : '-'))}</div>
          <div id="data-jurusan-2" className="data-overlay">{siswa.nama_jurusan_2 || (siswa.jurusan_dua ? siswa.jurusan_dua.nama_jurusan : (siswa.jurusanDua ? siswa.jurusanDua.nama_jurusan : '-'))}</div>

          <div id="data-tanggal" className="data-overlay">Bekasi, {tanggalCetak}</div>
        </div>
      </div>
    </>
  );
};

export default PrintKwitansi;
