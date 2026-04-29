package lk.sampath.cas_storage.repository;

import java.util.List;
import java.util.Optional;
import lk.sampath.cas_storage.entity.FPDocAuthMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocAuthMasterRepository extends JpaRepository<FPDocAuthMaster, Long> {

  @Query("SELECT DISTINCT m FROM FPDocAuthMaster m LEFT JOIN FETCH m.fpDocument")
  List<FPDocAuthMaster> findAllWithFpDocument();

  @Query(
      "SELECT DISTINCT m FROM FPDocAuthMaster m JOIN FETCH m.fpDocument d WHERE d.fpDocumentID = :fpDocId")
  List<FPDocAuthMaster> findByFpDocumentIdWithFetch(@Param("fpDocId") Integer fpDocId);

  @Query("SELECT m FROM FPDocAuthMaster m LEFT JOIN FETCH m.fpDocument WHERE m.id = :id")
  Optional<FPDocAuthMaster> findByIdWithFpDocument(@Param("id") Long id);
}