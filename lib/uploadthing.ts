import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate the upload helpers
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

// Re-export component generators
export { 
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";
