/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.dto.dasstorage.createcase;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCasePropertyDTO {

  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private String key;

  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private String value;

  @JsonProperty("Key")
  public String getKey() {
    return key;
  }

  @JsonProperty("Key")
  public void setKey(String key) {
    this.key = key;
  }

  @JsonProperty("Value")
  public String getValue() {
    return value;
  }

  @JsonProperty("Value")
  public void setValue(String value) {
    this.value = value;
  }
}
