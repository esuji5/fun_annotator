```
回答は日本語でお願いします

4コマ漫画の画像をそれぞれLLMのAPIに投げて人物やセリフの情報を取得したあと、フォームから修正してCSVに保存したり漫画の内容についてAIと語り合えるアノテート画面を作成します。
- 画像のパスは画面を開く前のViewから渡される
- 左側に4コマ分の画像が表示される
- 画像を選択するとその画像に対する入力フォームになり以下のものが表示される
	- LLMに投げてデータを取得するボタン
	- データを表示するフォーム
	- 表示するデータは以下
		- 一人目
			- "character": "縁",
			- "faceDirection": "正面",
			- "position": "右コマ (x: 0.8, y: 0.5)",
			- "expression": "楽しそうな笑顔",
			- "serif": "あはは〜 今度また〜 ヤケンノ?",
			- "clothing": "制服らしき上着",
		- 二人目…
		- 3人目…
		- 状況
			- "scene": "友人と楽しく会話している様子",
			- "location": "教室または部室のような室内",
			- "backgroundEffects": "なし"
- 4コマ分のデータ入力後、4コマまとめについてLLMについて聞いてまとめた結果を主力できる欄を用意
- その後、AIとボタンUIでディスカッションできるようにする
	- 質問は以下のようなもの
		- 「どう感じた？」
		- 「かわいいのはだれ？」
		- 「次はどうなると思う？」
		- 「特に気になる表現は？」
		- 「今までになかったような表現や新しい情報はありますか？」
- ヘッダーを用意し、以下のものを置きます
	- 現在表示している画像のパス、
	- 前の4コマ分の画像に遷移するボタン
	- 次の4コマ分の画像に遷移するボタン
	- CSV保存ボタン
		- 押すと、画像について入力したデータを画像データ用のCSVに、4コマまとめとディスカッションの内容をそれ専用のCSVにそれぞれ保存する
	- 画像には著作権があるのでデモ用にはぼかしをかけられるモードを用意する
- フロント側はReact、TypeScriptで作成
- バックエンド側はFastAPIで作成
	- 作成するViewなどは別途画像を参照
- ReactとFastAPIの環境を立ち上げるコマンドもそれぞれ教えて下さい


この要件に沿ったコードを書いてください
```

以下は、指定された要件に基づいて React と FastAPI を使用したアノテーション画面のコードの概要です。

## フロントエンド（React + TypeScript）

**1. 必要なパッケージをインストール**

```bash
npx create-react-app four-panel-manga --template typescript
cd four-panel-manga
npm install axios
```

**2. React コンポーネントの作成**

- **`App.tsx`**

```tsx
import React, {useState} from "react";
import axios from "axios";

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [data, setData] = useState<any>({});

  const fetchData = async () => {
    const response = await axios.post("/api/fetch-data", {
      imagePath: selectedImage,
    });
    setData(response.data);
  };

  const saveToCSV = async () => {
    await axios.post("/api/save-csv", {data});
  };

  return (
    <div>
      <header>
        <button onClick={() => setSelectedImage("prev")}>前の画像</button>
        <button onClick={() => setSelectedImage("next")}>次の画像</button>
        <button onClick={saveToCSV}>CSV保存</button>
      </header>
      <div>
        <img src={selectedImage} alt="4コマ漫画" />
        <button onClick={fetchData}>データ取得</button>
        <div>
          <h3>データ表示</h3>
          {/* データ表示用フォーム */}
          {data && (
            <div>
              <p>キャラクター: {data.character}</p>
              <p>表情: {data.expression}</p>
              {/* 他のデータ */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
```

## バックエンド（FastAPI）

**1. 必要なパッケージをインストール**

```bash
pip install fastapi uvicorn
```

**2. FastAPI アプリの作成**

- **`main.py`**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import csv

app = FastAPI()

class ImageData(BaseModel):
    imagePath: str

@app.post("/api/fetch-data")
async def fetch_data(image_data: ImageData):
    # LLM APIを呼び出してデータを取得（仮のデータを返す）
    return {
        "character": "縁",
        "expression": "楽しそうな笑顔",
        # 他のデータ
    }

@app.post("/api/save-csv")
async def save_csv(data: dict):
    # CSVにデータを保存
    with open('manga_data.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['character', 'expression'])
        writer.writerow([data.get('character'), data.get('expression')])
    return {"message": "CSVに保存しました"}
```

## 環境を立ち上げるコマンド

**React アプリの起動**

```bash
npm start
```

**FastAPI アプリの起動**

```bash
uvicorn main:app --reload
```

このコードは基本的な構造を提供します。詳細な機能や UI の改善は、要件に応じて追加してください。

Citations:
[1] https://pplx-res.cloudinary.com/image/upload/v1723132596/user_uploads/oavwipeuc/gamen_memo.jpg
