# arthub 美术中台 · 接口文档（实测逆向）

> 本文档是从 `router:3080` 网关实测逆向得出，字段/状态/模型名全部经过真实请求验证。

## 一、接入方式

| 项 | 说明 |
|---|---|
| 内网网关 | `http://router:3080/api/gateway/arthub`（公司 OpenClaw 平台网关，**透明注入身份、走公司账，无需 key**） |
| 公共域名 | `https://arthub.zx.com`（同一套接口，需 X-Token 鉴权） |
| 鉴权（公共域名） | 请求头 `X-Token: <key>` + `X-API-KEY: <key>`（或用 Cookie `arthub_token=<jwt>`） |

## 二、提交生成

### 生图：POST `/generate/image`
```json
{
  "service": "gpt_image_log",
  "modelName": "gpt-image-2",
  "prompt": "描述词",
  "imageSize": "1024x1024",
  "quality": "high",           // high/medium/low；2.5 模型额外 xhigh/max
  "n": 1,                       // 数量 1-10
  "outputFormat": "png"         // png / jpeg
}
```
- 图生图（参考图）：加 `"imageUrls": ["url1", "url2"]`（数组）

### 生视频：POST `/generate/video`
```json
{
  "service": "keling_video_log",
  "modelName": "kling-v3-omni",
  "prompt": "描述词",
  "videoCount": 1,              // 1-4
  "aspectRatio": "16:9",
  "duration": 5                 // 可选
}
```
- 图生视频（参考图）：加 `"imageUrls": ["url"]`（数组）
- 首尾帧：加 `"image": "首帧url"` + `"imageTail": "尾帧url"`（都是字符串）

### 返回（提交成功后）
```json
{ "code": 0, "data": { "id": 248719, "provider": "gpt_image_log", "targetId": 248719, "targetType": 19 } }
```
- `code != 0` 表示失败，`message` 是错误原因（会逐个提示缺什么字段）

## 三、轮询结果

### 图片：POST `/generate/imageResult`
```json
{ "provider": "gpt_image_log", "id": 248719 }
```
返回 `data.list[0]`，图片地址在 `ImageURLs` / `images`（都是 JSON 字符串数组，如 `"[\"url1\"]"`）。

### 视频：POST `/generate/videoResult`
```json
{ "provider": "keling_video_log", "id": 15138 }
```
返回 `data.list[0]`，视频地址在 `videos`（JSON 字符串数组）/ `videoUrl` / `playUrl`。

## 四、任务状态

`status` 字段：`submitted`（已提交）→ `processing`（处理中）→ `succeed`（成功）/ `failed`（失败）

## 五、service 路由表

### 图片（6 个 service）
| service | 支持的 modelName |
|---|---|
| `gpt_image_log` | gpt-image-2 / gpt-image-2.5-sunburst / gpt-image-2.5-flare |
| `gemini_image_log` | gemini-3-pro-image / gemini-3.1-flash-image |
| `jimeng_image_log` | jimeng_t2i_v40 / jimeng_seedream46_cvtob |
| `keling_image_log` | kling-image-o1 / kling-v3-omni |
| `volcengine_image_log` | doubao-seedream-5-0-pro-260628 |
| `qwen_image_log` | qwen-image-3.0-pro / qwen-image-3.0 |

### 视频（6 个 service）
| service | 支持的 modelName |
|---|---|
| `keling_video_log` | kling-v3-omni / kling-video-o1（及 kling-v1~v3 系列） |
| `volcengine_video_log` | doubao-seedance-1-5-pro-251215 / doubao-seedance-1-0-pro-250528 / doubao-seedance-1-0-lite-i2v-250428 |
| `vidu_video_log` | viduq2 |
| `happyhorse_video_log` | happyhorse |
| `minimax_video_log` | MiniMax-H3 |
| `wan_video_log` | wan3.0-video / wan3.0-video-prime |

## 六、完整模型清单（可直接做 UI 下拉）

**图片模型**（service → modelName）：
- gpt_image_log：gpt-image-2、gpt-image-2.5-sunburst、gpt-image-2.5-flare
- gemini_image_log：gemini-3-pro-image、gemini-3.1-flash-image
- jimeng_image_log：jimeng_t2i_v40、jimeng_seedream46_cvtob
- keling_image_log：kling-image-o1、kling-v3-omni
- volcengine_image_log：doubao-seedream-5-0-pro-260628
- qwen_image_log：qwen-image-3.0-pro、qwen-image-3.0

**视频模型**（service → modelName）：
- keling_video_log：kling-v3-omni、kling-video-o1
- volcengine_video_log：doubao-seedance-1-5-pro-251215、doubao-seedance-1-0-pro-250528、doubao-seedance-1-0-lite-i2v-250428
- vidu_video_log：viduq2
- happyhorse_video_log：happyhorse
- minimax_video_log：MiniMax-H3
- wan_video_log：wan3.0-video、wan3.0-video-prime

## 七、注意点

1. 字段是一个个校验的，缺哪个 `message` 里会明说（比如"需要 imageSize""需要 quality""需要 n"）。
2. 图片的 `image` 字段是 `[]string`（数组），视频的 `image` 是 `string`（单值）——两者类型不同。
3. 首尾帧不是所有视频模型都支持，kling-v3-omni 就报"不支持图生视频 image 参数"。
4. 网关返回的 `targetType`：19=文生图、20=图生图、3=视频任务。
