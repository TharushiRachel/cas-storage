package lk.sampath.cas_storage.dto;

import lombok.Data;

@Data
public class DownloadDocumentDTO {

    private String fileName;

    private byte[] document;
}
