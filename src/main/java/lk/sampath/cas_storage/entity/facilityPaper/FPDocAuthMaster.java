package lk.sampath.cas_storage.entity.facilityPaper;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "T_FP_DOC_AUTH_MASTER")
public class FPDocAuthMaster extends BaseFPDocAuth {

    @Id
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "FP_DOC_ID",
            referencedColumnName = "FP_DOCUMENT_ID",
            unique = true)
    private FPDocument fpDocument;
}
