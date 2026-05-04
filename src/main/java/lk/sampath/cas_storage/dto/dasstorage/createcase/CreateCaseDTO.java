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
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class CreateCaseDTO {

  @JsonProperty("lastNodeID")
  private String lastNodeID;

  @JsonProperty("lastNodeElementOrder")
  private String lastNodeElementOrder;

  @JsonProperty("createdUserID")
  private String createdUserId;

  @JsonProperty("createdUserLevel")
  private String userLevel;

  @JsonProperty("createdUserSol")
  private String createdUserSol;

  @JsonProperty("caseComment")
  private String caseComment;

  /**
   * SDAS expects the JSON key {@code Property} (capital P). A Java field literally named {@code
   * Property} makes Lombok expose {@code getProperty()}, which Jackson maps to {@code "property"} by
   * default, so the payload can send populated data under the wrong key and an empty {@code
   * "Property"} array.
   */
  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private List<CreateCasePropertyDTO> dasCaseProperties;

  @JsonProperty("Property")
  public List<CreateCasePropertyDTO> getDasCaseProperties() {
    return dasCaseProperties;
  }

  @JsonProperty("Property")
  public void setDasCaseProperties(List<CreateCasePropertyDTO> dasCaseProperties) {
    this.dasCaseProperties = dasCaseProperties;
  }
}
