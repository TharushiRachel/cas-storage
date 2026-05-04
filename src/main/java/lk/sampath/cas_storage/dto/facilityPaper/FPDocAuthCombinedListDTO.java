package lk.sampath.cas_storage.dto.facilityPaper;

import lombok.Data;

import java.util.List;

@Data
public class FPDocAuthCombinedListDTO {

    private List<FPDocAuthDTO> tempRecords;

    private List<FPDocAuthDTO> masterRecords;
}
