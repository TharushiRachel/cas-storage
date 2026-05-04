package lk.sampath.cas_storage.repository.facilityPaper;

import lk.sampath.cas_storage.entity.facilityPaper.FPDocAuthAud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocAuthAudRepository extends JpaRepository<FPDocAuthAud, Long> {
}
