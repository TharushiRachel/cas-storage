package lk.sampath.cas_storage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@MappedSuperclass
public class BaseFPDocAuth {

    @Column(name = "FACILITY_PAPER_ID")
    private Integer facilityPaperId;

    @Column(name = "ADDED_BY")
    private String addedBy;

    @Column(name = "ADDED_DATE")
    private Date addedDate;

    @Column(name = "ADDED_USER_DISPLAY_NAME")
    private String addedUserDisplayName;

    @Column(name = "ADDED_USER_WORK_CLASS")
    private String addedUserWorkClass;

    @Column(name = "ADDED_USER_DIV_CODE")
    private String addedUserDivCode;

    @Column(name = "ADDED_USER_BRANCH_CODE")
    private String addedUserBranchCode;

    @Column(name = "CURRENT_ASSIGN_USER")
    private String currentAssignUser;

    @Column(name = "VERIFIED_BY")
    private String verifiedBy;

    @Column(name = "VERIFIED_DATE")
    private Date verifiedDate;

    @Column(name = "VERIFIED_USER_DISPLAY_NAME")
    private String verifiedUserDisplayName;

    @Column(name = "VERIFIED_USER_WORK_CLASS")
    private String verifiedUserWorkClass;

    @Column(name = "VERIFIED_USER_DIV_CODE")
    private String verifiedUserDivCode;

    @Column(name = "VERIFIED_USER_BRANCH_CODE")
    private String verifiedUserBranchCode;

    @Column(name = "AUTHORIZED_BY")
    private String authorizedBy;

    @Column(name = "AUTHORIZED_DATE")
    private Date authorizedDate;

    @Column(name = "AUTHORIZED_USER_DISPLAY_NAME")
    private String authorizedUserDisplayName;

    @Column(name = "AUTHORIZED_USER_WORK_CLASS")
    private String authorizedUserWorkClass;

    @Column(name = "AUTHORIZED_USER_DIV_CODE")
    private String authorizedUserDivCode;

    @Column(name = "AUTHORIZED_USER_BRANCH_CODE")
    private String authorizedUserBranchCode;

    @Column(name = "IS_ADDED")
    private String isAdded;

    @Column(name = "IS_VERIFIED")
    private String isVerified;

    @Column(name = "IS_AUTHORIZED")
    private String isAuthorized;
}
