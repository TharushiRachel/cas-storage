package lk.sampath.cas_storage.service;

import java.util.List;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import org.springframework.http.ResponseEntity;

public interface FPDocumentService {

  ResponseEntity<StandardResponse<FPDocumentDTO>> saveFPDocument(FPDocumentDTO fpDocumentDTO)
      throws ApiRequestException;

  ResponseEntity<StandardResponse<FPDocumentDTO>> getFPDocumentById(Integer fpDocumentId)
      throws ApiRequestException;

  ResponseEntity<StandardResponse<List<FPDocumentDTO>>> getFPDocumentsByCaseId(String caseId)
      throws ApiRequestException;

  lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO saveOrUpdateFPDocAuth(lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO dto);

  lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO getFPDocAuth(Long id);

  List<lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO> getAllFPDocAuth();

  lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO getAllFPDocAuthTempAndMaster();
}
