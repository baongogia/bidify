import React, { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoryService";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Folder,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { useModal } from '../context/ModalContext';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';

/* ──────────────────── Page ──────────────────── */
const AdminCategoriesPage = () => {
  const { showAlert, showConfirm } = useModal();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    name: "",
    parentId: "",
    originalName: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      showToast("Không tải được danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createCategory(
        newName.trim(),
        newParentId ? Number(newParentId) : null,
      );
      if (res.success) {
        showToast(`Đã thêm danh mục "${newName.trim()}"`);
        setNewName("");
        setNewParentId("");
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message || "Không thể thêm danh mục", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async (id, name) => {
    const confirmed = await showConfirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa danh mục "${name}"? Các danh mục con sẽ bị tách rời.`
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        showAlert("Thành công", `Đã xóa danh mục "${name}"`);
        fetchCategories();
      }
    } catch (err) {
      showAlert("Lỗi", err.message || "Không thể xóa danh mục");
    } finally {
      setActionLoading(false);
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
        setEditModal({ open: false, id: null, name: "", parentId: "", originalName: "" });
        showAlert("Thành công", `Đã cập nhật danh mục thành "${editModal.name.trim()}"`);
        fetchCategories();
      }
    } catch (err) {
      showAlert("Lỗi", err.message || "Không thể cập nhật danh mục");
    } finally {
      setActionLoading(false);
    }
  };

  // Build hierarchical view: roots first, then their children
  const roots = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);

  return (
    <div className="py-12 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý danh mục</h1>
            <p className="text-gray-500 mt-1">Cấu hình cây danh mục cho toàn bộ sàn đấu giá</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Folder size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">Tổng số danh mục</p>
                <p className="text-lg font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="text-blue-600" size={20} /> Thêm danh mục mới
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Tên danh mục</label>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="VD: Điện thoại, Đồ cổ..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium"
                />
            </div>
            <div className="md:col-span-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Danh mục cha</label>
                <CustomSelect
                    value={newParentId}
                    onChange={setNewParentId}
                    options={[
                        { value: "", label: "Danh mục gốc" },
                        ...roots.map((r) => ({ value: r.id, label: r.name }))
                    ]}
                />
            </div>
            <div className="md:col-span-3 flex items-end">
                <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || creating}
                    className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                    {creating ? 'Đang tạo...' : 'Tạo mới'}
                </button>
            </div>
          </div>
        </div>

        {/* Category list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Đang tải...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Chưa có danh mục nào
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {roots.map((root) => (
                <div key={root.id} className="group transition-all">
                  {/* Root category */}
                  <div className="flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Folder size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-bold text-gray-900">
                        {root.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">slug/{root.slug}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setEditModal({
                            open: true,
                            id: root.id,
                            name: root.name,
                            parentId: "",
                            originalName: root.name,
                          })
                        }
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(root.id, root.name)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Children of this root */}
                  <div className="bg-gray-50/30">
                    {children
                        .filter((c) => c.parent_id === root.id)
                        .map((child) => (
                        <div
                            key={child.id}
                            className="flex items-center gap-4 px-6 py-3 pl-16 border-t border-gray-100 group/child transition-colors hover:bg-white"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <ChevronRight size={14} strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-gray-800">{child.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">
                                SLUG/{child.slug}
                            </p>
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover/child:opacity-100 transition-opacity">
                            <button
                                onClick={() =>
                                setEditModal({
                                    open: true,
                                    id: child.id,
                                    name: child.name,
                                    parentId: String(child.parent_id),
                                    originalName: child.name,
                                })
                                }
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => handleDeleteConfirm(child.id, child.name)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
              ))}

              {/* Orphan children (parent deleted) */}
              {children
                .filter((c) => !roots.find((r) => r.id === c.parent_id))
                .map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <FolderOpen
                      size={14}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{child.name}</p>
                      <p className="text-xs text-gray-400">
                        slug: {child.slug} • Con của: #{child.parent_id}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setEditModal({
                            open: true,
                            id: child.id,
                            name: child.name,
                            parentId: String(child.parent_id),
                            originalName: child.name,
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                      >
                        <Pencil size={12} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(child.id, child.name)}
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
        onClose={() =>
          setEditModal({
            open: false,
            id: null,
            name: "",
            parentId: "",
            originalName: "",
          })
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Tên danh mục
            </label>
            <input
              value={editModal.name}
              onChange={(e) =>
                setEditModal((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Danh mục cha
            </label>
            <CustomSelect
              value={editModal.parentId}
              onChange={(val) =>
                setEditModal((p) => ({ ...p, parentId: val }))
              }
              options={[
                { value: "", label: "Danh mục gốc" },
                ...roots
                  .filter((r) => r.id !== editModal.id)
                  .map((r) => ({ value: r.id, label: r.name }))
              ]}
              placeholder="Danh mục gốc"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() =>
                setEditModal({
                  open: false,
                  id: null,
                  name: "",
                  parentId: "",
                  originalName: "",
                })
              }
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 border flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-900 border-gray-800 text-white'
        }`}>
          {toast.type === 'error' && <AlertTriangle size={18} />}
          <p className="text-sm font-bold">{toast.msg}</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
