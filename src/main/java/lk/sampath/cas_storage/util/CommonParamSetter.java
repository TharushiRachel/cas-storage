/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.io.pem.PemReader;

public class CommonParamSetter {

  public static final String CBS_PKCS5PADDING = "/CBC/PKCS5Padding";
  public static final String ECB_PKCS5PADDING = "/ECB/PKCS5Padding";
  protected static final String[] Options_CBS_PKCS5Padding =
      new String[] {
        "AES",
        "RIJNDAEL",
        "BLOWFISH",
        "TWOFISH",
        "ENIGMA",
        "DES",
        "DESede",
        "DES_COMPAT",
        "3DES",
        "IDEA",
        "RSA",
        "RC6_256",
        "RC5"
      };
  protected static final String[] Options_IV8 = new String[] {"BLOWFISH", "DES", "DESede"};
  protected static final String[] Options_IV16 =
      new String[] {
        "AES",
        "RIJNDAEL",
        "TWOFISH",
        "ENIGMA",
        "DES_COMPAT",
        "3DES",
        "IDEA",
        "RSA",
        "RC6_256",
        "RC5"
      };

  private CommonParamSetter() {}

  public static PrivateKey getPrivateKeyFromP12(String path, String password)
      throws NoSuchAlgorithmException,
          CertificateException,
          IOException,
          UnrecoverableKeyException,
          KeyStoreException {
    KeyStore keyStore = KeyStore.getInstance("PKCS12");
    File keyFile = new File(path);
    keyStore.load(new FileInputStream(keyFile), password.toCharArray());
    return (PrivateKey) keyStore.getKey("1", password.toCharArray());
  }

  public static PublicKey getPublicKeyFromP12(String path, String password)
      throws NoSuchAlgorithmException, CertificateException, IOException, KeyStoreException {
    X509Certificate cert = getCertificateFromP12(path, password);
    return cert.getPublicKey();
  }

  public static X509Certificate getCertificateFromP12(String path, String password)
      throws NoSuchAlgorithmException, CertificateException, IOException, KeyStoreException {
    KeyStore keyStore = KeyStore.getInstance("PKCS12");
    File keyFile = new File(path);
    keyStore.load(new FileInputStream(keyFile), password.toCharArray());
    return (X509Certificate) keyStore.getCertificate("1");
  }

  public static PublicKey getPublicKeyFromPEM(String filename, String algorithm)
      throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    Security.addProvider(new BouncyCastleProvider());
    byte[] content;
    try (PemReader pemReader =
        new PemReader(new InputStreamReader(new FileInputStream(filename)))) {
      content = pemReader.readPemObject().getContent();
    }
    X509EncodedKeySpec spec = new X509EncodedKeySpec(content);
    KeyFactory kf = KeyFactory.getInstance(algorithm);
    return kf.generatePublic(spec);
  }

  public static PrivateKey getPrivateKeyFromPEM(String filename, String algorithm)
      throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    Security.addProvider(new BouncyCastleProvider());
    byte[] content;
    try (PemReader pemReader =
        new PemReader(new InputStreamReader(new FileInputStream(filename)))) {
      content = pemReader.readPemObject().getContent();
    }
    PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(content);
    KeyFactory kf = KeyFactory.getInstance(algorithm);
    return kf.generatePrivate(spec);
  }

  public static PublicKey getPublicKeyFromDER(String filename, String algorithm)
      throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    Path path = Paths.get(filename);
    byte[] pubKeyByteArray = Files.readAllBytes(path);
    X509EncodedKeySpec keySpec = new X509EncodedKeySpec(pubKeyByteArray);
    KeyFactory keyFactory = KeyFactory.getInstance(algorithm);
    return keyFactory.generatePublic(keySpec);
  }

  public static PrivateKey getPrivateKeyFromDER(String filename, String algorithm)
      throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    Path path = Paths.get(filename);
    byte[] privKeyByteArray = Files.readAllBytes(path);
    PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privKeyByteArray);
    KeyFactory keyFactory = KeyFactory.getInstance(algorithm);
    return keyFactory.generatePrivate(keySpec);
  }

  public static String getAlgoInstant(String algorithm) {
    String algoInstant = "";
    boolean iscbsPkcs5Padding = false;
    for (int i = 0; i < Options_CBS_PKCS5Padding.length; ++i) {
      if (algorithm.equals(Options_CBS_PKCS5Padding[i])) {
        iscbsPkcs5Padding = true;
        break;
      }
    }
    if (iscbsPkcs5Padding) {
      algoInstant = algorithm + CBS_PKCS5PADDING;
    } else {
      algoInstant = algorithm;
    }
    return algoInstant;
  }

  public static byte[] getIV(String algorithm) {
    byte[] initVec = new byte[0];
    int i;
    for (i = 0; i < Options_IV16.length; ++i) {
      if (algorithm.equals(Options_IV16[i])) {
        initVec = new byte[16];
        break;
      }
    }
    for (i = 0; i < Options_IV8.length; ++i) {
      if (algorithm.equals(Options_IV8[i])) {
        initVec = new byte[8];
        break;
      }
    }
    return initVec;
  }
}
