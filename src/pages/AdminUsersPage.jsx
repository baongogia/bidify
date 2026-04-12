import React, { useEffect, useState } from 'react';
import {
    deleteAdminUser,
    getAdminUserActivity,
    getAdminUsers,
    lockAdminUser,
    unlockAdminUser
} from '../services/adminService';
import {
    Search,
    Lock,
    Unlock,
    Trash2,
    Activity,
    X,
    AlertTriangle,
    ChevronDown
} from 'lucide-react';

/* ──────────────────── Helpers ──────────────────── */
const ROLE_BADGE = {
    ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
    SELLER: 'bg-blue-100 text-blue-700 border border-blue-200',
    BUYER: 'bg-gray-100 text-gray-600 border border-gray-200'
};

const STATUS_BADGE = {
    LOCKED: 'bg-red-100 text-red-700 border border-red-200',
    ACTIVE: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
};

/* ──────────────────── Modal ──────────────────── */
const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

/* ──────────────────── Page ──────────────────── */
const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ q: '', role: '', lock_status: '' });

    // Modal state
    const [lockModal, setLockModal] = useState({ open: false, userId: null, name: '' });
    const [lockReason, setLockReason] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, name: '' });
    const [activityModal, setActivityModal] = useState({ open: false, userId: null, name: '' });
    const [activity, setActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getAdminUsers(filters);
            if (res.success) setUsers(res.data.users);
        } catch (err) {
            showToast(err.message || 'Không tải được danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLockConfirm = async () => {
        if (!lockReason.trim()) return;
        try {
            setActionLoading(lockModal.userId);
            await lockAdminUser(lockModal.userId, lockReason.trim());
            showToast(`Đã khóa tài khoản ${lockModal.name}`);
            setLockModal({ open: false, userId: null, name: '' });
            setLockReason('');
            await fetchUsers();
        } catch (err) {
            showToast(err.message || 'Không khóa được tài khoản', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnlock = async (userId, name) => {
        try {
            setActionLoading(userId);
            await unlockAdminUser(userId);
            showToast(`Đã mở khóa tài khoản ${name}`);
            await fetchUsers();
        } catch (err) {
            showToast(err.message || 'Không mở khóa được tài khoản', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setActionLoading(deleteModal.userId);
            await deleteAdminUser(deleteModal.userId);
            showToast(`Đã xóa tài khoản ${deleteModal.name}`);
            setDeleteModal({ open: false, userId: null, name: '' });
            await fetchUsers();
        } catch (err) {
            showToast(err.message || 'Không xóa được tài khoản', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewActivity = async (userId, name) => {
        setActivityModal({ open: true, userId, name });
        setActivity([]);
        setActivityLoading(true);
        try {
            const res = await getAdminUserActivity(userId, { limit: 50 });
            if (res.success) setActivity(res.data);
        } catch (err) {
            showToast(err.message || 'Không tải được lịch sử', 'error');
        } finally {
            setActivityLoading(false);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500 mt-1">Tìm kiếm, lọc, khóa/mở khóa và xóa tài khoản</p>
                </div>

                {/* Filter bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={filters.q}
                            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            placeholder="Tìm theo tên / email"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="BUYER">Người mua (BUYER)</option>
                        <option value="SELLER">Người bán (SELLER)</option>
                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                    </select>
                    <select
                        value={filters.lock_status}
                        onChange={(e) => setFilters((p) => ({ ...p, lock_status: e.target.value }))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="LOCKED">Đã bị khóa</option>
                    </select>
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                    >
                        Áp dụng bộ lọc
                    </button>
                </div>

                {/* User list */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Đang tải...</div>
                    ) : users.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Không tìm thấy tài khoản phù hợp</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                    {/* Avatar + info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[user.role] || ''}`}>
                                                    {user.role}
                                                </span>
                                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[user.is_locked ? 'LOCKED' : 'ACTIVE']}`}>
                                                    {user.is_locked ? 'Đã khóa' : 'Hoạt động'}
                                                </span>
                                                {user.seller_status && user.seller_status !== 'NONE' && (
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        Seller: {user.seller_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleViewActivity(user.id, user.name)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                                        >
                                            <Activity size={14} />
                                            Lịch sử
                                        </button>

                                        {user.is_locked ? (
                                            <button
                                                disabled={actionLoading === user.id}
                                                onClick={() => handleUnlock(user.id, user.name)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
                                            >
                                                <Unlock size={14} />
                                                Mở khóa
                                            </button>
                                        ) : (
                                            <button
                                                disabled={actionLoading === user.id || user.role === 'ADMIN'}
                                                onClick={() => setLockModal({ open: true, userId: user.id, name: user.name })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition disabled:opacity-40"
                                                title={user.role === 'ADMIN' ? 'Không thể khóa Admin' : ''}
                                            >
                                                <Lock size={14} />
                                                Khóa
                                            </button>
                                        )}

                                        <button
                                            disabled={actionLoading === user.id || user.role === 'ADMIN'}
                                            onClick={() => setDeleteModal({ open: true, userId: user.id, name: user.name })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-40"
                                            title={user.role === 'ADMIN' ? 'Không thể xóa Admin' : ''}
                                        >
                                            <Trash2 size={14} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lock Modal */}
            <Modal
                open={lockModal.open}
                title={`Khóa tài khoản: ${lockModal.name}`}
                onClose={() => { setLockModal({ open: false, userId: null, name: '' }); setLockReason(''); }}
            >
                <p className="text-sm text-gray-600 mb-3">Nhập lý do khóa tài khoản này. Người dùng sẽ không thể đăng nhập sau khi bị khóa.</p>
                <textarea
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    rows={3}
                    placeholder="Lý do khóa tài khoản..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
                <div className="flex gap-2 mt-4 justify-end">
                    <button
                        onClick={() => { setLockModal({ open: false, userId: null, name: '' }); setLockReason(''); }}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleLockConfirm}
                        disabled={!lockReason.trim() || actionLoading === lockModal.userId}
                        className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                    >
                        Xác nhận khóa
                    </button>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                open={deleteModal.open}
                title="Xác nhận xóa tài khoản"
                onClose={() => setDeleteModal({ open: false, userId: null, name: '' })}
            >
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-gray-700">
                        Bạn có chắc muốn xóa tài khoản <strong>{deleteModal.name}</strong>? Hành động này không thể hoàn tác.
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setDeleteModal({ open: false, userId: null, name: '' })}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={actionLoading === deleteModal.userId}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        Xóa tài khoản
                    </button>
                </div>
            </Modal>

            {/* Activity Modal */}
            <Modal
                open={activityModal.open}
                title={`Lịch sử hoạt động: ${activityModal.name}`}
                onClose={() => { setActivityModal({ open: false, userId: null, name: '' }); setActivity([]); }}
            >
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {activityLoading ? (
                        <p className="text-sm text-gray-400 text-center py-6">Đang tải...</p>
                    ) : activity.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Chưa có lịch sử hoạt động</p>
                    ) : (
                        activity.map((item, idx) => (
                            <div key={`${item.created_at}-${idx}`} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{item.action_type}</p>
                                <p className="text-sm text-gray-700 mt-0.5">{item.action_detail}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
