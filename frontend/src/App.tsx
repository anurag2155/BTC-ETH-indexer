import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlockPage from './pages/BlockPage';
import TransactionPage from './pages/TransactionPage';
import AddressPage from './pages/AddressPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home chain="eth" />} />
            <Route path="/eth" element={<Home chain="eth" />} />
            <Route path="/eth/block/:number" element={<BlockPage chain="eth" />} />
            <Route path="/eth/tx/:hash" element={<TransactionPage chain="eth" />} />
            <Route path="/eth/address/:address" element={<AddressPage chain="eth" />} />
            
            <Route path="/btc" element={<Home chain="btc" />} />
            <Route path="/btc/block/:number" element={<BlockPage chain="btc" />} />
            <Route path="/btc/tx/:hash" element={<TransactionPage chain="btc" />} />
            <Route path="/btc/address/:address" element={<AddressPage chain="btc" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
