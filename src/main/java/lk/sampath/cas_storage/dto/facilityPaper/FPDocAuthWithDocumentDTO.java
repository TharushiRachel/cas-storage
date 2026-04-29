package lk.sampath.cas_storage.dto.facilityPaper;

import lombok.Data;

@Data
public class FPDocAuthWithDocumentDTO {

  private FPDocAuthDTO authRecord;

  private FPDocumentDTO fpDocument;
}
