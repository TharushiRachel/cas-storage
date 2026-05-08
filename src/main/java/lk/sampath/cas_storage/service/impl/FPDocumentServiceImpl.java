package lk.sampath.cas_storage.service.impl;

import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.DownloadDocumentDTO;
import lk.sampath.cas_storage.dto.common.DocStorageDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthWithDocumentDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.entity.DocStorage;
import lk.sampath.cas_storage.entity.SupportingDoc;
import lk.sampath.cas_storage.entity.facilityPaper.*;
import lk.sampath.cas_storage.enums.ErrorEnums;
import lk.sampath.cas_storage.enums.FPDocStatus;
import lk.sampath.cas_storage.enums.Status;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.repository.DocStorageRepository;
import lk.sampath.cas_storage.repository.FPDocumentRepository;
import lk.sampath.cas_storage.repository.SupportingDocRepository;
import lk.sampath.cas_storage.repository.facilityPaper.FPDocAuthAudRepository;
import lk.sampath.cas_storage.repository.facilityPaper.FPDocAuthMasterRepository;
import lk.sampath.cas_storage.repository.facilityPaper.FPDocAuthTempRepository;
import lk.sampath.cas_storage.service.DocumentService;
import lk.sampath.cas_storage.service.FPDocumentService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Log4j2
public class FPDocumentServiceImpl implements FPDocumentService {

    private final FPDocumentRepository fpDocumentRepository;
    private final DocumentService documentService;
    private final DocStorageRepository docStorageRepository;
    private final FPDocAuthTempRepository tempRepository;
    private final FPDocAuthMasterRepository masterRepository;
    private final FPDocAuthAudRepository audRepository;
    private final SupportingDocRepository supportingDocRepository;

    public FPDocumentServiceImpl(FPDocumentRepository fpDocumentRepository, @Lazy DocumentService documentService, DocStorageRepository docStorageRepository, FPDocAuthTempRepository tempRepository, FPDocAuthMasterRepository masterRepository, FPDocAuthAudRepository audRepository, SupportingDocRepository supportingDocRepository) {
        this.fpDocumentRepository = fpDocumentRepository;
        this.documentService = documentService;
        this.docStorageRepository = docStorageRepository;
        this.tempRepository = tempRepository;
        this.masterRepository = masterRepository;
        this.audRepository = audRepository;
        this.supportingDocRepository = supportingDocRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
    public ResponseEntity<StandardResponse<FPDocumentDTO>> saveFPDocument(FPDocumentDTO fpDocumentDTO) throws ApiRequestException {
        log.info("START : saveFPDocument - DocumentServiceImpl request : {}", fpDocumentDTO);

        try {
            FPDocument fpDocument = new FPDocument();
            fpDocument.setFacilityPaperID(fpDocumentDTO.getFacilityPaperID());

            SupportingDoc supportingDoc = supportingDocRepository.findById(fpDocumentDTO.getSupportingDocID())
                    .orElseThrow(() -> new ApiRequestException("SupportingDoc not found with ID: " + fpDocumentDTO.getSupportingDocID()));
            fpDocument.setSupportingDoc(supportingDoc);
            fpDocument.setDescription(fpDocumentDTO.getDescription());
            fpDocument.setUploadedUserDisplayName(fpDocumentDTO.getUploadedUserDisplayName());
            fpDocument.setUploadedDivCode(fpDocumentDTO.getUploadedDivCode());
            fpDocument.setStatus(Status.ACT);
            fpDocument.setCreatedBy(fpDocumentDTO.getCreatedBy());
            fpDocument.setCreatedDate(fpDocumentDTO.getCreatedDate());
            fpDocument.setDocStatus(fpDocumentDTO.getDocStatus());
            fpDocument.setCreatedDate(new Date());
            fpDocument.setDocumentName(fpDocumentDTO.getIndividualDocumentName());

            CreateCaseResponseDTO caseResponse =documentService.processCaseCreation(fpDocumentDTO);

            fpDocument.setCaseId(caseResponse.getCaseid());
            fpDocument.setDocumentReference(caseResponse.getDocumentRef());

            if(caseResponse.getDocStorageId() != null){
                DocStorage docStorage = docStorageRepository.findById(caseResponse.getDocStorageId())
                        .orElseThrow(() -> new ApiRequestException("DocStorage not found with ID: " + caseResponse.getDocStorageId()));
                fpDocument.setDocStorage(docStorage);
            }

            FPDocument savedEntity = fpDocumentRepository.save(fpDocument);
            convertFpDocumentToFPDocAuth(savedEntity, fpDocumentDTO);

            FPDocumentDTO responseDTO = new FPDocumentDTO(savedEntity);

            StandardResponse<FPDocumentDTO> response = new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), ErrorEnums.SUCCESS_CODE.getLabel(), responseDTO);

            log.info("END : saveFPDocument - DocumentServiceImpl response status : {} ", response.getMessage());
            return ResponseEntity.ok().body(response);

        } catch (Exception e) {
            log.error("Error saving FP Document: ", e);
            throw new ApiRequestException("Unable to Save FP Document");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentById(
            DasDocumentRequestDTO dasDocumentRequestDTO) throws ApiRequestException {
        log.info(
                "START : getFPDocumentById - FPDocumentServiceImpl dasDocumentRequestDTO : {}",
                dasDocumentRequestDTO);
        if (dasDocumentRequestDTO == null) {
            throw new ApiRequestException("FP document id is required");
        }
        FPDocument entity = fpDocumentRepository.findById(dasDocumentRequestDTO.getFpDocumentID()).orElseThrow(() -> new ApiRequestException("FP Document not found with ID: " + dasDocumentRequestDTO.getFpDocumentID()));
        FPDocumentDTO fpDocumentDTO = new FPDocumentDTO(entity);

        String documentReference = entity.getDocumentReference();
        boolean hasDasReference = documentReference != null && !documentReference.isBlank();

        if (hasDasReference) {
            DasDocumentDTO dasDocumentDTO =
                    documentService.fetchDocumentFromIntegrationService(dasDocumentRequestDTO);
            log.info("Document fetched from integration for FP Document ID: {}", dasDocumentRequestDTO.getFpDocumentID());
            fpDocumentDTO.setDasDocumentDTO(dasDocumentDTO);
            if (entity.getDocStorage() != null) {
                fpDocumentDTO.setDocStorageDTO(
                        new DocStorageDTO(entity.getDocStorage(), false));
            }
        } else if (entity.getDocStorage() != null) {
            DocStorageDTO docStorageDTO =
                    documentService.downloadDocumentDTOByStorageID(
                            entity.getDocStorage().getDocStorageID());
            fpDocumentDTO.setDocStorageDTO(docStorageDTO);
        }

        StandardResponse<FPDocumentDTO> response =
                new StandardResponse<>(
                        ErrorEnums.SUCCESS_CODE.getStatus(),
                        ErrorEnums.SUCCESS_CODE.getLabel(),
                        fpDocumentDTO);
        log.info("END : getFPDocumentById - FPDocumentServiceImpl");
        return ResponseEntity.ok().body(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<StandardResponse<List<FPDocumentDTO>>> getFPDocumentsByCaseId(String caseId)
            throws ApiRequestException {
        log.info("START : getFPDocumentsByCaseId - FPDocumentServiceImpl caseId : {}", caseId);
        if (caseId == null || caseId.isBlank()) {
            throw new ApiRequestException("Case id is required");
        }
        List<FPDocumentDTO> list = fpDocumentRepository.findByCaseId(caseId).stream()
                        .map(FPDocumentDTO::new)
                        .collect(Collectors.toList());
        StandardResponse<List<FPDocumentDTO>> response =
                new StandardResponse<>(
                        ErrorEnums.SUCCESS_CODE.getStatus(),
                        ErrorEnums.SUCCESS_CODE.getLabel(),
                        list);
        log.info("END : getFPDocumentsByCaseId - count : {}", list.size());
        return ResponseEntity.ok().body(response);
    }


    private FPDocAuthDTO convertFpDocumentToFPDocAuth(FPDocument fpDocument, FPDocumentDTO fpDocumentDTO) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        dto.setFpDocId(fpDocument.getFpDocumentID());
        dto.setFacilityPaperId(fpDocument.getFacilityPaperID());
        dto.setAddedBy(fpDocument.getCreatedBy());
        dto.setAddedDate(fpDocument.getCreatedDate());
        dto.setAddedUserDisplayName(fpDocument.getUploadedUserDisplayName());
        dto.setAddedUserDivCode(fpDocument.getUploadedDivCode());
        dto.setAddedUserWorkClass(fpDocumentDTO.getCreateRequestDTO().getUserLevel());
        dto.setAddedUserDivCode(fpDocument.getUploadedDivCode());
        dto.setAddedUserBranchCode(fpDocumentDTO.getUploadedDivCode());
        dto.setCurrentAssignUser("");
        //need to add the other

        saveOrUpdateFPDocAuth(dto);

        return dto;

    }

    @Override
    @Transactional
    public FPDocAuthDTO saveOrUpdateFPDocAuth(FPDocAuthDTO dto) {
        FPDocAuthTemp temp;
        boolean isUpdate = false;

        if (dto.getId() != null) {
            temp = tempRepository.findByIdWithFpDocument(dto.getId())
                    .orElseThrow(() -> new ApiRequestException("Record not found in Temp with ID: " + dto.getId()));
            isUpdate = true;
        } else {
            temp = new FPDocAuthTemp();
        }

        // Each temp update must insert a new audit row (snapshot before this change).
        if (isUpdate) {
            insertAuditRowForUpdate(temp);
        }

        BeanUtils.copyProperties(dto, temp, "id", "fpDocId");
        applyFpDocumentReference(temp, dto.getFpDocId());
        temp = tempRepository.save(temp);

        // If authorized, persist to master, add audit, remove temp
        if ("Y".equalsIgnoreCase(temp.getIsAuthorized())) {
            return promoteTempToMaster(temp);
        }

        return convertToDTO(temp);
    }

    @Override
    @Transactional(readOnly = true)
    public FPDocAuthDTO getFPDocAuth(Long id) {
        return tempRepository
                .findByIdWithFpDocument(id)
                .map(this::convertToDTO)
                .orElseGet(
                        () ->
                                masterRepository
                                        .findByIdWithFpDocument(id)
                                        .map(this::convertMasterToDTO)
                                        .orElseThrow(
                                                () ->
                                                        new ApiRequestException(
                                                                "Record not found in Temp or Master with ID: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FPDocAuthDTO> getAllFPDocAuth() {
        return tempRepository.findAllWithFpDocument().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FPDocAuthCombinedListDTO getAllFPDocAuthTempAndMaster() {
        FPDocAuthCombinedListDTO combined = new FPDocAuthCombinedListDTO();
        combined.setTempRecords(
                tempRepository.findAllWithFpDocument().stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
        combined.setMasterRecords(
                masterRepository.findAllWithFpDocument().stream()
                        .map(this::convertMasterToDTO)
                        .collect(Collectors.toList()));
        return combined;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FPDocAuthWithDocumentDTO> getFPDocAuthTempWithFpDocumentByFacilityPaperId(
            Integer facilityPaperId, FPDocStatus docStatus) {
        List<FPDocument> fpDocs = resolveFpDocumentsForFacilityPaper(facilityPaperId, docStatus);
        List<FPDocAuthWithDocumentDTO> results = fpDocs.stream()
                .flatMap(fpDoc -> tempRepository.findByFpDocumentIdWithFetch(fpDoc.getFpDocumentID()).stream())
                .map(this::toAuthWithDocumentFromTemp)
                .collect(Collectors.toList());

        if (results.isEmpty()) {
            throw new ApiRequestException(
                    "No FP doc auth temp for facility paper id "
                            + facilityPaperId
                            + " and doc status "
                            + docStatus);
        }
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FPDocAuthWithDocumentDTO> getFPDocAuthMasterWithFpDocumentByFacilityPaperId(
            Integer facilityPaperId, FPDocStatus docStatus) {
        log.info("Fetching FP doc auth master records for facility paper id {} and doc status {}", facilityPaperId, docStatus);
        List<FPDocument> fpDocs = resolveFpDocumentsForFacilityPaper(facilityPaperId, docStatus);
        List<FPDocAuthWithDocumentDTO> results = fpDocs.stream()
                .flatMap(fpDoc -> masterRepository.findByFpDocumentIdWithFetch(fpDoc.getFpDocumentID()).stream())
                .map(this::toAuthWithDocumentFromMaster)
                .collect(Collectors.toList());

        log.info("Found {} FP doc auth master records for facility paper id {} and doc status {}", results.size(), facilityPaperId, docStatus);

        if (results.isEmpty()) {
            throw new ApiRequestException(
                    "No FP doc auth master for facility paper id "
                            + facilityPaperId
                            + " and doc status "
                            + docStatus);
        }

        log.info("Returning {} FP doc auth master records for facility paper id {} and doc status {}", results.size(), facilityPaperId, docStatus);
        return results;
    }


    private List<FPDocument> resolveFpDocumentsForFacilityPaper(
            Integer facilityPaperId, FPDocStatus docStatus) {
        if (facilityPaperId == null) {
            throw new ApiRequestException("Facility paper id is required");
        }
        if (docStatus == null) {
            throw new ApiRequestException("Doc status is required");
        }
        List<FPDocument> docs = fpDocumentRepository.findByFacilityPaperIDAndDocStatus(facilityPaperId, docStatus);
        if (docs.isEmpty()) {
            throw new ApiRequestException(
                    "No FP document for facility paper id "
                            + facilityPaperId
                            + " and doc status "
                            + docStatus);
        }
        return docs;
    }

    private FPDocAuthWithDocumentDTO toAuthWithDocumentFromTemp(FPDocAuthTemp temp) {
        FPDocument doc = temp.getFpDocument();
        FPDocAuthWithDocumentDTO out = new FPDocAuthWithDocumentDTO();
        out.setAuthRecord(convertToDTO(temp, resolveFpDocumentId(doc)));
        out.setFpDocument(doc == null ? null : new FPDocumentDTO(doc));
        return out;
    }

    private FPDocAuthWithDocumentDTO toAuthWithDocumentFromMaster(FPDocAuthMaster master) {
        FPDocument doc = master.getFpDocument();
        FPDocAuthWithDocumentDTO out = new FPDocAuthWithDocumentDTO();
        out.setAuthRecord(convertMasterToDTO(master, resolveFpDocumentId(doc)));
        out.setFpDocument(doc == null ? null : new FPDocumentDTO(doc));
        return out;
    }

    private void insertAuditRowForUpdate(FPDocAuthTemp tempBeforeChange) {
        FPDocAuthAud aud = new FPDocAuthAud();
        BeanUtils.copyProperties(tempBeforeChange, aud, "id", "fpDocument");
        aud.setId(tempBeforeChange.getId());
        aud.setFpDocId(resolveFpDocumentId(tempBeforeChange.getFpDocument()));
        aud.setAudDate(new Date());
        aud.setAudAction("UPDATE");
        audRepository.save(aud);
    }

    private void insertAuditRowForPromotion(FPDocAuthTemp tempFinalState) {
        FPDocAuthAud aud = new FPDocAuthAud();
        BeanUtils.copyProperties(tempFinalState, aud, "id", "fpDocument");
        aud.setId(tempFinalState.getId());
        aud.setFpDocId(resolveFpDocumentId(tempFinalState.getFpDocument()));
        aud.setAudDate(new Date());
        aud.setAudAction("PROMOTED_TO_MASTER");
        audRepository.save(aud);
    }

    private FPDocAuthDTO promoteTempToMaster(FPDocAuthTemp temp) {
        insertAuditRowForPromotion(temp);
        FPDocAuthMaster master = new FPDocAuthMaster();
        BeanUtils.copyProperties(temp, master, "id");
        master.setId(temp.getId());
        master = masterRepository.save(master);
        tempRepository.deleteById(temp.getId());
        return convertMasterToDTO(master);
    }

    private void applyFpDocumentReference(FPDocAuthTemp temp, Integer fpDocId) {
        if (fpDocId == null) {
            temp.setFpDocument(null);
            return;
        }
        temp.setFpDocument(fpDocumentRepository.getReferenceById(fpDocId));
    }

    private static Integer resolveFpDocumentId(FPDocument fpDocument) {
        return fpDocument == null ? null : fpDocument.getFpDocumentID();
    }

    private FPDocAuthDTO convertToDTO(FPDocAuthTemp temp) {
        return convertToDTO(temp, resolveFpDocumentId(temp.getFpDocument()));
    }

    private FPDocAuthDTO convertToDTO(FPDocAuthTemp temp, Integer fpDocId) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        BeanUtils.copyProperties(temp, dto);
        dto.setFpDocId(fpDocId);
        return dto;
    }

    private FPDocAuthDTO convertMasterToDTO(FPDocAuthMaster master) {
        return convertMasterToDTO(master, resolveFpDocumentId(master.getFpDocument()));
    }

    private FPDocAuthDTO convertMasterToDTO(FPDocAuthMaster master, Integer fpDocId) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        BeanUtils.copyProperties(master, dto);
        dto.setFpDocId(fpDocId);
        return dto;
    }

    @Override
    public FPDocumentDTO deactivateFPDocument(Integer fpDocumentID) throws ApiRequestException {
        FPDocument fpDocument = fpDocumentRepository.findById(fpDocumentID)
                .orElseThrow(() -> new ApiRequestException("FP Document not found with ID: " + fpDocumentID));
        fpDocument.setStatus(Status.INA);
        FPDocument updatedDocument = fpDocumentRepository.save(fpDocument);
        return new FPDocumentDTO(updatedDocument);
    }

    @Override
    public DownloadDocumentDTO downloadFPDocument(Integer fpDocumentId) throws ApiRequestException, IOException {
        log.info("START : downloadFPDocument : {}", fpDocumentId);

        FPDocument fpDocument = fpDocumentRepository.findById(fpDocumentId).orElseThrow(() -> new ApiRequestException("FP Document not found"));

        byte[] fileData = new byte[0];

        if (fpDocument.getDocStorage() != null && fpDocument.getDocStorage().getDocStorageID() != null) {
            DocStorage docStorage =
                    docStorageRepository
                            .findById(fpDocument.getDocStorage().getDocStorageID())
                            .orElseThrow(() -> new ApiRequestException("Stored document not found"));
            byte[] stored = docStorage.getDocument();
            if (stored != null && stored.length > 0) {
                fileData = stored;
            }
        }

        if ((fileData == null || fileData.length == 0)
                && fpDocument.getDocumentReference() != null
                && !fpDocument.getDocumentReference().isBlank()) {
            if (fpDocument.getCaseId() == null || fpDocument.getCaseId().isBlank()) {
                throw new ApiRequestException("Case id is required to fetch document");
            }
            DasDocumentRequestDTO dasDocumentRequestDTO = new DasDocumentRequestDTO();
            dasDocumentRequestDTO.setCaseId(fpDocument.getCaseId());
            dasDocumentRequestDTO.setDocumentId(fpDocument.getDocumentReference());
            DasDocumentDTO dasDocumentDTO =
                    documentService.fetchDocumentFromIntegrationService(dasDocumentRequestDTO);
            String dasDocument = dasDocumentDTO.getBase64StrOrig();
            if (dasDocument == null || dasDocument.isBlank()) {
                throw new ApiRequestException("Document content is empty");
            }
            fileData = Base64.getDecoder().decode(dasDocument);
        }

        if (fileData == null || fileData.length == 0) {
            throw new ApiRequestException("Document content is empty");
        }

        DownloadDocumentDTO downloadDocumentDTO = new DownloadDocumentDTO();
        downloadDocumentDTO.setDocument(fileData);
        downloadDocumentDTO.setFileName(fpDocument.getDocumentName());

        log.info("END : downloadFPDocument : {}", fpDocumentId);
        return downloadDocumentDTO;
    }

}
