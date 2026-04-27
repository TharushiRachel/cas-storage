/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.service;

import java.io.IOException;
import java.util.List;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.DocumentModuleDTO;
import lk.sampath.cas_storage.dto.common.DocStorageDTO;
import lk.sampath.cas_storage.dto.common.SupportingDocIDStorageIDPairDTO;
import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import org.springframework.http.ResponseEntity;

public interface DocumentService {

  ResponseEntity<StandardResponse<List<DocStorageDTO>>> getDocumentStorageList(
      List<SupportingDocIDStorageIDPairDTO> supportingDocIDStorageIDListRQList);

  ResponseEntity<StandardResponse<CreateCaseResponseDTO>> createCase(CreateRequestDTO request)
      throws ApiRequestException, IOException;

  ResponseEntity<StandardResponse<CaseDocumentsDTO>> getDasDocumentsByCaseId(String caseId)
      throws ApiRequestException;

  ResponseEntity<StandardResponse<DasDocumentDTO>> getDocumentById(DasDocumentRequestDTO request)
      throws ApiRequestException;

  ResponseEntity<StandardResponse<DocStorageDTO>> getDocumentStorageByDocStorageID(
      Integer docStorageID) throws ApiRequestException;

  CreateCaseResponseDTO processCaseCreation(CreateRequestDTO request);

  ResponseEntity<?> saveDocumentByModule(DocumentModuleDTO request) throws ApiRequestException;
}
