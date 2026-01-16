import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Box, Zap, Bitcoin } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [isFocused, setIsFocused] = useState(false);
  
  const currentChain = location.pathname.startsWith('/btc') ? 'btc' : 'eth';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();
    if (!query) return;

    const prefix = `/${currentChain}`;

    if (query.startsWith('0x')) {
      if (query.length === 42) {
        navigate(`${prefix}/address/${query}`);
      } else if (query.length === 66) {
        try {
          const response = await fetch(`http://localhost:3000/${currentChain}/blocks/${query}`);
          if (response.ok) {
            navigate(`${prefix}/block/${query}`);
            return;
          }
        } catch (e) {}
        navigate(`${prefix}/tx/${query}`);
      } else {
        navigate(`${prefix}/address/${query}`);
      }
    } else if (!isNaN(Number(query))) {
      navigate(`${prefix}/block/${query}`);
    } else {
      if (currentChain === 'btc' && query.length === 64) {
         try {
            const response = await fetch(`http://localhost:3000/${currentChain}/blocks/${query}`);
            if (response.ok) {
              navigate(`${prefix}/block/${query}`);
              return;
            }
          } catch (e) {}
          navigate(`${prefix}/tx/${query}`);
      } else {
          navigate(`${prefix}/address/${query}`);
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 px-4 py-4"
    >
      <div className="container mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between border-white/50 shadow-xl shadow-slate-200/50">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            <Link to={`/${currentChain}`} className="flex items-center space-x-2 group">
              <div className={`p-2 rounded-xl text-white transition-colors duration-300 ${currentChain === 'btc' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                <Box className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-slate-900">
                Indexer<span className="text-slate-400">Pro</span>
              </span>
            </Link>

            {/* Chain Switcher - Pill Style */}
            <div className="hidden md:flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
              <Link 
                to="/eth" 
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 ${currentChain === 'eth' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ethereum</span>
              </Link>
              <Link 
                to="/btc" 
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 ${currentChain === 'btc' ? 'bg-white shadow-sm text-orange-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Bitcoin className="w-3.5 h-3.5" />
                <span>Bitcoin</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
              <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r opacity-30 blur transition duration-500 ${currentChain === 'btc' ? 'from-orange-400 to-red-600' : 'from-indigo-400 to-purple-600'} ${isFocused ? 'opacity-70' : 'opacity-30'}`}></div>
              <div className="relative flex items-center bg-white rounded-xl">
                <Search className={`w-5 h-5 ml-4 transition-colors ${isFocused ? (currentChain === 'btc' ? 'text-orange-500' : 'text-indigo-500') : 'text-slate-400'}`} />
                <input
                  type="text"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={`Search ${currentChain.toUpperCase()} (Block, Tx, Address)`}
                  className="w-full pl-3 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400 font-mono"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
                <div className="pr-2">
                   <kbd className="hidden lg:inline-flex items-center rounded border border-slate-200 px-2 py-0.5 text-xs font-sans font-medium text-slate-400 bg-slate-50">
                    Enter
                  </kbd>
                </div>
              </div>
            </div>
          </form>

          {/* Mobile Menu Button placeholder (can extend later) */}
          <div className="md:hidden">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-600" />
             </div>
          </div>

        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
