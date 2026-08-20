# Genca QMS 后端服务（qms_backend）

企业级 SaaS 质量管理系统（QMS）后端，基于 **Spring Boot 3 + Java 17 + MySQL**。

> 技术选型说明（面向产品经理）：后端采用 Java Spring Boot，是国内外企业级
> 质量管理系统的行业标准，配合 Spring Security（权限）、JPA（数据持久化）、
> 后续可接入 Flowable/Activiti（审批工作流）等成熟生态，满足企业级稳定性要求。

## 目录结构

```
qms_backend/
├── pom.xml                       # Maven 依赖与构建配置
├── src/main/java/com/genca/qms/
│   ├── QmsApplication.java       # 启动类
│   ├── common/                   # 通用：统一响应体、业务异常、全局异常处理
│   ├── config/                   # 配置：安全、跨域、后续 JWT/文档等
│   ├── controller/               # 接口层（REST Controller）
│   ├── service/                  # 业务逻辑层
│   ├── repository/               # 数据访问层（Spring Data JPA）
│   ├── entity/                   # 实体类（映射数据库表）
│   └── dto/                      # 接口出入参对象
└── src/main/resources/
    └── application.yml           # 环境配置（MySQL、端口等）
```

## 业务模块规划（按域分包）

| 一级模块 | 包/接口 | 状态 |
|---|---|---|
| 系统基础（组织/用户/权限/字典） | `sys` | 待开发 |
| 供应商质量 | `supplier` | 待开发 |
| 来料检验 IQC | `iqc` | 待开发 |
| 过程检验 IPQC | `ipqc` | 待开发 |
| 出货检验 OQC | `oqc` | 待开发 |
| 不合格品 NCR | `ncr` | 待开发 |
| 纠正与预防 CAPA | `capa` | 待开发 |
| 产品追溯 | `trace` | 待开发 |
| 文档与记录 | `doc` | 待开发 |
| 内审与自检 | `audit` | 待开发 |
| 质量绩效与看板 | `kpi` | 待开发 |
| 告警与通知 | `notify` | 待开发 |

> 骨架阶段仅实现健康检查接口（`GET /api/health`），验证服务可启动、前端可连通。

## 本机运行要求

本机当前**未安装 Java 与 Maven**，运行前需准备（任选其一）：

1. **方案 A（推荐）**：安装 IntelliJ IDEA（社区版即可），用 IDEA 打开本目录，
   它会提示自动下载 JDK 与 Maven，直接点 Run 运行 `QmsApplication`。
2. **方案 B（命令行）**：
   - 安装 JDK 17：`brew install openjdk@17`
   - 安装 Maven：`brew install maven`
   - 启动：`./mvnw spring-boot:run` 或 `mvn spring-boot:run`

启动后：
- 健康检查：`GET http://localhost:8080/api/health`
- 接口文档：`http://localhost:8080/swagger-ui/index.html`

## 数据库

默认连接 `localhost:3306/genca_qms`（MySQL）。如需复用现有 Genca 生产库，
在环境变量中指定，例如：

```bash
export DB_URL=jdbc:mysql://<生产库地址>:3306/<库名>?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
export DB_USERNAME=<账号>
export DB_PASSWORD=<密码>
```

> 生产环境禁止使用 `ddl-auto=update` 自动改表结构，应通过 Flyway 迁移脚本管理。

## 前后端联调

前端（`qms_fronted`，默认 3000 端口）通过 `/api/**` 反向代理到本服务
（8080 端口），已配置 CORS 放行本地跨域。
