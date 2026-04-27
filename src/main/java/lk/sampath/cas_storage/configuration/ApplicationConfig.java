/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.configuration;

import io.netty.channel.ChannelOption;
import java.time.Duration;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

@Configuration
public class ApplicationConfig {
  @Bean
  public ModelMapper modelMapper() {
    ModelMapper modelMapper = new ModelMapper();
    modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
    return modelMapper;
  }

  /**
   * Shared outbound HTTP pool for DAS calls. Limits concurrent connections and queues excess demand
   * so many users do not each open unbounded TCP connections or block threads indefinitely.
   */
  @Bean
  public WebClient webClient(
      @Value("${apps.http.client.pool-name:das}") String poolName,
      @Value("${apps.http.client.max-connections:200}") int maxConnections,
      @Value("${apps.http.client.pending-acquire-max-count:2000}") int pendingAcquireMaxCount,
      @Value("${apps.http.client.pending-acquire-timeout-ms:45000}") long pendingAcquireTimeoutMs,
      @Value("${apps.http.client.max-idle-time-seconds:30}") int maxIdleSeconds,
      @Value("${apps.http.client.max-life-time-seconds:300}") int maxLifeSeconds,
      @Value("${apps.http.client.connect-timeout-ms:10000}") int connectTimeoutMs,
      @Value("${apps.http.client.response-timeout-seconds:300}") int responseTimeoutSeconds,
      @Value("${apps.http.client.max-in-memory-size:10485760}") int maxInMemorySize) {

    ConnectionProvider provider =
        ConnectionProvider.builder(poolName)
            .maxConnections(maxConnections)
            .pendingAcquireMaxCount(pendingAcquireMaxCount)
            .pendingAcquireTimeout(Duration.ofMillis(pendingAcquireTimeoutMs))
            .maxIdleTime(Duration.ofSeconds(maxIdleSeconds))
            .maxLifeTime(Duration.ofSeconds(maxLifeSeconds))
            .build();

    HttpClient httpClient =
        HttpClient.create(provider)
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeoutMs)
            .responseTimeout(Duration.ofSeconds(responseTimeoutSeconds));

    ExchangeStrategies strategies =
        ExchangeStrategies.builder()
            .codecs(config -> config.defaultCodecs().maxInMemorySize(maxInMemorySize))
            .build();

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .exchangeStrategies(strategies)
        .build();
  }
}
