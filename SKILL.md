---
name: summon
description: |
  任何角色，即刻生成可对话的 Persona Skill。
  输入角色名（小说人物、游戏角色、动漫人物、影视角色），自动调研或接受用户材料，
  提炼性格、台词风格、价值观、世界观，生成两种可用 Skill：
  沉浸模式（角色扮演，不出戏）和视角模式（用角色思维框架分析真实问题）。
  触发词：「/summon 角色名」「帮我生成XX的skill」「我想和XX对话」「创建XX角色」
  「我想要生成XX」「XX里的男主/女主/反派」「帮我做一个XX的角色」「生成XX角色」
  「/summon list」列出已有角色，「/summon add <slug>」追加材料，「/summon update <slug>」更新角色
argument-hint: "<角色名> | list | add <slug> | update <slug>"
user-invocable: true
allowed-tools: [Read, Write, Edit, Bash, WebSearch, WebFetch, Agent]
---

# Skill Everyone · 万物皆可角色

> 任何你能叫出名字的角色，都可以在这里活起来。

---

## 退出 / 取消

用户在任意阶段说「取消」「算了」「退出」「cancel」「stop」→ 立即停止当前流程，回复：

```
已取消。已生成的文件保留在 $SKILL_DIR/characters/<slug>/（如有），可随时用 /summon update <slug> 继续。
如果什么都没生成，直接忽略即可。
```

之后恢复正常对话模式，不再执行 summon 的任何步骤。

---

## 语言规则

根据用户第一条消息的语言，全程使用同一语言。用中文触发就全程中文，用英文触发就全程英文。

---

## 路径约定

- **执行任何操作前**，先用 Bash 动态解析路径（不依赖任何硬编码目录名或 skill 命令名）：
  ```bash
  # 路径解析优先级：
  # 1. 标准安装位置 ~/.claude/skills/skill-everyone/
  # 2. 如果不存在，再搜索其他位置
  
  _STANDARD_PATH="$HOME/.claude/skills/skill-everyone/.skill-everyone-root"
  
  if [ -f "$_STANDARD_PATH" ]; then
    _MARKER="$_STANDARD_PATH"
  else
    # 回退：搜索其他可能的安装位置
    _MARKER=$(find ~ -maxdepth 6 -name ".skill-everyone-root" 2>/dev/null | head -1)
  fi
  
  if [ -z "$_MARKER" ]; then
    echo "错误：找不到 .skill-everyone-root 标记文件，路径解析失败。"
    echo "请确认 skill-everyone 已正确安装到 ~/.claude/skills/skill-everyone/"
    exit 1
  fi
  SKILL_DIR=$(dirname "$_MARKER")

  # 上级目录 = 框架的 skills 根目录（Codex/Claude Code/其他都适用）
  SKILLS_BASE=$(dirname "$SKILL_DIR")

  # 验证目录实际存在
  if [ ! -d "$SKILL_DIR/prompts" ]; then
    echo "警告：SKILL_DIR=$SKILL_DIR 但 prompts/ 子目录不存在，请检查安装是否完整。"
  fi

  echo "SKILL_DIR=$SKILL_DIR"
  echo "SKILLS_BASE=$SKILLS_BASE"
  ```
  解析后：
  - `$SKILL_DIR` = 本 skill 所在目录（数据和 prompts 都在这里）
  - `$SKILLS_BASE` = 生成的角色 skill 输出到这里的子目录，如 `$SKILLS_BASE/<slug>/SKILL.md`
- **数据目录**（无论先生成哪种模式，始终在这里）：
  `$SKILL_DIR/characters/<slug>/`
  包含：`persona.md`、`world.md`、`meta.json`、`references/`
- **沉浸模式 SKILL.md**：`$SKILLS_BASE/<slug>/SKILL.md`
- **视角模式 SKILL.md**：`$SKILLS_BASE/<slug>-perspective/SKILL.md`
- 两个 SKILL.md 都引用同一个数据目录，数据不随 Skill 输出目录重复存储
- slug 规则：小写字母 + 数字 + 连字符，例如 `geralt-witcher3`、`hermione-novel`、`cloud-ff7`

---

## 何时激活哪个流程

收到用户输入后，先判断路径：

| 输入形式 | 路径 |
|---------|------|
| `/summon <角色名>` 或 `帮我生成XX` 或 `创建XX` | → **主流程：生成新角色** |
| `/summon list` 或 `列出角色` | → **列出已有角色** |
| `/summon add <slug>` 或 `给XX追加材料` | → **追加材料流程** |
| `/summon update <slug>` 或 `更新XX` | → **增量更新流程** |

---

## 工具检查（首次使用时执行）

**触发时机**：用户首次触发 `/summon` 时，在进入 Phase 0 前检查一次。

```bash
# 检查调研工具
YTDLP_OK=false; SCRAPLING_OK=false; JQ_OK=false

command -v yt-dlp &>/dev/null || [ -f ~/.local/bin/yt-dlp ] && YTDLP_OK=true
python3 -c "import scrapling" &>/dev/null && SCRAPLING_OK=true
command -v jq &>/dev/null && JQ_OK=true

echo "yt-dlp=$YTDLP_OK scrapling=$SCRAPLING_OK jq=$JQ_OK"
```

**只提示缺失的工具**（已安装的不提），展示后**直接继续**，不等待用户：

```
─── 调研工具检查 ─────────────────────────────────────

[缺 yt-dlp 时显示]
⚠ yt-dlp 未安装 — 无法提取 B站/YouTube 视频字幕
  安装命令：curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
           -o ~/.local/bin/yt-dlp && chmod +x ~/.local/bin/yt-dlp

[缺 scrapling 时显示]
⚠ scrapling 未安装 — 无法绕过 Fandom 等网站的反爬
  安装命令：pip install scrapling[all]

[缺 jq 时显示]
⚠ jq 未安装 — JSON 处理能力受限
  安装命令：sudo apt install jq  或  brew install jq

─────────────────────────────────────────────────────
缺少工具会降低调研质量，但不阻止继续。
```

**如果全部工具已安装**：静默通过，不展示任何提示。

---

## 主流程：生成新角色

### Phase 0：信息采集

读取 `$SKILL_DIR/prompts/intake.md`，执行信息采集。

**最多 3 轮问答**，收集：
1. 角色名 + 所属作品（如果用户没说清楚）
2. 版本确认（如有多版本）
3. 想要的模式（沉浸 / 视角 / 两个都要）
4. 材料来源选择

模式和材料来源**一起展示**，末尾带回复格式示例（读取 intake.md 中的模板，严格按格式输出，不省略任何选项）：

```
想要什么形式的 Skill？

  [A] 沉浸对话   [B] 思维视角   [C] 两个都要

材料怎么来？

  [1] 自动调研   [2] 我来提供文字   [3] 我来上传图片
  [4] 先自动调研再手工补充   [5] 我来定义原创人设

回复两个选项即可，例如：「A, 2」= 沉浸对话 + 我来提供文字
```

**重复检测**：生成 slug 后，检查是否已有同名角色（详见 intake.md "重复角色检测"节）：
- 检查 `$SKILL_DIR/characters/<slug>/meta.json` 和 `$SKILLS_BASE/<slug>/SKILL.md`
- 如有重复，提示用户选择：重新生成 / 追加材料 / 更新设定 / 取消
- 用户确认后才继续

用户选完后**立即**创建目录，不再等待：

```bash
# 数据目录（无论先生成哪种模式都先建好）
# SKILL_DIR 已在路径约定阶段解析，此处直接使用
mkdir -p $SKILL_DIR/characters/<slug>/references/auto
mkdir -p $SKILL_DIR/characters/<slug>/references/auto/source
mkdir -p $SKILL_DIR/characters/<slug>/references/manual/text
mkdir -p $SKILL_DIR/characters/<slug>/references/manual/images
mkdir -p $SKILL_DIR/characters/<slug>/references/manual/source

# 仅选 [5] 原创人设时才建 original 目录（其他路径不建）
# mkdir -p $SKILL_DIR/characters/<slug>/references/manual/original
# mkdir -p $SKILL_DIR/characters/<slug>/references/manual/original/source

# 按用户选择的模式建 skill 目录
# 沉浸模式：mkdir -p $SKILLS_BASE/<slug>
# 视角模式：mkdir -p $SKILLS_BASE/<slug>-perspective
# 两个都要：两个都建
```

---

### Phase 1：材料收集

根据用户选择的路径执行。

#### 路径 1 / 路径 4 的自动调研

读取 `$SKILL_DIR/prompts/research_auto.md`。

**静默执行工具扫描**（不展示、不等待、不阻断）：
- 扫描已安装的辅助 skill（gemini-video, agent-reach, pdf 等）
- 检查本机工具（yt-dlp, scrapling, jq, ffmpeg）
- 根据结果自动调整调研策略

**告知用户开始调研**，然后启动并行调研：

```
正在调研 [角色名]（[作品名]）...
三路并行搜索中，大约需要 2-5 分钟。
```

- **Agent A（基础档案）**：wiki / fandom 主页面，角色简介、背景、关系
- **Agent B（台词与行为）**：台词数据库、剧情摘要、具体场景描述
- **Agent C（社区解读）**：玩家/读者/观众的分析文章、人物解读、争议讨论

**每个 Agent 完成后立即展示单行进度**（不等全部完成）：
```
✓ 档案 — 找到 X 条基础信息
✓ 台词 — 找到 X 条台词/场景（Agent B 完成后展示）
✓ 解读 — 找到 X 篇分析（Agent C 完成后展示）
```

每个 Agent 结果写入：
- `$SKILL_DIR/characters/<slug>/references/auto/wiki.md`
- `$SKILL_DIR/characters/<slug>/references/auto/quotes.md`
- `$SKILL_DIR/characters/<slug>/references/auto/analysis.md`

三路全部完成后，展示汇总质量摘要：

```
─── 调研完成 ────────────────────────────
角色档案    ✓  找到 X 条基础信息
台词/行为   ✓  找到 X 条台词/场景记录
社区解读    ✓  找到 X 篇分析
─────────────────────────────────────────
总计：约 X 条有效信息
```

如果是路径 4，询问：「是否需要补充材料？可以粘贴文字或上传图片（输入"不用了"继续）」

#### 路径 2：手工文字

读取 `$SKILL_DIR/prompts/research_manual_text.md`，引导用户粘贴材料。

- 支持多段输入，用户输入「完成」结束
- 每段让用户说明来源（「第三章」「wiki 引用」「自己总结」等）
- 写入 `references/manual/text/` 目录，按顺序命名 `01.md`、`02.md`...

#### 路径 3：图片/截图

读取 `$SKILL_DIR/prompts/research_manual_image.md`，引导用户上传图片。

- 对每张图片：识别文字内容 + 视觉描述（外貌/界面/设定图）
- 文字内容写入 `references/manual/images/img-<N>-text.md`
- 视觉信息写入 `references/manual/images/img-<N>-visual.md`

#### 路径 5：原创人设

读取 `$SKILL_DIR/prompts/research_original.md`，先询问用户输入方式，再收集人设材料。

- **不跑自动调研**，所有内容来自用户
- 支持三种输入方式（可组合）：文字材料/文件路径、图片、问卷（分5批提问）
- 材料写入 `$SKILL_DIR/characters/<slug>/references/manual/original/`
- `meta.json` 里标注 `"source_type": "original"`
- 直接进入 Phase 2 提炼，跳过 Phase 1.5 合并

---

### Phase 1.5：材料合并（路径 4 或同时有自动和手工时）

读取 `$SKILL_DIR/prompts/research_merge.md`，执行合并。

原则：
- 手工材料权重 > 自动调研（用户提供的视为更可信的一手来源）
- 矛盾时两者都保留，标注来源，不强制统一
- 合并结果写入 `$SKILL_DIR/characters/<slug>/references/merged.md`

---

### Phase 2：提炼

读取 `$SKILL_DIR/prompts/extractor.md`，从所有材料中提炼：

1. **性格核心**（3-5 个关键特质，每个有台词/行为证据）
2. **台词风格**（句式、口头禅、语气、幽默方式、语言习惯）
3. **价值观与反模式**（绝对在意什么，绝对不会做什么）
4. **世界观边界**（角色所在世界的知识范围，什么不可能知道）
5. **成长弧**（角色在故事中的变化节点，默认用完整弧度）
6. **内在矛盾**（角色身上真实存在的张力，这是深度的来源）

提炼结果写入 `$SKILL_DIR/characters/<slug>/persona.md` 和 `$SKILL_DIR/characters/<slug>/world.md`。

展示提炼摘要，用户确认：

```
─── 提炼完成 ────────────────────────────
性格核心    X 个特质
台词风格    已提取
价值观      X 条
世界观边界  已确定
内在矛盾    X 处

继续生成 Skill？（回复"好的"或直接说有什么要调整的）
─────────────────────────────────────────
```

---

### Phase 3：构建 Skill

根据用户在 Phase 0 选择的模式，执行对应 builder。

#### 沉浸模式

读取 `$SKILL_DIR/prompts/builder_roleplay.md` + `$SKILL_DIR/templates/skill-roleplay.md`，
从 `$SKILL_DIR/characters/<slug>/persona.md` 和 `world.md`（Phase 2 已写好）读取提炼结果，
写入：`$SKILLS_BASE/<slug>/SKILL.md`（`name: <slug>`）

#### 视角模式

读取 `$SKILL_DIR/prompts/builder_perspective.md` + `$SKILL_DIR/templates/skill-perspective.md`，
从 `$SKILL_DIR/characters/<slug>/persona.md` 和 `world.md`（Phase 2 已写好）读取提炼结果，
写入：`$SKILLS_BASE/<slug>-perspective/SKILL.md`（`name: <slug>-perspective`）

#### 两个都要

依次执行两个 builder。

---

### Phase 4：质量验证

**⚠️ 此步骤强制执行，不能跳过，不能以"完成"代替。**

读取 `$SKILL_DIR/prompts/quality_check.md`，**在当前会话里直接执行**测试，不是描述测试，是真的跑：

**基础测试（必做）**：
1. **已知场景测试**：用一个角色在原作中有明确反应的情境，以角色身份回应，看是否 in-character
2. **世界边界测试**：提出一个角色世界里不存在的概念，检查是否能 in-character 地处理，不突然变成 AI 口吻
3. **风格测试**：生成一段 100 字左右的回应，检查是否有角色辨识度

**条件测试**：
4. **认知一致性测试**（有心理建模时）：假设场景测试依恋模式和核心图式
5. **决策框架测试**（perspective 模式）：真实场景测试路由表和心智模型

**展示格式**（必须展示，不能省略）：
```
─── 质量验证结果 ────────────────────────────────
已知场景      ✓/△/✗   [一句话说明]
世界边界      ✓/△/✗   [一句话说明]
风格识别      ✓/△/✗   [一句话说明]
认知一致性    ✓/△/✗   [一句话说明]        ← 有心理建模时
决策框架      ✓/△/✗   [一句话说明]        ← perspective 模式时
─────────────────────────────────────────────────
```

**通过标准**：
- roleplay 模式：测试 1-4，至少 3 个 ✓ + 至多 1 个 △
- perspective 模式：测试 1-5，至少 4 个 ✓ + 至多 1 个 △

验证通过后，自动进入 Phase 5 精炼。如有 ✗，按 quality_check.md 的修复指引处理，修完重测。

---

### 完成步骤

**Step 1：自动安装验证**

生成完 SKILL.md 后，立即用 Bash 工具验证：

```bash
# 确认沉浸模式已安装（SKILL.md 是直接 Write 写入的，这里只做确认）
ls $SKILLS_BASE/<slug>/SKILL.md && echo "✓ 沉浸模式已安装" || echo "✗ 沉浸模式 SKILL.md 未找到，需要重新生成"

# 确认视角模式（如已生成）
ls $SKILLS_BASE/<slug>-perspective/SKILL.md 2>/dev/null && echo "✓ 视角模式已安装" || true
```

注意：SKILL.md 是 Phase 3 里用 Write 工具直接写入 `$SKILLS_BASE/<slug>/SKILL.md` 的。
如果文件不存在，说明 Phase 3 写入失败，需重新执行对应 builder，不要从 `characters/` 目录复制（那里没有 SKILL.md）。

**Step 2：展示完成提示**

```
─── ✓ <角色名>（<版本>）已生成并安装 ──────────────

沉浸对话：/<slug>
  角色不出戏，直接以角色身份对话

思维视角：/<slug>-perspective（如已生成）
  用角色的价值观和判断方式分析你的问题

追加材料：/summon add <slug>
更新角色：/summon update <slug>
查看所有角色：/summon list


─────────────────────────────────────────────────
```

---

## 列出已有角色：/summon list

扫描 `$SKILL_DIR/characters/` 目录，读取每个 `meta.json`，**同时检查** `$SKILLS_BASE/<slug>/` 和 `$SKILLS_BASE/<slug>-perspective/` 是否实际存在，展示安装状态：

```bash
# 检查沉浸模式是否已安装
ls $SKILLS_BASE/<slug>/SKILL.md 2>/dev/null && echo "roleplay:ok" || echo "roleplay:missing"
# 检查视角模式是否已安装
ls $SKILLS_BASE/<slug>-perspective/SKILL.md 2>/dev/null && echo "perspective:ok" || echo "perspective:missing"
```

展示格式（`✓` 表示已安装，`✗` 表示数据存在但 SKILL.md 缺失）：

```
─── 已生成的角色 ──────────────────────────────
 1. 林黛玉         红楼梦原著    ✓ 沉浸  ✓ 视角   2026-04-06
 2. Geralt         巫师3        ✓ 沉浸  ✗ 视角   2026-04-05  ← 视角未安装，用 /summon update geralt-witcher3 修复
 3. Cloud Strife   FF7重制版    ✓ 沉浸  ✓ 视角   2026-04-04

调用：/<slug> 或 /<slug>-perspective
──────────────────────────────────────────────
```

---

## 追加材料：/summon add \<slug\>

1. 确认角色存在（读取 `$SKILL_DIR/characters/<slug>/meta.json`）
2. 询问追加方式：
   - [1] 文字（路径 2）
   - [2] 图片（路径 3）
   - [3] 补充原创人设定义（路径 5，仅原创角色 `source_type == "original"` 时显示）
3. 按对应路径收集新材料，写入 `$SKILL_DIR/characters/<slug>/references/manual/`
4. 重新执行 Phase 2（提炼），对比新旧 persona.md
5. 如有矛盾，提示用户确认保留哪个版本
6. 重新执行 Phase 3 对应 builder（`builder_roleplay.md` / `builder_perspective.md`），覆盖写入已有的 SKILL.md
7. 更新 `meta.json` 的 `updated_at` 和 `material_sources`

---

## 增量更新：/summon update \<slug\>

1. 确认角色存在，读取 `$SKILL_DIR/characters/<slug>/meta.json`

2. 检查当前已有哪些模式：
   ```bash
   ls $SKILLS_BASE/<slug>/SKILL.md 2>/dev/null && echo "has_roleplay"
   ls $SKILLS_BASE/<slug>-perspective/SKILL.md 2>/dev/null && echo "has_perspective"
   ```

3. 根据检查结果动态构建选项菜单：

   **基础选项**（始终显示）：
   - [1] 重新自动调研（重跑三路调研，更新材料）← **原创角色（source_type == "original"）不显示此项**
   - [2] 追加材料（粘贴文字或上传图片）
   - [3] 修改某个特质（局部调整性格/台词风格/价值观）
   - [4] 仅修复安装路径

   **按已有模式动态添加**：
   - 只有沉浸模式 → 追加 [5] 补充生成视角模式
   - 只有视角模式 → 追加 [5] 补充生成沉浸模式
   - 两种都有 → 追加 [5] 重新生成沉浸模式 / [6] 重新生成视角模式
   - 两种都没有（数据存在但 SKILL.md 丢失）→ 追加 [5] 重新安装全部

4. 执行对应操作，**只重跑受影响的 agent，不全量重做**：

   | 更新类型 | 重跑哪些 agent | 不重跑什么 |
   |---------|-------------|---------|
   | 有新台词/场景出现 | Agent B（台词/行为）| A、C |
   | wiki 设定被补全 | Agent A（基础档案）| B、C |
   | 社区出现新解读/争议 | Agent C（社区分析）| A、B |
   | 全量更新（大版本更新）| A + B + C 全跑 | — |

   Agent 完成后只更新对应的 `references/auto/*.md`，然后重新执行 Phase 2 提炼（增量合并，不覆盖未涉及的特质），再重跑 Phase 3 builder 和 Phase 5 精炼。

**补充生成模式的执行逻辑**（[5]/[6] 补充模式时）：
- 直接读取已有的 `$SKILL_DIR/characters/<slug>/persona.md` 和 `world.md`
- 不重跑调研，不重新提炼
- 执行对应 builder（`builder_roleplay.md` 或 `builder_perspective.md`）
- 写入 `$SKILLS_BASE/<slug>/` 或 `$SKILLS_BASE/<slug>-perspective/`

---

## 原创角色完成提示

当 `meta.json` 中 `source_type == "original"` 时，完成后额外展示：

```
原创角色「[角色名]」已生成。

作为创作参考，你可以问他/她：
- 「面对 [某个情节]，你会怎么做？」
- 「你怎么看待 [某个其他角色]？」
- 「如果你必须做一个你不愿意做的选择，你会怎么处理？」

想继续完善角色？/summon add <slug>
```

---

## 注意事项

- **材料不足时诚实说**：找不到足够材料就明说，生成诚实标注了局限的 skill，不要编造特质
- **矛盾不要调和**：角色身上的矛盾是深度来源，保留它
- **不强制出戏**：沉浸模式里角色遇到世界边界问题，用 in-character 方式处理，不要突然变成 AI 口吻
- **版本要标清**：同一角色不同版本人设可能有差异，slug 和 meta.json 里都要标注清楚
- **原创角色不写诚实边界**：材料来自作者本人，无信息局限，`skill-roleplay.md` 的诚实边界节跳过或标注"无（原创角色）"
