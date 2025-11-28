import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");

  // Render上のバックエンドURL
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

  // ===== 背景色ロジック =====
  const getBackgroundColor = (days) => {
    if (days == null) return "#ddf"; // データなしは青
    if (days <= 0) return "#ffdddd"; // 赤：在庫切れ
    if (days <= 3) return "#ffe5b4"; // オレンジ：残り少ない
    return "#ddf";                   // 青：余裕あり
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
      fetchItems(); // 更新後に再取得
    } catch (error) {
      toast.error("在庫更新に失敗しました");
    }
  };

  // ===== 通知API呼び出し =====
  const handleNotify = async () => {
    try {
      const res = await fetch(`${API_BASE}/notify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("通知失敗");
      toast.info("通知を送信しました");
    } catch (error) {
      toast.error("通知サーバーに接続できませんでした");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>消耗品管理アプリ</h1>

      {/* アイテム一覧表示 */}
      {items.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: getBackgroundColor(item.estimatedDaysLeft),
          }}
        >
          <strong>{item.name}</strong>
          <div>残数: {item.quantity}</div>
          <div>
            {item.estimatedDaysLeft == null
              ? "残日数未計算"
              : `あと${item.estimatedDaysLeft.toFixed(1)}日`}
          </div>
          <div>カテゴリー: {item.category || "未分類"}</div>

          {/* ＋／－ボタン */}
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => updateQuantity(item._id, +1)}>＋購入</button>
            <button onClick={() => updateQuantity(item._id, -1)}>－消費</button>
          </div>
        </div>
      ))}

      {/* 通知送信ボタン */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleNotify}>通知送信</button>
      </div>

      {/* トースト通知のコンテナ */}
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
}

export default App;