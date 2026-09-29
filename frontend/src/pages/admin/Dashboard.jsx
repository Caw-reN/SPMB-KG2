import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle, FileText, Monitor, Settings as SettingsIcon, 
  Briefcase, Calculator 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <header className="bg-white/80 backdrop-blur-md shadow-sm px-8 py-5 flex justify-between items-center z-10 sticky top-0 border-b border-gray-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-64"></div>
          </div>
        </header>
        <main className="flex-1 p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-pulse">
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-gray-200 rounded-3xl h-48"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>)}
              </div>
              <div className="bg-gray-200 rounded-3xl h-64"></div>
            </div>
            <div className="space-y-8">
              <div className="bg-gray-200 rounded-3xl h-80"></div>
              <div className="bg-gray-200 rounded-3xl h-64"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const overview = data?.overview || {
    total: 0,
    menunggu: 0,
    diterima: 0,
    pembelian_formulir: 0,
    total_formulir_kembali: 0,
    gelombang_1: 0,
    gelombang_2: 0,
    gelombang_3: 0,
    target_siswa: 468,
    persen_target: 0,
  };

  const jurusanCounts = data?.jurusan_counts || {
    TKJ: 0,
    TKR: 0,
    MP: 0,
    AK: 0,
  };

  const chartLabels = data?.chart?.labels || [];
  const chartTotals = data?.chart?.totals || [];

  const chartColors = chartLabels.map((label) => {
    const u = label.toUpperCase();
    if (u.includes('TKJ') || u.includes('KOMPUTER')) return '#3b82f6'; // blue-500
    if (u.includes('TKR') || u.includes('KENDARAAN') || u.includes('OTOMOTIF')) return '#eab308'; // yellow-500
    if (u.includes('AK') || u.includes('AKUNTANSI')) return '#ec4899'; // pink-500
    if (u.includes('MP') || u.includes('PERKANTORAN') || u.includes('MANAJEMEN')) return '#10b981'; // emerald-500
    return '#9ca3af';
  });

  const chartDataConfig = {
    labels: chartLabels,
    datasets: [
      {
        data: chartTotals,
        backgroundColor: chartColors,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const latestPendaftar = data?.latest_pendaftar || [];

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md shadow-sm px-8 py-5 flex justify-between items-center z-10 sticky top-0 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Selamat datang kembali, Administrator!</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - MAIN STATS & TABLE */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Target Banner */}
            <div className="relative bg-gradient-to-br from-primary to-green-700 p-8 rounded-3xl text-white shadow-xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Users className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <p className="text-green-100 font-semibold uppercase tracking-wider text-xs mb-2">Pencapaian Target Siswa Baru</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <h3 className="text-5xl font-black tracking-tight">{overview.pembelian_formulir}</h3>
                  <span className="text-xl text-green-200 font-medium">/ {overview.target_siswa} Siswa</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/20 rounded-full h-4 overflow-hidden backdrop-blur-sm p-0.5">
                    <div 
                      className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1500 ease-out" 
                      style={{ width: `${Math.min(overview.persen_target, 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-lg">{overview.persen_target}%</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Ringkasan Pendaftaran</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800">{overview.total}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Menunggu</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800">{overview.menunggu}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Diterima</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800">{overview.diterima}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Kembali</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800">{overview.total_formulir_kembali}</h3>
                </div>
              </div>
            </div>

            {/* Gelombang Returns (Only shown if there are any) */}
            {(overview.gelombang_1 > 0 || overview.gelombang_2 > 0 || overview.gelombang_3 > 0) && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Pengembalian Per Gelombang</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {overview.gelombang_1 > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Gelombang 1</p>
                      <h3 className="text-3xl font-black text-blue-900">{overview.gelombang_1} <span className="text-sm font-medium text-blue-700/60">Formulir</span></h3>
                    </div>
                  )}
                  {overview.gelombang_2 > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Gelombang 2</p>
                      <h3 className="text-3xl font-black text-blue-900">{overview.gelombang_2} <span className="text-sm font-medium text-blue-700/60">Formulir</span></h3>
                    </div>
                  )}
                  {overview.gelombang_3 > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Gelombang 3</p>
                      <h3 className="text-3xl font-black text-blue-900">{overview.gelombang_3} <span className="text-sm font-medium text-blue-700/60">Formulir</span></h3>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Registrants Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-gray-800">Pendaftar Terbaru</h3>
                <Link to="/mlebu/data-pendaftar" className="text-sm font-semibold text-primary hover:text-green-700 transition-colors bg-green-50 px-4 py-2 rounded-full">
                  Lihat Semua
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="p-5 font-semibold">Nama Siswa</th>
                      <th className="p-5 font-semibold">Jurusan</th>
                      <th className="p-5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {latestPendaftar.length > 0 ? latestPendaftar.map((r) => (
                      <tr key={r.id_pendaftar} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="p-5 font-semibold text-gray-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                            {r.nama_siswa.substring(0, 2).toUpperCase()}
                          </div>
                          {r.nama_siswa}
                        </td>
                        <td className="p-5 text-gray-500 font-medium">{r.nama_jurusan}</td>
                        <td className="p-5 text-right">
                          {r.status_pendaftaran === 'Diterima' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Diterima
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Menunggu
                            </span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-400 font-medium">Belum ada pendaftar terbaru</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - CHARTS & JURUSAN */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Chart Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Distribusi Jurusan</h3>
              <div className="h-80 min-h-[320px] flex-1 flex justify-center items-center relative">
                {chartTotals.length > 0 ? (
                  <Doughnut data={chartDataConfig} options={chartOptions} />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 mb-3 mx-auto flex items-center justify-center">
                      <Monitor className="text-gray-300 w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">Belum ada data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Jurusan Breakdown */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Minat Program Keahlian</h3>
              <div className="space-y-4">
                
                {/* TKJ */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md group-hover:scale-110 transition-transform"><Monitor className="w-4 h-4" /></div>
                      <span className="font-semibold text-gray-700 text-sm">Teknik Komputer & Jaringan</span>
                    </div>
                    <span className="font-black text-gray-900">{jurusanCounts.TKJ}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${overview.total > 0 ? (jurusanCounts.TKJ / overview.total) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* TKR */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-md group-hover:scale-110 transition-transform"><SettingsIcon className="w-4 h-4" /></div>
                      <span className="font-semibold text-gray-700 text-sm">Teknik Kendaraan Ringan</span>
                    </div>
                    <span className="font-black text-gray-900">{jurusanCounts.TKR}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${overview.total > 0 ? (jurusanCounts.TKR / overview.total) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* MP */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md group-hover:scale-110 transition-transform"><Briefcase className="w-4 h-4" /></div>
                      <span className="font-semibold text-gray-700 text-sm">Manajemen Perkantoran</span>
                    </div>
                    <span className="font-black text-gray-900">{jurusanCounts.MP}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overview.total > 0 ? (jurusanCounts.MP / overview.total) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* AK */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-pink-100 text-pink-600 rounded-md group-hover:scale-110 transition-transform"><Calculator className="w-4 h-4" /></div>
                      <span className="font-semibold text-gray-700 text-sm">Akuntansi</span>
                    </div>
                    <span className="font-black text-gray-900">{jurusanCounts.AK}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-pink-500 h-full rounded-full" style={{ width: `${overview.total > 0 ? (jurusanCounts.AK / overview.total) * 100 : 0}%` }}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
