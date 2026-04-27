/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Entity
@Data
@Table(name = "T_DOCUMENT_STORAGE")
public class DocStorage implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_T_DOCUMENT_STORAGE")
  @SequenceGenerator(
      name = "SEQ_T_DOCUMENT_STORAGE",
      sequenceName = "SEQ_T_DOCUMENT_STORAGE",
      allocationSize = 1)
  @Column(name = "DOCUMENT_STORAGE_ID")
  private Integer docStorageID;

  @Column(name = "DESCRIPTION")
  private String description;

  @Column(name = "FILE_NAME")
  private String fileName;

  @Column(name = "DOCUMENT_BYTE")
  private byte[] document;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "LAST_UPDATED_DATE")
  private Date lastUpdatedDate;

  @Column(name = "CASE_ID")
  private String caseId;

  @Column(name = "DOCUMENT_REFERENCE")
  private String documentReference;

  @Column(name = "DOCUMENT_TYPE")
  private String fileType;
}
