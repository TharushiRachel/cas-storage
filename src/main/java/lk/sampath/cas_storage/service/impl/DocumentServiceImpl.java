/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.DocumentModuleDTO;
import lk.sampath.cas_storage.dto.common.DocStorageDTO;
import lk.sampath.cas_storage.dto.common.SupportingDocIDStorageIDPairDTO;
import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCasePropertyDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefResponseDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.entity.DocStorage;
import lk.sampath.cas_storage.entity.FPDocument;
import lk.sampath.cas_storage.enums.DocumentModule;
import lk.sampath.cas_storage.enums.ErrorEnums;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.repository.DocStorageRepository;
import lk.sampath.cas_storage.repository.FPDocumentRepository;
import lk.sampath.cas_storage.service.DocumentService;
import lk.sampath.cas_storage.service.FPDocumentService;
import lk.sampath.cas_storage.service.IntegrationService;
import lk.sampath.cas_storage.util.PropertyFileValue;
import lk.sampath.cas_storage.util.RequestLogSanitizer;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class DocumentServiceImpl implements DocumentService {

  @Value("${apps.documentService.case.LastNodeID}")
  private String lastNodeID;

  @Value("${apps.documentService.case.LastNodeElementOrder}")
  private String lastNodeElementOrder;

  @Value("${apps.documentService.document.Foldersavein}")
  private String foldersavein;

  @Value("${apps.documentService.document.Objectstorename}")
  private String objectstorename;

  @Value("${apps.documentService.document.Appreqid}")
  private String appreqid;

  @Value("${apps.documentService.document.Sdasdocuemntsecurity}")
  private String sdasdocuemntsecurity;

  @Value("${apps.documentService.document.Sdasdocumenttypeid}")
  private String sdasdocumenttypeid;

  private final DocStorageRepository docStorageRepository;
  private final ObjectMapper objectMapper;
  private final IntegrationService integrationService;
  private final PropertyFileValue propertyFileValue;
  private final RequestLogSanitizer requestLogSanitizer;
  private final FPDocumentRepository fpDocumentRepository;
  private final FPDocumentService fpDocumentService;

  @Autowired
  public DocumentServiceImpl(
          DocStorageRepository docStorageRepository,
          ObjectMapper objectMapper,
          IntegrationService integrationService,
          PropertyFileValue propertyFileValue,
          RequestLogSanitizer requestLogSanitizer, FPDocumentRepository fpDocumentRepository, FPDocumentService fpDocumentService) {
    this.docStorageRepository = docStorageRepository;
    this.objectMapper = objectMapper;
    this.integrationService = integrationService;
    this.propertyFileValue = propertyFileValue;
    this.requestLogSanitizer = requestLogSanitizer;
    this.fpDocumentRepository = fpDocumentRepository;
      this.fpDocumentService = fpDocumentService;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<List<DocStorageDTO>>> getDocumentStorageList(
      List<SupportingDocIDStorageIDPairDTO> supportingDocIDStorageIDListRQList)
      throws ApiRequestException {

    log.info(
        "START : getDocumentStorageList - DocumentServiceImpl request : {}",
        supportingDocIDStorageIDListRQList);
    DocStorageDTO docStorageDTO = new DocStorageDTO();
    List<DocStorageDTO> documentDTOList = new ArrayList<>();
    try {
      for (SupportingDocIDStorageIDPairDTO supportingDocIDStorageIDPairDTO :
          supportingDocIDStorageIDListRQList) {
        DocStorage docStorage =
            docStorageRepository
                .findById(supportingDocIDStorageIDPairDTO.getDocStorageID())
                .orElseThrow();

        docStorageDTO = new DocStorageDTO(docStorage);

        if (docStorage.getDocument() == null || docStorage.getDocument().length == 0) {
          log.info(
              "Document with ID {} is empty or not found in the CAS DB",
              supportingDocIDStorageIDPairDTO.getDocStorageID());

          DasDocumentRequestDTO request = new DasDocumentRequestDTO();
          request.setCaseId(docStorage.getCaseId());
          request.setDocumentId(docStorage.getDocumentReference());

          ResponseEntity<StandardResponse<DasDocumentDTO>> dasDocumentResponse =
              getDocumentById(request);

          DasDocumentDTO dasDocument = (DasDocumentDTO) dasDocumentResponse.getBody().getResponse();

          if (dasDocument.getBase64StrOrig() != null) {
            docStorageDTO.setDasDocument(dasDocument.getBase64StrOrig());
          } else {
            log.info("Document or Base64 content is null. Cannot set document bytes.");
            docStorageDTO.setDasDocument(null);
          }
        }

        log.info(
            "Documents retrieved successfully {} : ",
            requestLogSanitizer.sanitizeCreateRequest(docStorageDTO));

        documentDTOList.add(new DocStorageDTO(docStorageDTO));
      }
    } catch (Exception exception) {
      log.info(
          "ERROR: getDocumentStorageList - DocumentServiceImpl with error: {}",
          exception.getMessage(),
          exception);

      throw new ApiRequestException("Unable to Fetch Documents");
    }
    StandardResponse<List<DocStorageDTO>> response =
        new StandardResponse<>(
            ErrorEnums.SUCCESS_CODE.getStatus(),
            ErrorEnums.SUCCESS_CODE.getLabel(),
            documentDTOList);
    log.info(
        " END : getDocumentStorageList - DocumentServiceImpl response status : {} ",
        response.getMessage());

    return ResponseEntity.ok().body(response);
  }

//  @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
//  public ResponseEntity<StandardResponse<CreateCaseResponseDTO>> createCase(
//      CreateRequestDTO request) {
//    log.info("START : createcase - DocumentServiceImpl request : {}", request.getCreatedUserId());
//
//    CreateCaseDTO createCaseDTO = new CreateCaseDTO();
//    CreateCaseResponseDTO createCaseResponseDTO = new CreateCaseResponseDTO();
//    CreateDocumentRefResponseDTO createDocumentRefResponseDTO;
//
//    try {
//      if (request.getCaseid() == null || request.getCaseid().isEmpty()) {
//        log.info("Case ID is null or empty, creating a new case.");
//        log.info("Property file value for template path: {}", propertyFileValue.getTemplatePath());
//
//        createCaseDTO.setLastNodeID(lastNodeID);
//        createCaseDTO.setLastNodeElementOrder(lastNodeElementOrder);
//        createCaseDTO.setCreatedUserId(request.getCreatedUserId());
//        createCaseDTO.setUserLevel(request.getUserLevel());
//        createCaseDTO.setCreatedUserSol(request.getCreatedUserSol());
//        createCaseDTO.setCaseComment(request.getCaseComment());
//        createCaseDTO.setProperty(new ArrayList<>());
//        createCaseDTO.setCreatedUserId(request.getSenderid());
//
//        log.info("Request to the integration service : {}", createCaseDTO);
//        createCaseResponseDTO = integrationService.createCaseFromDas(createCaseDTO);
//
//        createDocumentRefResponseDTO = this.createDocumentRef(request, createCaseResponseDTO);
//      }
//      else {
//        log.info("Using existing Case ID: {}", request.getCaseid());
//        createDocumentRefResponseDTO = this.createDocumentRef(request, createCaseResponseDTO);
//        createCaseResponseDTO.setCaseid(request.getCaseid());
//      }
//
//      createCaseResponseDTO.setDocumentRef(createDocumentRefResponseDTO.getDocumentRef());
//
//      if ("ERROR".equalsIgnoreCase(createCaseResponseDTO.getResponceFlag())) {
//        log.error("Case creation failed. Response Flag: ERROR");
//        throw new ApiRequestException("Case creation failed due to SDAS service error.");
//      }
//
//      StandardResponse<CreateCaseResponseDTO> response =
//          new StandardResponse<>(
//              ErrorEnums.SUCCESS_CODE.getStatus(),
//              ErrorEnums.SUCCESS_CODE.getLabel(),
//              createCaseResponseDTO);
//
//      log.info(
//          "END : getDocumentStorageList - DocumentServiceImpl response status : {} ",
//          response.getMessage());
//      return ResponseEntity.ok().body(response);
//
//    } catch (ApiRequestException e) {
//      log.error("API Request Exception occurred: ", e);
//      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//          .body(new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), e.getMessage(), null));
//
//    }
//    catch (Exception e) {
//      log.error("Unexpected error occurred in createCase: ", e);
//      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//          .body(
//              new StandardResponse<>(
//                  ErrorEnums.SUCCESS_CODE.getStatus(), "Unexpected server error", null));
//    }
//  }


  @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<CreateCaseResponseDTO>> createCase(CreateRequestDTO request) {

    log.info("START : createCase - DocumentServiceImpl request : {}", request.getCreatedUserId());

    try {

      CreateCaseResponseDTO responseDTO = processCaseCreation(request);

      StandardResponse<CreateCaseResponseDTO> response = new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), ErrorEnums.SUCCESS_CODE.getLabel(), responseDTO);

      log.info("END : createCase - response status : {}", response.getMessage());

      return ResponseEntity.ok().body(response);

    } catch (ApiRequestException e) {

      log.error("API Request Exception occurred: ", e);

      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(new StandardResponse<>(
                      ErrorEnums.SUCCESS_CODE.getStatus(),
                      e.getMessage(),
                      null
              ));

    } catch (Exception e) {

      log.error("Unexpected error occurred in createCase: ", e);

      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(new StandardResponse<>(
                      ErrorEnums.SUCCESS_CODE.getStatus(),
                      "Unexpected server error",
                      null
              ));
    }
  }

  public CreateCaseResponseDTO processCaseCreation(CreateRequestDTO request) {

    log.info("Processing case creation for user: {}", request.getCreatedUserId());

    CreateCaseDTO createCaseDTO = new CreateCaseDTO();
    CreateCaseResponseDTO createCaseResponseDTO = new CreateCaseResponseDTO();
    CreateDocumentRefResponseDTO createDocumentRefResponseDTO = null;

    if (request.getCaseid() == null || request.getCaseid().isEmpty()) {

      log.info("Case ID is null or empty, creating a new case.");
      log.info("Property file value for template path: {}", propertyFileValue.getTemplatePath());

      createCaseDTO.setLastNodeID(lastNodeID);
      createCaseDTO.setLastNodeElementOrder(lastNodeElementOrder);
      createCaseDTO.setCreatedUserId(request.getCreatedUserId());
      createCaseDTO.setUserLevel(request.getUserLevel());
      createCaseDTO.setCreatedUserSol(request.getCreatedUserSol());
      createCaseDTO.setCaseComment(request.getCaseComment());
      createCaseDTO.setProperty(new ArrayList<>());

      createCaseDTO.setCreatedUserId(request.getSenderid());

      log.info("Request to the integration service : {}", createCaseDTO);

      boolean storedInDocStorageOnly = false;
      try {
        createCaseResponseDTO = integrationService.createCaseFromDas(createCaseDTO);
      } catch (ApiRequestException e) {
        log.warn(
            "createCaseFromDas failed; storing document in Doc Storage instead. {}",
            e.getMessage());
        createCaseResponseDTO = buildCreateCaseResponseFromLocalDocStorage(request);
        storedInDocStorageOnly = true;
      }

      if (!storedInDocStorageOnly && shouldFallbackToDocStorageAfterDasCase(createCaseResponseDTO)) {
        log.warn(
            "DAS case creation unavailable or unsuccessful; storing document in Doc Storage instead.");
        createCaseResponseDTO = buildCreateCaseResponseFromLocalDocStorage(request);
        storedInDocStorageOnly = true;
      }

      if (!storedInDocStorageOnly) {
        createDocumentRefResponseDTO = this.createDocumentRef(request, createCaseResponseDTO);
      }

    } else {
      log.info("Using existing Case ID: {}", request.getCaseid());
      createDocumentRefResponseDTO = this.createDocumentRef(request, createCaseResponseDTO);
      createCaseResponseDTO.setCaseid(request.getCaseid());
    }

    if (createDocumentRefResponseDTO != null) {
      createCaseResponseDTO.setDocumentRef(createDocumentRefResponseDTO.getDocumentRef());
    }

    if ("ERROR".equalsIgnoreCase(createCaseResponseDTO.getResponceFlag())) {
      log.error("Case creation failed. Response Flag: ERROR");
      throw new ApiRequestException("Case creation failed due to SDAS service error.");
    }

    return createCaseResponseDTO;
  }

  private boolean shouldFallbackToDocStorageAfterDasCase(CreateCaseResponseDTO dto) {
    if (dto == null) {
      return true;
    }
    if ("ERROR".equalsIgnoreCase(dto.getResponceFlag())) {
      return true;
    }
    String caseId = dto.getCaseid();
    return caseId == null || caseId.isBlank();
  }

  private CreateCaseResponseDTO buildCreateCaseResponseFromLocalDocStorage(CreateRequestDTO request)
      throws ApiRequestException {
    DocStorage saved = persistRequestFileToDocStorage(request);
    CreateCaseResponseDTO dto = new CreateCaseResponseDTO();
    dto.setResponceFlag("SUCCESS");
    dto.setCaseid(null);
    dto.setDocumentRef(String.valueOf(saved.getDocStorageID()));
    log.info(
        "Document stored in Doc Storage with id {} (DAS case creation not used).",
        saved.getDocStorageID());
    return dto;
  }

  private DocStorage persistRequestFileToDocStorage(CreateRequestDTO request)
      throws ApiRequestException {
    String b64 = request.getSdasfilecontent();
    if (b64 == null || b64.isBlank()) {
      throw new ApiRequestException("Cannot store document locally: sdasfilecontent is empty");
    }
    byte[] bytes;
    try {
      bytes = Base64.getDecoder().decode(b64);
    } catch (IllegalArgumentException e) {
      throw new ApiRequestException("Cannot store document locally: invalid base64 content", e);
    }
    DocStorage doc = new DocStorage();
    doc.setDescription(request.getCaseComment());
    doc.setFileName(request.getSdasdocumentname());
    doc.setDocument(bytes);
    doc.setLastUpdatedDate(new Date());
    doc.setFileType(request.getSdasdocumenttype());
    return docStorageRepository.save(doc);
  }

  private CreateDocumentRefResponseDTO createDocumentRef(
      CreateRequestDTO request, CreateCaseResponseDTO caseResponseDTO) throws ApiRequestException {
    log.info(
        "START : createDocumentRef - DocumentServiceImpl request : {}", request.getCreatedUserId());

    try {
      CreateDocumentRefRequestDTO requestDTO = new CreateDocumentRefRequestDTO();
      log.info(
          "Property file value for template path for document: {}",
          propertyFileValue.getTemplatePath());

//      String path = propertyFileValue.getTemplatePath() + File.separator + "document-ref.json";
//      File file = new File(path);
//
//      JsonNode root = objectMapper.readTree(file);

      requestDTO.setFoldersavein(foldersavein);
      requestDTO.setSenderid(request.getSenderid());
      requestDTO.setObjectstorename(objectstorename);
      requestDTO.setSdasdocumentname(request.getSdasdocumentname());

      if (request.getCaseid() == null) {
        requestDTO.setCaseid(caseResponseDTO.getCaseid());
      } else {
        requestDTO.setCaseid(request.getCaseid());
      }

      requestDTO.setSdasdocumenttype(request.getSdasdocumenttype());
      requestDTO.setAppreqid(appreqid);
      requestDTO.setUploaduserSecuritylevel(request.getUploaduserSecuritylevel());
      requestDTO.setSdasfilecontent(request.getSdasfilecontent());
      requestDTO.setSdasdocuemntsecurity(sdasdocuemntsecurity);
      requestDTO.setSdasdocumenttypeid(sdasdocumenttypeid);
      requestDTO.setCreatedUserId(request.getSenderid());
      requestDTO.setCreatedUserSol(request.getCreatedUserSol());
      requestDTO.setCreatedUserLevel(request.getUserLevel());
      requestDTO.setCaseComment(request.getCaseComment());

      log.info("Request to the integration service for create doc ref: {}", requestDTO.getSdasdocumentname());

      CreateDocumentRefResponseDTO createDocumentRefResponseDTO =
          integrationService.createDocumentRefFromDas(requestDTO);

      if (createDocumentRefResponseDTO.getDocumentRef().isEmpty()) {
        log.error("Document Ref creation failed. documentRef: Empty");
        throw new ApiRequestException("Document Ref creation failed due to SDAS service error.");
      }

      log.info(
          "END : createDocumentRef - DocumentServiceImpl response : {}",
          createDocumentRefResponseDTO);
      return createDocumentRefResponseDTO;

    }

    catch (ApiRequestException e) {
      log.error("Integration service call failed while creating document reference: ", e);
      throw e; // re-throw so the controller can catch and handle it
    } catch (Exception e) {
      log.error("Unexpected error in createDocumentRef: ", e);
      throw new ApiRequestException("Unexpected error while creating document reference", e);
    }
  }

  @Override
  @Transactional(readOnly = true, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<CaseDocumentsDTO>> getDasDocumentsByCaseId(String caseId) {
    log.info("START : getDasDocumentsByCaseId - DocumentServiceImpl caseId : {}", caseId);

    try {
      CaseDocumentsDTO caseDocumentsDTO = integrationService.getDasDocumentsByCaseId(caseId);

      StandardResponse<CaseDocumentsDTO> response =
          new StandardResponse<>(
              ErrorEnums.SUCCESS_CODE.getStatus(),
              ErrorEnums.SUCCESS_CODE.getLabel(),
              caseDocumentsDTO);

      log.info("END : getDasDocumentsByCaseId - DocumentServiceImpl response : {}", response);
      return ResponseEntity.ok().body(response);

    } catch (ApiRequestException e) {
      log.error("API Request Exception in getDasDocumentsByCaseId: ", e);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), e.getMessage(), null));

    } catch (Exception e) {
      log.error("Unexpected error in getDasDocumentsByCaseId: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(
              new StandardResponse<>(
                  ErrorEnums.SUCCESS_CODE.getStatus(), "Unexpected error occurred", null));
    }
  }

  @Override
  @Transactional(propagation = Propagation.REQUIRED, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<DasDocumentDTO>> getDocumentById(
      DasDocumentRequestDTO request) {
    log.info("START : getDocumentById - DocumentServiceImpl request : {}", request);

    try {
      DasDocumentDTO documentDTO = integrationService.getDocumentById(request);

      StandardResponse<DasDocumentDTO> response =
          new StandardResponse<>(
              ErrorEnums.SUCCESS_CODE.getStatus(), ErrorEnums.SUCCESS_CODE.getLabel(), documentDTO);

      if (propertyFileValue.isLogOriginalBase64()) {
        log.info(
            "DAS Response: contentType={}, base64Str={}, base64StrOrig={}",
            documentDTO.getContentType(),
            documentDTO.getBase64Str(),
            documentDTO.getBase64StrOrig());
      } else {
        log.info(
            "DAS Response: contentType={}, base64Str={}, base64StrOrig={}",
            documentDTO.getContentType(),
            documentDTO.getBase64Str(),
            "file retrieved from DAS, original base64 not logged");
      }

      log.info("END : getDocumentById - DocumentServiceImpl success");
      return ResponseEntity.ok().body(response);

    } catch (ApiRequestException e) {
      log.error("API Request Exception in getDocumentById: ", e);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), e.getMessage(), null));

    } catch (Exception e) {
      log.error("Unexpected error in getDocumentById: ", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(
              new StandardResponse<>(
                  ErrorEnums.SUCCESS_CODE.getStatus(), "Unexpected error occurred", null));
    }
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<DocStorageDTO>> getDocumentStorageByDocStorageID(
      Integer docStorageID) throws ApiRequestException {

    log.info(
        "START : getDocumentStorageByDocStorageID - DocumentServiceImpl docStorageID : {}",
        docStorageID);
    DocStorageDTO docStorageDTO = new DocStorageDTO();
    try {
      DocStorage docStorage = docStorageRepository.findById(docStorageID).orElseThrow();

      docStorageDTO = new DocStorageDTO(docStorage);

      if (docStorage.getDocument() == null || docStorage.getDocument().length == 0) {
        log.info("Document with ID {} is empty or not found in the CAS DB", docStorageID);

        DasDocumentRequestDTO request = new DasDocumentRequestDTO();
        request.setCaseId(docStorage.getCaseId());
        request.setDocumentId(docStorage.getDocumentReference());

        ResponseEntity<StandardResponse<DasDocumentDTO>> dasDocumentResponse =
            getDocumentById(request);

        DasDocumentDTO dasDocument = (DasDocumentDTO) dasDocumentResponse.getBody().getResponse();

        if (dasDocument.getBase64StrOrig() != null) {
          docStorageDTO.setDasDocument(dasDocument.getBase64StrOrig());
        } else {
          log.info("Document or Base64 content is null. Cannot set document bytes.");
          docStorageDTO.setDasDocument(null);
        }

        docStorageDTO.setFileType(docStorage.getFileType());
      }

      log.info("Documents retrieved successfully {} : ", requestLogSanitizer.sanitizeCreateRequest(docStorageDTO));

    } catch (Exception exception) {
      log.info(
          "ERROR: getDocumentStorageList - DocumentServiceImpl with error: {}",
          exception.getMessage(),
          exception);

      throw new ApiRequestException("Unable to Fetch Documents");
    }
    StandardResponse<DocStorageDTO> response =
        new StandardResponse<>(
            ErrorEnums.SUCCESS_CODE.getStatus(), ErrorEnums.SUCCESS_CODE.getLabel(), docStorageDTO);
    log.info(
        "END : getDocumentStorageList - DocumentServiceImpl response status : {} ",
        response.getMessage());

    return ResponseEntity.ok().body(response);
  }


  @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
  public ResponseEntity<StandardResponse<?>> saveDocumentByModule(DocumentModuleDTO request
  ) throws ApiRequestException {

    log.info("START : saveDocumentByModule request : {}", request);

    if (request == null || request.getModuleType() == null) {
      throw new ApiRequestException("Module type cannot be null");
    }

    Object responseData;
    DocumentModule moduleType;

    try {
      moduleType = DocumentModule.valueOf(
              request.getModuleType().toUpperCase()
      );
    } catch (Exception e) {
      throw new ApiRequestException(
              "Invalid module type: " + request.getModuleType()
      );
    }

    try {

      switch (moduleType) {

        case FP:
          responseData = fpDocumentService.saveFPDocument((FPDocumentDTO) request.getPayload());
          break;

        default:
          throw new ApiRequestException(
                  "Unsupported module type: " + request.getModuleType()
          );
      }

      StandardResponse<?> response =
              new StandardResponse<>(
                      ErrorEnums.SUCCESS_CODE.getStatus(),
                      ErrorEnums.SUCCESS_CODE.getLabel(),
                      responseData
              );

      log.info("END : saveDocumentByModule success");

      return ResponseEntity.ok(response);

    } catch (ClassCastException e) {

      log.error("Payload casting error", e);

      throw new ApiRequestException(
              "Invalid payload for module type: " + request.getModuleType()
      );

    } catch (Exception e) {

      log.error("Unexpected error", e);

      throw new ApiRequestException(
              "Unable to process module save request"
      );
    }
  }
}
