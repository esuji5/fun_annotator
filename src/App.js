import React, {useState, useEffect} from "react";
import axios from "axios";
import Papa from "papaparse";

import "./App.css";

function App() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("yuyu10_kanji.csv"); // CSVファイルのパス
      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          setRows(results.data); // CSVのデータを状態に保存
        },
      });
    };

    fetchCSV();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (rows.length / 4)); // 次のインデックスに切り替え
  };

  const imagePathDir =
    "/yuyu10/pages_corrected/2_paint_out/0_koma/0_padding_shave/";
  const currentKomaPaths = rows
    .slice(currentIndex * 4, currentIndex * 4 + 4)
    .map((row) => row.koma_path); // 現在の4つのkoma_pathを取得
  const imagePathList = currentKomaPaths.reduce((acc, koma_path, index) => {
    acc[`image${index + 1}`] = imagePathDir + koma_path.split("/").pop(); // imagePathDirとkoma_pathを結合
    return acc;
  }, {}); // imagePathListを更新
  const [selectedImage, setSelectedImage] = useState("image1");
  const [characters, setCharacters] = useState([]);
  const [imageData, setImageData] = useState({
    image1: {
      komaPath: imagePathList.image1,
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image2: {
      komaPath: imagePathList.image2,
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image3: {
      komaPath: imagePathList.image3,
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image4: {
      komaPath: imagePathList.image4,
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
          isVisible: true,
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
  });
  const [summary, setSummary] = useState("");

  const fetchData = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/fetch-data",
        {imagePath: selectedImage}
      );
      setImageData((prevData) => ({
        ...prevData,
        [selectedImage]: {
          characters: response.data.characters,
          sceneData: response.data.sceneData,
        },
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const updateKomaPathInImageData = () => {
    setImageData((prevData) => ({
      ...prevData, // prevDataを展開
      image1: {
        // image1を新しいオブジェクトとして更新
        ...prevData.image1,
        komaPath: imagePathList.image1, // ここを修正
      },
      image2: {
        // image1を新しいオブジェクトとして更新
        ...prevData.image2,
        komaPath: imagePathList.image2, // ここを修正
      },
      image3: {
        // image1を新しいオブジェクトとして更新
        ...prevData.image3,
        komaPath: imagePathList.image3, // ここを修正
      },
      image4: {
        // image1を新しいオブジェクトとして更新
        ...prevData.image4,
        komaPath: imagePathList.image4, // ここを修正
      },
    }));
  };
  const saveToCSV = async () => {
    try {
      updateKomaPathInImageData(); // ここを追加
      await axios.post("http://localhost:8000/api/save-csv", {
        komaPath: imagePathList.image1,
        imageData,
        summary,
      });
    } catch (error) {
      console.error("Error saving CSV:", error);
    }
  };

  const handleCharacterChange = (index, field, value) => {
    setImageData((prevData) => {
      const updatedCharacters = [...prevData[selectedImage].characters];
      updatedCharacters[index][field] = value;
      return {
        ...prevData,
        [selectedImage]: {
          ...prevData[selectedImage],
          characters: updatedCharacters,
        },
      };
    });
  };

  const addCharacter = () => {
    const newCharacter = {
      character: "",
      faceDirection: "",
      position: "",
      expression: "",
      serif: "",
      clothing: "",
      isVisible: true,
    };
    setCharacters([...characters, newCharacter]);
    setImageData((prevData) => ({
      ...prevData,
      [selectedImage]: {
        ...prevData[selectedImage],
        characters: [...prevData[selectedImage].characters, newCharacter], // ここを追加
      },
    }));
  };

  const removeCharacter = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
    setImageData((prevData) => ({
      ...prevData,
      [selectedImage]: {
        ...prevData[selectedImage],
        characters: prevData[selectedImage].characters.filter(
          (_, i) => i !== index
        ), // ここを追加
      },
    }));
  };

  const [isBlurred, setIsBlurred] = useState(false);

  const toggleBlur = () => {
    setIsBlurred(!isBlurred); // ブラー状態を切り替え
  };
  return (
    <div className="container">
      <header className="header">
        <span>{imagePathList[selectedImage]?.split("/").pop()}</span>
        <button onClick={() => setSelectedImage("prev")}>前の画像</button>
        <button onClick={() => setSelectedImage("next")}>次の画像</button>
        <button onClick={saveToCSV}>保存</button>
        <button
          onClick={() =>
            setCurrentIndex(
              (prevIndex) =>
                (prevIndex - 1 + rows.length / 4) % (rows.length / 4)
            )
          }
          disabled={currentIndex === 0}
        >
          前の4コマ({currentIndex - 1})
        </button>{" "}
        <button onClick={handleNext}>次の4コマ({currentIndex + 1})</button>
        <button onClick={toggleBlur}>ブラーを切り替え</button>
      </header>
      <div className="main-content">
        <div className="image-selector">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`image-box ${
                selectedImage === `image${num}` ? "selected" : ""
              }`}
              onClick={() => setSelectedImage(`image${num}`)}
            >
              <img
                src={imagePathList[`image${num}`]}
                alt={`image${num}`}
                className={isBlurred ? "blur" : ""}
              />
              <button onClick={fetchData}>データ取得</button>
              {/* {selectedImage === `image${num}` ? (
                <img src={imagePathList[num - 1]} alt={`image${num}`} />
              ) : (
                <span>{num}</span>
              )}
              <button onClick={fetchData}>データ取得</button> */}
            </div>
          ))}
        </div>
        <div className="data-form">
          <h3>データ表示</h3>
          {imageData[selectedImage].characters.map((character, index) => (
            <div key={index}>
              <h4>{index + 1}人目</h4>
              <input
                name="character"
                value={character.character}
                onChange={(e) =>
                  handleCharacterChange(index, "character", e.target.value)
                }
                placeholder="キャラクター"
              />
              <input
                name="faceDirection"
                value={character.faceDirection}
                onChange={(e) =>
                  handleCharacterChange(index, "faceDirection", e.target.value)
                }
                placeholder="顔の向き"
              />
              <input
                name="position"
                value={character.position}
                onChange={(e) =>
                  handleCharacterChange(index, "position", e.target.value)
                }
                placeholder="位置"
              />
              <input
                name="expression"
                value={character.expression}
                onChange={(e) =>
                  handleCharacterChange(index, "expression", e.target.value)
                }
                placeholder="表情"
              />
              <input
                name="serif"
                value={character.serif}
                onChange={(e) =>
                  handleCharacterChange(index, "serif", e.target.value)
                }
                placeholder="セリフ"
              />
              <input
                name="clothing"
                value={character.clothing}
                onChange={(e) =>
                  handleCharacterChange(index, "clothing", e.target.value)
                }
                placeholder="服装"
              />
              <label style={{display: "flex"}}>
                画面内にいる
                <input
                  name="isVisible"
                  type="checkbox" // チェックボックスを追加
                  checked={character.isVisible}
                  onChange={(e) =>
                    handleCharacterChange(index, "isVisible", e.target.checked)
                  }
                />
              </label>
              <button onClick={() => removeCharacter(index)}>削除</button>
            </div>
          ))}
          <button onClick={addCharacter}>キャラクター追加</button>
          <div>
            <h4>状況</h4>
            <input
              name="scene"
              value={imageData[selectedImage].sceneData.scene}
              onChange={(e) =>
                setImageData((prevData) => ({
                  ...prevData,
                  [selectedImage]: {
                    ...prevData[selectedImage],
                    sceneData: {
                      ...prevData[selectedImage].sceneData,
                      scene: e.target.value,
                    },
                  },
                }))
              }
              placeholder="シーン"
            />
            <input
              name="location"
              value={imageData[selectedImage].sceneData.location}
              onChange={(e) =>
                setImageData((prevData) => ({
                  ...prevData,
                  [selectedImage]: {
                    ...prevData[selectedImage],
                    sceneData: {
                      ...prevData[selectedImage].sceneData,
                      location: e.target.value,
                    },
                  },
                }))
              }
              placeholder="場所"
            />
            <input
              name="backgroundEffects"
              value={imageData[selectedImage].sceneData.backgroundEffects}
              onChange={(e) =>
                setImageData((prevData) => ({
                  ...prevData,
                  [selectedImage]: {
                    ...prevData[selectedImage],
                    sceneData: {
                      ...prevData[selectedImage].sceneData,
                      backgroundEffects: e.target.value,
                    },
                  },
                }))
              }
              placeholder="背景効果"
            />
          </div>
        </div>
      </div>
      <div className="summary-section">
        <h3>4コマまとめ</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div className="discussion-section">
        <h3>ディスカッション</h3>
        <button>どう感じた？</button>
        <button>かわいいのはだれ？</button>
        <button>次はどうなると思う？</button>
        <button>特に気になる表現は？</button>
        <button>今までになかったような表現や新しい情報はありますか？</button>
      </div>
    </div>
  );
}

export default App;
