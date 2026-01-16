const Footer = () => (
  <footer className="mt-24 pt-16 pb-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 items-center mb-12">
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Finance Dashboard</h3>
            <p className="text-slate-400 text-sm font-medium">Track smarter, spend wiser</p>
          </div>
        </div>

        
        <div>
          <h4 className="text-slate-300 font-bold text-lg mb-4">Quick Links</h4>
          <div className="space-y-2">
            <a href="#" className="block text-slate-400 hover:text-white font-medium hover:underline transition-colors">Features</a>
            <a href="#" className="block text-slate-400 hover:text-white font-medium hover:underline transition-colors">Pricing</a>
            <a href="#" className="block text-slate-400 hover:text-white font-medium hover:underline transition-colors">About</a>
          </div>
        </div>

       
        <div className="text-center md:text-left">
          <h4 className="text-slate-300 font-bold text-lg mb-4">Live Stats</h4>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400 font-bold">0 Transactions</p>
            <p className="text-slate-400">$0.00 Total</p>
          </div>
        </div>

        
        <div className="text-center md:text-right">
          <h4 className="text-slate-300 font-bold text-lg mb-4">Ready to Start?</h4>
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl">
            Get Started Free
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-px bg-gradient-to-r from-slate-700 to-transparent mx-auto mb-8" />
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <p>&copy; 2026 Finance Dashboard. Built with ❤️ for smart spending.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-emerald-400 transition-colors font-medium">Privacy</a>
          <a href="#" className="hover:text-emerald-400 transition-colors font-medium">Terms</a>
          <a href="#" className="hover:text-emerald-400 transition-colors font-medium">Support</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
