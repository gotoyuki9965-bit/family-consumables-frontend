import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const API_BASE = "https://gotoyuki-app.onrender.com";

  // ===== アイテム一覧を取得 =====
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("アイテム取得失敗");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error("アイテム一覧を取得できませんでした");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
      fetchItems();
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  // ===== 在庫数更新（＋／－） =====
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
      fetchItems();
    } catch (error) {
      toast.error("在庫更新に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>消耗品管理アプリ</h1>

      {/* アイテム一覧 */}
      {items.map((item) => (
        <div key={item._id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <strong>{item.name}</strong>
          <div>残数: {item.quantity}</div>
          <div>
            {item.estimatedDaysLeft == null
              ? "残日数未計算"
              : `あと${item.estimatedDaysLeft.toFixed(1)}日`}
          </div>
          <div>カテゴリー: {item.category}</div>
          <button onClick={() => updateQuantity(item._id, +1)}>＋購入</button>
          <button onClick={() => updateQuantity(item._id, -1)}>－消費</button>
        </div>
      ))}

      {/* 新規追加フォーム */}
      <h2>新しい消耗品を追加</h2>
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
      <input
        type="text"
        placeholder="カテゴリー"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button onClick={addItem}>追加</button>

      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
}

export default App;