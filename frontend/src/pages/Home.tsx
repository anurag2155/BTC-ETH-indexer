import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Block } from '../api';
import { Layers, Cuboid, Activity, Clock, Zap, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Home = ({ chain }: { chain: 'eth' | 'btc' }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    
    // Theme configs
    const theme = chain === 'btc' ? {
        gradient: 'from-orange-500 to-amber-600',
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        icon: 'text-orange-500',
        subtle: 'bg-orange-100/50'
    } : {
        gradient: 'from-indigo-600 to-violet-600',
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        icon: 'text-indigo-500',
        subtle: 'bg-indigo-100/50'
    };

    const fetchBlocks = async () => {
        try {
            const res = await api.get<Block[]>(`/${chain}/blocks`);
            setBlocks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setBlocks([]);
        fetchBlocks();
        const interval = setInterval(fetchBlocks, 5000); 
        return () => clearInterval(interval);
    }, [chain]);

    return (
        <div className="space-y-8 pb-20">
            {/* Hero Stats Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.gradient} p-8 text-white shadow-2xl`}
            >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                         <div className="flex items-center space-x-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span>LIVE MAINNET</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                            {chain === 'btc' ? 'Bitcoin' : 'Ethereum'} Explorer
                        </h1>
                        <p className="text-white/80 text-lg max-w-xl">
                            Real-time block exploration and transaction tracking for the decentralized world.
                        </p>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="flex gap-4">
                        <div className="glass bg-white/10 border-white/20 p-4 rounded-xl min-w-[140px] backdrop-blur-md">
                            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Last Block</div>
                            <div className="text-2xl font-mono font-bold">
                                {blocks[0]?.number ? `#${blocks[0].number}` : '...'}
                            </div>
                        </div>
                        <div className="glass bg-white/10 border-white/20 p-4 rounded-xl min-w-[140px] backdrop-blur-md">
                            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Avg TPS</div>
                            <div className="text-2xl font-mono font-bold flex items-center">
                                <Zap className="w-4 h-4 mr-1 text-yellow-300 fill-yellow-300" />
                                {blocks[0] ? Math.round(blocks.slice(0,5).reduce((acc, b) => acc + (b.transactions?.length || 0), 0) / 5) : 0}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Latest Blocks Feed */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Layers className={`w-6 h-6 mr-2 ${theme.icon}`} /> Latest Blocks
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {blocks.map((block, index) => (
                                <motion.div
                                    key={`${chain}-${block.number}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                                    
                                    <Link to={`/${chain}/block/${block.number}`} className="block relative glass hover:-translate-y-1 transition-all duration-300 rounded-2xl p-5 border-white/60">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.subtle} ${theme.text} group-hover:scale-110 transition-transform`}>
                                                    <Cuboid className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-lg font-bold ${theme.text}`}>#{block.number}</span>
                                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {block.hash.substring(0, 8)}...
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                        {formatDistanceToNow(new Date(parseInt(block.timestamp) * 1000), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="flex items-center justify-end font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Activity className={`w-4 h-4 mr-2 ${theme.icon}`} />
                                                    {block.transactions?.length || 0} txns
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Stats (Mocked for layout completeness) */}
                <div className="space-y-6">
                     <div className="glass rounded-2xl p-6 sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <Database className="w-5 h-5 mr-2 text-slate-400" /> Network Stats
                        </h3>
                        
                        <div className="space-y-4">
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Gas Price</span>
                                <span className="font-mono text-sm font-medium">12 Gwei</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Diffculty</span>
                                <span className="font-mono text-sm font-medium">12.5 T</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Hash Rate</span>
                                <span className="font-mono text-sm font-medium">950 TH/s</span>
                             </div>
                        </div>
                        
                        <div className={`mt-6 p-4 rounded-xl ${theme.subtle} border ${theme.border}`}>
                             <p className={`text-xs ${theme.text} font-medium leading-relaxed`}>
                                 Viewing {chain === 'btc' ? 'Bitcoin Testnet' : 'Ethereum Mainnet'} real-time indexer data.
                             </p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
