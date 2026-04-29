package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Table(name = "T_FP_DOC_AUTH_TEMP")
public class FPDocAuthTemp extends BaseFPDocAuth {

    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_FP_DOC_AUTH_TEMP")
    @SequenceGenerator(
            name = "SEQ_FP_DOC_AUTH_TEMP",
            sequenceName = "SEQ_FP_DOC_AUTH_TEMP",
            allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FP_DOC_ID", referencedColumnName = "FP_DOCUMENT_ID")
    private FPDocument fpDocument;

    public Integer getFpDocId() {
        return fpDocument == null ? null : fpDocument.getFpDocumentID();
    }

    public void setFpDocId(Integer fpDocumentId) {
        if (fpDocumentId == null) {
            this.fpDocument = null;
            return;
        }
        FPDocument ref = new FPDocument();
        ref.setFpDocumentID(fpDocumentId);
        this.fpDocument = ref;
    }
}
