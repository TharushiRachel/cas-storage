/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.controller;

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
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.service.DocumentService;
import lk.sampath.cas_storage.util.RequestLogSanitizer;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Log4j2
@RequestMapping("api")
@CrossOrigin("*")
public class DocumentController {

  private final DocumentService documentService;

  private final RequestLogSanitizer requestLogSanitizer;

  @Autowired
  public DocumentController(
      DocumentService documentService, RequestLogSanitizer requestLogSanitizer) {
    this.documentService = documentService;
    this.requestLogSanitizer = requestLogSanitizer;
  }

  @PostMapping("/getDocumentStorageList")
  public ResponseEntity<StandardResponse<List<DocStorageDTO>>> getDocumentStorageList(
      @RequestBody List<SupportingDocIDStorageIDPairDTO> supportingDocIDStorageIDListRQList)
      throws ApiRequestException {
    log.info(
        "START | getDocumentStorageList - DocumentController | request  {}",
        supportingDocIDStorageIDListRQList);
    ResponseEntity<StandardResponse<List<DocStorageDTO>>> response =
        documentService.getDocumentStorageList(supportingDocIDStorageIDListRQList);
    log.info(
        "END | getDocumentStorageList - DocumentController | response : {}",
        response.getStatusCode());
    return ResponseEntity.ok().body(response.getBody());
  }

  @PostMapping("/createCaseId")
  public ResponseEntity<StandardResponse<CreateCaseResponseDTO>> createCaseId(
      @RequestBody CreateRequestDTO request) throws ApiRequestException, IOException {
    log.info(
        "START | createCaseId - DocumentController | request  {}",
        requestLogSanitizer.sanitizeCreateRequest(request));
    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> response =
        documentService.createCase(request);
    log.info("END | createCaseId - DocumentController | response : {}", response);
    return ResponseEntity.ok().body(response.getBody());
  }

  @GetMapping("/getDasDocumentsByCaseId/{caseId}")
  public ResponseEntity<StandardResponse<CaseDocumentsDTO>> getDasDocumentsByCaseId(
      @PathVariable String caseId) throws ApiRequestException {
    log.info("START | getDasDocumentsByCaseId - DocumentController | caseId  {}", caseId);
    ResponseEntity<StandardResponse<CaseDocumentsDTO>> response =
        documentService.getDasDocumentsByCaseId(caseId);
    log.info("END | getDasDocumentsByCaseId - DocumentController | response : {}", response);
    return ResponseEntity.ok().body(response.getBody());
  }

  @PostMapping("/getDocumentById")
  public ResponseEntity<StandardResponse<DasDocumentDTO>> getDocumentById(
      @RequestBody DasDocumentRequestDTO request) throws ApiRequestException {
    log.info("START | getDocumentById - DocumentController | request  {}", request);
    ResponseEntity<StandardResponse<DasDocumentDTO>> response =
        documentService.getDocumentById(request);
    log.info(
        "END | getDocumentById - DocumentController | response : {}", response.getStatusCode());
    return ResponseEntity.ok().body(response.getBody());
  }

  @GetMapping("/getDocumentStorageByDocStorageID/{docStorageID}")
  public ResponseEntity<StandardResponse<DocStorageDTO>> getDocumentStorageByDocStorageID(
      @PathVariable Integer docStorageID) throws ApiRequestException {
    log.info(
        "START | getDocumentStorageByDocStorageID - DocumentController | caseId  {}", docStorageID);
    ResponseEntity<StandardResponse<DocStorageDTO>> response =
        documentService.getDocumentStorageByDocStorageID(docStorageID);
    log.info(
        "END | getDocumentStorageByDocStorageID - DocumentController | response : {}",
        response.getStatusCode());
    return ResponseEntity.ok().body(response.getBody());
  }

  @GetMapping("/fpDocument/{fpDocumentId}")
  public ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentById(
      @PathVariable Integer fpDocumentId) throws ApiRequestException {
    log.info("START | getFPDocumentById - DocumentController | fpDocumentId {}", fpDocumentId);
    ResponseEntity<StandardResponse<FPDocumentDTO>> response =
        documentService.getFPDocumentById(fpDocumentId);
    log.info("END | getFPDocumentById - DocumentController | status {}", response.getStatusCode());
    return ResponseEntity.ok().body(response.getBody());
  }

  @GetMapping("/fpDocument/case/{caseId}")
  public ResponseEntity<StandardResponse<List<FPDocumentDTO>>> getFPDocumentsByCaseId(
      @PathVariable String caseId) throws ApiRequestException {
    log.info("START | getFPDocumentsByCaseId - DocumentController | caseId {}", caseId);
    ResponseEntity<StandardResponse<List<FPDocumentDTO>>> response =
        documentService.getFPDocumentsByCaseId(caseId);
    log.info(
        "END | getFPDocumentsByCaseId - DocumentController | status {}", response.getStatusCode());
    return ResponseEntity.ok().body(response.getBody());
  }

  @PostMapping("/saveDocument")
  public ResponseEntity<StandardResponse<?>> saveDocument(@RequestBody DocumentModuleDTO request) throws ApiRequestException {
    log.info("START | saveDocument - DocumentController | request  {}", request);
    ResponseEntity<?> response = documentService.saveDocumentByModule(request);
    log.info("END | saveDocument - DocumentController | response : {}", response);
    Object body = response.getBody();
    if (body instanceof StandardResponse) {
      return ResponseEntity.ok((StandardResponse<?>) body);
    } else {
      // Optionally handle error or wrap in a StandardResponse
      return ResponseEntity.status(response.getStatusCode()).body(null);
    }
  }
}
