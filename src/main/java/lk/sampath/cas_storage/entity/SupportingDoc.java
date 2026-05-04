package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lk.sampath.cas_storage.enums.Status;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "T_SUPPORTING_DOC")
@Getter
@Setter
public class SupportingDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_T_SUPPORTING_DOC")
    @SequenceGenerator(name = "SEQ_T_SUPPORTING_DOC", sequenceName = "SEQ_T_SUPPORTING_DOC", allocationSize = 1)
    @Column(name = "SUPPORTING_DOC_ID")
    private Integer supportingDocID;

    @Column(name = "DOCUMENT_NAME")
    private String documentName;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "SUPPORT_DOCUMENT_TYPE")
    private String supportDocumentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;
}
