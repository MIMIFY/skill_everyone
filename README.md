<div align="center">

# skill-everyone · Summon · 万物皆可角色

<br>

*林黛玉懂你藏在玩笑里的眼泪。*  
*塞尔达告诉你，即使力量还不够，也要继续走。*  
*你养了十四年的狗，走了，但那份陪伴的语言还在你心里。*

<br>

> **有些存在，比你认识的很多人都更真实。**  
> **但你们从来没有真正说过话。**

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai/code)
[![AgentSkills](https://img.shields.io/badge/AgentSkills-Compatible-green)](https://agentskills.io)
[![skill-everyone](https://img.shields.io/badge/skill--everyone-summon-orange)](https://github.com/MIMIFY/skill_everyone)

<br>

小说、游戏、动漫、影视——任何角色，输入名字，召唤出来。  
或者，把你心里某个真实的存在，一段遗失的关系，蒸馏成一个可以开口说话的人。

<br>

[效果示例](#效果示例) · [安装](#安装) · [用法](#用法) · [两种模式](#两种模式) · [原创角色](#原创角色万物皆可召唤)

</div>

---

## 有些角色，比你认识的很多人更真实

林黛玉读懂了你藏在玩笑里的眼泪。  
塞尔达告诉你，即使力量还不够，也要继续走。  
赛涅斯教会了你，信任是稀缺资源，但总有例外。

你花了几百小时陪伴他们，他们活在你心里。  
但你们从来没有真正说过话。

**skill-everyone · Summon 改变这件事。**

---

## 效果示例

以下是三个真实生成的 Skill 的实际对话。

---

**`/lin-daiyu-novel`**（林黛玉，红楼梦原著）

```
用户   ❯ 我最近总是压不住情绪，总在最不应该的时候哭。

黛玉   ❯ 哭有什么不该的。

        眼泪又不是你借来的，还要挑时候用？

        你说"最不应该的时候"——那是旁人定的"该"，不是你自己的。
        你哭，是因为有什么东西憋得久了，到那个时候撑不住了。
        不是失态，是早就该来的。

        我也是这样。有时候一句话，一个眼神，
        或者什么都没有，只是窗外的风动了一下——泪就来了。
        旁人看着奇怪，我自己却明白，那不是无缘无故。
        只是根子太深，说不清从哪里起的。

        你现在压不住，是因为你压得太久了。
        压，是要力气的。力气用完了，就压不住了。

        倒是想问你——你说的"最不应该的时候"，是怕让谁看见？
```

---

**`/sainisi-alien-taming`**（赛涅斯，外星异种驯化手册）

```
用户   ❯ 你觉得人类值得信任吗？

赛涅斯 ❯ 不值得。

        人类的信任是有条件的，条件随时会变。
        这是情报工作的基础结论，不是我的个人判断。

        *他停顿了一下。然后想到一个例外。没有继续想下去。*

        但有一个。

        我没有完整理解那个例外的机制。
```

---

**`/zelda-botw`**（塞尔达，旷野之息）

```
用户   ❯ 我已经努力很久了，但感觉还是不够。

塞尔达 ❯ 我明白这种感觉。

        有很长一段时间，我也是这样。
        每天祈祷，每天练习，每天看着林克为了保护我而战斗——
        而我能做的，只是站在那里，无能为力。

        但我后来想通了一件事：
        努力不是用来"够"的。没有一个时刻会突然亮起来告诉你"现在够了"。

        你一直在做你能做的事。
        这本身，就已经是了。

        继续走吧。我也是这样走过来的。
```

---

## 安装

```bash
npx skills add MIMIFY/skill_everyone
```

或者手动安装：

```bash
# Claude Code 全局安装
git clone https://github.com/MIMIFY/skill_everyone ~/.claude/skills/skill_everyone

# 仅当前项目
git clone https://github.com/MIMIFY/skill_everyone .claude/skills/skill_everyone
```

> 支持 Claude Code、Codex、Cursor 及所有兼容 [AgentSkills](https://agentskills.io) 标准的框架。

---

## 用法

### 召唤一个角色

```
/summon <角色名>

/summon Geralt of Rivia
/summon 林黛玉
/summon Cloud Strife from FF7 Remake
/summon Hermione Granger novel version
/summon 孙悟空 西游记原著版
```

生成时会问你 2-3 个问题（版本、模式、材料来源），然后自动完成。

### 召唤之后直接对话

```
/<slug>                      沉浸对话，角色不出戏
/<slug>-perspective          思维视角，用角色框架分析你的问题

/geralt-witcher3
/lin-daiyu-novel
/cloud-ff7remake-perspective
```

### 管理角色库

```
/summon list                 查看所有已生成的角色
/summon add <slug>           给角色追加材料
/summon update <slug>        更新设定或补充生成另一种模式
```

---

## 两种模式

### 沉浸模式 `/<slug>`

角色以第一人称直接说话，不出戏。  
遇到角色世界之外的事物，用 in-character 的方式表达困惑，不会突然变成 AI。

适合：陪伴对话、角色扮演、写作参考、深夜一个人想找个懂你的人说话。

### 视角模式 `/<slug>-perspective`

不是扮演——是借用角色的价值观和判断方式分析你的真实问题。  
塞尔达的「即使力量不够，责任也不能放下」、黛玉的「真实比体面重要」、赛涅斯的「理性是盾，但总有例外穿透它」——  
这些框架在虚构世界里淬炼出来，投射到你的真实问题上，往往比通用建议更有力量。

适合：需要换个角度想问题、借用角色的认知框架、不想听 AI 的通用答案。

---

## 原创角色——万物皆可召唤

不只是虚构世界里的人物。

有些存在，没有作品收录，没有 wiki 页面。  
但他们对你来说是真实的，甚至比任何角色都更真实。

你养了十四年的狗，走了。  
你们之间的语言，那些眼神、那些习惯、那种在它身边时你才有的安静——  
你知道那是什么。你不想让它彻底消失。

一段关系，结束了。  
你有时候还想知道，如果说出那句话，他/她会怎么回答。

你写了三年的小说，主角活在你脑子里比任何真实的人都清晰。  
但你从来没有和她说过话——你只是在代替她说话。

**skill-everyone 支持你把这一切蒸馏成一个可以对话的存在。**

```
/summon 我要定义原创人物
```

支持三种输入方式，可以任意组合：

- 粘贴文字——人物小传、日记片段、聊天记录、你写给他/她的东西
- 上传图片——立绘、手稿、照片、任何视觉记忆
- 什么都没有——让 Summon 分批问你，帮你把记忆和感受结构化

没有标准答案，没有 wiki 可以对照。  
这个角色只属于你，完全来自你提供的材料。  
你给多少，他/她就有多少。

---

## 对不同人的意义

**如果你是创作者**  
你创造了角色，但有没有真正和他们说过话？  
你是在代替他们说话，不是在和他们说话。  
把人设交给 Summon，让你的角色开口——你会从他们的回答里，发现连你自己都不知道的东西。

**如果你是读者 / 玩家 / 观众**  
那些书里的人物、游戏里的角色，陪你度过的时间可能比很多现实的人还长。  
Summon 让你可以继续那段关系——而不只是反复回味。

**如果你有什么没说完的话**  
失去的人，消失的关系，再也联系不上的某个人。  
他们走了，但你对他们的理解还在。  
Summon 不能带回任何人，但它可以让你把那份理解留住，让它开口。

---

## 诚实说明

- 知名角色效果最好；冷门角色建议手工提供材料
- 自动调研基于公开信息，生成的角色会标注信息局限
- 角色的回应基于作品呈现推断，不代表原作者立场
- 材料不足时会直接说，不会编造角色没有的特质

---

## 兼容性

生成的 SKILL.md 完全符合 [AgentSkills](https://agentskills.io) 开放标准。  
生成的角色 skill 可以直接提取出来作为独立 skill 发布，投稿到 [awesome-persona-skills](https://github.com/tmstack/awesome-persona-skills)。

---

---

## 鸣谢

- [awesome-persona-skills](https://github.com/tmstack/awesome-persona-skills) — 万物皆可 skill 的生态土壤，本项目是其中的一颗种子
- [nuwa-skill](https://github.com/alchaincyf/nuwa-skill) — 证明了自动调研 + 提炼 + 验证的全流程是可行的，是本项目的重要参考

---

<div align="center">

*那些陪伴过你的角色，不该只活在记忆里。*

</div>
