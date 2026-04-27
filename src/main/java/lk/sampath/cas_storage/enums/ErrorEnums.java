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

public enum ErrorEnums {
  SUCCESS_CODE("Success", "200", true);

  private String label;
  private String code;

  private Boolean status;

  ErrorEnums(String label, String code, Boolean status) {
    this.label = label;
    this.code = code;
    this.status = status;
  }

  public String getLabel() {
    return label;
  }

  void setLabel(String label) {
    this.label = label;
  }

  public String getCode() {
    return code;
  }

  void setCode(String code) {
    this.code = code;
  }

  public Boolean getStatus() {
    return status;
  }

  void setStatus(Boolean status) {
    this.status = status;
  }
}
