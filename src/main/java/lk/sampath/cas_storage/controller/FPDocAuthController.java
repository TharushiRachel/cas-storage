package lk.sampath.cas_storage.controller;

import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthCombinedListDTO;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.service.FPDocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fp-doc-auth")
@CrossOrigin("*")
public class FPDocAuthController {

    private final FPDocumentService fpDocumentService;

    public FPDocAuthController(FPDocumentService fpDocumentService) {
        this.fpDocumentService = fpDocumentService;
    }

    @PostMapping
    public ResponseEntity<StandardResponse<FPDocAuthDTO>> saveOrUpdate(@RequestBody FPDocAuthDTO dto) {
        FPDocAuthDTO savedDto = fpDocumentService.saveOrUpdateFPDocAuth(dto);
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Saved/Updated Successfully", savedDto),
                HttpStatus.OK
        );
    }

    @GetMapping("/combined")
    public ResponseEntity<StandardResponse<FPDocAuthCombinedListDTO>> getTempAndMaster() {
        FPDocAuthCombinedListDTO combined = fpDocumentService.getAllFPDocAuthTempAndMaster();
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Fetched Successfully", combined),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<FPDocAuthDTO>> getById(@PathVariable("id") Long id) {
        FPDocAuthDTO dto = fpDocumentService.getFPDocAuth(id);
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Fetched Successfully", dto),
                HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<StandardResponse<List<FPDocAuthDTO>>> getAll() {
        List<FPDocAuthDTO> dtoList = fpDocumentService.getAllFPDocAuth();
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Fetched Successfully", dtoList),
                HttpStatus.OK
        );
    }
}
