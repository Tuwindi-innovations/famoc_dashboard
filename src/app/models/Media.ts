export interface MediaResponseDTO {
  id: number; // long en Java devient number en TS
  fileName: string;
  fileType: string;
  filePath: string;
  webPath: string;
}
