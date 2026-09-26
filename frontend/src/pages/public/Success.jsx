import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Success = () => {
  const location = useLocation();
  const noPendaftaran = location.state?.no_pendaftaran;

  return (
    <div className="container mx-auto px-4 my-10 mb-20 max-w-custom">
      <section id="success-message" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-kg-green p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <i className="fas fa-check-circle text-9xl text-white absolute -top-4 -left-4 transform -rotate-12"></i>
            <i className="fas fa-check-circle text-9xl text-white absolute -bottom-4 -right-4 transform rotate-12"></i>
          </div>
          
          <h3 className="text-white text-2xl font-bold relative z-10">
            <i className="fas fa-check-circle me-2 mr-2"></i> Pendaftaran Berhasil!
          </h3>
        </div>

        <div className="p-6 md:p-10">
          <div className="text-center">
            {noPendaftaran ? (
              <>
                <p className="font-bold text-gray-600 mb-2">No. Pendaftaran Anda:</p>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 py-4 px-6 rounded-xl inline-block shadow-sm">
                  <h3 className="text-3xl md:text-4xl font-extrabold tracking-wide mb-0">
                    {noPendaftaran}
                  </h3>
                </div>
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 py-3 px-4 rounded-lg inline-block">
                <span className="font-medium">Sesi pendaftaran telah berakhir atau halaman di-refresh.</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-8"></div>

          <div className="text-center max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold text-kg-dark mb-3">Terima Kasih Telah Mendaftar!</h4>
            <p className="text-gray-500 text-lg leading-relaxed">
              Data Anda telah kami terima. Langkah selanjutnya, <span className="font-semibold text-kg-green">silakan datang langsung ke ruang pendaftaran siswa baru</span> untuk melakukan pembayaran biaya formulir pendaftaran.
            </p>
          </div>
          
          <div className="border-t border-gray-100 my-8"></div>

          <div className="text-center">
            <h5 className="font-bold text-lg text-gray-700 mb-3">
              <i className="fas fa-wallet me-2 mr-2 text-kg-green"></i> Biaya Formulir Pendaftaran
            </h5>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg inline-block shadow-sm min-w-[200px]">
              <h3 className="text-3xl font-bold text-gray-800 mb-0">Rp 200.000,-</h3>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              to="/cek-status" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-kg-green hover:bg-green-800 transition-colors"
            >
              <i className="fas fa-search mr-2"></i> Cek Status Pendaftaran
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Success;
