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
    ChevronDown,
    Filter
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import Modal from '../components/Modal';

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
            showToast(err.message || 'Không tải được danh sách', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLockConfirm = async () => {
        if (!lockReason.trim()) return;
        try {
            setActionLoading(lockModal.userId);
            await lockAdminUser(lockModal.userId, lockReason.trim());
            showToast(`Đã khóa tài khoản ${lockModal.name}`, 'warning');
            setLockModal({ open: false, userId: null, name: '' });
            setLockReason('');
            await fetchUsers();
        } catch (err) {
            showToast(err.message || 'Thao tác thất bại', 'error');
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
            showToast(err.message || 'Thao tác thất bại', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            setActionLoading(deleteModal.userId);
            await deleteAdminUser(deleteModal.userId);
            showToast(`Đã xóa tài khoản ${deleteModal.name}`, 'error');
            setDeleteModal({ open: false, userId: null, name: '' });
            await fetchUsers();
        } catch (err) {
            showToast(err.message || 'Thao tác thất bại', 'error');
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
        <div className="bg-[#f0f2f5] min-h-full pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-8 px-8">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#002B5B]">Quản lý người dùng</h1>
                        <p className="text-gray-500 mt-1 text-sm">Quản trị danh sách và quyền hạn thành viên.</p>
                    </div>
                </div>
            </div>

            <div className="px-8 mt-8 max-w-[1400px] mx-auto">
                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="relative group col-span-1 md:col-span-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            value={filters.q}
                            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            placeholder="Tên hoặc email..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all shadow-sm text-sm"
                        />
                    </div>
                    <CustomSelect
                        value={filters.role}
                        onChange={(val) => setFilters((p) => ({ ...p, role: val }))}
                        options={[
                            { value: "", label: "Tất cả vai trò" },
                            { value: "BUYER", label: "Người mua" },
                            { value: "SELLER", label: "Người bán" },
                            { value: "ADMIN", label: "Quản trị viên" }
                        ]}
                    />
                    <CustomSelect
                        value={filters.lock_status}
                        onChange={(val) => setFilters((p) => ({ ...p, lock_status: val }))}
                        options={[
                            { value: "", label: "Tất cả trạng thái" },
                            { value: "ACTIVE", label: "Đang hoạt động" },
                            { value: "LOCKED", label: "Đã bị khóa" }
                        ]}
                    />
                    <button
                        onClick={fetchUsers}
                        className="bg-[#002B5B] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#001f40] transition shadow-sm"
                    >
                        Lọc dữ liệu
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 text-sm">Đang tải danh sách...</div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 text-sm italic">Không tìm thấy người dùng phù hợp.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 italic font-medium">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded bg-blue-100 text-[#002B5B] flex items-center justify-center font-bold text-sm border border-blue-200">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 not-italic">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 uppercase">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${ROLE_BADGE[user.role]}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 uppercase">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${STATUS_BADGE[user.is_locked ? 'LOCKED' : 'ACTIVE']}`}>
                                                    {user.is_locked ? 'Đã khóa' : 'Hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewActivity(user.id, user.name)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem nhật ký">
                                                        <Activity size={16} />
                                                    </button>
                                                    
                                                    {user.is_locked ? (
                                                        <button disabled={actionLoading === user.id} onClick={() => handleUnlock(user.id, user.name)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Mở khóa">
                                                            <Unlock size={16} />
                                                        </button>
                                                    ) : (
                                                        <button disabled={actionLoading === user.id || user.role === 'ADMIN'} onClick={() => setLockModal({ open: true, userId: user.id, name: user.name })} className="p-2 text-amber-600 hover:bg-amber-50 rounded transition disabled:opacity-20" title="Khóa">
                                                            <Lock size={16} />
                                                        </button>
                                                    )}

                                                    <button disabled={actionLoading === user.id || user.role === 'ADMIN'} onClick={() => setDeleteModal({ open: true, userId: user.id, name: user.name })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-20" title="Xóa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal open={lockModal.open} title="Khóa tài khoản" onClose={() => setLockModal({ open: false, userId: null, name: '' })}>
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-gray-600">Nhập lý do khóa tài khoản <strong>{lockModal.name}</strong>:</p>
                    <textarea value={lockReason} onChange={(e) => setLockReason(e.target.value)} rows={4} placeholder="VD: Vi phạm điều khoản..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all text-sm" />
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setLockModal({ open: false, userId: null, name: '' })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200">Hủy</button>
                        <button onClick={handleLockConfirm} disabled={!lockReason.trim() || actionLoading} className="flex-1 py-3 bg-amber-600 text-white font-bold text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50">Xác nhận khóa</button>
                    </div>
                </div>
            </Modal>

            <Modal open={deleteModal.open} title="Xóa tài khoản" onClose={() => setDeleteModal({ open: false, userId: null, name: '' })}>
                <div className="space-y-6 pt-4 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center rounded-lg mx-auto border border-red-100">
                        <AlertTriangle size={32} />
                    </div>
                    <p className="text-sm text-gray-600 px-4">Bạn chắc chắn muốn xóa tài khoản <strong>{deleteModal.name}</strong>? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.</p>
                    <div className="flex gap-3 px-4 pb-2">
                        <button onClick={() => setDeleteModal({ open: false, userId: null, name: '' })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200">Hủy</button>
                        <button onClick={handleDeleteConfirm} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700">Xác nhận xóa</button>
                    </div>
                </div>
            </Modal>

            <Modal open={activityModal.open} title={`Lịch sử: ${activityModal.name}`} onClose={() => setActivityModal({ open: false, userId: null, name: '' })}>
                <div className="max-h-[400px] overflow-y-auto space-y-3 pt-4 pr-1">
                    {activityLoading ? (
                        <p className="text-center py-10 text-gray-400 text-sm italic">Đang tải...</p>
                    ) : activity.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 text-sm italic">Không có hoạt động nào.</p>
                    ) : (
                        activity.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-bold text-[#002B5B] uppercase">{item.action_type}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                                </div>
                                <p className="text-gray-700 text-xs font-medium">{item.action_detail}</p>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right-10 duration-500 border ${
                    toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-[#002B5B] border-[#002B5B] text-white'
                }`}>
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
