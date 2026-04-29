package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "T_FP_DOC_AUTH_AUD")
public class FPDocAuthAud extends BaseFPDocAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_FP_DOC_AUTH_AUD")
    @SequenceGenerator(name = "SEQ_FP_DOC_AUTH_AUD", sequenceName = "SEQ_FP_DOC_AUTH_AUD", allocationSize = 1)
    @Column(name = "AUD_ID")
    private Long audId;

    @Column(name = "ID")
    private Long id; // original temp/master ID

    @Column(name = "FP_DOC_ID")
    private Integer fpDocId;

    @Column(name = "AUD_DATE")
    private Date audDate;

    @Column(name = "AUD_ACTION")
    private String audAction; // e.g. "UPDATE"
}
