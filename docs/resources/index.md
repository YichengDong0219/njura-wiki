---
title: 资料库
description: 获授权课程资料的独立仓库与版权边界
comment: false
---

# 资料库

学习资料与主站代码分仓管理：

- **主站 `njura-wiki`**：Markdown 正文、人员与课程索引、来源链接、网站组件。
- **资料仓库 [`njura-resources`](https://github.com/YichengDong0219/njura-resources)**：仅存放权利清楚、已获授权的课件、试卷、笔记等文件。

## 目录规范

```text
courses/
└── 课程号-课程名/
    └── 学年-学期/
        └── 授课教师/
            ├── notes/
            ├── slides/
            ├── exams/
            └── metadata.json
```

每批文件都必须有来源、权利人、授权说明、贡献者和适用学期。没有授权资料时，仓库保持为空内容骨架。

## 文件大小

- 普通 Git 文件控制在 50 MiB 内。
- 大文件优先使用 GitHub Releases。
- 超过 100 MiB 的文件不直接提交；确有需要时再评估 Git LFS。

> [!WARNING]
> 课程文件不自动适用本站的 CC BY-SA 4.0 文本许可；每个资料条目以自己的权利说明为准。
