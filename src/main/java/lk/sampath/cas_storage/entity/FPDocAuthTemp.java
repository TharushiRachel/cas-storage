package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "T_FP_DOC_AUTH_TEMP")
public class FPDocAuthTemp extends BaseFPDocAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_FP_DOC_AUTH_TEMP")
    @SequenceGenerator(
            name = "SEQ_FP_DOC_AUTH_TEMP",
            sequenceName = "SEQ_FP_DOC_AUTH_TEMP",
            allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "FP_DOC_ID",
            referencedColumnName = "FP_DOCUMENT_ID",
            unique = true)
    private FPDocument fpDocument;
}
