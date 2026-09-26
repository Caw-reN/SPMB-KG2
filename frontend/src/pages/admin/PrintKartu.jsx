import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const PrintKartu = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/pendaftar/${id}/kartu-ujian`);
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Gagal memuat data kartu ujian.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-8 max-w-md mx-auto space-y-4 animate-pulse">
        <div className="h-96 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Dapat Mencetak Kartu</h3>
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

  if (!data) {
    return <div className="p-8 text-center text-red-600">Data kartu ujian tidak ditemukan.</div>;
  }

  const noKwitansi = data.no_kwitansi ? data.no_kwitansi.slice(-10) : '-';

  return (
    <>
      <style>{`
        @page {
          size: 11.5cm 18cm;
          margin: 0;
        }
        @media print {
          .no-print { display: none !important; }
        }
        .card-container {
          width: 11.5cm;
          height: 18cm;
          position: fixed; 
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          border: 1px solid #000;
          overflow: hidden;
          font-family: 'Lexend', sans-serif;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
        }
        .bg-card {
          width: 100%;
          height: 100%;
          object-fit: fill;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }
        .data-field {
          position: absolute;
          z-index: 10;
          font-weight: 700;
          color: #000;
          font-size: 9pt;
        }
        .no-formulir { top: 30.8%; left: 17.5%; width: 80px; text-align: center; font-size: 8pt; }
        .gelombang   { top: 30.7%; left: 42.3%; width: 65px; text-align: center; }
        .jurusan     { top: 30.8%; left: 62.8%; width: 90px; text-align: center; font-size: 8pt; }
        .nama         { top: 43.3%; left: 44%; }
        .asal-sekolah { top: 46.7%; left: 44%; }
        .username     { top: 55%; left: 44%; letter-spacing: 1px; }
        .password     { top: 58.2%; left: 44%; letter-spacing: 1px; }
        .tanggal-tes { 
          top: 71.3%; 
          left: 43.5%; 
          width: 175px; 
          text-align: center; 
          font-size: 8pt;
        }
      `}</style>

      <div className="card-container">
        <img src="/assets/img/kartu_ujian.png" alt="Kartu Ujian" className="bg-card" />

        <div className="data-field no-formulir">{noKwitansi}</div>
        <div className="data-field gelombang">{data.gelombang || '1'}</div>
        <div className="data-field jurusan">{data.kode_jurusan}</div>

        <div className="data-field nama">{data.nama_siswa}</div>
        <div className="data-field asal-sekolah">{data.nama_sekolah}</div>

        <div className="data-field username">{noKwitansi}</div>
        <div className="data-field password">{data.password_cbt || '-'}</div>

        <div className="data-field tanggal-tes">07 Februari 2026</div>
      </div>
    </>
  );
};

export default PrintKartu;
