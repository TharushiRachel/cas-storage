/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.dto.dasstorage.createdocref;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.ToString;

@Data
public class CreateDocumentRefRequestDTO {

  @JsonProperty("createdUserId")
  private String createdUserId;

  @JsonProperty("createdUserLevel")
  private String createdUserLevel;

  @JsonProperty("createdUserSol")
  private String createdUserSol;

  @JsonProperty("caseComment")
  private String caseComment;

  @JsonProperty("foldersavein")
  private String foldersavein;

  @JsonProperty("senderid")
  private String senderid;

  @JsonProperty("objectstorename")
  private String objectstorename;

  @JsonProperty("sdasdocumentname")
  private String sdasdocumentname;

  @JsonProperty("caseid")
  private String caseid;

  @JsonProperty("sdasdocumenttype")
  private String sdasdocumenttype;

  @JsonProperty("appreqid")
  private String appreqid;

  @JsonProperty("uploaduserSecuritylevel")
  private String uploaduserSecuritylevel;

  @ToString.Exclude
  @JsonProperty("sdasfilecontent")
  private String sdasfilecontent;

  @JsonProperty("sdasdocuemntsecurity")
  private String sdasdocuemntsecurity;

  @JsonProperty("sdasdocumenttypeid")
  private String sdasdocumenttypeid;
}
