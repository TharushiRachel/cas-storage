package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lk.sampath.cas_storage.dto.facilityPaper.FPDocumentDTO;
import lk.sampath.cas_storage.entity.common.UserTrackableEntity;
import lk.sampath.cas_storage.enums.Status;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "T_FP_DOCUMENT")
public class FPDocument extends UserTrackableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_T_FP_DOCUMENT")
    @SequenceGenerator(name = "SEQ_T_FP_DOCUMENT", sequenceName = "SEQ_T_FP_DOCUMENT", allocationSize = 1)
    @Column(name = "FP_DOCUMENT_ID")
    private Integer fpDocumentID;

    @Column(name = "FACILITY_PAPER_ID")
    private Integer facilityPaperID;

    @Column(name = "SUPPORT_DOC_ID")
    private Integer supportingDocID;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "UPLOADED_USER_DISPLAY_NAME")
    private String uploadedUserDisplayName;

    @Column(name = "UPLOADED_SOL_ID")
    private String uploadedDivCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "CASE_ID")
    private String caseId;

    @Column(name = "DOCUMENT_REFERENCE")
    private String documentReference;
}
