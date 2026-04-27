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

import java.util.Date;
import lombok.Data;

@Data
public class DocumentListDTO {

  private Integer docSecLevel;
  private String documentCreatedUser;
  private String docName;
  private Date docmentCreatedDate;
  private String cdmsID;
  private String document_description;
  private Long caseID;
  private Integer docSize;
  private Long documentID;
  private Integer documentCreatedUserLevel;
  private Integer documentBackupUserLevel;
}
