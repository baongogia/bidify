import React, { useEffect, useState } from 'react';
import { getAdminLogs, getAdminSettings, updateAdminSetting } from '../services/adminService';
import { Settings2, X, Clock, ChevronRight } from 'lucide-react';

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
const AdminSettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState({ open: false, key: '', value: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [settingsRes, logsRes] = await Promise.all([
                getAdminSettings(),
                getAdminLogs({ target_type: 'SETTING', limit: 50 })
            ]);
            if (settingsRes.success) setSettings(settingsRes.data);
            if (logsRes.success) setLogs(logsRes.data);
        } catch (err) {
            showToast(err.message || 'Không tải được thông tin hệ thống', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (item) => {
        setEditModal({ open: true, key: item.setting_key, value: item.setting_value || '', description: item.description || '' });
    };

    const handleSave = async () => {
        if (!editModal.key) return;
        setSaving(true);
        try {
            await updateAdminSetting(editModal.key, editModal.value, editModal.description || 'Cập nhật từ trang thiết lập');
            showToast(`Đã cập nhật cài đặt "${editModal.key}"`);
            setEditModal({ open: false, key: '', value: '', description: '' });
            await fetchData();
        } catch (err) {
            showToast(err.message || 'Không cập nhật được cài đặt', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thiết lập hệ thống</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý bước giá mặc định, quy tắc hệ thống và các tham số cấu hình
                    </p>
                </div>

                {/* Settings list */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Settings2 size={16} />
                            Các tham số cấu hình
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Đang tải...</div>
                    ) : settings.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Chưa có cài đặt nào</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {settings.map((item) => (
                                <div key={item.setting_key} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 font-mono">{item.setting_key}</p>
                                        {item.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                        )}
                                        <p className="text-sm text-blue-700 font-medium mt-1">{item.setting_value}</p>
                                    </div>
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition flex-shrink-0"
                                    >
                                        <ChevronRight size={13} />
                                        Sửa
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action log */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock size={16} />
                            Nhật ký thay đổi cài đặt
                        </div>
                    </div>
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Chưa có lịch sử thay đổi</div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800">{log.action_type}</p>
                                        <p className="text-xs text-gray-500">
                                            {log.admin_name} • {new Date(log.created_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                open={editModal.open}
                title={`Cập nhật: ${editModal.key}`}
                onClose={() => setEditModal({ open: false, key: '', value: '', description: '' })}
            >
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Giá trị mới</label>
                        <textarea
                            value={editModal.value}
                            onChange={(e) => setEditModal((p) => ({ ...p, value: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Mô tả (tùy chọn)</label>
                        <input
                            value={editModal.description}
                            onChange={(e) => setEditModal((p) => ({ ...p, description: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                        <button
                            onClick={() => setEditModal({ open: false, key: '', value: '', description: '' })}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminSettingsPage;
