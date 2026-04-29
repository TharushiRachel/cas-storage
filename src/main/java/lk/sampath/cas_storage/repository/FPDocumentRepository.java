package lk.sampath.cas_storage.repository;

import java.util.List;
import lk.sampath.cas_storage.entity.FPDocument;
import lk.sampath.cas_storage.enums.FPDocStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocumentRepository extends JpaRepository<FPDocument, Integer> {

  List<FPDocument> findByCaseId(String caseId);

  List<FPDocument> findByFacilityPaperID(Integer facilityPaperID);

  List<FPDocument> findByFacilityPaperIDAndDocStatus(
      Integer facilityPaperID, FPDocStatus docStatus);
}
