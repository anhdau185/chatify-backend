import path from "path";

export class FileValidator {
  allowedExtensions: string[];

  constructor() {
    this.allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  }

  validateFile(filename: string | null | undefined) {
    const result: { valid: boolean; errors: string[] } = {
      valid: true,
      errors: [],
    };

    // Check if filename exists
    if (!filename || filename.trim() === "") {
      result.valid = false;
      result.errors.push("No filename provided");
      return result;
    }

    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      result.valid = false;
      result.errors.push(
        `File extension '${ext}' not allowed. Allowed: ${this.allowedExtensions.join(
          ", "
        )}`
      );
    }

    return result;
  }
}
