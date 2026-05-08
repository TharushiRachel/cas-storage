package lk.sampath.cas_storage.service;

import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.DownloadDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthWithDocumentDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.enums.FPDocStatus;
import lk.sampath.cas_storage.exception.ApiRequestException;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

public interface FPDocumentService {

    ResponseEntity<StandardResponse<FPDocumentDTO>> saveFPDocument(FPDocumentDTO fpDocumentDTO) throws ApiRequestException;

    ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentById(DasDocumentRequestDTO dasDocumentRequestDTO) throws ApiRequestException;

    ResponseEntity<StandardResponse<List<FPDocumentDTO>>> getFPDocumentsByCaseId(String caseId) throws ApiRequestException;

    FPDocAuthDTO saveOrUpdateFPDocAuth(FPDocAuthDTO dto);

    FPDocAuthDTO getFPDocAuth(Long id);

    List<FPDocAuthDTO> getAllFPDocAuth();

    FPDocAuthCombinedListDTO getAllFPDocAuthTempAndMaster();

    List<FPDocAuthWithDocumentDTO> getFPDocAuthTempWithFpDocumentByFacilityPaperId(Integer facilityPaperId, FPDocStatus docStatus);

    List<FPDocAuthWithDocumentDTO> getFPDocAuthMasterWithFpDocumentByFacilityPaperId(Integer facilityPaperId, FPDocStatus docStatus);

    FPDocumentDTO deactivateFPDocument(Integer fpDocumentID) throws ApiRequestException;

    DownloadDocumentDTO downloadFPDocument(Integer fpDocumentId) throws IOException;
}
