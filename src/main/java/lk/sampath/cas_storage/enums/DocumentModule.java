package lk.sampath.cas_storage.enums;

import org.springframework.util.StringUtils;

public enum DocumentModule {

    FP("FacilityPaper", "FP"),
    AF("ApplicationForm", "AF"),
    LEAD("Lead", "LEAD"),;

    private String label;
    private String value;

    DocumentModule(String label, String value) {
        this.label = label;
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static DocumentModule getEnum(String value) {
        for (DocumentModule documentModule : DocumentModule.values()) {
            if (documentModule.getValue().equalsIgnoreCase(value)) {
                return documentModule;
            }
        }
        return null;
    }

    public static DocumentModule resolveDocumentModule(String statusStr) {
        DocumentModule matchingDocumentModule = null;
        if (StringUtils.hasText(statusStr)) {
            matchingDocumentModule = DocumentModule.valueOf(statusStr.trim());
        }
        return matchingDocumentModule;
    }
}
