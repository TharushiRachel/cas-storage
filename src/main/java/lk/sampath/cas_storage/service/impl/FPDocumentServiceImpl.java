package lk.sampath.cas_storage.service.impl;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.entity.FPDocAuthAud;
import lk.sampath.cas_storage.entity.FPDocAuthMaster;
import lk.sampath.cas_storage.entity.FPDocAuthTemp;
import lk.sampath.cas_storage.entity.FPDocument;
import lk.sampath.cas_storage.enums.ErrorEnums;
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
            temp = tempRepository.findById(dto.getId())
                    .orElseThrow(() -> new ApiRequestException("Record not found in Temp with ID: " + dto.getId()));
            isUpdate = true;
        } else {
            temp = new FPDocAuthTemp();
        }

        // Each temp update must insert a new audit row (snapshot before this change).
        if (isUpdate) {
            insertAuditRowForUpdate(temp);
        }

        BeanUtils.copyProperties(dto, temp, "id");
        temp = tempRepository.save(temp);

        // If authorized, persist to master, add audit, remove temp
        if ("Y".equalsIgnoreCase(temp.getIsAuthorized())) {
            return promoteTempToMaster(temp);
        }

        return convertToDTO(temp);
    }

    @Override
    public FPDocAuthDTO getFPDocAuth(Long id) {
        return tempRepository
                .findById(id)
                .map(this::convertToDTO)
                .orElseGet(
                    () ->
                        masterRepository
                            .findById(id)
                            .map(this::convertMasterToDTO)
                            .orElseThrow(
                                () ->
                                    new ApiRequestException(
                                        "Record not found in Temp or Master with ID: " + id)));
    }

    @Override
    public List<FPDocAuthDTO> getAllFPDocAuth() {
        return tempRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FPDocAuthCombinedListDTO getAllFPDocAuthTempAndMaster() {
        FPDocAuthCombinedListDTO combined = new FPDocAuthCombinedListDTO();
        combined.setTempRecords(
                tempRepository.findAll().stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList()));
        combined.setMasterRecords(
                masterRepository.findAll().stream()
                        .map(this::convertMasterToDTO)
                        .collect(Collectors.toList()));
        return combined;
    }

    private void insertAuditRowForUpdate(FPDocAuthTemp tempBeforeChange) {
        FPDocAuthAud aud = new FPDocAuthAud();
        BeanUtils.copyProperties(tempBeforeChange, aud, "id");
        aud.setId(tempBeforeChange.getId());
        aud.setAudDate(new Date());
        aud.setAudAction("UPDATE");
        audRepository.saveAndFlush(aud);
    }

    private void insertAuditRowForPromotion(FPDocAuthTemp tempFinalState) {
        FPDocAuthAud aud = new FPDocAuthAud();
        BeanUtils.copyProperties(tempFinalState, aud, "id");
        aud.setId(tempFinalState.getId());
        aud.setAudDate(new Date());
        aud.setAudAction("PROMOTED_TO_MASTER");
        audRepository.saveAndFlush(aud);
    }

    private FPDocAuthDTO promoteTempToMaster(FPDocAuthTemp temp) {
        insertAuditRowForPromotion(temp);
        FPDocAuthMaster master = new FPDocAuthMaster();
        BeanUtils.copyProperties(temp, master, "id");
        master.setId(temp.getId());
        master = masterRepository.saveAndFlush(master);
        tempRepository.deleteById(temp.getId());
        tempRepository.flush();
        return convertMasterToDTO(master);
    }

    private FPDocAuthDTO convertToDTO(FPDocAuthTemp temp) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        BeanUtils.copyProperties(temp, dto);
        return dto;
    }

    private FPDocAuthDTO convertMasterToDTO(FPDocAuthMaster master) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        BeanUtils.copyProperties(master, dto);
        return dto;
    }
}
