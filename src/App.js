import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const API_BASE = "https://gotoyuki-app.onrender.com";

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [updateValue, setUpdateValue] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // ===== アイテム一覧を取得 =====
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items${filter ? `?category=${filter}` : ""}`);
      if (!res.ok) throw new Error("アイテム取得失敗");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error("アイテム一覧を取得できませんでした");
    }
  };

  // ===== カテゴリー一覧を取得 =====
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
    if (!newName || !newQuantity || !newCategory) {
      toast.error("名前・個数・カテゴリーを入力してください");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          quantity: Number(newQuantity),
          category: newCategory,
        }),
      });
      if (!res.ok) throw new Error("追加失敗");
      await res.json();
      toast.success("新しい消耗品を追加しました");
      setNewName("");
      setNewQuantity("");
      setNewCategory("");
      setShowAddForm(false);
      fetchItems();
      fetchCategories();
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  // ===== 在庫数更新 =====
  const updateQuantity = async (id, change) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change }),
      });
      if (!res.ok) throw new Error("数量更新失敗");
      await res.json();
      toast.success("在庫を更新しました");
      setUpdateValue(0);
      fetchItems();
    } catch (error) {
      toast.error("在庫更新に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>消耗品管理アプリ</h1>

      {/* カテゴリーフィルタ */}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">すべて</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* アイテム一覧 */}
      {items.map((item) => (
        <div key={item._id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <strong>{item.name}</strong>
          <div style={{
            color: item.quantity <= 1 ? "red" : "black",
            backgroundColor: item.quantity === 0 ? "red" : "transparent",
            fontWeight: item.quantity <= 1 ? "bold" : "normal"
          }}>
            残数: {item.quantity}
          </div>
          <div>
            {item.estimatedDaysLeft == null
              ? "残日数未計算"
              : `あと${item.estimatedDaysLeft.toFixed(1)}日`}
          </div>
          <div>カテゴリー: {item.category}</div>

          {/* 数量更新UI */}
          <input
            type="number"
            value={updateValue}
            onChange={(e) => setUpdateValue(Number(e.target.value))}
            style={{ width: "60px", marginRight: "5px" }}
          />
          <button onClick={() => setUpdateValue(updateValue + 1)}>＋1</button>
          <button onClick={() => setUpdateValue(updateValue + 5)}>＋5</button>
          <button onClick={() => setUpdateValue(updateValue + 10)}>＋10</button>
          <button onClick={() => updateQuantity(item._id, updateValue)}>確定</button>
        </div>
      ))}

      {/* 新規追加ボタン */}
      <button onClick={() => setShowAddForm(true)}>➕ 新しい消耗品追加</button>
      {showAddForm && (
        <div style={{ border: "1px solid #000", padding: "10px", marginTop: "10px" }}>
          <input
            type="text"
            placeholder="名前"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            placeholder="個数"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="">カテゴリー選択</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={addItem}>追加</button>
          <button onClick={() => setShowAddForm(false)}>キャンセル</button>
        </div>
      )}

      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
}

export default App;