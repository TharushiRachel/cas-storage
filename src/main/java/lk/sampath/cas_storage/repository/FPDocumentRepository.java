package lk.sampath.cas_storage.repository;

import java.util.List;
import lk.sampath.cas_storage.entity.FPDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FPDocumentRepository extends JpaRepository<FPDocument, Integer> {

  List<FPDocument> findByCaseId(String caseId);
}
