import React, {useState} from "react";
import axios from "axios";
import "./App.css";

function App() {
  const imagePathDir = "atode kaeru";
  const imagePathList = [
    imagePathDir + "image-0012-1.jpg",
    imagePathDir + "image-0012-2.jpg",
    imagePathDir + "image-0012-3.jpg",
    imagePathDir + "image-0012-4.jpg",
  ];
  const [selectedImage, setSelectedImage] = useState("image1");
  const [imageData, setImageData] = useState({
    image1: {
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image2: {
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image3: {
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
      ],
      sceneData: {scene: "", location: "", backgroundEffects: ""},
    },
    image4: {
      characters: [
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
        },
        {
          character: "",
          faceDirection: "",
          position: "",
          expression: "",
          serif: "",
          clothing: "",
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

  const saveToCSV = async () => {
    try {
      await axios.post("http://localhost:8000/api/save-csv", {
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

  return (
    <div className="container">
      <header className="header">
        <span>{selectedImage}</span>
        <button onClick={() => setSelectedImage("prev")}>前の画像</button>
        <button onClick={() => setSelectedImage("next")}>次の画像</button>
        <button onClick={saveToCSV}>保存</button>
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
              <img src={imagePathList[num - 1]} alt={`image${num}`} />
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
            </div>
          ))}
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
