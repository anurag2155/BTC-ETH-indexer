import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type Transaction } from '../api';
import { Wallet, Activity, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AddressPage = ({ chain }: { chain: 'eth' | 'btc' }) => {
    const { address } = useParams();
    const [balance, setBalance] = useState<string>('0');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
     const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fetch balance
        api.get<{ balance: string }>(`/${chain}/balance/${address}`)
            .then(res => setBalance(res.data.balance))
            .catch(err => console.error(err));
            
        // Fetch transactions
        api.get<Transaction[]>(`/${chain}/address/${address}/transactions`)
            .then(res => setTransactions(res.data))
            .catch(err => console.error(err));
    }, [address, chain]);

     const copyToClipboard = () => {
        if(address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    const theme = chain === 'btc' ? {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        subtle: 'bg-orange-100/50',
        icon: 'text-orange-500',
        border: 'border-orange-100'
    } : {
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        subtle: 'bg-indigo-100/50',
        icon: 'text-indigo-500',
        border: 'border-indigo-100'
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                 <div className={`absolute top-0 right-0 w-64 h-64 ${theme.subtle} rounded-full blur-3xl -mr-16 -mt-16 opacity-50`}></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl ${theme.subtle} flex items-center justify-center shadow-inner`}>
                            <Wallet className={`w-10 h-10 ${theme.icon}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl font-bold text-slate-800 break-all font-mono tracking-tight">
                                    {address?.substring(0, 8)}...{address?.substring(address.length - 8)}
                                </h1>
                                <button onClick={copyToClipboard} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                                </button>
                            </div>
                             <p className="text-slate-500 font-mono text-sm break-all max-w-xl opacity-80">{address}</p>
                        </div>
                    </div>

                    <div className="text-right bg-slate-900 text-white p-6 rounded-2xl min-w-[240px] shadow-lg">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Balance</div>
                        <div className="text-3xl font-mono font-bold">
                            {(Number(balance) / (chain === 'btc' ? 1e8 : 1e18)).toFixed(8)} <span className="text-lg text-slate-500">{chain.toUpperCase()}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 font-medium">
                            ≈ $0.00 USD
                        </div>
                    </div>
                 </div>
            </div>

            {/* Transactions List */}
             <div className="space-y-4">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                    <Activity className={`w-5 h-5 ${theme.icon}`} /> Transaction History
                 </h2>
                 
                 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {transactions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {transactions.map((tx) => {
                                const isIncoming = tx.to?.toLowerCase() === address?.toLowerCase();
                                return (
                                    <div key={tx.hash} className="p-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <Link to={`/${chain}/tx/${tx.hash}`} className="text-slate-900 font-mono font-medium hover:underline decoration-2 underline-offset-2">
                                                    {tx.hash.substring(0, 16)}...
                                                </Link>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {formatDistanceToNow(tx.createdAt ? new Date(tx.createdAt) : new Date(), { addSuffix: true }).replace('about ', '').replace('almost ', '')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`font-mono font-bold ${isIncoming ? 'text-green-600' : 'text-slate-900'}`}>
                                                {isIncoming ? '+' : '-'}{(Number(tx.value) / (chain === 'btc' ? 1e8 : 1e18)).toFixed(8)} {chain.toUpperCase()}
                                            </div>
                                             <div className="text-xs text-slate-400 font-mono">
                                                Block #{tx.blockNumber}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium mb-1">No Transactions Found</h3>
                            <p className="text-slate-500 text-sm">This address hasn't made any transactions yet.</p>
                        </div>
                    )}
                 </div>
             </div>
        </div>
    );
};

export default AddressPage;
