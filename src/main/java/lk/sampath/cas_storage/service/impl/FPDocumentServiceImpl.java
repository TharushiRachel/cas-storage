package lk.sampath.cas_storage.service.impl;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
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

        BeanUtils.copyProperties(dto, temp, "id");
        temp = tempRepository.save(temp);

        // If it's an update, add an audit record
        if (isUpdate) {
            FPDocAuthAud aud = new FPDocAuthAud();
            BeanUtils.copyProperties(temp, aud, "id"); // Base fields
            aud.setId(temp.getId());
            aud.setAudDate(new Date());
            aud.setAudAction("UPDATE");
            audRepository.save(aud);
        }

        // If authorized, move to master
        if ("Y".equalsIgnoreCase(temp.getIsAuthorized())) {
            moveToMaster(temp);
        }

        return convertToDTO(temp);
    }

    @Override
    public FPDocAuthDTO getFPDocAuth(Long id) {
        FPDocAuthTemp temp = tempRepository.findById(id)
                .orElseThrow(() -> new ApiRequestException("Record not found with ID: " + id));
        return convertToDTO(temp);
    }

    @Override
    public List<FPDocAuthDTO> getAllFPDocAuth() {
        return tempRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void moveToMaster(FPDocAuthTemp temp) {
        FPDocAuthMaster master = new FPDocAuthMaster();
        BeanUtils.copyProperties(temp, master, "id");
        master.setId(temp.getId());
        masterRepository.save(master);
    }

    private FPDocAuthDTO convertToDTO(FPDocAuthTemp temp) {
        FPDocAuthDTO dto = new FPDocAuthDTO();
        BeanUtils.copyProperties(temp, dto);
        return dto;
    }
}
