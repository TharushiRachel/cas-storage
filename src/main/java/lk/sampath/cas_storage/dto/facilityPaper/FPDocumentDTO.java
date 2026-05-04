package lk.sampath.cas_storage.dto.facilityPaper;

import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.entity.facilityPaper.FPDocument;
import lk.sampath.cas_storage.enums.FPDocStatus;
import lk.sampath.cas_storage.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FPDocumentDTO {

    private Integer fpDocumentID;

    private Integer facilityPaperID;

    private Integer supportingDocID;

    private String documentName;

    private String description;

    private String uploadedUserDisplayName;

    private String uploadedDivCode;

    private Status status;

    private String caseId;

    private String documentReference;

    private Date createdDate;

    private String createdBy;

    private Date modifiedDate;

    private String modifiedBy;

    private Integer docStorageID;

    private FPDocStatus docStatus;

    private CreateRequestDTO createRequestDTO;

    private DasDocumentDTO dasDocumentDTO;

    private String fpRefNumber;

    public FPDocumentDTO(FPDocument fpDocument) {
        this.fpDocumentID = fpDocument.getFpDocumentID();
        this.facilityPaperID = fpDocument.getFacilityPaperID();
        this.supportingDocID = fpDocument.getSupportingDoc() != null ? fpDocument.getSupportingDoc().getSupportingDocID() : null;
        this.documentName = fpDocument.getSupportingDoc() != null ? fpDocument.getSupportingDoc().getDocumentName() : null;
        this.description = fpDocument.getDescription();
        this.uploadedUserDisplayName = fpDocument.getUploadedUserDisplayName();
        this.uploadedDivCode = fpDocument.getUploadedDivCode();
        this.status = fpDocument.getStatus();
        this.caseId = fpDocument.getCaseId();
        this.documentReference = fpDocument.getDocumentReference();
        this.createdDate = fpDocument.getCreatedDate();
        this.createdBy = fpDocument.getCreatedBy();
        this.modifiedDate = fpDocument.getModifiedDate();
        this.modifiedBy = fpDocument.getModifiedBy();
        this.docStorageID = fpDocument.getDocStorage() != null ? fpDocument.getDocStorage().getDocStorageID() : null;
        this.docStatus = fpDocument.getDocStatus();
    }
}
