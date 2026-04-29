package lk.sampath.cas_storage.dto.facilityPaper;

import jakarta.persistence.Column;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.entity.FPDocument;
import lk.sampath.cas_storage.enums.FPDocStatus;
import lk.sampath.cas_storage.enums.Status;
import lombok.Data;

import java.util.Date;

@Data
public class FPDocumentDTO {

    private Integer fpDocumentID;

    private Integer facilityPaperID;

    private Integer supportingDocID;

    private String description;

    private String uploadedUserDisplayName;

    private String uploadedDivCode;

    private Status status;

    private FPDocStatus docStatus;

    private String caseId;

    private String documentReference;

    private Integer docStorageID;

    private Date createdDate;

    private String createdBy;

    private Date modifiedDate;

    private String modifiedBy;

    private CreateRequestDTO createRequestDTO;

    public FPDocumentDTO(FPDocument fpDocument){
        this.fpDocumentID = fpDocument.getFpDocumentID();
        this.facilityPaperID = fpDocument.getFacilityPaperID();
        this.supportingDocID = fpDocument.getSupportingDocID();
        this.description = fpDocument.getDescription();
        this.uploadedUserDisplayName = fpDocument.getUploadedUserDisplayName();
        this.uploadedDivCode = fpDocument.getUploadedDivCode();
        this.status = fpDocument.getStatus();
        this.docStatus = fpDocument.getDocStatus();
        this.caseId = fpDocument.getCaseId();
        this.documentReference = fpDocument.getDocumentReference();
        this.docStorageID = fpDocument.getDocStorageID();
        this.createdDate = fpDocument.getCreatedDate();
        this.createdBy = fpDocument.getCreatedBy();
        this.modifiedDate = fpDocument.getModifiedDate();
        this.modifiedBy = fpDocument.getModifiedBy();
    }
}
