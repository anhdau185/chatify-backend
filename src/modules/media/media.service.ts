import { FileValidator } from "./media.type.js";

const fileValidator = new FileValidator();

export function validateFile(filename: string | null | undefined) {
  return fileValidator.validateFile(filename);
}
