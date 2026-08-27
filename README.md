# 南大机器人学生 Wiki

南京大学机器人与自动化学院学生共同维护的非官方知识站，覆盖项目、课程、师资、科研与学法五个板块。

- 线上地址：<https://yichengdong0219.github.io/njura-wiki/>
- 资料仓库：<https://github.com/YichengDong0219/njura-resources>
- 学院官网：<https://ra.nju.edu.cn/>

## 技术架构

主站使用 VitePress 1.6.4 + Vue 3 构建纯静态页面，无自建后端。Markdown 承载长期内容，Vue 与 Canvas 承载研究图谱；课程大文件放在独立资料仓库。

## 本地开发

需要 Node.js 20、22 或 24，推荐 Node 24 LTS。

```bash
npm ci
npm run docs:dev
npm run check
```

项目站点配置了 `base: "/njura-wiki/"`。本地开发地址通常为 `http://localhost:5173/njura-wiki/`。

## 数据与来源

人员、课程和项目记录位于 `docs/.vitepress/data/content.json`，契约位于 `contracts.ts`。`npm run validate` 会检查 25+4 人员、2 个兼职标记、研究域引用、来源 URL、核验日期和详情页完整性。

研究聚类属于学生 Wiki 编辑性整理；最后核验日期为 2026-08-27。详见[研究聚类方法](https://yichengdong0219.github.io/njura-wiki/about/methodology/)。

## 许可

- 软件代码：MIT License。
- 原创 Wiki 文本：CC BY-SA 4.0。
- 课程文件与第三方材料：以各自权利说明为准，不自动继承上述许可。

本站不代表南京大学或南京大学机器人与自动化学院。
