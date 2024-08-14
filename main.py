import json
import os
from collections import defaultdict

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from llm_utils import (
    build_koma_id,
    fetch_anthropic_4koma_response,
    fetch_anthropic_discussion_response,
    fetch_response,
    prompt_anal_koma,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じてドメインを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageData(BaseModel):
    dataName: str
    currentIndex: int
    komaPath: str
    imageData: dict
    summary: str


class ImagePathData(BaseModel):
    komaPath: str


class FeedbackRequest(BaseModel):
    dataName: str
    currentIndex: int
    imageData: dict
    imagePathList: dict


class DiscussionRequest(BaseModel):
    dataName: str
    currentIndex: int
    imageData: dict
    imagePathList: dict
    summary: str
    question: str


@app.post("/api/discussion")
async def get_discussion(request: DiscussionRequest):
    # ここでLLMにリクエストを送信し、フィードバックを取得する処理を実装
    print(request)
    prompt = (
        "今までのデータを基にこの漫画についてディスカッションしましょう。質問はこちらです："
        + request.question
    )
    # import pdb;pdb.set_trace()
    summary = json.loads(request.summary)
    response = fetch_anthropic_discussion_response(prompt, summary, request.imageData)
    # with open(f'public/saved_json/discussion_{request.dataName}_{request.currentIndex}.json', 'a+') as f:
    #     f.write(json.dumps(response.json()))

    # 既存の内容をリストとして取得
    existing_data = []
    try:
        with open(
            f"public/saved_json/discussion_{request.dataName}_{request.currentIndex}.json",
            "r",
        ) as read_f:
            existing_data = json.load(read_f)  # 既存のJSONデータを読み込む
    except (FileNotFoundError, json.JSONDecodeError):
        pass  # ファイルが存在しないか、空の場合は無視
    with open(
        f"public/saved_json/discussion_{request.dataName}_{request.currentIndex}.json",
        "w",
    ) as f:  # 'a+'から'w'に変更
        new_response = response.json()
        # new_response = new_response if isinstance(new_response, dict) else json.loads(new_response)
        new_response = (
            json.loads(new_response) if isinstance(new_response, str) else new_response
        )
        new_response["question"] = request.question
        # import pdb;pdb.set_trace()
        existing_data.append(new_response)  # 新しいレスポンスをリストに追加
        f.write(json.dumps(existing_data))  # リストをJSONとして書き込む
    return JSONResponse(content=response.json())
    # feedback = "ここにLLMからのフィードバックを挿入"  # LLMからのフィードバックを取得するロジックを追加
    # return {"feedback": feedback}


@app.post("/api/feedback")
async def get_feedback(request: FeedbackRequest):
    # ここでLLMにリクエストを送信し、フィードバックを取得する処理を実装
    print(request)
    prompt = "画像郡とimageDataから4コマ全体でどんな話かをまとめてください"
    response = fetch_anthropic_4koma_response(
        prompt, list(request.imagePathList.values()), request.imageData
    )
    with open(
        f"public/saved_json/feedback_{request.dataName}_{request.currentIndex}.json",
        "w",
    ) as f:
        f.write(json.dumps(response.json()))
    return JSONResponse(content=response.json())
    # feedback = "ここにLLMからのフィードバックを挿入"  # LLMからのフィードバックを取得するロジックを追加
    # return {"feedback": feedback}


@app.post("/api/analyze-image/")
async def analyze_image(data: ImagePathData):
    image_path = "./public" + data.komaPath
    response = fetch_response(prompt_anal_koma, image_path)
    # print_and_save_response(response,'10-009-3')
    if response.status_code == 200:
        content = response.json()["choices"][0]["message"]["content"]
        try:
            content_data = json.loads("\n".join(content.split("\n")[1:-1]))
        except Exception as e:
            # import pdb;pdb.set_trace()
            print(e)
            content_data = {}
        ret_data = {
            k: v for k, v in response.json().items() if k not in ["object", "choices"]
        }
        try:
            del content_data["charactersNum"]
            del content_data["serifsNum"]
        except:
            print("akan")
        print(content_data)
        ret_data["content_data"] = content_data
        # import pdb;pdb.set_trace()
        # Extract necessary information from the response
        # Assuming the response contains 'items' you are interested in
        return JSONResponse(content=ret_data)
        # return JSONResponse(content={"items": items})
    else:
        return JSONResponse(
            content={"error": "Failed to analyze image"}, status_code=500
        )


@app.post("/api/save-json")
async def save_json(data: ImageData):
    print(data)
    json_path = f"public/saved_json/imageData_{data.dataName}_{data.currentIndex}.json"
    with open(json_path, "w") as f:
        f.write(json.dumps(data.imageData))
    return {"result": "saved!"}


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
