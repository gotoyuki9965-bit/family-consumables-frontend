import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const API_BASE = "https://gotoyuki-app.onrender.com";

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");

  // 各アイテムごとの一時更新値（入力、+1、-1、確定のため）
  const [pendingChanges, setPendingChanges] = useState({});

  // 新規追加フォーム表示
  const [showAddForm, setShowAddForm] = useState(false);
  // 新規追加フィールド
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategorySelect, setNewCategorySelect] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // ===== API: アイテム一覧 =====
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items${filter ? `?category=${encodeURIComponent(filter)}` : ""}`);
      if (!res.ok) throw new Error("アイテム取得失敗");
      const data = await res.json();
      setItems(data);
      // 初期のpending値は0に
      const init = {};
      data.forEach(i => { init[i._id] = 0; });
      setPendingChanges(init);
    } catch (error) {
      toast.error("アイテム一覧を取得できませんでした");
    }
  };

  // ===== API: カテゴリー一覧 =====
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error("カテゴリー取得失敗");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("カテゴリー一覧を取得できませんでした");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [filter]);

  // ===== 新規アイテム追加 =====
  const addItem = async () => {
    const categoryFinal = (newCategoryInput && newCategoryInput.trim().length > 0)
      ? newCategoryInput.trim()
      : newCategorySelect;

    if (!newName || !newQuantity || !categoryFinal) {
      toast.error("名前・個数・カテゴリーを入力または選択してください");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          quantity: Number(newQuantity),
          category: categoryFinal,
        }),
      });
      if (!res.ok) throw new Error("追加失敗");
      await res.json();
      toast.success("新しい消耗品を追加しました");
      setNewName("");
      setNewQuantity("");
      setNewCategorySelect("");
      setNewCategoryInput("");
      setShowAddForm(false);
      fetchItems();
      fetchCategories();
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  // ===== 在庫数更新（入力、＋1、－1、確定） =====
  const setChangeForItem = (id, value) => {
    setPendingChanges(prev => ({ ...prev, [id]: value }));
  };

  const bumpChange = (id, delta) => {
    setPendingChanges(prev => ({ ...prev, [id]: (prev[id] || 0) + delta }));
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
    } catch (error) {
      toast.error("在庫更新に失敗しました");
    }
  };

  // ===== ちょっとおしゃれなスタイル =====
  const styles = {
    page: { padding: "20px", fontFamily: "Segoe UI, Arial, sans-serif", backgroundColor: "#f6f7fb", minHeight: "100vh" },
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
    filterSelect: { padding: "8px 10px", borderRadius: "8px", border: "1px solid #d0d4dd", background: "#fff", color: "#333" },
    addBtn: { backgroundColor: "#4CAF50", color: "#fff", padding: "10px 14px", border: "none", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", cursor: "pointer" },
    card: { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", marginBottom: "14px", padding: "14px" },
    itemName: { fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "6px" },
    qtyBadge: (qty) => ({
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "6px",
      fontWeight: 600,
      color: qty === 0 ? "#fff" : qty <= 1 ? "#b91c1c" : "#111827",
      backgroundColor: qty === 0 ? "#ef4444" : "#eef2ff",
      marginRight: "8px"
    }),
    etaText: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
    catText: { color: "#374151", fontSize: "14px", marginTop: "4px" },
    inputSmall: { width: "72px", padding: "6px 8px", borderRadius: "8px", border: "1px solid #d1d5db", marginRight: "8px" },
    btnPlus: { padding: "6px 10px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", marginRight: "6px", cursor: "pointer" },
    btnMinus: { padding: "6px 10px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", marginRight: "6px", cursor: "pointer" },
    btnConfirm: { padding: "6px 10px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", cursor: "pointer" },
    addForm: { background: "#fff", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", padding: "14px", marginTop: "10px" },
    addInput: { width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "10px" },
    addRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" },
    addRow3: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    addSelect: { width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" },
    addBtnPrimary: { background: "#2563eb", color: "#fff", padding: "10px 12px", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "8px" },
    addBtnSecondary: { background: "#6b7280", color: "#fff", padding: "10px 12px", border: "none", borderRadius: "8px", cursor: "pointer" }
  };

  return (
    <div style={styles.page}>
      <h1 style={{ textAlign: "center", color: "#111827", marginBottom: "12px" }}>📦 消耗品管理アプリ</h1>

      {/* フィルタ + 新規追加ボタン（隣） */}
      <div style={styles.headerRow}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect}>
          <option value="">すべて</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={() => setShowAddForm(true)}>➕ 新しい消耗品追加</button>
      </div>

      {/* アイテム一覧 */}
      {items.map((item) => (
        <div key={item._id} style={styles.card}>
          <div style={styles.itemName}>{item.name}</div>
          <div>
            <span style={styles.qtyBadge(item.quantity)}>残数: {item.quantity}</span>
          </div>
          <div style={styles.etaText}>
            {item.estimatedDaysLeft == null
              ? "残日数未計算"
              : `あと${item.estimatedDaysLeft.toFixed(1)}日`}
          </div>
          <div style={styles.catText}>カテゴリー: {item.category}</div>

          {/* 数量更新UI（入力、＋1、－1、確定） */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              value={pendingChanges[item._id] ?? 0}
              onChange={(e) => setChangeForItem(item._id, Number(e.target.value))}
              style={styles.inputSmall}
            />
            <button style={styles.btnPlus} onClick={() => bumpChange(item._id, +1)}>＋1</button>
            <button style={styles.btnMinus} onClick={() => bumpChange(item._id, -1)}>－1</button>
            <button style={styles.btnConfirm} onClick={() => confirmUpdate(item._id)}>確定</button>
          </div>
        </div>
      ))}

      {/* 新規追加フォーム（モーダル風にカードを表示） */}
      {showAddForm && (
        <div style={styles.addForm}>
          <div style={styles.addRow}>
            <input
              type="text"
              placeholder="名前"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={styles.addInput}
            />
            <input
              type="number"
              placeholder="個数"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              style={styles.addInput}
            />
          </div>

          {/* カテゴリーは選択 + 入力（入力が優先される） */}
          <div style={styles.addRow3}>
            <select
              value={newCategorySelect}
              onChange={(e) => setNewCategorySelect(e.target.value)}
              style={styles.addSelect}
            >
              <option value="">カテゴリー選択（既存）</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="新規カテゴリーを入力（任意）"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              style={styles.addInput}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <button style={styles.addBtnPrimary} onClick={addItem}>追加</button>
            <button style={styles.addBtnSecondary} onClick={() => setShowAddForm(false)}>キャンセル</button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-center" autoClose={2500} />
    </div>
  );
}

export default App;