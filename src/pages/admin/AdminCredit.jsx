import React, { useState, useEffect } from 'react';
import { fetchAllCredits, fetchCreditsByStatus } from '../../services/adminCreditService';

const AdminCredit = () => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const loadCredits = async () => {
        setLoading(true);
        try {
            if (selectedStatus === 'ALL') {
                const data = await fetchAllCredits(page, pageSize);
                setCredits(data.content || []);
                setTotalPages(data.totalPages || 0);
            } else {
                const data = await fetchCreditsByStatus(selectedStatus);
                setCredits(data || []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Kreditlər yüklənərkən xəta baş verdi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCredits();
    }, [page, selectedStatus]);

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setPage(0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('az-AZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (val) => {
        if (val === null || val === undefined) return '0.00 ₼';
        return `${Number(val).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">APPROVED</span>;
            case 'REJECTED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">REJECTED</span>;
            case 'PAID_OFF':
            case 'CLOSED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">PAID_OFF</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status || '-'}</span>;
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            
            {/* BAŞLIQ VƏ FİLTR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Kreditlərin İdarə Edilməsi</h2>
                    <p className="text-xs text-slate-500 mt-1">Mövcud kredit müraciətləri və onların detallı statusları</p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Status:</label>
                    <select 
                        value={selectedStatus} 
                        onChange={handleStatusChange}
                        className="p-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Bütün Kreditlər</option>
                        <option value="ACTIVE">ACTIVE (Təsdiqlənib)</option>
                        <option value="PAID_OFF">PAID_OFF (Ödənilib)</option>
                    </select>
                </div>
            </div>

            {/* CƏDVƏL */}
            {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm font-medium">Yüklənir...</div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                                <th className="p-3">ID</th>
                                <th className="p-3">Hesab ID</th>
                                <th className="p-3">Əsas Məbləğ</th>
                                <th className="p-3">Ümumi Məbləğ</th>
                                <th className="p-3">Qalıq Məbləğ</th>
                                <th className="p-3">Aylıq Ödəniş</th>
                                <th className="p-3">Faiz (%)</th>
                                <th className="p-3">Növbəti Ödəniş Tarixi</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {credits.length > 0 ? (
                                credits.map((credit) => (
                                    <tr key={credit.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-3 font-semibold text-slate-900">#{credit.id}</td>
                                        <td className="p-3 font-mono text-xs text-slate-600">#{credit.accountId}</td>
                                        <td className="p-3 font-medium text-slate-800">{formatCurrency(credit.originalAmount)}</td>
                                        <td className="p-3 font-medium text-slate-800">{formatCurrency(credit.totalAmount)}</td>
                                        <td className="p-3 font-semibold text-rose-600">{formatCurrency(credit.remainingAmount)}</td>
                                        <td className="p-3 font-semibold text-blue-600">{formatCurrency(credit.monthlyPayment)}</td>
                                        <td className="p-3 font-mono text-xs font-bold text-slate-700">
                                            {credit.interestRate !== null && credit.interestRate !== undefined ? `%${credit.interestRate}` : '-'}
                                        </td>
                                        <td className="p-3 text-xs text-slate-600">
                                            {formatDate(credit.nextPaymentDate)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {getStatusBadge(credit.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-400 text-sm">
                                        Məlumat tapılmadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {selectedStatus === 'ALL' && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button 
                        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        Əvvəlki
                    </button>
                    <span className="text-xs font-medium text-slate-600">
                        Səhifə {page + 1} / {totalPages || 1}
                    </span>
                    <button 
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={page >= totalPages - 1}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        Sonrakı
                    </button>
                </div>
            )}

        </div>
    );
};

export default AdminCredit;