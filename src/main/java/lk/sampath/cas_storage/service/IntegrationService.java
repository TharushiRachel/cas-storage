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

import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefResponseDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;

public interface IntegrationService {

  CreateCaseResponseDTO createCaseFromDas(CreateCaseDTO createCaseDTO) throws ApiRequestException;

  CreateDocumentRefResponseDTO createDocumentRefFromDas(
      CreateDocumentRefRequestDTO createDocumentRefRequestDTO) throws ApiRequestException;

  CaseDocumentsDTO getDasDocumentsByCaseId(String caseId) throws ApiRequestException;

  DasDocumentDTO getDocumentById(DasDocumentRequestDTO request) throws ApiRequestException;
}
