package lk.sampath.cas_storage.service;

import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import org.springframework.http.ResponseEntity;

public interface FPDocumentService {

    ResponseEntity<StandardResponse<FPDocumentDTO>> saveFPDocument(FPDocumentDTO fpDocumentDTO) throws ApiRequestException;
}
