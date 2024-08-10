import os
import re
from collections import defaultdict

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
RE_PAGE_KOMA_NUM = re.compile(r'\b\d{3}-\d\b')  # 3桁の数字-1桁の数字

class ImageData(BaseModel):
    komaPath: str
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
    try:
        data_name = data.komaPath.split('/')[1]
        kanji = data_name[-2:]
        filename = os.path.basename(data.komaPath.split('/')[-1])[:-4]
        rows = []
        for img_key, img_info in data.imageData.items():
            koma_path = img_info.get('komaPath')
            page_koma_num = RE_PAGE_KOMA_NUM.findall(koma_path)[-1]
            koma_id = f'{kanji}-{page_koma_num}'
            row = defaultdict(str)
            row['koma_id']= koma_id
            row['koma_path']= koma_path
            for character in img_info['characters']:
                row['character']+= character['character']+','
                row['faceDirection']+= character['faceDirection']+','
                row['position']+= character['position']+','
                row['expression']+= character['expression']+','
                row['serif']+= character['serif']+','
                row['clothing']+= character['clothing']+','
                row['isVisible']+= str(int(character['isVisible']))+','
            row['scene']= img_info['sceneData']['scene']
            row['location']= img_info['sceneData']['location']
            row['backgroundEffects']= img_info['sceneData']['backgroundEffects']
            rows.append(row)

        # TODO:あとでサマリーなども保存する
        summary= data.summary
        df = pd.DataFrame(rows)
        df = df.sort_values('koma_id')
        df.to_csv(f'saved_csv/{data_name}__{filename}.csv', mode='w', index=False)

        return {"message": "Data saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
