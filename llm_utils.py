import base64
import json
import os
import re
from pathlib import Path

import anthropic
import requests
from dotenv import load_dotenv

load_dotenv()

# .envファイルを用意してAPIキーをそれぞれ記入しておく
# OPENAI_API_KEY={api_key}
# ANTHROPIC_API_KEY={api_key}
openai_api_key = os.getenv("OPENAI_API_KEY")
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")


RE_PAGE_KOMA_NUM = re.compile(r"\b\d{3}-\d\b")  # 3桁の数字-1桁の数字


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def fetch_response(prompt, image_path, model_name="gpt-4o-mini"):
    print("start fetch_response", model_name)
    # Getting the base64 string
    base64_image = encode_image(image_path)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}",
    }

    payload = {
        "model": model_name,
        # "response_format":{"type":"json_object"},
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 4000,
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )
    return response


def print_and_save_response(response, koma_id):
    save_dir = "chat_results"
    os.makedirs(name=save_dir, exist_ok=True)
    print(dir(response))
    print(response.json()["content"][0]["text"])

    with open(save_dir + "/" + koma_id + ".json", "w") as f:
        f.write(response.text)


def save_response(response, image_path):
    p = Path(image_path)
    with open(f"chat_results/result.txt", "+a") as f:
        # with open(f'chat_yuyu_results/result.txt', "+a") as f:
        f.write(f"{image_path}___{response.json()}\n")


def get_base64_encoded_image(image_path):
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()
        base_64_encoded_data = base64.b64encode(binary_data)
        base64_string = base_64_encoded_data.decode("utf-8")
        return base64_string


def fetch_anthropic_discussion_response(prompt, summary, image_data):
    MODEL_NAME = "claude-3-5-sonnet-20240620"
    print("start fetch_anthropic_4koma_response", MODEL_NAME)
    assistant_data = {}
    assistant_data = {k: v for k, v in summary.items() if k in ["role", "content"]}
    # import pdb;pdb.set_trace()
    message_list = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": json.dumps(image_data)},
                {
                    "type": "text",
                    "text": "画像郡とimageDataから4コマ全体でどんな話かをまとめてください",
                },
            ],
        },
        assistant_data,
        {"role": "user", "content": [{"type": "text", "text": prompt}]},
    ]
    client = anthropic.Anthropic(
        api_key=anthropic_api_key,
    )
    response = client.messages.create(
        model=MODEL_NAME, max_tokens=4048, messages=message_list
    )
    return response


def fetch_anthropic_4koma_response(prompt, image_path_list, image_data):
    MODEL_NAME = "claude-3-5-sonnet-20240620"
    print("start fetch_anthropic_4koma_response", MODEL_NAME)
    message_list = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Image 1:"},
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": get_base64_encoded_image("public" + image_path_list[0]),
                    },
                },
                {"type": "text", "text": "Image 2:"},
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": get_base64_encoded_image("public" + image_path_list[1]),
                    },
                },
                {"type": "text", "text": "Image 3:"},
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": get_base64_encoded_image("public" + image_path_list[2]),
                    },
                },
                {"type": "text", "text": "Image 4:"},
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": get_base64_encoded_image("public" + image_path_list[3]),
                    },
                },
                {"type": "text", "text": json.dumps(image_data)},
                {"type": "text", "text": prompt},
            ],
        },
    ]
    client = anthropic.Anthropic(
        api_key=anthropic_api_key,
    )
    response = client.messages.create(
        model=MODEL_NAME, max_tokens=4048, messages=message_list
    )
    return response


def build_koma_id(image_path):
    data_name = image_path.split("/")[1]
    kanji = data_name[-2:]
    page_koma_num = RE_PAGE_KOMA_NUM.findall(image_path)[-1]
    koma_id = f"{kanji}-{page_koma_num}"
    return koma_id


prompt_anal_koma = """
「わからないことは知らないと答えて」
以下は『ゆゆ式』の画像です。日本の4コマ漫画のため、右から左に読んでいきます。主な登場人物は以下です。

- 日向縁
	- "縁の髪の特徴": [  "黒っぽい髪色",  "長め（肩くらいの長さ）",  "ストレートな髪質",  "前髪がある"  ]
- 櫟井唯 
	- "唯の髪の特徴": [  "白っぽい髪色",  "短め（首あたりの長さ）",  "ややウェーブがかかっているように見える",  "前髪がある",  "髪の先端が少し外側に跳ねている"  ]
- 野々原ゆずこ 
	- "ゆずこの髪の特徴": [ "短め",  "ボブカットのようなスタイル",  "前髪がやや長め",  "髪の先端が内側に少し巻き込んでいる",  "髪色は白髪でも黒髪でもない中間的な色（おそらくグレーがかった色）"  ]
この画像について以下に答えてください。それぞれについて画像の右側にあるものから順に答えてください。
- ゆずこたちは、それぞれがコマのどこにいますか？誰もいない場合もあるし、3人より多い人数が写っている場合もあります
	- 画像の右側にあるものから順に答えてください。
	- 座標も答えてください
- どんな表情をしていますか?いない場合は「いない」
- 顔の向きを答えてください.いない場合は「いない」
- どんなセリフを言っていますか？ない場合は「なし」
	- 画像の右側にあるものから順に答えてください。
	- 座標も画像に対する比率で答えてください で答えてください 
	- 文が複数ある場合は半角スペースで区切ってください
- どんな服装をしていますか？いない場合は「いない」
- どんな場面だと思われますか？いない場合は「いない」
- 話している場所はどこですか？わからない場合は「不明」
- 背景に漫画ならではの効果描写があれば教えて下さい。ない場合は「なし」
- 画像の中には全部で何人いますか
- 画像の中には吹き出しがいくつありますか
- {出力はJSON形式のみ}

出力するjsonは以下の形式にしてください
```
{
    charactersNum: int,
    serifsNum: int,
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
}
```
"""
