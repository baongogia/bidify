import React, { useEffect, useState } from 'react';
import { getAdminLogs, getAdminSettings, updateAdminSetting } from '../services/adminService';
import { Settings2, X, Clock, ChevronRight, Activity, Save } from 'lucide-react';

/* ──────────────────── Modal ──────────────────── */
const Modal = ({ open, title, children, onClose }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 z-10 border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-[#002B5B]">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
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
                getAdminLogs({ target_type: 'SETTING', limit: 30 })
            ]);
            if (settingsRes.success) setSettings(settingsRes.data);
            if (logsRes.success) setLogs(logsRes.data);
        } catch (err) {
            showToast(err.message || 'Không tải được cấu hình', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editModal.key) return;
        setSaving(true);
        try {
            await updateAdminSetting(editModal.key, editModal.value, editModal.description || 'Hệ thống');
            showToast(`Đã lưu thiết lập "${editModal.key}"`);
            setEditModal({ open: false, key: '', value: '', description: '' });
            await fetchData();
        } catch (err) {
            showToast(err.message || 'Lỗi lưu dữ liệu', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-[#f0f2f5] min-h-full pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#002B5B]">Thiết lập hệ thống</h1>
                    <p className="text-gray-500 mt-1 text-sm">Cấu hình tham số vận hành sàn đấu giá.</p>
                </div>
            </div>

            <div className="px-8 mt-8 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Settings Table */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                             <Settings2 size={16} className="text-[#002B5B]" />
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tham số cấu hình</span>
                        </div>
                        
                        {loading ? (
                            <div className="py-20 text-center text-gray-400 text-sm">Đang tải...</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {settings.map((item) => (
                                    <div key={item.setting_key} className="p-6 hover:bg-gray-50/50 transition-colors flex items-start gap-6">
                                        <div className="p-3 bg-blue-50 text-[#002B5B] rounded-lg shrink-0 border border-blue-100 italic">
                                            <Settings2 size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs font-bold text-blue-600 mb-1">{item.setting_key}</p>
                                                    <h4 className="text-base font-bold text-gray-900">{item.description || 'Cấu hình hệ thống'}</h4>
                                                </div>
                                                <button 
                                                    onClick={() => setEditModal({ open: true, key: item.setting_key, value: item.setting_value || '', description: item.description || '' })}
                                                    className="px-4 py-2 bg-[#002B5B] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-[#001f40] transition"
                                                >
                                                    Thay đổi
                                                </button>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 rounded border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Giá trị:</p>
                                                <code className="text-sm font-bold text-gray-700 font-mono break-all">{item.setting_value}</code>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="lg:col-span-4 italic">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-8">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                             <Activity size={16} className="text-[#002B5B]" />
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lịch sử thay đổi</span>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                            {logs.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 text-xs">Trống</div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-gray-800 not-italic">{log.action_type}</p>
                                            <span className="text-[9px] text-gray-400 font-bold">{new Date(log.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">"{log.action_detail}"</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase not-italic">{log.admin_name}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={editModal.open} title="Cập nhật tham số" onClose={() => setEditModal({ open: false, key: '', value: '', description: '' })}>
                <div className="space-y-4 pt-4">
                    <p className="text-sm font-bold text-[#002B5B] uppercase tracking-wide">{editModal.key}</p>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Giá trị mới</label>
                        <textarea 
                            value={editModal.value}
                            onChange={(e) => setEditModal(p => ({ ...p, value: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:border-[#002B5B] outline-none transition-all text-sm font-mono font-bold"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setEditModal({ open: false, key: '', value: '', description: '' })} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded">Hủy</button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-[#002B5B] text-white font-bold text-sm rounded hover:bg-[#001f40] flex items-center justify-center gap-2">
                            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </button>
                    </div>
                </div>
            </Modal>

            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right-10 duration-500 border ${
                    toast.type === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-[#002B5B] border-[#002B5B] text-white'
                }`}>
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
};

export default AdminSettingsPage;
