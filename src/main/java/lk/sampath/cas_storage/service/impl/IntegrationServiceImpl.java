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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import java.time.Duration;
import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefResponseDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.service.IntegrationService;
import lk.sampath.cas_storage.util.PropertyFileValue;
import lk.sampath.cas_storage.util.RequestLogSanitizer;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Log4j2
public class IntegrationServiceImpl implements IntegrationService {

  private final PropertyFileValue propertyFileValue;
  private final WebClient webClient;
  private final ObjectMapper objectMapper;
  private final RequestLogSanitizer requestLogSanitizer;

  public IntegrationServiceImpl(
      PropertyFileValue propertyFileValue,
      WebClient webClient,
      ObjectMapper objectMapper,
      RequestLogSanitizer requestLogSanitizer) {
    this.propertyFileValue = propertyFileValue;
    this.webClient = webClient;
    this.objectMapper = objectMapper;
    this.requestLogSanitizer = requestLogSanitizer;
  }

  @Override
  public CreateCaseResponseDTO createCaseFromDas(CreateCaseDTO createCaseDTO)
      throws ApiRequestException {
    log.info(
        "START : createCaseFromDas - IntegrationServiceImpl | createCaseDTO : {}", createCaseDTO);

    boolean isServiceEnable = propertyFileValue.isCreateDasCaseEnable();
    CreateCaseResponseDTO createCaseResponseDTO = new CreateCaseResponseDTO();
    if (isServiceEnable) {
      String dasUrl = propertyFileValue.getCreateDasCaseUrl();
      log.info("DAS URL for create case Id: {}", dasUrl);

      try {
        log.info(
            "Calling DAS service to create case Request Body ===> {} : with URL ===> : {}",
            createCaseDTO,
            dasUrl);

        String response =
            webClient
                .post()
                .uri(dasUrl)
                .bodyValue(createCaseDTO)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofMillis(3000000));

        log.info("Response from DAS service for create case Id : {}", response);

        createCaseResponseDTO = objectMapper.readValue(response, CreateCaseResponseDTO.class);
      } catch (Exception e) {
        log.error("Error while calling DAS service for create case Id: {}", e.getMessage(), e);
        throw new ApiRequestException("Error while creating case in DAS service");
      }
    }

    log.info(
        "END : createCaseFromDas - IntegrationServiceImpl | createCaseResponseDTO : {}",
        createCaseResponseDTO);
    return createCaseResponseDTO;
  }

  @Override
  public CreateDocumentRefResponseDTO createDocumentRefFromDas(
      CreateDocumentRefRequestDTO createDocumentRefRequestDTO) throws ApiRequestException {
    log.info(
        "START : createDocumentRefFromDas - IntegrationServiceImpl | createDocumentRefRequestDTO : {}",
        requestLogSanitizer.sanitizeCreateRequest(createDocumentRefRequestDTO));

    boolean isServiceEnable = propertyFileValue.isCreateDasDocumentRefEnable();
    CreateDocumentRefResponseDTO createDocumentRefResponseDTO = new CreateDocumentRefResponseDTO();
    if (isServiceEnable) {
      String dasUrl = propertyFileValue.getCreateDasDocumentRefUrl();
      log.info("DAS URL for create document reference : {}", dasUrl);

      try {
        log.info(
            "Calling DAS service to create document reference Request Body ===> {} : with URL ===> : {}",
            requestLogSanitizer.sanitizeCreateRequest(createDocumentRefRequestDTO),
            dasUrl);

        String response =
            webClient
                .post()
                .uri(dasUrl)
                .bodyValue(createDocumentRefRequestDTO)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofMillis(3000000));

        log.info("Response from DAS service for create document reference : {}", response);

        createDocumentRefResponseDTO =
            objectMapper.readValue(response, CreateDocumentRefResponseDTO.class);
      } catch (Exception e) {
        log.error(
            "Error while calling DAS service for create document reference : {}",
            e.getMessage(),
            e);
        throw new ApiRequestException("Error while creating document reference in DAS service");
      }
    }

    log.info(
        "END : createDocumentRefFromDas - IntegrationServiceImpl | createDocumentRefResponseDTO : {}",
        createDocumentRefResponseDTO);
    return createDocumentRefResponseDTO;
  }

  @Override
  public CaseDocumentsDTO getDasDocumentsByCaseId(String caseId) throws ApiRequestException {
    log.info("START : getDasDocumentsByCaseId - IntegrationServiceImpl | caseId : {}", caseId);

    boolean isServiceEnable = propertyFileValue.isGetDasDocumentsByCaseIdEnable();
    CaseDocumentsDTO caseDocumentsDTO = new CaseDocumentsDTO();

    if (isServiceEnable) {
      String dasUrl =
          propertyFileValue
              .getGetDasDocumentsByCaseIdUrl()
              .replace("{caseId}", String.valueOf(caseId));
      log.info("DAS URL: {}", dasUrl);

      try {
        log.info(
            "Calling DAS service to get documents by case ID: {} with URL: {}", caseId, dasUrl);

        String response =
            webClient
                .get()
                .uri(dasUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofMillis(3000000));

        log.info("Response from DAS service: {}", response);

        Gson gson = new Gson();

        caseDocumentsDTO = gson.fromJson(response, CaseDocumentsDTO.class);
      } catch (Exception e) {
        log.error("Error while calling DAS service: {}", e.getMessage(), e);
        throw new ApiRequestException("Error while fetching documents from DAS service");
      }
    }

    log.info(
        "END : getDasDocumentsByCaseId - IntegrationServiceImpl | caseDocumentsDTO : {}",
        caseDocumentsDTO);
    return caseDocumentsDTO;
  }

  @Override
  public DasDocumentDTO getDocumentById(DasDocumentRequestDTO request) throws ApiRequestException {
    log.info("START : getDocumentById - IntegrationServiceImpl | request : {}", request);

    boolean isServiceEnable = propertyFileValue.isGetDasDocumentByDocIdEnable();
    DasDocumentDTO documentDTO = new DasDocumentDTO();

    if (isServiceEnable) {
      String dasUrl =
          propertyFileValue
              .getGetDasDocumentByDocIdUrl()
              .replace("{documentId}", request.getDocumentId())
              .replace("{caseId}", request.getCaseId());
      log.info("DAS URL: {}", dasUrl);

      try {
        log.info("Calling DAS service to get document by ID: {} with URL: {}", request, dasUrl);

        WebClient webClient =
            WebClient.builder()
                .exchangeStrategies(
                    ExchangeStrategies.builder()
                        .codecs(
                            config ->
                                config.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10 MB
                        .build())
                .build();

        String response =
            webClient
                .get()
                .uri(dasUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofMillis(3000000));

        log.info(
            "Property File Value for print the decoded file : {}",
            propertyFileValue.isLogOriginalBase64());
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
              "file fetched");
        }

        Gson gson = new Gson();
        documentDTO = gson.fromJson(response, DasDocumentDTO.class);
        log.info(
            "Response from DAS service: {}",
            requestLogSanitizer.sanitizeCreateRequest(documentDTO));

      } catch (Exception e) {
        log.error("Error while calling DAS service: {}", e.getMessage(), e);
        throw new ApiRequestException("Error while fetching document from DAS service");
      }
    }

    log.info(
        "END : getDocumentById - IntegrationServiceImpl | documentDTO : {}",
        requestLogSanitizer.sanitizeCreateRequest(documentDTO));
    return documentDTO;
  }
}
