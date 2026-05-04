package lk.sampath.cas_storage.repository;

import lk.sampath.cas_storage.entity.SupportingDoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportingDocRepository extends JpaRepository<SupportingDoc, Integer> {
}
