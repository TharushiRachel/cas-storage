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
import lombok.Data;

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

  @JsonProperty("Property")
  private List<CreateCasePropertyDTO> Property;
}
