/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.enums;

public enum CipherAlgo {
  RSA("RSA"),
  AES("AES"),
  DES("DES"),
  TRIPLE_DES("3DES");
  private final String cipherAlgorithm;

  CipherAlgo(String algo) {
    this.cipherAlgorithm = algo;
  }

  public String getAlgorithm() {
    return this.cipherAlgorithm;
  }
}
