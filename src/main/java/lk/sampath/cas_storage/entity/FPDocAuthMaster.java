package lk.sampath.cas_storage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "T_FP_DOC_AUTH_MASTER")
public class FPDocAuthMaster extends BaseFPDocAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_FP_DOC_AUTH_MASTER")
    @SequenceGenerator(name = "SEQ_FP_DOC_AUTH_MASTER", sequenceName = "SEQ_FP_DOC_AUTH_MASTER", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

}
