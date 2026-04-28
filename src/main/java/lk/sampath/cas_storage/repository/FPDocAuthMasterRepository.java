package lk.sampath.cas_storage.repository;

import lk.sampath.cas_storage.entity.FPDocAuthMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocAuthMasterRepository extends JpaRepository<FPDocAuthMaster, Long> {
}
