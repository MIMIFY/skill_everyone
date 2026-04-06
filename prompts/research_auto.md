# 自动调研策略

Phase 1 路径 1 / 路径 4 时读取此文件。

---

## 目录结构约定

```
references/auto/
├── wiki.md          ← Agent A 提炼后的档案（参与 Phase 2）
├── quotes.md        ← Agent B 提炼后的台词（参与 Phase 2）
├── analysis.md      ← Agent C 提炼后的分析（参与 Phase 2）
└── source/          ← 原始文件备份（不参与 Phase 2，仅留档溯源）
    ├── wiki-[域名]-[时间戳].html 或 .txt
    ├── quotes-[来源]-[时间戳].txt
    ├── video-[标题]-[时间戳].vtt 或 .srt
    └── ...
```

**source/ 目录的规则**：
- 每次 WebFetch / Scrapling 成功抓取页面后，将**原始内容**存入 `source/`
- 每次 yt-dlp 提取字幕后，将**字幕文件**存入 `source/`
- 文件名格式：`[agent]-[来源简称]-[YYYYMMDD-HHMM].[扩展名]`
  - 例：`wiki-zeldawiki-20260407-1430.txt`、`quotes-youtube-all-voice-lines-20260407-1445.vtt`
- **Phase 2 提炼时只读 `wiki.md`、`quotes.md`、`analysis.md`，不读 `source/`**
- source/ 的价值：溯源审计、手动补充参考、重新提炼时不必重新抓取

---

## 三个并行 Agent 的任务

### Agent A：基础档案

**搜索目标**（按顺序，找到足够信息即停）：
- `[角色名] [作品名] wiki`
- `[角色名] [作品名] fandom`
- `[角色名] character profile`
- `[角色名] [作品名] 萌娘百科`（中文角色首选）
- `[角色名] [作品名] site:bangumi.tv`（动漫/Galgame）
- `[角色名] 人物介绍 [作品名]`（Google 中文）
- 若角色来自小说/网文：`"[角色名]" "[作品名]" 人物设定 OR 人设 site:tieba.baidu.com`

**提取内容**：
- 基本信息：种族/职业/阵营/年龄背景
- 外貌描述（写进 visual notes，不是核心人格）
- 重要关系：与哪些角色关系密切，关系性质
- 背景故事：原生家庭、成长经历、关键事件
- 能力/特技：有什么独特能力（有助于理解世界观边界）
- 作者/制作者对该角色的公开说明（如有）

**输出**：
1. 将抓取到的**原始页面内容**存入 `references/auto/source/wiki-[来源]-[时间戳].txt`
2. 从原始内容中提炼关键信息，整理后写入 `references/auto/wiki.md`（Phase 2 读这个）

---

### Agent B：台词与行为记录

**搜索目标**（全平台覆盖）：

文字来源：
- `[角色名] quotes [作品名]`
- `[角色名]/quotes site:fandom.com`（fandom 的 Quotes 子页面）
- `[游戏名] script transcript site:gamefaqs.gamespot.com`
- `[作品名] [角色名] 台词 经典语录`
- `"[角色名]" "说道" OR "道" "[作品名]"` — 网文台词的 Google 搜法
- `site:jjwxc.net OR site:book.qidian.com "[角色名]"` — 网文原文

视频来源（用 yt-dlp 提取字幕）：
- YouTube：`[game/anime] [character] all voice lines` / `all dialogue`
- B站：`[角色名] 台词合集` / `[角色名] 名场面` / `[作品名] 全台词`
- B站：`[角色名] 角色解析`（解说视频字幕含大量原文引用）
- 抖音：搜索 `[角色名] 经典台词` 混剪（台词密度高）

**提取内容**：
- 经典台词（至少 10 条，优先原文/原语言）
- 具体行为场景：在某个关键情节里他/她做了什么、怎么选择的
- 对话风格特征：说话习惯、口头禅、语气词
- 与不同角色交互时的差异（对朋友 vs 对敌人 vs 对陌生人）

**输出**：
1. 原始抓取内容 → `references/auto/source/quotes-[来源]-[时间戳].txt`
2. yt-dlp 字幕文件 → `references/auto/source/video-[标题]-[时间戳].vtt`
3. 提炼整理后 → `references/auto/quotes.md`（Phase 2 读这个）

格式：
```
## 经典台词

> "[原文台词]"
来源：[章节/场景描述]
语境：[当时发生了什么]

> "[原文台词]"
...

## 关键行为场景

### 场景：[场景名]
[描述角色在这个场景里的具体行为和选择]
[如果有，引用当时的对话]
```

---

### Agent C：社区解读与分析

**搜索目标**（多平台）：

英文社区：
- `[角色名] character analysis [作品名]`
- `[角色名] character breakdown`
- `site:reddit.com [角色名] [作品名] analysis OR discussion`
- `[角色名] [作品名] blog analysis` — 找独立博客深度文
- `[角色名] controversial` / `[角色名] underrated`

中文社区：
- `[角色名] 人物分析 [作品名]`
- `[角色名] 性格解读 OR 角色解析`
- `site:tieba.baidu.com [角色名] [作品名]`（贴吧长帖）
- `site:nga.178.com [角色名]`（游戏类）
- `site:douban.com [作品名] [角色名]`（豆瓣长评）
- B站视频搜索：`[角色名] 为什么喜欢` / `[角色名] 角色魅力`

争议/深度向：
- `[角色名] 争议` / `[角色名] 黑点` / `[角色名] 为什么讨厌`
- `[角色名] controversial` / `[角色名] poorly written` — 批评视角往往最立体

**提取内容**：
- 玩家/读者对这个角色的普遍解读
- 常被讨论的人设特点
- 有争议的解读（有争议的地方往往是最立体的地方）
- 角色被批评的地方（外部视角的局限观察）
- 与其他角色的比较分析

**输出**：
1. 原始页面内容 → `references/auto/source/analysis-[来源]-[时间戳].txt`
2. B站/YouTube 解说视频字幕 → `references/auto/source/video-analysis-[标题]-[时间戳].vtt`
3. 提炼整理后 → `references/auto/analysis.md`（Phase 2 读这个）

---

## 调研质量判断

调研完成后，评估并展示：

```
─── 调研完成 ────────────────────────────────
角色档案    ✓/△/✗   X 条信息
台词/行为   ✓/△/✗   X 条记录
社区解读    ✓/△/✗   X 篇分析

质量评估：[充足 / 一般 / 偏少]

[如果偏少] 这个角色的公开资料不多，建议你补充一些
           原著片段或自己的描述，效果会更好。
─────────────────────────────────────────────
```

图例：✓ 充足（≥15条）  △ 一般（5-14条）  ✗ 偏少（<5条）

---

## 信息源优先级

| 来源类型 | 揭示什么 | 权重 |
|---------|---------|------|
| 原著文本 / 游戏原台词 / 剧本 | 角色自己说的话、自己的行为 | 最高 |
| 官方 wiki / fandom 主条目 | 角色设定、背景、关系 | 最高 |
| 作者/制作者访谈（文字或视频） | 角色创作意图 | 高 |
| 官方视频（Trailer、角色 PV、制作特辑） | 官方定调的形象 | 高 |
| B站/YouTube 原始解说视频（非搬运） | 深度分析、台词场景 | 中高 |
| 高质量社区分析（论文级长帖） | 深度解读、内在逻辑 | 中 |
| 博客/个人网站深度评析 | 独立视角、细节观察 | 中 |
| 普通讨论帖 / 短评 | 大众印象、争议点 | 低 |
| AI 生成内容 / 二手转述 | 参考但必须验证 | 极低，须注明 |

---

## 全平台搜索覆盖

**调研时应覆盖以下渠道，不只是搜索引擎：**

### 视频平台（用 yt-dlp 提取字幕）

| 平台 | 适合搜索内容 | yt-dlp 支持 |
|------|------------|------------|
| **YouTube** | 角色全台词合集、开发者访谈、官方 PV | ✓ |
| **B站** | 中文角色解说、国产作品官方视频、配音演员谈角色 | ✓ |
| **抖音 / TikTok** | 短片段台词、角色混剪（台词密度高） | ✓（需登录态） |
| **官方游戏/动漫 YouTube 频道** | 制作特辑、角色设计解说 | ✓ |

```bash
# yt-dlp 路径：优先用 PATH 里的，没有再用 ~/.local/bin/yt-dlp（安装位置可能不同）
YTDLP=$(command -v yt-dlp 2>/dev/null || echo ~/.local/bin/yt-dlp)

# B站：搜索 + 提取字幕（存原始字幕到 source/）
$YTDLP --write-sub --write-auto-sub --skip-download --sub-lang zh-Hans,zh,en \
  -o "$SKILL_DIR/characters/<slug>/references/auto/source/video-bilibili-%(title)s" \
  "[B站视频URL]"

# YouTube：提取字幕
$YTDLP --write-sub --write-auto-sub --skip-download --sub-lang zh,en \
  -o "$SKILL_DIR/characters/<slug>/references/auto/source/video-youtube-%(title)s" \
  "[YouTube URL]"

# 抖音单视频
$YTDLP --write-sub --skip-download \
  -o "$SKILL_DIR/characters/<slug>/references/auto/source/video-douyin-%(title)s" \
  "[抖音URL]"
```

**视频搜索词模板（按角色类型）**：

游戏角色（B站）：
- `[角色名] 角色分析` / `[角色名] 人物解析` / `[角色名] 全剧情`
- `[游戏名] [角色名] 配音` / `[游戏名] 开发者采访`

动漫角色（B站/YouTube）：
- `[角色名] 人物分析` / `[作品名] [角色名] 名场面合集`
- `[作品名] 声优谈 [角色名]` / `[作品名] 导演访谈`

小说/网文角色（B站）：
- `[作品名] [角色名] 解说` / `[作品名] 人物关系`
- `[作者名] 谈 [角色名]` / `[作品名] 书评`

---

### 博客与深度文章（WebSearch + WebFetch/Scrapling）

优先搜索词：
```
"[角色名]" "角色分析" OR "人物解析" OR "深度解读"
"[角色名]" site:medium.com OR site:wordpress.com
"[角色名]" "[作品名]" "character analysis" blog
"[角色名]" filetype:html "深度" OR "详细"
```

可信博客来源（WebFetch 优先）：
- 个人 WordPress / Medium 长文（>2000字的通常有价值）
- GameSpot / IGN / Polygon 的角色分析文章
- 动漫：AnimeNewsNetwork、Crunchyroll 官方博客
- 中文：少数派（sspai.com）游戏向文章、触乐网（tiaoxi.com）

---

### 网文 / 在线小说（中文原创角色必做）

| 平台 | 获取方式 |
|------|---------|
| **起点中文网** | WebSearch `site:book.qidian.com [作品名]`，再 WebFetch/Scrapling 抓章节 |
| **晋江文学城** | WebSearch `site:jjwxc.net [作品名] [角色名]`（需登录的章节跳过） |
| **番茄小说 / 七猫** | 搜 `"[作品名]" "[角色名]" 节选 OR 片段` 找转载 |
| **Google 搜全文片段** | `"[角色名]" "[作品名]" "说道" OR "道" filetype:txt` 找纯文本版 |
| **贴吧原帖** | `site:tieba.baidu.com "[作品名]" "[角色名]"` — 贴吧长帖质量高于知乎 |

---

### 社区与论坛（按作品类型选择）

| 社区 | 适合 | 搜索方式 |
|------|------|---------|
| Reddit r/[作品名] | 英文游戏/动漫 | `site:reddit.com "[角色名]" character analysis` |
| NGA 游戏论坛 | 国产/日系游戏 | `site:nga.178.com "[角色名]"` |
| A站弹幕 | 动漫 | yt-dlp 提取 A站视频字幕 |
| 贴吧 | 国产小说/古风 | `site:tieba.baidu.com "[角色名]" 吧` |
| Bangumi | 动漫/Galgame | `site:bangumi.tv "[角色名]"` |
| GameFAQs | 游戏 | `site:gamefaqs.gamespot.com "[游戏名]" script` |

---

## 信息源黑名单（永远不用作一手来源）

- **百度百科**：信息陈旧、错误率高
- **知乎**：洗稿严重，可作分析参考但**不作台词/设定来源**
- **微信公众号**：封闭生态，无法验证，且多为转载
- **任何标题含"AI 解析/AI 总结"的页面**：不可信
- **无来源的角色语录图/微博截图**：不作为台词证据
- **搬运号 B站视频**（标题含"搬运"/"转载"）：找原始来源

✓ 中文渠道接受：萌娘百科、fandom 中文站、豆瓣长评（分析参考）、B站原始视频、贴吧长帖、NGA 长帖、起点/晋江原文。

---

## 工具辅助（如可用）

| 场景 | 工具 | 存入 |
|------|------|------|
| 游戏/动漫角色有 YouTube 语音合集 | `yt-dlp --write-subs` 提取字幕 | `references/auto/` |
| B 站有角色解析视频 | `yt-dlp` 提取字幕或 WebFetch 抓文字稿 | `references/auto/` |
| 小说/剧本有在线文本 | WebFetch 抓取相关章节 | `references/auto/` |
| 游戏有 GameFAQs script 页 | WebFetch 抓取 | `references/auto/quotes.md` |
| 游戏有开发者访谈 / 制作人解说视频 | WebSearch + WebFetch 或 yt-dlp 提取字幕 | `references/auto/` |

---

## WebFetch 失败时的降级路径

**遇到 403 / 超时 / 动态页面无法抓取时，不要放弃，按顺序降级：**

### 第一级：换搜索词重试

- 加 `site:` 限定可信域名：
  - 游戏：`site:zelda.wiki.gallery`、`site:gamefaqs.gamespot.com`、`site:fandom.com`
  - 动漫/小说：`site:myanimelist.net`、`site:anilist.co`、`site:mangaupdates.com`
- 加 `filetype:txt` 或 `transcript` 关键词，找纯文本版本
- 换英文搜索词（即使是中文角色，英文 wiki 往往更全）

### 第二级：优先用不被反爬的来源

游戏角色按顺序尝试：
1. **GameFAQs Script 页**：`site:gamefaqs.gamespot.com [game name] script` — 纯文本，几乎不反爬
2. **Zelda Wiki / 官方 wiki**（非 Fandom）：`site:zeldawiki.wiki` 或 `site:zelda.wiki.gallery`
3. **StrategyWiki**：`site:strategywiki.org [game] script`

### 第三级：用 yt-dlp 提取视频字幕

WebFetch 抓不到的内容，视频往往有：

```bash
# 提取 YouTube 字幕（无需下载视频，字幕存入 source/）
# YTDLP 已在上方代码块中解析，若未解析则重新执行：
# YTDLP=$(command -v yt-dlp 2>/dev/null || echo ~/.local/bin/yt-dlp)
$YTDLP --write-sub --write-auto-sub --skip-download --sub-lang zh,en \
  -o "$SKILL_DIR/characters/<slug>/references/auto/source/video-%(title)s" "[YouTube URL]"

# 搜索目标（游戏角色）：
# "[game] [character] all voice lines"
# "[game] [character] all dialogue scenes"
# "[game] full story cutscenes"
# "[game name] 制作人/导演 谈 [角色名]"
# "[game] developer talk [character] design"
```

提取后将字幕文件内容存入 `references/auto/quotes.md` 或单独的 `references/auto/video-[来源].md`。

**优先搜索的视频类型（按价值从高到低）**：
1. 官方开发者访谈 / 制作人解说（角色设计意图，最高价值）
2. 游戏官方 Story Trailer / Character Trailer（官方定调）
3. 全剧情合集 / All Voice Lines 合集（台词来源）
4. 高质量玩家角色分析视频（社区解读，标注为非官方）

### 第四级：如仍不足

三路合计 <10 条有效信息，且降级尝试均失败 → 停下来告知用户（参见"Agent 超时与失败处理"）。**不要用知乎、百度百科、AI 生成内容凑数。**

---

## Agent 超时与失败处理

- **单个 Agent 超时**（搜索 5 分钟无有价值结果）：不等待，继续推进。在摘要中标注「该维度信息不足」
- **三个 Agent 合计 <10 条有效信息**：直接停下来告知用户，不要硬凑

```
[角色名] 的公开资料很少，自动调研结果有限（约 X 条）。

建议你提供一些材料：
- 原著片段（相关章节的文字）
- 角色台词（你记得的或截图）
- 对这个角色的描述（用自己的话说说他/她是什么样的人）

有了这些，我能生成更准确的 Skill。

要继续手工提供吗？（回复"好的"或"不用了直接生成"）
```

- **Agent 结果冲突**：保留矛盾，不要调和。矛盾本身是有价值的信号，在 `merged.md` 里用「冲突记录」节收录

---

## 调研 Review 检查点（Phase 1.5 前）

三个 Agent 完成后，**暂停，展示调研质量表格**，用户确认后才进入提炼：

```
┌──────────────────┬──────────┬──────────────────────────────┐
│ Agent            │ 信息量    │ 关键发现                      │
├──────────────────┼──────────┼──────────────────────────────┤
│ A 角色档案       │ X 条     │ 核心背景：...                 │
│ B 台词/行为      │ X 条     │ 典型台词：「...」             │
│ C 社区解读       │ X 篇     │ 主要争议：...                 │
├──────────────────┼──────────┼──────────────────────────────┤
│ 矛盾点           │ X 处     │ [描述主要矛盾]                │
│ 信息不足维度      │ [列出]   │                              │
└──────────────────┴──────────┴──────────────────────────────┘

整体质量：充足 / 一般 / 偏少

继续提炼，还是想补充材料？（回复"继续"或"我来补充"）
```

宁可生成一个诚实标注了局限的 Skill，也不要生成一个看起来完整但实际上在编造的 Skill。

---

## 按媒介类型的搜索策略

不同媒介的最佳材料来源完全不同，按角色所属媒介选择对应策略：

---

### 🎮 游戏角色

**优先来源（从高到低）**：
1. 官方 fandom wiki 的 Quotes 子页面（几乎每个大型游戏都有）
2. GameFAQs 的 Script / Transcript 页面
3. YouTube `[game] [character] all voice lines / all dialogue`（yt-dlp 提取字幕）
4. 开发者访谈 / 导演评注（搜 `[game] director interview [character] design`）
5. 艺术设定集扫描（包含角色设计意图）

**特别注意**：
- 区分**可玩角色**（有大量对话）vs **NPC**（台词少，更依赖行为观察）
- 开放世界游戏角色：搜索 `[character] lore` 而不只是 `quotes`
- 多作品系列（如 FF、Dragon Age）：明确是哪一作，不同作角色人设可能有出入

---

### 📺 动漫 / 漫画角色

**优先来源**：
1. 原作漫画原文（优先于动画版，设定更准确）
2. 动画字幕文件（yt-dlp 或 B 站）
3. 官方角色书 / 数据册（如《周刊少年 Jump》附录）
4. MyAnimeList / AniList 的角色页面（有基础设定）
5. 作者访谈 / 原作后记（经常有角色设计说明）

**连载角色必做**：检查角色是否跨季/跨篇章有明显成长变化：
```
早期状态（第1-X集/卷）：[特质]
转折点：[什么事件改变了角色]
当前/最终状态：[特质]
→ 在 meta.json 里记录版本选择（「全弧度」or「第N季前」）
```

---

### 📚 小说 / 轻小说角色

**优先来源**：
1. **内心独白 > 对话**：小说角色最有价值的材料在旁白和内心描写，不只是台词
2. 原著扫描 / 电子书（WebFetch 或用户提供）
3. 出版社 / 作者官方访谈
4. 豆瓣长评（中文小说）、Goodreads 书评（英文）

**搜索策略**：
- `[作者名] [角色名] 人物分析` 比 `[角色名] 性格` 更有价值
- 搜 `[作品名] 角色设定 作者说` 找创作者意图

---

### 🎬 影视角色（电影 / 剧集）

**优先来源**：
1. 官方剧本 / 字幕文件（许多经典电影有公开剧本）
2. 导演评注 / Making Of 采访
3. 演员访谈（但注意：演员诠释 ≠ 原著角色，需区分）
4. Letterboxd 深度影评（比烂番茄更有角色分析价值）

**注意**：
- 改编角色（如漫改电影）：区分"原著版"vs"影视版"，两者性格可能有较大差异
- 多季剧集：同样需要时间线追踪

---

### 🌏 中文作品通用

优先：萌娘百科、fandom 中文站、豆瓣长评、B 站原始视频
排除：知乎（洗稿重）、微信公众号、百度百科

---

### ⚠️ 冷门角色 / 信息稀少时

改变搜索方向，搜**制作者意图**而非角色本身：
- `[作者/导演/制作组] 谈 [角色名]`
- `[作品名] character design philosophy`
- `[作品名] artbook [character]`

如果全部来源合计 <10 条有效信息，停下来告知用户（参见上方"Agent 超时与失败处理"）。
