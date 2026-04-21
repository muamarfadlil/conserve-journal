"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
}

type UsersTableProps = {
  users: User[]
  currentUserId: string
}

const ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const
const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
}
const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-red-900/30 text-red-300 border-red-700",
  ADMIN: "bg-ocean-800 text-ocean-300 border-ocean-600",
  USER: "bg-ocean-900 text-ocean-500 border-ocean-700",
}

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-ocean-900 border border-ocean-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-ocean-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ocean-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "USER" as string })
  const [editForm, setEditForm] = useState({ name: "", role: "USER" as string, isActive: true, password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const inputCls = "w-full px-3 py-2 bg-ocean-800 border border-ocean-700 rounded-lg text-white text-sm placeholder-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
  const labelCls = "block text-xs text-ocean-400 mb-1"

  function openEdit(user: User) {
    setEditForm({ name: user.name, role: user.role, isActive: user.isActive, password: "" })
    setError("")
    setEditModal({ open: true, user })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Gagal membuat pengguna"); return }
    setCreateModal(false)
    setCreateForm({ name: "", email: "", password: "", role: "USER" })
    router.refresh()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editModal.user) return
    setError("")
    setLoading(true)
    const body: Record<string, unknown> = { name: editForm.name, role: editForm.role, isActive: editForm.isActive }
    if (editForm.password) body.password = editForm.password
    const res = await fetch(`/api/users?id=${editModal.user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Gagal memperbarui pengguna"); return }
    setEditModal({ open: false, user: null })
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteModal.user) return
    setLoading(true)
    const res = await fetch(`/api/users?id=${deleteModal.user.id}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      setDeleteModal({ open: false, user: null })
      router.refresh()
    }
  }

  async function toggleActive(user: User) {
    await fetch(`/api/users?id=${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    router.refresh()
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setError(""); setCreateModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-ocean-950 text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      <div className="bg-ocean-900 border border-ocean-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ocean-800">
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Peran</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Terdaftar</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-ocean-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-ocean-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${ROLE_COLOR[user.role]}`}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ocean-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => user.id !== currentUserId && toggleActive(user)}
                      disabled={user.id === currentUserId}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors
                        ${user.isActive
                          ? "bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50"
                          : "bg-ocean-900 text-ocean-500 border-ocean-700 hover:bg-ocean-800"
                        } ${user.id === currentUserId ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 text-ocean-400 hover:text-white hover:bg-ocean-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createModal} title="Tambah Pengguna Baru" onClose={() => setCreateModal(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">{error}</div>}
          <div>
            <label className={labelCls}>Nama Lengkap *</label>
            <input className={inputCls} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Nama lengkap" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" className={inputCls} value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required placeholder="email@domain.com" />
          </div>
          <div>
            <label className={labelCls}>Password * (min. 8 karakter)</label>
            <input type="password" className={inputCls} value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} required placeholder="••••••••" />
          </div>
          <div>
            <label className={labelCls}>Peran *</label>
            <select className={inputCls} value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-ocean-950 font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Membuat..." : "Buat Pengguna"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.open} title="Edit Pengguna" onClose={() => setEditModal({ open: false, user: null })}>
        <form onSubmit={handleEdit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">{error}</div>}
          <div>
            <label className={labelCls}>Nama Lengkap *</label>
            <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className={labelCls}>Peran *</label>
            <select className={inputCls} value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded bg-ocean-800 border-ocean-700" />
            <label htmlFor="isActive" className="text-sm text-ocean-300">Akun aktif</label>
          </div>
          <div>
            <label className={labelCls}>Password baru (kosongkan jika tidak diubah)</label>
            <input type="password" className={inputCls} value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditModal({ open: false, user: null })} className="px-4 py-2 text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-ocean-950 font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal.open} title="Hapus Pengguna" onClose={() => setDeleteModal({ open: false, user: null })}>
        <p className="text-ocean-300 text-sm mb-1">Pengguna berikut akan dihapus secara permanen:</p>
        <div className="p-3 bg-ocean-800 rounded-lg mb-6">
          <p className="text-white font-medium text-sm">{deleteModal.user?.name}</p>
          <p className="text-ocean-500 text-xs">{deleteModal.user?.email}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal({ open: false, user: null })} className="px-4 py-2 text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors">Batal</button>
          <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </>
  )
}
