/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.decryptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import lk.sampath.cas_storage.enums.CipherAlgo;
import lk.sampath.cas_storage.enums.FileType;
import lk.sampath.cas_storage.exception.CipheringException;
import lk.sampath.cas_storage.util.CommonParamSetter;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Log4j2
@Component
public class Decryptor {
  private static final String PATTERN = "%1$-10s";
  private static final String ENTERED_STATUS = "ENTERED";
  private static final String LEFT_STATUS = "LEFT";

  public String decryptString(
      String cipherText, String path, String password, FileType fileType, CipherAlgo algorithm)
      throws UnrecoverableKeyException,
          CertificateException,
          NoSuchAlgorithmException,
          IOException,
          KeyStoreException,
          InvalidKeySpecException,
          NoSuchPaddingException,
          IllegalBlockSizeException,
          BadPaddingException,
          InvalidKeyException {
    log.info(String.format(PATTERN, ENTERED_STATUS) + "| Decrypter.decryptString()");
    byte[] bytes = Base64.getDecoder().decode(cipherText);
    String result = decrypt(bytes, path, password, fileType, algorithm);
    log.info(String.format(PATTERN, LEFT_STATUS) + "| Decrypter.decryptString()");
    return result;
  }

  public String decryptBytes(
      byte[] bytes, String path, String password, FileType fileType, CipherAlgo algorithm)
      throws UnrecoverableKeyException,
          CertificateException,
          NoSuchAlgorithmException,
          IOException,
          KeyStoreException,
          InvalidKeySpecException,
          NoSuchPaddingException,
          InvalidKeyException,
          IllegalBlockSizeException,
          BadPaddingException {
    log.info(String.format(PATTERN, ENTERED_STATUS) + "| Decrypter.decryptBytes()");
    String result = decrypt(bytes, path, password, fileType, algorithm);
    log.info(String.format(PATTERN, LEFT_STATUS) + "| Decrypter.decryptBytes()");
    return result;
  }

  private String decrypt(
      byte[] bytes, String path, String password, FileType fileType, CipherAlgo algorithm)
      throws UnrecoverableKeyException,
          CertificateException,
          NoSuchAlgorithmException,
          IOException,
          KeyStoreException,
          InvalidKeySpecException,
          NoSuchPaddingException,
          InvalidKeyException,
          IllegalBlockSizeException,
          BadPaddingException {
    PrivateKey privateKey = null;
    if (fileType.equals(FileType.P12)) {
      privateKey = CommonParamSetter.getPrivateKeyFromP12(path, password);
    } else if (fileType.equals(FileType.PEM)) {
      privateKey = CommonParamSetter.getPrivateKeyFromPEM(path, algorithm.getAlgorithm());
    } else if (fileType.equals(FileType.DER)) {
      privateKey = CommonParamSetter.getPrivateKeyFromDER(path, algorithm.getAlgorithm());
    }
    Cipher decriptCipher = Cipher.getInstance(algorithm.getAlgorithm());
    decriptCipher.init(2, privateKey);
    return new String(decriptCipher.doFinal(bytes), StandardCharsets.UTF_8);
  }

  public String symmetricKeyDecrypt(CipherAlgo algorithm, String cipherText, String encrptKey)
      throws CipheringException, InvalidAlgorithmParameterException {
    log.info(String.format(PATTERN, ENTERED_STATUS) + "| Decrypter.symmetricKeyDecrypt()");
    String cryptedString;
    String algoInstant;
    byte[] initVec;
    try {
      algoInstant = CommonParamSetter.getAlgoInstant(algorithm.getAlgorithm());
      initVec = CommonParamSetter.getIV(algorithm.getAlgorithm());
      Cipher cipher = Cipher.getInstance(algoInstant);
      SecretKeySpec secretKeySpec =
          new SecretKeySpec(Base64.getDecoder().decode(encrptKey), algorithm.getAlgorithm());
      cipher.init(2, secretKeySpec, new IvParameterSpec(initVec));
      byte[] cipherArr = cipher.doFinal(Base64.getDecoder().decode(cipherText));
      cryptedString = new String(cipherArr);
    } catch (NoSuchAlgorithmException
        | NoSuchPaddingException
        | InvalidKeyException
        | IllegalBlockSizeException
        | BadPaddingException ex) {
      log.error(ex.getMessage());
      throw new CipheringException(ex.getMessage());
    }
    log.info(String.format(PATTERN, LEFT_STATUS) + "| Decrypter.symmetricKeyDecrypt()");
    return cryptedString;
  }
}
