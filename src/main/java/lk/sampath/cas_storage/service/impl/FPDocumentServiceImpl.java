package lk.sampath.cas_storage.service.impl;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthWithDocumentDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.entity.FPDocAuthAud;
import lk.sampath.cas_storage.entity.FPDocAuthMaster;
import lk.sampath.cas_storage.entity.FPDocAuthTemp;
import lk.sampath.cas_storage.entity.FPDocument;
import lk.sampath.cas_storage.enums.ErrorEnums;
import lk.sampath.cas_storage.enums.FPDocStatus;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.repository.FPDocAuthAudRepository;
import lk.sampath.cas_storage.repository.FPDocAuthMasterRepository;
import lk.sampath.cas_storage.repository.FPDocAuthTempRepository;
import lk.sampath.cas_storage.repository.FPDocumentRepository;
import lk.sampath.cas_storage.service.DocumentService;
import lk.sampath.cas_storage.service.FPDocumentService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Log4j2
public class FPDocumentServiceImpl implements FPDocumentService {

    private final FPDocumentRepository fpDocumentRepository;
    private final DocumentService documentService;
    private final FPDocAuthTempRepository tempRepository;
    private final FPDocAuthMasterRepository masterRepository;
    private final FPDocAuthAudRepository audRepository;

    public FPDocumentServiceImpl(FPDocumentRepository fpDocumentRepository, 
                                 @Lazy DocumentService documentService,
                                 FPDocAuthTempRepository tempRepository,
                                 FPDocAuthMasterRepository masterRepository,
                                 FPDocAuthAudRepository audRepository) {
        this.fpDocumentRepository = fpDocumentRepository;
        this.documentService = documentService;
        this.tempRepository = tempRepository;
        this.masterRepository = masterRepository;
        this.audRepository = audRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = ApiRequestException.class)
    public ResponseEntity<StandardResponse<FPDocumentDTO>> saveFPDocument(FPDocumentDTO fpDocumentDTO)
        throws ApiRequestException {
        log.info("START : saveFPDocument - FPDocumentServiceImpl request : {}", fpDocumentDTO);

        try {
            FPDocument fpDocument = new FPDocument();
            fpDocument.setFacilityPaperID(fpDocumentDTO.getFacilityPaperID());
            fpDocument.setSupportingDocID(fpDocumentDTO.getSupportingDocID());
            fpDocument.setDescription(fpDocumentDTO.getDescription());
            fpDocument.setUploadedUserDisplayName(fpDocumentDTO.getUploadedUserDisplayName());
            fpDocument.setUploadedDivCode(fpDocumentDTO.getUploadedDivCode());
            fpDocument.setStatus(fpDocumentDTO.getStatus());
            fpDocument.setDocStatus(fpDocumentDTO.getDocStatus());
            fpDocument.setCreatedBy(fpDocumentDTO.getCreatedBy());
            fpDocument.setCreatedDate(fpDocumentDTO.getCreatedDate());

            CreateCaseResponseDTO caseResponse =documentService.processCaseCreation(fpDocumentDTO.getCreateRequestDTO());

            fpDocument.setCaseId(caseResponse.getCaseid());
            fpDocument.setDocumentReference(caseResponse.getDocumentRef());
            fpDocument.setDocStorageID(caseResponse.getDocStorageID());

            FPDocument savedEntity = fpDocumentRepository.save(fpDocument);
            FPDocumentDTO responseDTO = new FPDocumentDTO(savedEntity);

            StandardResponse<FPDocumentDTO> response = new StandardResponse<>(ErrorEnums.SUCCESS_CODE.getStatus(), ErrorEnums.SUCCESS_CODE.getLabel(), responseDTO);

            log.info("END : saveFPDocument - FPDocumentServiceImpl response status : {} ", response.getMessage());
            return ResponseEntity.ok().body(response);

        } catch (ApiRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error saving FP Document: ", e);
            throw new ApiRequestException("Unable to Save FP Document");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentByFacilityPaperIdAndDocStatus(
            Integer facilityPaperId, FPDocStatus docStatus) throws ApiRequestException {
        log.info(
                "START : getFPDocumentByFacilityPaperIdAndDocStatus facilityPaperId {} docStatus {}",
                facilityPaperId,
                docStatus);
        FPDocument entity = resolveSingleFpDocumentForFacilityPaper(facilityPaperId, docStatus);
        StandardResponse<FPDocumentDTO> response =
                new StandardResponse<>(
                        ErrorEnums.SUCCESS_CODE.getStatus(),
                        ErrorEnums.SUCCESS_CODE.getLabel(),
                        new FPDocumentDTO(entity));
        log.info("END : getFPDocumentByFacilityPaperIdAndDocStatus");
        return ResponseEntity.ok().body(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentById(Integer fpDocumentId)
        throws ApiRequestException {
        log.info("START : getFPDocumentById - FPDocumentServiceImpl fpDocumentId : {}", fpDocumentId);
        if (fpDocumentId == null) {
            throw new ApiRequestException("FP document id is required");
        }
        FPDocument entity =
            fpDocumentRepository
                .findById(fpDocumentId)
                .orElseThrow(() -> new ApiRequestException("FP document not found"));
        StandardResponse<FPDocumentDTO> response =
            new StandardResponse<>(
                ErrorEnums.SUCCESS_CODE.getStatus(),
                ErrorEnums.SUCCESS_CODE.getLabel(),
                new FPDocumentDTO(entity));
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
        List<FPDocumentDTO> list =
            fpDocumentRepository.findByCaseId(caseId).stream()
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
                .map(fpDoc -> tempRepository.findByFpDocumentIdWithFetch(fpDoc.getFpDocumentID()).orElse(null))
                .filter(java.util.Objects::nonNull)
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
        List<FPDocument> fpDocs = resolveFpDocumentsForFacilityPaper(facilityPaperId, docStatus);
        List<FPDocAuthWithDocumentDTO> results = fpDocs.stream()
                .map(fpDoc -> masterRepository.findByFpDocumentIdWithFetch(fpDoc.getFpDocumentID()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(this::toAuthWithDocumentFromMaster)
                .collect(Collectors.toList());

        if (results.isEmpty()) {
            throw new ApiRequestException(
                    "No FP doc auth master for facility paper id "
                            + facilityPaperId
                            + " and doc status "
                            + docStatus);
        }
        return results;
    }

    private FPDocument resolveSingleFpDocumentForFacilityPaper(
            Integer facilityPaperId, FPDocStatus docStatus) {
        List<FPDocument> docs = resolveFpDocumentsForFacilityPaper(facilityPaperId, docStatus);
        if (docs.size() > 1) {
            throw new ApiRequestException(
                    "Multiple FP documents for facility paper id "
                            + facilityPaperId
                            + " and doc status "
                            + docStatus
                            + "; expected exactly one");
        }
        return docs.get(0);
    }

    private List<FPDocument> resolveFpDocumentsForFacilityPaper(
            Integer facilityPaperId, FPDocStatus docStatus) {
        if (facilityPaperId == null) {
            throw new ApiRequestException("Facility paper id is required");
        }
        if (docStatus == null) {
            throw new ApiRequestException("Doc status is required");
        }
        List<FPDocument> docs =
                fpDocumentRepository.findByFacilityPaperIDAndDocStatus(facilityPaperId, docStatus);
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
}
