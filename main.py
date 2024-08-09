import csv

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じてドメインを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageData(BaseModel):
    imageData: dict
    summary: str

@app.post("/api/fetch-data")
async def fetch_data(image_data: ImageData):
    # LLM APIを呼び出してデータを取得（仮のデータを返す）
    return {
        "character": "縁",
        "expression": "楽しそうな笑顔",
        # 他のデータ
    }

@app.post("/api/save-csv")
async def save_csv(data: ImageData):
    # TODO: とりあえず何らからの保存処理が走るところまで確認
    try:
        rows = []
        for img_key, img_info in data.imageData.items():
            print(img_key)
            for character in img_info['characters']:
                print(character)
                row = {
                    'image': img_key,
                    'character': character['character'],
                    'faceDirection': character['faceDirection'],
                    'position': character['position'],
                    'expression': character['expression'],
                    'serif': character['serif'],
                    'clothing': character['clothing'],
                    'scene': img_info['sceneData']['scene'],
                    'location': img_info['sceneData']['location'],
                    'backgroundEffects': img_info['sceneData']['backgroundEffects'],
                    'summary': data.summary
                }
                rows.append(row)

        df = pd.DataFrame(rows)
        df = df.sort_values(by=['image'])
        df.to_csv('annotated_data.csv', mode='w', index=False)

        return {"message": "Data saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
