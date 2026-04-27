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

import lk.sampath.cas_storage.decryptor.Decryptor;
import lk.sampath.cas_storage.enums.CipherAlgo;
import lk.sampath.cas_storage.enums.FileType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Log4j2
@RequiredArgsConstructor
public class JasyptAdvancedConfig {

  private final Decryptor decryptor;

  @Value("${enc.key}")
  private String key;

  @Value("${cert.path}")
  private String certPath;

  @Value("${cert.password}")
  private String certPassword;

  @Bean(name = "jasyptStringEncryptor")
  public StringEncryptor getPasswordEncryptor() throws Exception {
    PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
    SimpleStringPBEConfig config = new SimpleStringPBEConfig();
    log.info("CERT_PATH:{}", certPath);
    String decryptValue = "";
    decryptValue =
        decryptor.decryptString(key, certPath, certPassword, FileType.P12, CipherAlgo.RSA);
    config.setPassword(decryptValue);
    config.setAlgorithm("PBEWithMD5AndDES");
    config.setKeyObtentionIterations("1000");
    config.setPoolSize("1");
    config.setProviderName("SunJCE");
    config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
    config.setStringOutputType("base64");
    encryptor.setConfig(config);
    return encryptor;
  }
}
