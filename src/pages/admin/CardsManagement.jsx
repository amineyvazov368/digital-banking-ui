import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Sun,
  Lock,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Trash2,
  Building2,
  Wallet,
  Copy,
  Check,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { adminCardService } from '../../services/adminCardService';

const CardsManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // Status filteri üçün state
  const [copiedCardId, setCopiedCardId] = useState(null);  // Kopyalama statusu üçün state

  const currentAdminId = 1;

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await adminCardService.getAllCards();
      setCards(data);
    } catch (error) {
      console.error("Kartlar yüklənərkən xəta baş verdi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Kopyalama funksiyası
  const handleCopyNumber = (cardNumber, cardId) => {
    if (!cardNumber) return;
    navigator.clipboard.writeText(cardNumber);
    setCopiedCardId(cardId);
    setTimeout(() => {
      setCopiedCardId(null);
    }, 2000); // 2 saniyə sonra kopyalandı işarəsi itir
  };

  // Status dəyişmə (Aktivləşdir / Blokla)
// Status dəyişmə (Aktivləşdir / Blokla)
// Status dəyişmə (Aktivləşdir / Blokla)
  const handleToggleStatus = async (card) => {
    const status = card.cardStatus || card.status;
    const isBlocked = status === 'BLOCKED' || status === 'FROZEN' || status === 'INACTIVE';
    const actionName = isBlocked ? "AKTİVLƏŞDİRMƏK" : "BLOKLAMAQ";

    // Silmədə olduğu kimi təsdiq mesajı əlavə edirik
    if (!window.confirm(`Bu kartı ${actionName} istədiyinizdən əminsiniz?`)) {
      return;
    }

    try {
      const targetUserId = card.account?.user?.id || card.account?.userId || card.userId;

      if (!targetUserId) {
        alert("Xəta: Karta bağlı İstifadəçi ID-si tapılmadı!");
        return;
      }

      if (isBlocked) {
        await adminCardService.activateCard(card.id, targetUserId);
        alert("Kart uğurla aktivləşdirildi!");
      } else {
        await adminCardService.blockCard(card.id, targetUserId);
        alert("Kart uğurla bloklandı!");
      }
      
      await fetchCards(); // Cədvəli yenilə
    } catch (error) {
      console.error("Status dəyişdirilərkən xəta:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Status dəyişdirilərkən xəta baş verdi!");
    }
  };

  // Kartı Silmə
  const handleDeleteCard = async (card) => { // id əvəzinə obyektin özünü ötürürük
    if (window.confirm("Bu kartı silməyə əminsiniz?")) {
      try {
        const targetUserId = card.account?.user?.id || card.account?.userId || card.userId;

        if (!targetUserId) {
          alert("Xəta: Karta bağlı İstifadəçi ID-si tapılmadı!");
          return;
        }

        await adminCardService.deleteCard(card.id, targetUserId);
        await fetchCards(); // Cədvəli yenilə
      } catch (error) {
        console.error("Kart silinərkən xəta:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Kart silinərkən xəta baş verdi!");
      }
    }
  };

  // Filterləmə (Axtarış, Kart Tipi və Status üzrə)
  const filteredCards = cards.filter(card => {
    const user = card.account?.user;
    const holder = card.account?.userName ||
      card.holderName ||
      (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');

    const number = card.cardNumber || '';
    const accNumber = card.account?.accountNumber || '';

    // Axtarış süzgəci
    const matchesSearch =
      holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      number.includes(searchTerm) ||
      accNumber.includes(searchTerm);

    // Tip süzgəci
    const cardType = card.cardType || '';
    const matchesType = typeFilter === 'ALL' || cardType === typeFilter;

    // Status süzgəci
    const cardStatus = card.cardStatus || card.status || '';
    const matchesStatus = statusFilter === 'ALL' || cardStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }
 

  return (
    <div className="space-y-6">
      {/* BAŞLIQ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kartlar və Bağlı Hesablar</h2>
          <p className="text-slate-500 text-sm">
            Sistemdəki bütün kartlar, onların balansları və hesab statusları.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
          <PlusCircle size={18} />
          <span>Yeni Kart Təyin Et</span>
        </button>
      </div>

      {/* STATİSTİKA KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Aktiv Kartlar</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {cards.filter(c => (c.cardStatus || c.status) === 'ACTIVE').length}
            </p>
          </div>
          <CheckCircle2 className="text-emerald-500/20 shrink-0" size={32} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Bloklanmış / Passiv</p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {cards.filter(c => (c.cardStatus || c.status) === 'BLOCKED' || (c.cardStatus || c.status) === 'INACTIVE').length}
            </p>
          </div>
          <Lock className="text-rose-500/20 shrink-0" size={32} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Ümumi Kart Sayı</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{cards.length}</p>
          </div>
          <CreditCard className="text-blue-500/20 shrink-0" size={32} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Virtual Kartlar</p>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {cards.filter(c => c.cardForm === 'VIRTUAL' || c.cardType === 'VIRTUAL').length}
            </p>
          </div>
          <Smartphone className="text-purple-500/20 shrink-0" size={32} />
        </div>
      </div>

      {/* AXTARIŞ VƏ FİLTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Müştəri adı, kart və ya hesab nömrəsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 shrink-0" />

          {/* Status Filteri */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">Bütün Statuslar</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="BLOCKED">Bloklanmış</option>
            <option value="CLOSED">Closed</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Kart Tipi Filteri */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">Bütün Kart Tipləri</option>
            <option value="DEBIT">Debet</option>
            <option value="CASHBACK">CashBack</option>
            <option value="VISA">VISA</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>
      </div>

      {/* CƏDVƏL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold border-b border-slate-100">
                <th className="p-4 pl-6">Kart Məlumatı</th>
                <th className="p-4">Kart Sahibi</th>
                <th className="p-4">Bağlı Hesab (IBAN/Acc)</th>
                <th className="p-4">Balans</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Heç bir kart tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const status = card.cardStatus || card.status;
                  const account = card.account;
                  const balance = account?.balance ?? 0;
                  const currency = account?.currency || 'AZN';
                  const accountNumber = account?.accountNumber || `Hesab ID: #${card.accountId}`;

                  const user = account?.user;
                  const holderName = account?.userName ||
                    card.holderName ||
                    (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Məlum deyil');

                  const isCopied = copiedCardId === card.id;

                  return (
                    <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kart nömrəsi, Copy və Expire Date */}
                      <td className="p-4 pl-6">
                        {/* Kart Tipi və Adına görə dinamik stillər */}
{(() => {
  const type = (card.cardType || 'DEBIT').toUpperCase();
  const form = (card.cardForm || 'PHYSICAL').toUpperCase();
  const isCashback = type === 'CASHBACK' || card.cardName === 'CASHBACK' || card.isCashback;

  // Type-a uyğun dizayn konfiqurasiyası
  const getCardStyle = () => {
    if (type.includes('CREDIT')) {
      return {
        bg: 'bg-gradient-to-br from-rose-900 via-slate-900 to-rose-950',
        textColor: 'text-rose-400',
        badgeBg: 'bg-rose-500 text-white',
        badgeText: 'CR'
      };
    }
    if (type.includes('VISA')) {
      return {
        bg: 'bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950',
        textColor: 'text-sky-300',
        badgeBg: 'bg-sky-400 text-slate-950',
        badgeText: 'VISA'
      };
    }
    if (type.includes('MASTERCARD')) {
      return {
        bg: 'bg-gradient-to-br from-amber-800 via-slate-900 to-red-950',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500 text-slate-950',
        badgeText: 'MC'
      };
    }
    if (isCashback) {
      return {
        bg: 'bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-400 text-slate-900',
        badgeText: 'CB'
      };
    }
    // Default (DEBIT və digərləri üçün)
    return {
      bg: 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500 text-slate-950',
      badgeText: 'DB'
    };
  };

  const style = getCardStyle();

  return (
    <div className="flex items-center gap-3">
      {/* Dinamik Kart Box-u */}
      <div className={`w-16 h-10 rounded-lg flex flex-col justify-between p-1.5 shadow-sm relative overflow-hidden shrink-0 border border-white/10 ${style.bg}`}>
        
        {/* Üst Tərəf: Kart Tipi & Badge */}
        <div className="flex items-center justify-between w-full leading-none">
          <span className={`text-[8.5px] font-black tracking-wider uppercase truncate ${style.textColor}`}>
            {type}
          </span>

          {/* Dinamik Badge (CR, CB, MC, VISA, DB) */}
          <span className={`text-[6px] font-extrabold px-1 rounded-[2px] uppercase ${style.badgeBg}`}>
            {style.badgeText}
          </span>
        </div>

        {/* Orta Tərəf: Əgər əlavə ad/Cashback varsa */}
        <span className="text-[8.5px] font-extrabold tracking-tight uppercase truncate text-slate-200 leading-none my-auto">
          {card.cardName || (isCashback ? 'CASHBACK' : '')}
        </span>

        {/* Alt Tərəf: Forması (VIRTUAL / PHYSICAL) və Çip */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tight">
            {form}
          </span>
          <div className="w-2.5 h-2 bg-amber-400 rounded-[2px] shadow-sm shrink-0" />
        </div>
      </div>

      {/* Kart Nömrəsi, Copy Və Expire Date */}
      <div>
        <div className="flex items-center gap-1.5">
          <p className="font-mono font-bold text-slate-800 tracking-wide">
            {card.cardNumber}
          </p>

          <button
            onClick={() => handleCopyNumber(card.cardNumber, card.id)}
            title="Kopyala"
            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
          >
            {isCopied ? (
              <Check size={14} className="text-emerald-600" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          EXP: {card.expiryDate || card.expireDate}
        </p>
      </div>
    </div>
  );
})()}
                      </td>

                      {/* Kart Sahibi */}
                      <td className="p-4 font-semibold text-slate-700">
                        {holderName}
                      </td>

                      {/* Bağlı Hesab Nömrəsi */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Building2 size={16} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-xs font-semibold">{accountNumber}</span>
                        </div>
                      </td>

                      {/* Balans */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Wallet size={15} className="text-emerald-600" />
                          <span>{Number(balance).toLocaleString('az-AZ', { minimumFractionDigits: 2 })} {currency}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={12} /> Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
                            <Lock size={12} /> {status === 'BLOCKED' ? 'Bloklanıb' : 'Passiv'}
                          </span>
                        )}
                      </td>

                      {/* Düymələr */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(card)}
                            title={status === 'ACTIVE' ? "Blokla" : "Aktivləşdir"}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                          >
                            {status === 'ACTIVE' ? <Lock size={15} /> : <Sun size={15} />}
                          </button>

                          <button
                            onClick={() => handleDeleteCard(card)}
                            title="Sil"
                            className="p-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardsManagement;