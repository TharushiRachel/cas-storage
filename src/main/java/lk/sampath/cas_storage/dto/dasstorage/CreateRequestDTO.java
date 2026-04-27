/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.dto.dasstorage;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCasePropertyDTO;
import lombok.Data;

@Data
public class CreateRequestDTO {

  private String createdUserId;

  @JsonProperty("createdUserLevel")
  private String userLevel;

  @JsonProperty("createdUserSol")
  private String createdUserSol;

  @JsonProperty("caseComment")
  private String caseComment;

  @JsonProperty("Property")
  private List<CreateCasePropertyDTO> Property;

  @JsonProperty("senderid")
  private String senderid;

  @JsonProperty("sdasdocumentname")
  private String sdasdocumentname;

  @JsonProperty("caseid")
  private String caseid;

  @JsonProperty("sdasdocumenttype")
  private String sdasdocumenttype;

  @JsonProperty("uploaduserSecuritylevel")
  private String uploaduserSecuritylevel;

  @JsonProperty("sdasfilecontent")
  private String sdasfilecontent;

}
