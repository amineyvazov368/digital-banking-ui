import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  RefreshCw,
  Calendar,
  Check,
  X,
  User,
  Zap,
  Eye,
  Activity,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import transactionService from '../../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Ümumi Baza Statistikası üçün State
  const [globalStats, setGlobalStats] = useState({
    totalCount: 0,
    totalAmount: 0,
    flaggedCount: 0,
    failedCount: 0
  });

  // Pagination State-ləri
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const getTxId = (tx) => tx?.id || tx?.transactionId;

  // 1. Ümumi Statistikanı Yükləyən Funksiya (Bütün Baza Üzrə)
  const loadGlobalStats = async () => {
    try {
      // Böyük pageSize verməklə və ya unpaged endpoint çağıraraq ümumi statistikaları hesablayırıq
      // Əgər backend-də xüsusi getSummary() varsa, onu çağırmaq daha yaxşıdır.
      const allData = await transactionService.getAllAdminTransactions(0, 10000); 
      const allTx = allData?.content || (Array.isArray(allData) ? allData : []);

      const totalCount = allData?.totalElements || allTx.length;
      const totalAmount = allTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const flaggedCount = allTx.filter(tx => tx.status === 'FLAGGED').length;
      const failedCount = allTx.filter(tx => tx.status === 'FAILED').length;

      setGlobalStats({
        totalCount,
        totalAmount,
        flaggedCount,
        failedCount
      });
    } catch (err) {
      console.error("Statistika yüklənərkən xəta:", err);
    }
  };

  // 2. Səhifələnmiş Tranzaksiyaları Yükləyən Funksiya (Cədvəl üçün)
  const loadTransactions = async () => {
    setLoading(true);
    try {
      let data = {};
      if (statusFilter === 'ALL') {
        data = await transactionService.getAllAdminTransactions(page, pageSize);
      } else {
        data = await transactionService.getAdminTransactionsByStatus(statusFilter, page, pageSize);
      }
      
      setTransactions(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error("Tranzaksiyaları çəkərkən xəta:", err);
      setTransactions([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Səhifə yüklənəndə və ya Yenilə düyməsinə basıldıqda işləyir
  const handleRefreshAll = () => {
    loadTransactions();
    loadGlobalStats();
  };

  useEffect(() => {
    loadGlobalStats();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [statusFilter, page]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  // Admin Təsdiq (Approve)
  const handleApprove = async (tx) => {
    const id = getTxId(tx);
    if (!id) return alert("Xəta: Tranzaksiya ID-si tapılmadı!");
    if (!window.confirm(`TXN-${id} nömrəli köçürməni TƏSDİQLƏMƏK istədiyinizdən əminsiniz?`)) return;

    setActionLoading(id);
    try {
      await transactionService.approveTransaction(id);
      setTransactions(prev =>
        prev.map(t => (getTxId(t) === id ? { ...t, status: 'SUCCESS' } : t))
      );
      // Status dəyişdiyi üçün statistikaları yeniləyirik
      loadGlobalStats();
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      alert(`Təsdiqləmə xətası: ${serverMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Ləğv (Reject)
  const handleReject = async (tx) => {
    const id = getTxId(tx);
    if (!id) return alert("Xəta: Tranzaksiya ID-si tapılmadı!");
    if (!window.confirm(`TXN-${id} nömrəli köçürməni LƏĞV ETMƏK istədiyinizdən əminsiniz?`)) return;

    setActionLoading(id);
    try {
      await transactionService.rejectTransaction(id);
      setTransactions(prev =>
        prev.map(t => (getTxId(t) === id ? { ...t, status: 'FAILED' } : t))
      );
      // Status dəyişdiyi üçün statistikaları yeniləyirik
      loadGlobalStats();
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      alert(`Ləğv etmə xətası: ${serverMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getSenderName = (tx) => {
    if (tx.senderName) return tx.senderName;
    if (tx.senderAccountNumber) return `Hesab: **** ${tx.senderAccountNumber.slice(-4)}`;
    return 'Sistem / Mədaxil';
  };

  const getReceiverName = (tx) => {
    if (tx.receiverName) return tx.receiverName;
    if (tx.receiverAccountNumber) return `Hesab: **** ${tx.receiverAccountNumber.slice(-4)}`;
    return 'Xidmət / Nağdlaşdırma';
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ["ID", "Göndərən", "Alan", "Məbləğ", "Status", "Təsvir", "Tarix"];
    const rows = filteredTransactions.map(tx => [
      getTxId(tx) || 'N/A',
      `"${getSenderName(tx)}"`,
      `"${getReceiverName(tx)}"`,
      tx.amount,
      tx.status,
      `"${tx.description || ''}"`,
      tx.createdAt ? new Date(tx.createdAt).toLocaleString('az-AZ') : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filterləmə (Cari Səhifə Üzrə Axtarış)
  const filteredTransactions = transactions.filter(tx => {
    const txId = String(getTxId(tx) || '').toLowerCase();
    const sender = getSenderName(tx).toLowerCase();
    const receiver = getReceiverName(tx).toLowerCase();
    const search = searchTerm.toLowerCase();

    return sender.includes(search) || receiver.includes(search) || txId.includes(search);
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* BAŞLIQ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Tranzaksiyalar və Audit Loqları</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            5,000 AZN və yuxarı (FLAGGED) əməliyyatların admin təsdiqi və canlı monitorinqi.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={handleRefreshAll}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
            title="Yenilə"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium px-3.5 py-2 rounded-xl shadow-sm transition-all text-xs"
          >
            <Download size={14} />
            <span>CSV Çıxar</span>
          </button>
        </div>
      </div>

      {/* STATİSTİKA KARTLARI — İndi yalnız globalStats istifadə edir */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ümumi Tranzaksiya</p>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">{globalStats.totalCount}</h3>
          </div>
          <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Activity size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ümumi Məbləğ</p>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">₼ {globalStats.totalAmount.toFixed(2)}</h3>
          </div>
          <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Şübhəli / Yoxlamada</p>
            <h3 className="text-base sm:text-lg font-bold text-rose-700 mt-0.5">{globalStats.flaggedCount}</h3>
          </div>
          <div className="p-1.5 sm:p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse shrink-0">
            <ShieldAlert size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ləğv Edilən</p>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">{globalStats.failedCount}</h3>
          </div>
          <div className="p-1.5 sm:p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
            <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>

      {/* AXTARIŞ VƏ FİLTERLƏR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Ad, Soyad və ya TXN ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg text-xs px-2.5 py-2 sm:py-1.5 focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">Bütün Statuslar</option>
            <option value="FLAGGED">⚠️ Yoxlamadadır (FLAGGED - 5000+ AZN)</option>
            <option value="SUCCESS">✅ İcra edilib (SUCCESS)</option>
            <option value="PENDING">⏳ Gözləmədə (PENDING)</option>
            <option value="FAILED">❌ Ləğv olunub (FAILED)</option>
          </select>
        </div>
      </div>

      {/* MƏLUMAT SİYAHISI CONTAINER */}
      <div className="bg-white md:rounded-xl md:border md:border-slate-200 shadow-sm overflow-hidden">
        {/* MOBİL TƏRƏF */}
        <div className="block md:hidden space-y-3 p-2 bg-slate-100/70">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              <RefreshCw className="animate-spin inline-block mr-2" size={18} />
              Məlumatlar yüklənir...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              Tranzaksiya tapılmadı.
            </div>
          ) : (
            filteredTransactions.map((tx, index) => {
              const currentId = getTxId(tx);
              const senderName = getSenderName(tx);
              const receiverName = getReceiverName(tx);
              const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('az-AZ') : '-';
              const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : '';
              const isHighAmount = Number(tx.amount) >= 5000;
              const isFlagged = tx.status === 'FLAGGED';

              return (
                <div 
                  key={currentId || index}
                  className={`p-4 rounded-xl border shadow-sm transition-all flex flex-col gap-3 ${
                    isFlagged 
                      ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        #{currentId || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar size={11} /> {dateStr} {timeStr && `• ${timeStr}`}
                      </span>
                    </div>

                    <div>
                      {(tx.status === 'SUCCESS' || tx.status === 'COMPLETED') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={11} /> İcra edilib
                        </span>
                      )}
                      {tx.status === 'FLAGGED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          <ShieldAlert size={11} /> Yoxlamadadır
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={11} /> Gözləmədə
                        </span>
                      )}
                      {tx.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          <XCircle size={11} /> Ləğv olunub
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User size={13} className="text-slate-500 shrink-0" />
                        <span>{senderName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 pl-4 font-medium">
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-800 font-semibold">{receiverName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-2xs">
                      <span className={`font-extrabold text-sm block ${isHighAmount ? 'text-rose-600' : 'text-slate-900'}`}>
                        ₼ {Number(tx.amount || 0).toFixed(2)}
                      </span>
                      {isHighAmount && (
                        <span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider block">
                          5k+ Limit
                        </span>
                      )}
                    </div>
                  </div>

                  {isFlagged ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        disabled={actionLoading === currentId}
                        onClick={() => handleApprove(tx)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                      >
                        <Check size={14} />
                        {actionLoading === currentId ? '...' : 'Təsdiqlə'}
                      </button>

                      <button
                        disabled={actionLoading === currentId}
                        onClick={() => handleReject(tx)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                      >
                        <X size={14} />
                        {actionLoading === currentId ? '...' : 'Ləğv Et'}
                      </button>
                    </div>
                  ) : tx.status === 'SUCCESS' ? (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-semibold bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200">
                        <Zap size={11} className="text-amber-500" /> Avto-İcra
                      </span>
                      <button 
                        onClick={() => alert(`TXN-${currentId} Təfərrüatları:\nGöndərən: ${senderName}\nAlan: ${receiverName}\nMəbləğ: ${tx.amount} AZN\nTəsvir: ${tx.description || '-'}`)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100"
                      >
                        <Eye size={13} /> Detallara bax
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TƏRƏF CƏDVƏLİ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                <th className="p-3 pl-5">ID & Tarix</th>
                <th className="p-3">Kimdən → Kimə</th>
                <th className="p-3">Məbləğ</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-5 text-right">Əməliyyatlar (Qərar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                    Məlumatlar yüklənir...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400">
                    Tranzaksiya tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const currentId = getTxId(tx);
                  const senderName = getSenderName(tx);
                  const receiverName = getReceiverName(tx);
                  const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('az-AZ') : '-';
                  const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : '';
                  const isHighAmount = Number(tx.amount) >= 5000;
                  const isFlagged = tx.status === 'FLAGGED';

                  return (
                    <tr 
                      key={currentId || index} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isFlagged ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="p-3 pl-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                            #{currentId || 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={11} /> {dateStr} {timeStr && `• ${timeStr}`}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <User size={12} className="text-slate-400" />
                            <span>{senderName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 pl-4">
                            <span className="text-slate-400">→</span>
                            <span className="font-semibold text-slate-700">{receiverName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${isHighAmount ? 'text-rose-600' : 'text-slate-900'}`}>
                            ₼ {Number(tx.amount || 0).toFixed(2)}
                          </span>
                          {isHighAmount && (
                            <span className="text-[9px] text-rose-500 font-semibold uppercase tracking-wider">
                              Yüksək Limit (5k+)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        {(tx.status === 'SUCCESS' || tx.status === 'COMPLETED') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 size={12} /> İcra edilib
                          </span>
                        )}
                        {tx.status === 'FLAGGED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <ShieldAlert size={12} /> Yoxlamadadır
                          </span>
                        )}
                        {tx.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                            <Clock size={12} /> Gözləmədə
                          </span>
                        )}
                        {tx.status === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <XCircle size={12} /> Ləğv olunub
                          </span>
                        )}
                      </td>

                      <td className="p-3 pr-5 text-right">
                        {isFlagged ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actionLoading === currentId}
                              onClick={() => handleApprove(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                            >
                              <Check size={13} />
                              {actionLoading === currentId ? '...' : 'Təsdiqlə'}
                            </button>

                            <button
                              disabled={actionLoading === currentId}
                              onClick={() => handleReject(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                            >
                              <X size={13} />
                              {actionLoading === currentId ? '...' : 'Ləğv Et'}
                            </button>
                          </div>
                        ) : tx.status === 'SUCCESS' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              <Zap size={11} className="text-amber-500" /> Avto-İcra
                            </span>
                            <button 
                              onClick={() => alert(`TXN-${currentId} Təfərrüatları:\nGöndərən: ${senderName}\nAlan: ${receiverName}\nMəbləğ: ${tx.amount} AZN\nTəsvir: ${tx.description || '-'}`)}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Təfərrüatlara bax"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Əməl yoxdur</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANELİ */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-50/50 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Səhifə <span className="font-bold text-slate-800">{page + 1}</span> / <span className="font-bold text-slate-800">{totalPages || 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Əvvəlki</span>
            </button>

            <button
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(prev => prev + 1)}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <span className="hidden sm:inline">Növbəti</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;