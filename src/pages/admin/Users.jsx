import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  Loader2,
  X,
  Save
} from 'lucide-react';
import adminService from '../../services/adminService';
import adminAccountService from '../../services/adminAccountService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [userBalances, setUserBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Redaktə Modalı
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeRequestRef = useRef(0);

  // Obyektdən ID-ni Təhlükəsiz Qaytaran Funksiya
  const getUserId = (u) => {
    if (!u) return null;
    return u.id ?? u.userId ?? u._id ?? u.idDto ?? u.user_id ?? u.user?.id;
  };

  // 1. Məlumatları Yükləmək
  const fetchUsersAndBalances = async () => {
    const requestId = ++activeRequestRef.current;

    try {
      setLoading(true);
      setError(null);

      const [userData, allAccounts] = await Promise.all([
        adminService.getAllUsers(searchTerm, statusFilter),
        adminAccountService.getAllAccounts(),
      ]);

      if (requestId !== activeRequestRef.current) return;

      const userList = Array.isArray(userData)
        ? userData
        : (userData?.content || userData?.data || []);

      if (userList.length > 0) {
        console.log("İstifadəçi obyektinin açarları:", Object.keys(userList[0]));
        console.log("Tapılan ID:", getUserId(userList[0]));
      }

      setUsers(userList);

      const accountsList = Array.isArray(allAccounts)
        ? allAccounts
        : (allAccounts?.content || allAccounts?.data || []);

      const balancesMap = {};

      accountsList.forEach((acc) => {
        const uId = acc.userId ?? acc.user?.id ?? acc.user_id;
        const currentBalance = Number(acc.balance ?? acc.currentBalance ?? acc.amount ?? 0) || 0;

        if (uId !== undefined && uId !== null) {
          const key = String(uId);
          balancesMap[key] = (balancesMap[key] || 0) + currentBalance;
        }
      });

      if (requestId === activeRequestRef.current) {
        setUserBalances(balancesMap);
      }

    } catch (err) {
      if (requestId === activeRequestRef.current) {
        console.error("Məlumatlar yüklənərkən xəta:", err);
        setError("Məlumatları yükləmək mümkün olmadı.");
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsersAndBalances();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  // 2. Status Dəyişdirmə (Block / Activate)
  const handleToggleStatus = async (user, currentStatus) => {
    const userId = getUserId(user);

    if (!userId) {
      console.error("İstifadəçi ID-si tapılmadı. Obyekt:", user);
      alert("İstifadəçi ID-si tapılmadı!");
      return;
    }

    try {
      if (currentStatus === 'BLOCKED') {
        await adminService.activateUser(userId);
      } else {
        await adminService.blockUser(userId);
      }

      const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';

      setUsers(prev => prev.map(u => {
        if (getUserId(u) === userId) {
          return { ...u, userStatus: newStatus, status: newStatus };
        }
        return u;
      }));
    } catch (err) {
      console.error("Status dəyişdirilərkən xəta:", err);
      alert("Statusu dəyişmək mümkün olmadı.");
    }
  };

  // 3. İstifadəçi Silmə
  const handleDeleteUser = async (user) => {
    const userId = getUserId(user);

    if (!userId) {
      alert("İstifadəçi ID-si tapılmadı!");
      return;
    }

    if (!window.confirm("Bu istifadəçini silmək istədiyinizdən əminsiniz?")) return;

    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => getUserId(u) !== userId));
    } catch (err) {
      console.error("Silmə xətası:", err);
      alert("İstifadəçini silmək mümkün olmadı.");
    }
  };

  // 4. Redaktə Modalı Açmaq
  const handleEditClick = (user) => {
    const userId = getUserId(user);
    setEditingUser({
      id: userId,
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
      role: user.role || 'USER'
    });
    setIsModalOpen(true);
  };

  // 5. Redaktə Məlumatlarını Yadda Saxlamaq
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateDto = {
        name: editingUser.name,
        surname: editingUser.surname,
        email: editingUser.email,
        role: editingUser.role,
      };

      // 1. Backend-i yeniləyirik
      const updatedUserFromBackend = await adminService.updateUser(editingUser.id, updateDto);

      // 2. Siyahı state-ini (məsələn: users) lokal olaraq yeniləyirik
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...updateDto } : user
        )
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Yeniləmə zamanı xəta:", error);
      alert(error.response?.data?.message || "Məlumatları yeniləmək mümkün olmadı!");
    } finally {
      setSaving(false);
    }
  };

  // Balans Hesablama
  const getUserTotalBalance = (user) => {
    if (Array.isArray(user.accounts) && user.accounts.length > 0) {
      return user.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    }

    const uId = getUserId(user);
    if (uId && userBalances[String(uId)] !== undefined) {
      return userBalances[String(uId)];
    }

    return 0;
  };

  return (
    <div className="space-y-6">
      {/* BAŞLIQ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">İstifadəçilərin İdarə Edilməsi</h2>
          <p className="text-slate-500 text-sm">
            Müştəri hesabları, ümumi balanslar, rol və status idarəetməsi.
          </p>
        </div>
      </div>

      {/* STATİSTİKA KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Ümumi İstifadəçilər</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Aktiv</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {users.filter(u => (u.userStatus || u.status || 'ACTIVE') === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Bloklanmış</p>
          <p className="text-xl font-bold text-rose-600 mt-1">
            {users.filter(u => (u.userStatus || u.status) === 'BLOCKED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Adminlər</p>
          <p className="text-xl font-bold text-purple-600 mt-1">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* AXTARIŞ VƏ FİLTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Ad, Soyad və ya Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">Bütün Statuslar</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="BLOCKED">Bloklanmış</option>
          </select>
        </div>
      </div>

      {/* CƏDVƏL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 size={36} className="animate-spin mb-2 text-blue-600" />
            <p className="text-sm">Məlumatlar yüklənir...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 font-medium">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400">İstifadəçi tapılmadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold border-b border-slate-100">
                  <th className="p-4 pl-6">İstifadəçi</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Ümumi Balans</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Qeydiyyat Tarixi</th>
                  <th className="p-4 pr-6 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user, index) => {
                  const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || 'İstifadəçi';
                  const currentStatus = user.userStatus || user.status || 'ACTIVE';
                  const userId = getUserId(user);

                  const balance = getUserTotalBalance(user);

                  const formattedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('az-AZ')
                    : '-';

                  return (
                    <tr key={userId || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{fullName}</p>
                            <p className="text-xs text-slate-400">{userId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-700">
                        {user.email}
                      </td>

                      <td className="p-4 font-bold text-slate-800">
                        {balance.toFixed(2)} AZN
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                          }`}>
                          {user.role || 'USER'}
                        </span>
                      </td>

                      <td className="p-4">
                        {currentStatus === 'ACTIVE' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                            Aktiv
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
                            Bloklanıb
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-500 text-xs">
                        {formattedDate}
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Redaktə */}
                          <button
                            onClick={() => handleEditClick(user)}
                            title="Redaktə et"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* Blokla / Unblock */}
                          <button
                            onClick={() => handleToggleStatus(user, currentStatus)}
                            title={currentStatus === 'BLOCKED' ? "Aktivləşdir" : "Blokla"}
                            className={`p-1.5 rounded-lg transition-colors ${currentStatus === 'BLOCKED'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                          >
                            {currentStatus === 'BLOCKED' ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>

                          {/* Sil */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            title="Sil"
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REDAKTƏ MODALI */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">İstifadəçi Redaktəsi</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ad:</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Soyad:</label>
                <input
                  type="text"
                  value={editingUser.surname || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, surname: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email:</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Rol:</label>
                <select
                  value={editingUser.role || 'USER'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Yadda Saxla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;