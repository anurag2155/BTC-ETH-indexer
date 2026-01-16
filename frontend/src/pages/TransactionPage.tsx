import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type Transaction } from '../api';
import { ArrowLeft, FileText, CheckCircle2, Copy, MoveRight, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TransactionPage = ({ chain }: { chain: 'eth' | 'btc' }) => {
    const { hash } = useParams();
    const [tx, setTx] = useState<Transaction | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        api.get<Transaction>(`/${chain}/transactions/${hash}`)
            .then(res => setTx(res.data))
            .catch(err => console.error(err));
    }, [hash, chain]);

    const copyToClipboard = () => {
        if(tx?.hash) {
            navigator.clipboard.writeText(tx.hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (!tx) return (
         <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${chain === 'btc' ? 'border-orange-500' : 'border-indigo-500'}`}></div>
                <p className="text-slate-400 font-medium">Loading Transaction...</p>
            </div>
        </div>
    );

     const theme = chain === 'btc' ? {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        subtle: 'bg-orange-100/50',
        icon: 'text-orange-500'
    } : {
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        subtle: 'bg-indigo-100/50',
        icon: 'text-indigo-500'
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Link to={`/${chain}/block/${tx.blockNumber}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Block #{tx.blockNumber}
            </Link>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.subtle} shadow-inner`}>
                            <FileText className={`w-7 h-7 ${theme.icon}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">Transaction Details</h1>
                            <div className="flex items-center gap-3">
                                <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> SUCCEEDED
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono text-sm text-slate-500 break-all">{tx.hash}</span>
                                <button onClick={copyToClipboard} className="hover:text-slate-800 transition-colors">
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Value Card */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Value Transfer</h3>
                            <div className="text-3xl font-mono font-bold text-slate-900">
                                {(Number(tx.value) / (chain === 'btc' ? 1e8 : 1e18)).toFixed(8)} 
                                <span className={`text-lg ml-2 ${theme.text}`}>{chain.toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Block Number</h3>
                             <div className="flex items-center justify-between">
                                <Link to={`/${chain}/block/${tx.blockNumber}`} className={`text-2xl font-bold ${theme.text} hover:underline decoration-2 underline-offset-4`}>
                                    #{tx.blockNumber}
                                </Link>
                                <div className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                     {formatDistanceToNow(tx.createdAt ? new Date(tx.createdAt) : new Date(), { addSuffix: true }).replace('about ', '').replace('almost ', '')}
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="relative p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="grid md:grid-cols-3 gap-8 items-center">
                            {/* From */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">From Address</h3>
                                <Link to={`/${chain}/address/${tx.from}`} className="block p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                                    <div className="font-mono text-sm text-slate-600 break-all group-hover:text-slate-900 transition-colors">
                                        {tx.from}
                                    </div>
                                </Link>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                                <div className={`w-12 h-12 rounded-full ${theme.subtle} flex items-center justify-center`}>
                                    <MoveRight className={`w-6 h-6 ${theme.icon}`} />
                                </div>
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">To Address</h3>
                                <Link to={`/${chain}/address/${tx.to}`} className="block p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                                    <div className="font-mono text-sm text-slate-600 break-all group-hover:text-slate-900 transition-colors">
                                        {tx.to || 'Contract Creation'}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;
