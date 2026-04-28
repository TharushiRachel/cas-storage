package lk.sampath.cas_storage.repository;

import lk.sampath.cas_storage.entity.FPDocAuthAud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocAuthAudRepository extends JpaRepository<FPDocAuthAud, Long> {
}
