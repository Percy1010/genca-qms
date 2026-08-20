# Genca QMS · 产品追溯

企业级质量管理系统（QMS）—— 产品追溯 模块。

## 仓库结构（Monorepo）

| 目录 | 说明 | 技术栈 |
|---|---|---|
| `qms_backend/` | 后端服务 | Spring Boot 3 · Java 17 · MySQL · Spring Security · JPA |
| `qms_fronted/` | 前端应用 | Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui |

> 两个子目录内均带有各自的 `.gitignore` 与 README，请分别查阅。

## 快速开始

### 后端（qms_backend）

```bash
cd qms_backend
# 本地需 JDK 17 与 Maven，或用 IntelliJ IDEA 打开运行
./mvnw spring-boot:run
```

- 健康检查：`GET http://localhost:8080/api/health`
- 接口文档：`http://localhost:8080/swagger-ui/index.html`

数据库通过环境变量注入（`DB_URL`、`DB_USERNAME`、`DB_PASSWORD`），默认本地 `genca_qms`。
产品追溯生产库（`fangxing` 只读）凭据通过 `TRACE_DB_*` 环境变量注入，**不写死在代码**。

### 前端（qms_fronted）

```bash
cd qms_fronted
npm install
npm run dev
```

- 访问：`http://localhost:3000`
- 前端通过 `/api/**` 反向代理到后端 8080 端口

## 关键约定

- 生产/联调凭据一律走环境变量，严禁提交真实密码与 token。
- 后端禁用手动 `ddl-auto=update` 改表，数据库变更用 Flyway 迁移脚本管理。
- 前端 UI 组件优先复用 shadcn/ui，业务冲突时以业务需求为准。

## 协同方式

- 采用 Trunk-based：在 `main` 上拉取分支（`feat/`、`fix/`），通过 Pull Request 合入。
- 提交信息建议为 `type(scope): 描述` 的 Conventional Commits 风格。