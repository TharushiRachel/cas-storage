package lk.sampath.cas_storage.repository;

import lk.sampath.cas_storage.entity.FPDocAuthTemp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocAuthTempRepository extends JpaRepository<FPDocAuthTemp, Long> {
}
