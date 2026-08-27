# 贡献指南

感谢共建南大机器人学生 Wiki。请先阅读本站的[贡献规范](https://yichengdong0219.github.io/njura-wiki/contribute/)。

## 工作流

1. 使用 Issue 报告错误、提出选题或登记资料线索。
2. Fork 仓库并从 `main` 创建短分支。
3. 修改内容，同时补充来源与 `lastVerified`。
4. 运行 `npm ci && npm run check`。
5. 提交 Pull Request，说明事实来源、主观内容和版权状态。

## 内容规则

- 事实优先使用学校/学院官网、教师本人主页与论文 DOI。
- 不抓取或写入动态引用量；Google Scholar 仅保存教师本人明确链接的档案。
- 学生经验使用第一人称，注明适用学期、个人背景和失效条件。
- 不提交私人联系方式、成绩单、群聊截图、未公开数据或可识别个人的敏感信息。
- 不上传未获授权的课件、试卷、教材扫描件、论文插图或网盘镜像。

## 数据修改

`FacultyRecord`、`CourseEntry` 与 `ProjectEntry` 的字段定义在 `docs/.vitepress/data/contracts.ts`。编辑 `content.json` 后必须通过 `npm run validate`。

## 提交建议

一次 Pull Request 聚焦一个主题；标题使用清晰动词，例如 `docs: 补充机器人导论课程来源`。不要把格式化、组件重构和大批内容更改混在同一提交中。
