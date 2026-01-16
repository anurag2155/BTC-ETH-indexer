import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type Block } from '../api';
import { ArrowLeft, Clock, Hash, Database, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BlockPage = ({ chain }: { chain: 'eth' | 'btc' }) => {
    const { number } = useParams();
    const [block, setBlock] = useState<Block | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        api.get<Block>(`/${chain}/blocks/${number}`)
            .then(res => setBlock(res.data))
            .catch(err => console.error(err));
    }, [number, chain]);

    const copyToClipboard = () => {
        if(block?.hash) {
            navigator.clipboard.writeText(block.hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    if (!block) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${chain === 'btc' ? 'border-orange-500' : 'border-indigo-500'}`}></div>
                <p className="text-slate-400 font-medium">Indexing Block #{number}...</p>
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
        <div className="max-w-6xl mx-auto pb-20">
            <Link to={`/${chain}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Dashboard
            </Link>

            <div className={`rounded-3xl bg-white shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100`}>
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.subtle} shadow-inner`}>
                                <Database className={`w-7 h-7 ${theme.icon}`} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-1">Block #{block.number}</h1>
                                <div className="flex items-center text-sm text-slate-500 gap-2">
                                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-600">CONFIRMED</span>
                                    <span>•</span>
                                    <span className="font-mono text-xs opacity-70 break-all">{block.hash}</span>
                                    <button onClick={copyToClipboard} className="hover:text-slate-800 transition-colors">
                                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                         <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">Mined</div>
                            <div className="font-medium text-slate-800 flex items-center justify-end gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {formatDistanceToNow(new Date(parseInt(block.timestamp) * 1000), { addSuffix: true }).replace('about ', '').replace('almost ', '')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                         <h2 className="text-lg font-bold text-slate-800">Transactions</h2>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.subtle} ${theme.text}`}>
                             {block.transactions?.length || 0} Total
                         </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Tx Hash</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">From</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">To</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {block.transactions?.map((tx) => (
                                    <tr key={tx.hash} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link to={`/${chain}/tx/${tx.hash}`} className={`font-mono ${theme.text} hover:underline flex items-center gap-2`}>
                                                <div className={`p-1.5 rounded bg-white border border-slate-200 group-hover:border-${chain === 'btc' ? 'orange' : 'indigo'}-200 transition-colors`}>
                                                    <Hash className="w-3 h-3 text-slate-400" />
                                                </div>
                                                {tx.hash.substring(0, 18)}...
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/${chain}/address/${tx.from}`} className="font-mono hover:text-slate-900 transition-colors flex items-center gap-2 text-slate-600">
                                                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                 {tx.from.substring(0, 12)}...
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.to ? (
                                                <Link to={`/${chain}/address/${tx.to}`} className="font-mono hover:text-slate-900 transition-colors flex items-center gap-2 text-slate-600">
                                                    <span className="text-slate-300">→</span>
                                                    {tx.to.substring(0, 12)}...
                                                </Link>
                                            ) : (
                                                 <span className="text-slate-400 italic pl-6">Contract Creation</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                                            {(Number(tx.value) / (chain === 'btc' ? 1e8 : 1e18)).toFixed(8)} {chain.toUpperCase()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!block.transactions || block.transactions.length === 0) && (
                            <div className="p-12 text-center text-slate-500">
                                No transactions found in this block.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockPage;
