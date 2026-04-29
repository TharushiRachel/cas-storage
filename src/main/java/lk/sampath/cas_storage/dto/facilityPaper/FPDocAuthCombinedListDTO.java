package lk.sampath.cas_storage.dto.facilityPaper;

import java.util.List;
import lombok.Data;

@Data
public class FPDocAuthCombinedListDTO {

  private List<FPDocAuthDTO> tempRecords;

  private List<FPDocAuthDTO> masterRecords;
}
