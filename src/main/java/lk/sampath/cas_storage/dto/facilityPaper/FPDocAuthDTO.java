package lk.sampath.cas_storage.dto.facilityPaper;

import lombok.Data;

import java.util.Date;

@Data
public class FPDocAuthDTO {
    private Long id;
    private Integer fpDocId;
    private Integer facilityPaperId;
    private String addedBy;
    private Date addedDate;
    private String addedUserDisplayName;
    private String addedUserWorkClass;
    private String addedUserDivCode;
    private String addedUserBranchCode;
    private String currentAssignUser;
    private String verifiedBy;
    private Date verifiedDate;
    private String verifiedUserDisplayName;
    private String verifiedUserWorkClass;
    private String verifiedUserDivCode;
    private String verifiedUserBranchCode;
    private String authorizedBy;
    private Date authorizedDate;
    private String authorizedUserDisplayName;
    private String authorizedUserWorkClass;
    private String authorizedUserDivCode;
    private String authorizedUserBranchCode;
    private String isAdded;
    private String isVerified;
    private String isAuthorized;
}
