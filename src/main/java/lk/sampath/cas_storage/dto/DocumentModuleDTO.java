package lk.sampath.cas_storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentModuleDTO {

    private String moduleType;

    private Object payload;

}
