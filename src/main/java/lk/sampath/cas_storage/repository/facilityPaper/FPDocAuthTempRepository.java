package lk.sampath.cas_storage.repository.facilityPaper;

import lk.sampath.cas_storage.entity.facilityPaper.FPDocAuthTemp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FPDocAuthTempRepository extends JpaRepository<FPDocAuthTemp, Long> {

    @Query("SELECT DISTINCT t FROM FPDocAuthTemp t LEFT JOIN FETCH t.fpDocument")
    List<FPDocAuthTemp> findAllWithFpDocument();

    @Query("SELECT t FROM FPDocAuthTemp t LEFT JOIN FETCH t.fpDocument d WHERE d.fpDocumentID = :fpDocId")
    List<FPDocAuthTemp> findByFpDocumentIdWithFetch(@Param("fpDocId") Integer fpDocId);

    @Query("SELECT t FROM FPDocAuthTemp t LEFT JOIN FETCH t.fpDocument WHERE t.id = :id")
    Optional<FPDocAuthTemp> findByIdWithFpDocument(@Param("id") Long id);
}