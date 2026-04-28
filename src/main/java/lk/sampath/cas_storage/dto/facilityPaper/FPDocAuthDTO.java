package lk.sampath.cas_storage.dto.facilityPaper;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

@Data
public class FPDocAuthDTO {
    private Long id;
    private Integer fpDocId;
    private Integer facilityPaperId;
    private String addedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date addedDate;

    private String addedUserDisplayName;
    private String addedUserWorkClass;
    private String addedUserDivCode;
    private String addedUserBranchCode;
    private String currentAssignUser;
    private String verifiedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date verifiedDate;

    private String verifiedUserDisplayName;
    private String verifiedUserWorkClass;
    private String verifiedUserDivCode;
    private String verifiedUserBranchCode;
    private String authorizedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Date authorizedDate;

    private String authorizedUserDisplayName;
    private String authorizedUserWorkClass;
    private String authorizedUserDivCode;
    private String authorizedUserBranchCode;
    private String isAdded;
    private String isVerified;
    private String isAuthorized;
}
