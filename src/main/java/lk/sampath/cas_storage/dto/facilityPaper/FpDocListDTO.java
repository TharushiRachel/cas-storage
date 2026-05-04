package lk.sampath.cas_storage.dto.facilityPaper;

import lk.sampath.cas_storage.enums.FPDocStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FPDocListDTO {

    private Integer facilityPaperID;

    private FPDocStatus docStatus;
}
