import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");

  // Render上のバックエンドURL
  const API_BASE = "https://gotoyuki-app.onrender.com";

  // ===== アイテム一覧を取得 =====
  useEffect(() => {
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
    fetchItems();
  }, []);

  // ===== 背景色ロジック =====
  const getBackgroundColor = (days) => {
    if (days === 0) return "#ffdddd";   // 赤：在庫切れ
    if (days <= 2) return "#ffe5b4";    // オレンジ：残り少ない
    return "#ddf";                      // 青：余裕あり
  };

  // ===== 通知API呼び出し =====
  const handleNotify = async () => {
    if (category.trim() === "") {
      toast.error("カテゴリー名を入力してください");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!res.ok) throw new Error("通知失敗");

      const data = await res.json();
      toast.info(data.message); // バックエンドから返ってきた通知を表示
    } catch (error) {
      toast.error("通知サーバーに接続できませんでした");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>消耗品管理アプリ</h1>

      {/* アイテム一覧表示 */}
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: getBackgroundColor(item.days),
          }}
        >
          <strong>{item.name}</strong>
          <div>{item.days === 0 ? "在庫切れ" : `あと${item.days}日`}</div>
          <div>カテゴリー: {item.category || "未分類"}</div>
        </div>
      ))}

      {/* 通知送信フォーム */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="カテゴリー名を入力"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button onClick={handleNotify}>通知送信</button>
      </div>

      {/* トースト通知のコンテナ */}
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;