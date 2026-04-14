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

  const roots = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);

  return (
    <div className="bg-[#f0f2f5] min-h-full pb-20">
      <div className="bg-white border-b border-gray-200 py-8 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[#002B5B]">Quản lý Danh mục</h1>
              <p className="text-gray-500 mt-1 text-sm">Cấu hình hệ thống phân loại sản phẩm trên sàn.</p>
            </div>
            
            <div className="bg-[#002B5B] text-white px-6 py-3 rounded-lg flex items-center gap-3">
              <Folder size={18} />
              <span className="text-sm font-bold">{categories.length} danh mục</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-[#002B5B]" />
              Thêm danh mục
            </h2>

            <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tên hiển thị</label>
                  <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      placeholder="VD: Xe hơi, Laptop..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#002B5B] outline-none transition-all text-sm"
                  />
              </div>

              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Danh mục cha</label>
                  <CustomSelect
                      value={newParentId}
                      onChange={setNewParentId}
                      options={[
                          { value: "", label: "Cấp cao nhất" },
                          ...roots.map((r) => ({ value: r.id, label: r.name }))
                      ]}
                  />
              </div>

              <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="w-full py-3 bg-[#002B5B] text-white font-bold text-sm rounded-lg hover:bg-[#001f40] transition-all disabled:opacity-50 mt-2"
              >
                  {creating ? 'Đang xử lý...' : 'Xác nhận thêm'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center">
                 <p className="text-gray-500 text-sm">Chưa có danh mục nào được tạo.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {roots.map((root) => (
                  <div key={root.id} className="group transition-all">
                    <div className="flex items-center gap-4 px-6 py-5 bg-white hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B5B] flex items-center justify-center border border-blue-100 shrink-0">
                          <Folder size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 leading-tight">{root.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">SLUG: {root.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditModal({
                              open: true, id: root.id, name: root.name, parentId: "", originalName: root.name
                            })
                          }
                          className="p-2 text-gray-400 hover:text-[#002B5B] hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(root.id, root.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50/50">
                      {children
                          .filter((c) => c.parent_id === root.id)
                          .map((child) => (
                          <div
                              key={child.id}
                              className="flex items-center gap-4 px-6 py-3 pl-16 border-t border-gray-100 transition-colors hover:bg-white"
                          >
                              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                  <ChevronRight size={12} strokeWidth={3} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-700">{child.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">ID: {child.id}</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                  onClick={() =>
                                  setEditModal({
                                      open: true, id: child.id, name: child.name, parentId: String(child.parent_id), originalName: child.name,
                                  })
                                  }
                                  className="p-1.5 text-gray-400 hover:text-[#002B5B] transition"
                              >
                                  <Pencil size={14} />
                              </button>
                              <button
                                  onClick={() => handleDeleteConfirm(child.id, child.name)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                              >
                                  <Trash2 size={14} />
                              </button>
                              </div>
                          </div>
                          ))}
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={editModal.open}
        title={`Chỉnh sửa danh mục`}
        onClose={() => setEditModal({ open: false, id: null, name: "", parentId: "", originalName: "" })}
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tên danh mục</label>
            <input
              value={editModal.name}
              onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#002B5B] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Danh mục cha</label>
            <CustomSelect
              value={editModal.parentId}
              onChange={(val) => setEditModal((p) => ({ ...p, parentId: val }))}
              options={[
                { value: "", label: "Cấp cao nhất" },
                ...roots
                  .filter((r) => r.id !== editModal.id)
                  .map((r) => ({ value: r.id, label: r.name }))
              ]}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditModal({ open: false, id: null, name: "", parentId: "", originalName: "" })}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleEditConfirm}
              disabled={!editModal.name.trim() || actionLoading}
              className="flex-1 py-3 bg-[#002B5B] text-white font-bold text-sm rounded-lg hover:bg-[#001f40] transition shadow-lg shadow-gray-200 disabled:opacity-50"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-3 border ${
          toast.type === 'error' ? 'bg-white border-red-200 text-red-700' : 'bg-[#002B5B] border-[#002B5B] text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <FolderOpen size={18} />}
          <p className="text-sm font-bold">{toast.msg}</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
