import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Eye,
    EyeOff,
    PlusCircle,
    FileText,
    Settings,
    Copy,
    Check,
    ArrowUpRight,
    ArrowDownLeft,
    Inbox,
    X
} from 'lucide-react';
import cardService from '../services/cardService';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import userService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const actionRowStyle = {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    padding: '20px 16px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.01)',
    marginBottom: '0.5rem'
};

const iconWrapperStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justify: 'center',
    fontSize: '1.2rem',
    marginBottom: '0.1rem'
};

export const CardDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [card, setCard] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(true);

    const [showDetails, setShowDetails] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    // 1. İstifadəçi məlumatlarını və Kart məlumatlarını yükləyirik
    useEffect(() => {
    const fetchCardTransactions = async (cardData) => {
        try {
            setTxLoading(true);
            
            // Kart nömrəsindəki bütün boşluqları təmizləyirik (məsələn: "4532 7890..." -> "45327890...")
            const cleanCardNumber = cardData?.cardNumber ? String(cardData.cardNumber).replace(/\s+/g, '') : '';

            console.log("Axtarılan kart nömrəsi:", cleanCardNumber);

            // 1. Düzgün cardNumber parametri ilə göndəririk
            const txData = await transactionService.getTransactions({
                cardNumber: cleanCardNumber
            });

            console.log("Backend-dən gələn xam transaksiya datası:", txData);

            const list = Array.isArray(txData) ? txData : [];

            // 2. Əgər backend artıq filtrlənmiş verirsə, birbaşa son 5-ini götürürük.
            // Əgər verilməyibsə, yumşaq (soft) filtrləmə edirik:
            let finalTxList = list;

            if (list.length > 0) {
                const hasMatchingField = list.some(tx => tx.fromCardNumber || tx.toCardNumber || tx.cardNumber);
                
                if (hasMatchingField) {
                    finalTxList = list.filter(tx => {
                        const from = String(tx.fromCardNumber || '').replace(/\s+/g, '');
                        const to = String(tx.toCardNumber || '').replace(/\s+/g, '');
                        const cardNum = String(tx.cardNumber || '').replace(/\s+/g, '');

                        return from === cleanCardNumber || to === cleanCardNumber || cardNum === cleanCardNumber;
                    });
                }
            }

            console.log("Süzülmüş son siyahı:", finalTxList);

            // Son 5 transaksiyanı götürürük
            setTransactions(finalTxList.slice(0, 5));

        } catch (err) {
            console.error("Kart əməliyyatları yüklənərkən xəta:", err);
            setTransactions([]);
        } finally {
            setTxLoading(false);
        }
    };

    const fetchCardData = async () => {
        try {
            setLoading(true);

            try {
                if (userService?.getProfile) {
                    const user = await userService.getProfile();
                    setCurrentUser(user);
                } else if (userService?.getCurrentUser) {
                    const user = await userService.getCurrentUser();
                    setCurrentUser(user);
                }
            } catch (uErr) {
                console.error("İstifadəçi məlumatı alınarkən xəta:", uErr);
            }

            if (!id || id === 'undefined') {
                setLoading(false);
                return;
            }

            const cardData = await cardService.getCardById(id);

            if (cardData) {
                setCard(cardData);
                const targetAccountId = cardData.accountId || cardData.account?.id;

                if (targetAccountId) {
                    try {
                        const accountData = await accountService.getAccountById(targetAccountId);
                        setCard(prevCard => ({
                            ...prevCard,
                            account: accountData
                        }));
                    } catch (accErr) {
                        console.error("Karta aid hesab məlumatları tapılmadı:", accErr);
                    }
                }

                // Transaksiyaları çağıran funksiya
                await fetchCardTransactions(cardData);
            }
        } catch (err) {
            console.error("Kart məlumatları yüklənərkən xəta:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchCardData();
}, [id]);

    // Tarixə görə qruplaşdırma məntiqi (Göndərdiyiniz koddan)
    const groupTransactionsByDate = (txList) => {
        const groups = {};
        txList.forEach((tx) => {
            const rawDate = tx.createdAt || tx.timestamp || tx.date;
            if (!rawDate) return;

            const dateObj = new Date(rawDate);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const dateStr = `${day}.${month}.${year}`;

            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(tx);
        });
        return groups;
    };

    // Mədaxil/Məxaric yoxlanması məntiqi (Göndərdiyiniz koddan)
    const checkIsDeposit = (tx) => {
        if (tx.type === 'INCOME' || tx.type === 'DEPOSIT') return true;
        if (tx.type === 'EXPENSE' || tx.type === 'WITHDRAWAL') return false;

        if (!currentUser) {
            return false;
        }

        const currentFullName = `${currentUser.name || currentUser.firstName || ''} ${currentUser.surname || currentUser.lastName || ''}`.trim().toLowerCase();
        const senderFullName = String(tx.senderName || '').trim().toLowerCase();

        if (senderFullName && currentFullName && senderFullName === currentFullName) {
            return false; // Məxaric (-)
        }

        if (senderFullName && currentFullName && senderFullName !== currentFullName) {
            return true; // Mədaxil (+)
        }

        return false;
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCardNumber = (num) => {
        if (!num) return '•••• •••• •••• ••••';
        if (!showDetails) return `•••• ${num.slice(-4)}`;
        return num.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatExpiryDate = (dateStr) => {
        if (!dateStr) return '••/••';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '••/••';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    };

    const toggleCardStatus = async () => {
        if (!card || isProcessing) return;

        const userId = currentUser?.id || localStorage.getItem('userId');
        const isCurrentlyBlocked = card.cardStatus === 'BLOCKED';
        const confirmMsg = isCurrentlyBlocked
            ? "Kartı blokdan çıxartmaq istəyirsiniz?"
            : "Kartı keçici olaraq bloklamaq istəyirsiniz?";

        if (window.confirm(confirmMsg)) {
            try {
                setIsProcessing(true);
                const cardIdToUse = card.id || card.cardId;

                if (isCurrentlyBlocked) {
                    await cardService.activateCard(cardIdToUse, userId);
                    alert("Kartınız uğurla aktivləşdirildi!");
                } else {
                    await cardService.blockCard(cardIdToUse, userId);
                    alert("Kartınız bloklandı!");
                }
                window.location.reload();
            } catch (err) {
                alert("Əməliyyat uğursuz oldu: " + (err.response?.data?.message || err.message));
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleReplaceCard = async () => {
        if (!card || isProcessing) return;
        const userId = currentUser?.id || localStorage.getItem('userId');

        if (window.confirm("Kartı tamamilə yararsız edib yeni nömrə ilə əvəzləmək istəyirsiniz?")) {
            try {
                setIsProcessing(true);
                await cardService.replaceCard(card.id || card.cardId, userId);
                alert("Kartınız yeniləndi!");
                window.location.reload();
            } catch (e) {
                alert("Xəta baş verdi: " + (e.response?.data?.message || e.message));
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleDeleteCard = async () => {
        if (!card || isProcessing) return;
        const userId = currentUser?.id || localStorage.getItem('userId');

        if (window.confirm("Bu kartı tamamilə silmək istədiyinizdən əminsiniz?")) {
            try {
                setIsProcessing(true);
                await cardService.deleteCard(card.id || card.cardId, userId);
                alert("Kart silindi.");
                navigate(-1);
            } catch (e) {
                alert("Xəta baş verdi: " + (e.response?.data?.message || e.message));
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!card) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Kart tapılmadı.</div>;

    const cardTypeStr = card.cardType || 'VISA';
    const isVisa = cardTypeStr.toUpperCase().includes('VISA');
    const isCardBlocked = card.cardStatus === 'BLOCKED';

    // Ad və Soyad
    const cardHolderName = card.account?.user?.fullName ||
        (currentUser ? `${currentUser.name || currentUser.firstName || ''} ${currentUser.surname || currentUser.lastName || ''}`.trim() : '') ||
        'İSTİFADƏÇİ ADI';

    const groupedTransactions = groupTransactionsByDate(transactions);

    return (
     <div style={{
            backgroundColor: 'var(--bg-primary)',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box'
        }}>

            <div className="page-container" style={{ width: '100%', maxWidth: '1000px', padding: '0' }}>

                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary interactive-btn"
                        style={{
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                        Kartın Təfərrüatları
                    </h2>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="btn btn-secondary interactive-btn"
                        style={{
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </header>

                {/* Main Grid */}
                <div className="main-grid">

                    {/* SOL TƏRƏF */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Balans Paneli - FIX EDİLDİ */}
                        <div className="glass-card" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '1.25rem 1.5rem',
                            gap: '1rem'
                        }}>
                            {isCardBlocked && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--color-danger)' }} />
                            )}

                            {/* Sol tərəf - Məlumatlar (minWidth: 0 sayəsində mətn daşmır) */}
                            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {cardHolderName}
                                </div>
                                <div style={{ 
                                    fontSize: 'clamp(1.5rem, 5vw, 2.1rem)', // Məbləğ böyüdükcə dinamik kiçilir
                                    fontWeight: '800', 
                                    color: 'var(--text-primary)', 
                                    display: 'flex', 
                                    alignItems: 'baseline', 
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {(card.account?.balance ?? card.balance ?? 0).toFixed(2)} 
                                    <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary)' }}>AZN</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {card.account?.accountNumber || 'Hesab yüklənir...'}
                                </div>
                            </div>

                            {/* Sağ tərəf - Mini Vizual Kart (FIX: flexShrink: 0 sayəsində HЕÇ VAXT sıxılmır) */}
                            <div style={{
                                width: '120px',
                                minWidth: '120px', // Ölçüsü sabit qaldı
                                height: '78px',
                                borderRadius: '12px',
                                background: isCardBlocked
                                    ? 'linear-gradient(135deg, #64748b, #475569)'
                                    : (isVisa ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #e11d48, #be123c)'),
                                color: '#ffffff',
                                padding: '10px',
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                                opacity: isCardBlocked ? 0.7 : 1,
                                flexShrink: 0 // Sıxılmanın qarşısını alan əsas xassə
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                        {cardTypeStr} {isCardBlocked && '(🔒)'}
                                    </span>
                                    <div style={{ width: '16px', height: '11px', backgroundColor: '#fbbf24', borderRadius: '2px' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.5px', marginBottom: '2px', fontFamily: 'monospace' }}>
                                        {formatCardNumber(card.cardNumber)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', opacity: 0.9 }}>
                                        <span>{formatExpiryDate(card.expiryDate)}</span>
                                        <span style={{ color: isCardBlocked ? '#fbbf24' : '#4ade80', fontWeight: 'bold' }}>
                                            {card.cardStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menyu Düymələri - RAТAT SÜRÜŞƏN HORIZONTAL SCROLL */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            overflowX: 'auto', 
                            paddingBottom: '8px',
                            paddingTop: '4px',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch', // İOS-da yumşaq scroll
                            scrollbarWidth: 'none' // Firefox scrollbar gizlətmək
                        }}
                        className="no-scrollbar"
                        >
                            {[
                                { icon: <PlusCircle size={22} />, label: 'Artırmaq', action: () => navigate('/transfer') },
                                { icon: <FileText size={22} />, label: 'Çıxarış', action: () => { } },
                                { icon: <Settings size={22} />, label: 'Gizlət', action: () => { setShowDetails(false); setShowSettings(false); } },
                                { icon: <FileText size={22} />, label: 'Rekvizitlər', action: () => handleCopy(card.cardNumber) },
                                { icon: <Settings size={22} />, label: 'Sazlamalar', action: () => setShowSettings(true) },
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="glass-card"
                                    style={{
                                        minWidth: '85px', // Hər düyməyə rahat yer ayrıldı
                                        flex: '0 0 auto',
                                        padding: '14px 8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ color: 'var(--color-primary)' }}>{item.icon}</div>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Kart Təhlükəsizlik / Rekvizit Məlumatları Paneli */}
                        {showDetails && (
                            <div className="glass-card" style={{ animation: 'fadeIn var(--transition-normal)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: '700' }}>
                                    Kart Sahibinin Rekvizitləri
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Ad və Soyad:</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {cardHolderName}
                                            <button onClick={() => handleCopy(cardHolderName)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                                                {copied ? <Check size={15} style={{ color: 'var(--color-success)' }} /> : <Copy size={15} />}
                                            </button>
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Kartın Nömrəsi:</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
                                            {card.cardNumber || '•••• •••• •••• ••••'}
                                            <button onClick={() => handleCopy(card.cardNumber)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                                                {copied ? <Check size={15} style={{ color: 'var(--color-success)' }} /> : <Copy size={15} />}
                                            </button>
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Bitiş Tarixi:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatExpiryDate(card.expiryDate)}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>CVV / CVC:</span>
                                        <span style={{ fontWeight: 600, backgroundColor: 'var(--bg-primary)', padding: '3px 10px', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                            {card.cvv || '•••'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SAĞ TƏRƏF: Son 5 Əməliyyat */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
                            Kartın Son 5 Əməliyyatı
                        </h3>

                        {txLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
                                <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%' }} className="animate-spin" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                                <Inbox size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>Heç bir əməliyyat tapılmadı</p>
                            </div>
                        ) : (
                            <div>
                                {Object.keys(groupedTransactions).map((dateStr) => (
                                    <div key={dateStr} style={{ marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <span
                                                style={{
                                                    backgroundColor: 'var(--color-primary-glow)',
                                                    color: 'var(--color-primary)',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                {dateStr}
                                            </span>
                                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {groupedTransactions[dateStr].map((tx) => {
                                                const isDeposit = checkIsDeposit(tx);
                                                const dateObj = new Date(tx.createdAt || tx.timestamp || tx.date);
                                                const timeStr = isNaN(dateObj.getTime()) ? '' : `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

                                                let transactionTitle = tx.description;
                                                if (tx.senderName && tx.receiverName) {
                                                    transactionTitle = `${tx.senderName} ➔ ${tx.receiverName}`;
                                                } else if (!transactionTitle) {
                                                    transactionTitle = isDeposit ? 'Mədaxil' : 'Köçürmə';
                                                }

                                                return (
                                                    <div
                                                        key={tx.id || Math.random()}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '0.75rem 0.85rem',
                                                            borderRadius: '12px',
                                                            backgroundColor: 'var(--bg-primary)',
                                                            border: '1px solid var(--border-color)',
                                                            gap: '0.75rem'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                                            <div
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    minWidth: '38px',
                                                                    borderRadius: '10px',
                                                                    backgroundColor: isDeposit ? 'var(--color-success-glow)' : 'var(--color-danger-glow)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: isDeposit ? 'var(--color-success)' : 'var(--color-danger)'
                                                                }}
                                                            >
                                                                {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                                <p style={{
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    color: 'var(--text-primary)',
                                                                    margin: 0,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}>
                                                                    {transactionTitle}
                                                                </p>
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                                    {timeStr}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                            <span
                                                                style={{
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '700',
                                                                    color: isDeposit ? 'var(--color-success)' : 'var(--text-primary)'
                                                                }}
                                                            >
                                                                {isDeposit ? '+' : '-'}{Math.abs(tx.amount || 0).toFixed(2)} AZN
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* MODAL */}
            {showSettings && (
                <div
                    onClick={() => setShowSettings(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'var(--backdrop-blur)',
                        zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '24px',
                            padding: '1.5rem', boxSizing: 'border-box',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            marginBottom: '1.5rem',
                            animation: 'fadeIn 0.25s ease-out'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <button
                                onClick={() => setShowSettings(false)}
                                style={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <X size={18} />
                            </button>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                                Kartın Sazlamaları
                            </h3>

                            <div style={{ width: '36px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                {
                                    icon: isCardBlocked ? '🔓' : '🔒',
                                    title: isCardBlocked ? 'Kartı Blokdan Çıxart' : 'Kartı Keçici Blokla',
                                    subtitle: isCardBlocked ? 'Kartı yenidən aktiv hala gətirin' : 'Təhlükəsizlik üçün dondurun',
                                    color: 'var(--color-warning)',
                                    handler: toggleCardStatus
                                },
                                {
                                    icon: '🔄',
                                    title: 'Kartı Yenilə (Replace)',
                                    subtitle: 'Yeni nömrə ilə yeniləyin',
                                    color: 'var(--color-primary)',
                                    handler: handleReplaceCard
                                },
                                {
                                    icon: '🗑️',
                                    title: 'Kartı Sil',
                                    subtitle: 'Sistemdən həmişəlik silin',
                                    color: 'var(--color-danger)',
                                    handler: handleDeleteCard,
                                    titleColor: 'var(--color-danger)'
                                }
                            ].map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={opt.handler}
                                    className="glass-card"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        opacity: isProcessing ? 0.6 : 1,
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        border: '1px solid var(--border-color)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ color: opt.color, fontSize: '1.2rem' }}>{opt.icon}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: opt.titleColor || 'var(--text-primary)' }}>
                                                {opt.title}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {opt.subtitle}
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>➔</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardDetailPage;