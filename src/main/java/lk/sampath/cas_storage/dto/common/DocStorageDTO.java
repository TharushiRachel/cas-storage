/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.dto.common;

import java.io.Serializable;
import lk.sampath.cas_storage.entity.DocStorage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocStorageDTO implements Serializable {

  private Integer docStorageID;

  private String description;

  private String fileName;

  private byte[] document;

  private String dasDocument;

  private String lastUpdatedDateStr;

  private String fileType;

  public DocStorageDTO(DocStorage docStorage) {
    this.docStorageID = docStorage.getDocStorageID();
    this.description = docStorage.getDescription();
    this.fileName = docStorage.getFileName();
    this.document = docStorage.getDocument();
    this.lastUpdatedDateStr = docStorage.getDescription();
    this.dasDocument = docStorage.getDocumentReference();
    this.fileType = docStorage.getFileType();
  }

  public DocStorageDTO(DocStorageDTO docStorageDTO) {
    this.docStorageID = docStorageDTO.getDocStorageID();
    this.description = docStorageDTO.getDescription();
    this.fileName = docStorageDTO.getFileName();
    this.document = docStorageDTO.getDocument();
    this.lastUpdatedDateStr = docStorageDTO.getLastUpdatedDateStr();
    this.dasDocument = docStorageDTO.getDasDocument();
    this.fileType = docStorageDTO.getFileType();
  }
}
