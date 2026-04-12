import React, { useEffect, useState } from 'react';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/categoryService';
import { Plus, Pencil, Trash2, X, AlertTriangle, ChevronRight, Folder, FolderOpen } from 'lucide-react';

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
const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Create form
    const [newName, setNewName] = useState('');
    const [newParentId, setNewParentId] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit modal
    const [editModal, setEditModal] = useState({ open: false, id: null, name: '', parentId: '', originalName: '' });

    // Delete confirm modal
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await getCategories();
            if (res.success) setCategories(res.data);
        } catch (err) {
            showToast('Không tải được danh mục', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await createCategory(newName.trim(), newParentId ? Number(newParentId) : null);
            if (res.success) {
                showToast(`Đã thêm danh mục "${newName.trim()}"`);
                setNewName('');
                setNewParentId('');
                fetchCategories();
            }
        } catch (err) {
            showToast(err.message || 'Không thể thêm danh mục', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleEditConfirm = async () => {
        if (!editModal.name.trim()) return;
        setActionLoading(true);
        try {
            const res = await updateCategory(
                editModal.id,
                editModal.name.trim(),
                editModal.parentId ? Number(editModal.parentId) : null
            );
            if (res.success) {
                showToast(`Đã cập nhật danh mục "${editModal.name.trim()}"`);
                setEditModal({ open: false, id: null, name: '', parentId: '', originalName: '' });
                fetchCategories();
            }
        } catch (err) {
            showToast(err.message || 'Không thể cập nhật danh mục', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setActionLoading(true);
        try {
            const res = await deleteCategory(deleteModal.id);
            if (res.success) {
                showToast(`Đã xóa danh mục "${deleteModal.name}"`);
                setDeleteModal({ open: false, id: null, name: '' });
                fetchCategories();
            }
        } catch (err) {
            showToast(err.message || 'Không thể xóa danh mục', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Build hierarchical view: roots first, then their children
    const roots = categories.filter((c) => !c.parent_id);
    const children = categories.filter((c) => c.parent_id);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
                    <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa danh mục sản phẩm và danh mục con</p>
                </div>

                {/* Add form */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Thêm danh mục mới</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="Tên danh mục..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <select
                            value={newParentId}
                            onChange={(e) => setNewParentId(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Danh mục gốc (không có cha)</option>
                            {roots.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCreate}
                            disabled={!newName.trim() || creating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Plus size={16} />
                            Thêm
                        </button>
                    </div>
                </div>

                {/* Category list */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Đang tải...</div>
                    ) : categories.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Chưa có danh mục nào</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {roots.map((root) => (
                                <React.Fragment key={root.id}>
                                    {/* Root category */}
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                                        <Folder size={16} className="text-amber-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">{root.name}</p>
                                            <p className="text-xs text-gray-400">slug: {root.slug}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setEditModal({ open: true, id: root.id, name: root.name, parentId: '', originalName: root.name })}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                                            >
                                                <Pencil size={12} /> Sửa
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, id: root.id, name: root.name })}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                            >
                                                <Trash2 size={12} /> Xóa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Children of this root */}
                                    {children
                                        .filter((c) => c.parent_id === root.id)
                                        .map((child) => (
                                            <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 pl-10">
                                                <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                                                <FolderOpen size={14} className="text-blue-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800">{child.name}</p>
                                                    <p className="text-xs text-gray-400">slug: {child.slug}</p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => setEditModal({ open: true, id: child.id, name: child.name, parentId: String(child.parent_id), originalName: child.name })}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                                                    >
                                                        <Pencil size={12} /> Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, id: child.id, name: child.name })}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        <Trash2 size={12} /> Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </React.Fragment>
                            ))}

                            {/* Orphan children (parent deleted) */}
                            {children
                                .filter((c) => !roots.find((r) => r.id === c.parent_id))
                                .map((child) => (
                                    <div key={child.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <FolderOpen size={14} className="text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700">{child.name}</p>
                                            <p className="text-xs text-gray-400">slug: {child.slug} • Con của: #{child.parent_id}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setEditModal({ open: true, id: child.id, name: child.name, parentId: String(child.parent_id), originalName: child.name })}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                                            >
                                                <Pencil size={12} /> Sửa
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, id: child.id, name: child.name })}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                            >
                                                <Trash2 size={12} /> Xóa
                                            </button>
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
                title={`Chỉnh sửa: "${editModal.originalName}"`}
                onClose={() => setEditModal({ open: false, id: null, name: '', parentId: '', originalName: '' })}
            >
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Tên danh mục</label>
                        <input
                            value={editModal.name}
                            onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Danh mục cha</label>
                        <select
                            value={editModal.parentId}
                            onChange={(e) => setEditModal((p) => ({ ...p, parentId: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Danh mục gốc (không có cha)</option>
                            {roots
                                .filter((r) => r.id !== editModal.id) // can't be own parent
                                .map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                        <button
                            onClick={() => setEditModal({ open: false, id: null, name: '', parentId: '', originalName: '' })}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleEditConfirm}
                            disabled={!editModal.name.trim() || actionLoading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                open={deleteModal.open}
                title="Xác nhận xóa danh mục"
                onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
            >
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-gray-700">
                        Bạn có chắc muốn xóa danh mục <strong>"{deleteModal.name}"</strong>? Các danh mục con và sản phẩm liên quan có thể bị ảnh hưởng.
                    </p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={actionLoading}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        Xóa danh mục
                    </button>
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

export default AdminCategoriesPage;
