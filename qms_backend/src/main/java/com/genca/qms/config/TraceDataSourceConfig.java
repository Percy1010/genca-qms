package com.genca.qms.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * 产品追溯专用只读访问层（生产库 fangxing 的物料主数据等业务表）。
 *
 * <p>设计要点：</p>
 * <ul>
 *   <li>不注册额外的 {@link DataSource} Bean，避免触发 Spring Boot「已存在 DataSource 则注销
 *       自动配置主数据源」的逻辑而破坏系统主数据源（JPA）。数据源在内部创建、仅被
 *       {@code traceJdbcTemplate} / {@code traceTransactionManager} 持有。</li>
 *   <li>凭据通过环境变量注入（不写死代码）：{@code TRACE_DB_URL} / {@code TRACE_DB_USERNAME} / {@code TRACE_DB_PASSWORD}。</li>
 *   <li>连接池 {@link HikariDataSource#setReadOnly(boolean) readOnly=true}，配合只读事务 + 数据库层的只读账号，
 *       从机制上禁止对生产库的任何写操作。</li>
 * </ul>
 */
@Configuration
public class TraceDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(TraceDataSourceConfig.class);

    public static final String TRACE_JDBC_TEMPLATE = "traceJdbcTemplate";
    public static final String TRACE_TX_MANAGER = "traceTransactionManager";

    /** 追溯只读数据源（非 Bean，仅内部持有，避免干扰主数据源自动配置）。 */
    private final DataSource dataSource;

    public TraceDataSourceConfig(
            @Value("${qms.trace.datasource.url:}") String url,
            @Value("${qms.trace.datasource.username:}") String username,
            @Value("${qms.trace.datasource.password:}") String password) {
        this.dataSource = buildTraceDataSource(url, username, password);
    }

    private static DataSource buildTraceDataSource(String url, String username, String password) {
        HikariDataSource ds = new HikariDataSource();
        if (url != null && !url.isBlank()) {
            ds.setJdbcUrl(url);
            ds.setUsername(username);
            ds.setPassword(password);
            log.info("[trace] 追溯只读数据源已配置：{}", url);
        } else {
            // 占位库：避免启动失败；联调/上线前必须通过 TRACE_DB_URL 注入
            ds.setJdbcUrl("jdbc:mysql://localhost:3306/genca_qms?useSSL=false&serverTimezone=Asia/Shanghai");
            ds.setUsername("root");
            ds.setPassword("root");
            log.warn("[trace] 未配置 TRACE_DB_URL，追溯接口暂不可用，请设置只读数据源环境变量。");
        }
        ds.setPoolName("trace-hikari");
        ds.setMaximumPoolSize(5);
        ds.setMinimumIdle(0);
        ds.setConnectionTimeout(5000);
        ds.setReadOnly(true);           // 连接池层面强制只读
        return ds;
    }

    @Bean(name = TRACE_JDBC_TEMPLATE)
    public NamedParameterJdbcTemplate traceJdbcTemplate() {
        return new NamedParameterJdbcTemplate(dataSource);
    }

    @Bean(name = TRACE_TX_MANAGER)
    public PlatformTransactionManager traceTransactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }
}