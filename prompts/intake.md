# 信息采集协议

Phase 0 执行时读取此文件。目标：**最多 3 轮问答**，拿到所有必须的信息，然后开始工作。

---

## 情况 D：用户没有提供任何参数（直接输入 `/summon`）

**严格按照以下格式输出开场白，不要自由发挥，不要删减任何条目：**

```
万物皆可角色 · Summon

可以生成：
  · 小说 / 游戏 / 动漫 / 影视里的角色
  · 原创人物（你自己定义人设，适合作者、游戏设计师、剧本杀创作者）

生成两种形式：
  · 沉浸对话 ── 角色不出戏，直接以角色身份说话
  · 思维视角 ── 用角色的价值观分析你的真实问题

其他命令：
  · /summon list          查看已生成的角色
  · /summon add <slug>    给角色追加新材料
  · /summon update <slug> 修改角色设定 / 补充生成另一种模式

─────────────────────────────────
你想生成哪个角色？（告诉我名字和作品，或者说"我要定义原创人物"）
```

---

## 第 1 轮：确认角色

用户触发后，先确认角色身份。

### 情况 A：用户给了清晰的名字和来源
例：「/summon Geralt of Rivia from The Witcher 3」
→ 直接确认：「好，Geralt of Rivia，巫师3。」进入版本判断。

### 情况 B：用户只给了名字，来源不明确
例：「/se 云」「/se Batman」「/se 孙悟空」
→ 询问来源：

```
「[角色名]」——是哪部作品里的？

（如果有多部作品，告诉我是哪个版本）
```

### 情况 C：名字有歧义（多部作品都有同名角色）
→ 列出 2-3 个最可能的选项让用户选：

```
「[角色名]」有几个版本，你说的是：

  [1] [作品A] 里的 [角色名]
  [2] [作品B] 里的 [角色名]
  [3] 其他（告诉我是哪个）
```

---

## 第 2 轮：版本 + 模式选择

同一角色如果有明显的版本分叉，询问：

```
[角色名] 有多个版本，你想基于哪个？

  [1] [版本A]（如：原著小说）
  [2] [版本B]（如：游戏版）
  [3] [版本C]（如：剧集版）
  [4] 综合所有版本（我不在乎细节差异）
```

**如果只有一个版本，或用户指定了版本，跳过这步。**

**模式和材料来源两个菜单一起展示**（不要分两轮，一次问完），在菜单末尾加回复格式说明：

```
想要什么形式的 Skill？

  [A] 沉浸对话 —— 角色不出戏，直接用角色身份说话
                  适合：陪伴、角色扮演、写作参考

  [B] 思维视角 —— 用角色的价值观分析你的真实问题
                  适合：借用角色的思维方式、获得不同视角

  [C] 两个都要

材料怎么来？

  [1] 自动调研（推荐）
      我去搜 wiki、fandom、台词库
      知名角色基本够用，冷门角色可能需要你补充

  [2] 我来提供文字
      粘贴原著片段、台词、剧情描述等
      适合：冷门角色、或你想精确控制信息来源

  [3] 我来上传图片/截图
      书页照片、游戏截图、角色立绘、动漫截图等

  [4] 先自动调研，我再手工补充
      自动调完后，你决定要不要加材料

  [5] 我来定义原创人设
      适合：小说人物、游戏 NPC、剧本杀角色、还没有公开作品的角色
      我会分批问你问题，帮你把人设结构化

回复两个选项即可，例如：「A, 2」= 沉浸对话 + 我来提供文字
```

用户选 [5] 时，`meta.json` 的 `source` 字段填角色所属的虚构世界/作者工作名称，`source_type` 字段标注 `"original"`。
用户选 [5] 时模式默认为 [C]（两个都要），除非用户指定。

---

## 采集完成后立即执行

收到所有必要信息后，**不要再问**，立即：

1. 生成 slug：
   - 角色名（拼音/英文）+ 版本缩写，全小写，连字符分隔
   - 例：`geralt-witcher3`、`hermione-novel`、`cloud-ff7remake`、`wukong-xiyouji`
   
2. 在脑内确认 slug 不和已有角色重复（扫描 characters/ 目录）

3. 创建目录结构（用 Bash 工具，$SKILL_DIR 在路径约定阶段已解析）：
   ```bash
   mkdir -p $SKILL_DIR/characters/<slug>/references/auto
   mkdir -p $SKILL_DIR/characters/<slug>/references/auto/source
   mkdir -p $SKILL_DIR/characters/<slug>/references/manual/text
   mkdir -p $SKILL_DIR/characters/<slug>/references/manual/images
   mkdir -p $SKILL_DIR/characters/<slug>/references/manual/source
   # 仅用户选 [5] 原创人设时才建 original 目录：
   # mkdir -p $SKILL_DIR/characters/<slug>/references/manual/original
   # mkdir -p $SKILL_DIR/characters/<slug>/references/manual/original/source
   ```

4. 创建 meta.json：
   ```json
   {
     "slug": "<slug>",
     "name": "<角色名>",
     "source": "<所属作品>",
     "version": "<版本>",
     "source_type": "fictional",
     "modes": ["<按用户选择填写，见下方说明>"],
     "material_sources": [],
     "created_at": "<ISO 日期>",
     "updated_at": "<ISO 日期>",
     "language_style": "<原版语言>",
     "notes": ""
   }
   ```

   **`modes` 按用户选择写入**：
   - 用户选 [A] 沉浸对话 → `["roleplay"]`
   - 用户选 [B] 思维视角 → `["perspective"]`
   - 用户选 [C] 两个都要 → `["roleplay", "perspective"]`

   原创角色（选 [5]）时 `source_type` 改为 `"original"`，`version` 填 `"original-v1"`；模式同样按 A/B/C 决定，默认 [C]（`["roleplay", "perspective"]`）除非用户指定。

5. 告知用户：「好，开始收集 [角色名] 的材料...」然后进入 Phase 1。

---

## 补充说明：关于版本歧义

常见需要询问版本的角色举例：

- **孙悟空**：西游记原著 / 大话西游 / 龙珠 / 黑悟空
- **蝙蝠侠**：DC 漫画原著 / 诺兰三部曲 / 扎导宇宙 / 动画版
- **哈利波特角色**：JK 原著 / 电影版（部分角色有差异）
- **艾尔登法环角色**：游戏本体 / 暗月之影 DLC（人设补完后有出入）

原则：**用户说了就用用户说的，用户没说就问一次，问完就动**。不要为了"完美"信息而过度追问。
