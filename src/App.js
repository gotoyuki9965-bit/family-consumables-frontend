import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const API_BASE = "https://gotoyuki-app.onrender.com";

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");

  const [pendingChanges, setPendingChanges] = useState({});

  // モーダル制御
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  // 新規追加フィールド
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategorySelect, setNewCategorySelect] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // 削除フィールド
  const [deleteName, setDeleteName] = useState("");

  // ===== データ取得 =====
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items${filter ? `?category=${encodeURIComponent(filter)}` : ""}`);
      if (!res.ok) throw new Error("アイテム取得失敗");
      const data = await res.json();
      setItems(data);
      const init = {};
      data.forEach((i) => { init[i._id] = 0; });
      setPendingChanges(init);
    } catch {
      toast.error("アイテム一覧を取得できませんでした");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error("カテゴリー取得失敗");
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("カテゴリー一覧を取得できませんでした");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [filter]);

  // ===== 新規追加 =====
  const addItem = async () => {
    const categoryFinal = newCategoryInput.trim() ? newCategoryInput.trim() : newCategorySelect;
    if (!newName || !newQuantity || !categoryFinal) {
      toast.error("名前・個数・カテゴリーを入力してください");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          quantity: Number(newQuantity),
          category: categoryFinal
        }),
      });
      if (!res.ok) throw new Error("追加失敗");
      await res.json();
      toast.success("新しい消耗品を追加しました");
      setNewName(""); setNewQuantity(""); setNewCategorySelect(""); setNewCategoryInput("");
      setShowAddForm(false);
      fetchItems();
      fetchCategories();
    } catch {
      toast.error("追加に失敗しました");
    }
  };

  // ===== 削除 =====
  const deleteItem = async () => {
    if (!deleteName.trim()) {
      toast.error("削除する名前を入力してください");
      return;
    }
    try {
      const target = items.find((i) => i.name === deleteName.trim());
      if (!target) {
        toast.error("該当アイテムが見つかりません");
        return;
      }
      const res = await fetch(`${API_BASE}/items/${target._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除失敗");
      toast.success("消耗品を削除しました");
      setDeleteName("");
      setShowDeleteForm(false);
      fetchItems();
      fetchCategories();
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  // ===== 在庫更新 =====
  const setChangeForItem = (id, value) => {
    setPendingChanges((prev) => ({ ...prev, [id]: value }));
  };
  const bumpChange = (id, delta) => {
    setPendingChanges((prev) => ({ ...prev, [id]: (prev[id] || 0) + delta }));
  };
  const confirmUpdate = async (id) => {
    const change = Number(pendingChanges[id] || 0);
    if (!Number.isFinite(change) || change === 0) {
      toast.info("変更量が0です");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/items/${id}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change }),
      });
      if (!res.ok) throw new Error("数量更新失敗");
      await res.json();
      toast.success("在庫を更新しました");
      setChangeForItem(id, 0);
      fetchItems();
    } catch {
      toast.error("在庫更新に失敗しました");
    }
  };

  // ===== スタイル =====
  const styles = {
    page: { padding: "20px", fontFamily: "Segoe UI, Arial, sans-serif", backgroundColor: "#f6f7fb", minHeight: "100vh" },
    header: { textAlign: "center", color: "#111827", marginBottom: "12px" },
    topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    filterSelect: { padding: "8px", borderRadius: "10spx", border: "1px solid #d1d5db", background: "#fff" },
    actionBtn: (bg) => ({ background: bg, color: "#fff", padding: "10px 15px", border: "none", borderRadius: "8px", marginLeft: "10px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }),
    card: { background: "#fff", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", marginBottom: "14px", padding: "14px" },
    itemName: { fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "6px" },
    qtyBadge: (qty) => ({
      display: "inline-block",
      padding: "8px 14spx",
      borderRadius: "6px",
      fontWeight: 600,
      color: qty === 0 ? "#fff" : qty <= 1 ? "#b91c1c" : "#111827",
      backgroundColor: qty === 0 ? "#ef4444" : "#eef2ff",
      marginRight: "8px"
    }),
    etaText: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
    catText: { color: "#374151", fontSize: "14px", marginTop: "4px" },
    inputSmall: { width: "72px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", marginRight: "8px" },
    btnPlus: { padding: "8px 12px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", marginRight: "6px", cursor: "pointer" },
    btnMinus: { padding: "8px 12px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", marginRight: "6px", cursor: "pointer" },
    btnConfirm: { padding: "8px 12px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", cursor: "pointer" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 999 },
    modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.2)", zIndex: 1000, width: "320px" },
    modalInput: { width: "80%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "10px" },
    modalRow: { display: "flex", justifyContent: "space-between" }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>📦 消耗品管理アプリ</h1>

      {/* フィルタ + 新規追加 + 削除ボタン（右並び） */}
      <div style={styles.topRow}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">すべて</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div>
          <button
            onClick={() => setShowAddForm(true)}
            style={styles.actionBtn("#4CAF50")}
          >
            ➕ 新規追加
          </button>
          <button
            onClick={() => setShowDeleteForm(true)}
            style={styles.actionBtn("#EF4444")}
          >
            🗑️ 項目削除
          </button>
        </div>
      </div>

      {/* アイテム一覧 */}
      {items.map((item) => (
        <div key={item._id} style={styles.card}>
          <div style={styles.itemName}>{item.name}</div>
          <div>
            <span style={styles.qtyBadge(item.quantity)}>
              残数: {item.quantity}
            </span>
          </div>
          <div style={styles.etaText}>
            {item.estimatedDaysLeft == null
              ? "残日数未計算"
              : `あと${item.estimatedDaysLeft.toFixed(1)}日`}
          </div>
          <div style={styles.catText}>カテゴリー: {item.category}</div>

          {/* 数量更新（入力、＋1、－1、確定） */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              value={pendingChanges[item._id] ?? 0}
              onChange={(e) =>
                setChangeForItem(item._id, Number(e.target.value))
              }
              style={styles.inputSmall}
            />
            <button
              style={styles.btnPlus}
              onClick={() => bumpChange(item._id, +1)}
            >
              ＋1
            </button>
            <button
              style={styles.btnMinus}
              onClick={() => bumpChange(item._id, -1)}
            >
              －1
            </button>
            <button
              style={styles.btnConfirm}
              onClick={() => confirmUpdate(item._id)}
            >
              確定
            </button>
          </div>
        </div>
      ))}

      {/* 新規追加モーダル（ポップアップ） */}
      {showAddForm && (
        <>
          <div style={styles.overlay} onClick={() => setShowAddForm(false)} />
          <div style={styles.modal}>
            <h3>新規消耗品を追加</h3>
            <input
              type="text"
              placeholder="名前"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={styles.modalInput}
            />
            <input
              type="number"
              placeholder="個数"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              style={styles.modalInput}
            />
            <select
              value={newCategorySelect}
              onChange={(e) => setNewCategorySelect(e.target.value)}
              style={styles.modalInput}
            >
              <option value="">カテゴリー選択（既存）</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="新規カテゴリーを入力（任意）"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalRow}>
              <button onClick={addItem} style={styles.actionBtn("#2563eb")}>
                追加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={styles.actionBtn("#6b7280")}
              >
                キャンセル
              </button>
            </div>
          </div>
        </>
      )}

      {/* 削除モーダル（ポップアップ：名前入力→確定） */}
      {showDeleteForm && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowDeleteForm(false)}
          />
          <div style={styles.modal}>
            <h3>消耗品を削除</h3>
            <input
              type="text"
              placeholder="削除する名前を入力"
              value={deleteName}
              onChange={(e) => setDeleteName(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalRow}>
              <button onClick={deleteItem} style={styles.actionBtn("#ef4444")}>
                削除
              </button>
              <button
                onClick={() => setShowDeleteForm(false)}
                style={styles.actionBtn("#6b7280")}
              >
                キャンセル
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="bottom-center" autoClose={2500} />
    </div>
  );
}

export default App;