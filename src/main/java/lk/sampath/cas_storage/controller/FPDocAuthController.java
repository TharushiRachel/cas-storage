package lk.sampath.cas_storage.controller;

import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocAuthDTO;
import lk.sampath.cas_storage.service.FPDocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fp-doc-auth")
public class FPDocAuthController {

    private final FPDocumentService fpDocumentService;

    public FPDocAuthController(FPDocumentService fpDocumentService) {
        this.fpDocumentService = fpDocumentService;
    }

    @PostMapping
    public ResponseEntity<StandardResponse<FPDocAuthDTO>> save(@RequestBody FPDocAuthDTO dto) {
        FPDocAuthDTO savedDto = fpDocumentService.saveFPDocAuth(dto);
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Saved Successfully", savedDto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse<FPDocAuthDTO>> update(@PathVariable("id") Long id, @RequestBody FPDocAuthDTO dto) {
        FPDocAuthDTO updatedDto = fpDocumentService.updateFPDocAuth(id, dto);
        return new ResponseEntity<>(
                new StandardResponse<>(true, "Updated Successfully", updatedDto),
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
