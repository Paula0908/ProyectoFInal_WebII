// src/utils/filename.util.ts
import * as crypto from "crypto";

export function generateFileName(nombreImg: string): string {
    const separador = nombreImg.lastIndexOf(".");
    const extension = separador !== -1 ? nombreImg.slice(separador) : ".jpg";
    return `${crypto.randomUUID()}${extension}`;
}
