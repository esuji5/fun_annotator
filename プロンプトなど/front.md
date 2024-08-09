以下は、React で LLM の API を使用して画像から情報を取得するための実装方法です。

## フロントエンド（React + TypeScript）

**1. 必要なパッケージをインストール**

```bash
npm install axios
npm install usellm
```

**2. React コンポーネントの作成**

以下は、React で JavaScript を使用して、指定されたアノテーション画面を実装するコードの例です。

## フロントエンド（React + JavaScript）

**1. 必要なパッケージをインストール**

```bash
npx create-react-app four-panel-manga
cd four-panel-manga
npm install axios
```

**2. React コンポーネントの作成**

- **`App.js`**

```jsx
import React, {useState} from "react";
import axios from "axios";

function App() {
  const [selectedImage, setSelectedImage] = useState("");
  const [data, setData] = useState({});
  const [summary, setSummary] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.post("/api/fetch-data", {
        imagePath: selectedImage,
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const saveToCSV = async () => {
    try {
      await axios.post("/api/save-csv", {data, summary});
    } catch (error) {
      console.error("Error saving CSV:", error);
    }
  };

  return (
    <div>
      <header>
        <span>{selectedImage}</span>
        <button onClick={() => setSelectedImage("prev")}>前の画像</button>
        <button onClick={() => setSelectedImage("next")}>次の画像</button>
        <button onClick={saveToCSV}>CSV保存</button>
      </header>
      <div>
        <div className="image-selector">
          <div onClick={() => setSelectedImage("image1")}>1</div>
          <div onClick={() => setSelectedImage("image2")}>2</div>
          <div onClick={() => setSelectedImage("image3")}>3</div>
          <div onClick={() => setSelectedImage("image4")}>4</div>
        </div>
        <div className="data-form">
          <button onClick={fetchData}>データ取得</button>
          <div>
            <h3>データ表示</h3>
            {/* データ表示用フォーム */}
            {data && (
              <div>
                <p>1人目: {data.character1}</p>
                <p>表情: {data.expression1}</p>
                {/* 他のデータ */}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3>4コマまとめ</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div>
        <h3>ディスカッション</h3>
        <button>どう感じた？</button>
        <button>かわいいのはだれ？</button>
        <button>次はどうなると思う？</button>
        <button>特に気になる表現は？</button>
      </div>
    </div>
  );
}

export default App;
```

このコードは、手書きの設計図に基づいて、画像選択、データ取得、CSV 保存、ディスカッションの UI を提供します。必要に応じて、スタイルや機能を追加してください。

Citations:
[1] https://pplx-res.cloudinary.com/image/upload/v1723132596/user_uploads/oavwipeuc/gamen_memo.jpg

````

## バックエンド（FastAPI）

**1. FastAPI アプリの作成**

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
````

このコードは、React で LLM を使用して画像から情報を取得し、FastAPI を通じてバックエンドとやり取りする方法を示しています。必要に応じて、UI や機能をさらに拡張してください。

Citations:
[1] https://vadimfedorov.ru/en/lab/react-image-parser/
[2] https://dev.to/aakashns/usellm-react-hooks-for-large-language-models-4343
[3] https://herotofu.com/solutions/guides/react-post-form-data-to-api
[4] https://stackoverflow.com/questions/64031976/extracting-images-data-from-promise-reactjs-and-axios
[5] https://www.youtube.com/watch?v=AFLHmlG5FIE
[6] https://pplx-res.cloudinary.com/image/upload/v1723132596/user_uploads/oavwipeuc/gamen_memo.jpg
