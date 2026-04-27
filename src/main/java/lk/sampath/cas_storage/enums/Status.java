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

import org.springframework.util.StringUtils;

public enum Status {
  ACT("Active", "A"),
  INA("Inactive", "I");

  private String label;
  private String value;

  Status(String label, String value) {
    this.label = label;
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  public String getLabel() {
    return label;
  }

  public static Status getEnum(String value) {
    for (Status clusterStatus : Status.values()) {
      if (clusterStatus.getValue().equalsIgnoreCase(value)) {
        return clusterStatus;
      }
    }
    return null;
  }

  public static Status resolveStatus(String statusStr) {
    Status matchingStatus = null;
    if (StringUtils.hasText(statusStr)) {
      matchingStatus = Status.valueOf(statusStr.trim());
    }
    return matchingStatus;
  }
}
