/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.util;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class PropertyFileValue {

  @Value("${apps.integration.create.das.case.enable}")
  private boolean createDasCaseEnable;

  @Value("${apps.integration.create.das.case.url}")
  private String createDasCaseUrl;

  @Value("${apps.integration.create.das.document.ref.enable}")
  private boolean createDasDocumentRefEnable;

  @Value("${apps.integration.create.das.document.ref.url}")
  private String createDasDocumentRefUrl;

  @Value("${apps.integration.get.das.documents.by.caseId.ref.enable}")
  private boolean getDasDocumentsByCaseIdEnable;

  @Value("${apps.integration.get.das.documents.by.caseId.url}")
  private String getDasDocumentsByCaseIdUrl;

  @Value("${apps.integration.get.das.document.by.docId.enable}")
  private boolean getDasDocumentByDocIdEnable;

  @Value("${apps.integration.get.das.document.by.docId.url}")
  private String getDasDocumentByDocIdUrl;

  @Value("${das.log.originalBase64.enabled}")
  private boolean logOriginalBase64;

  @Value("${apps.print.html.template.path}")
  private String templatePath;
}
