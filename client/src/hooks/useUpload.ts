import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UploadResult {
  sourceId: number;
  chunkCount: number;
  message: string;
}

export interface UploadPayload {
  file: File;
  subject: string;
  topic?: string;
  gradeLevel?: string;
  language: "es" | "en";
}

/**
 * Upload a teacher material file to POST /api/content/upload (multipart).
 * Returns the created source id + chunk count on success.
 */
export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation<UploadResult, Error, UploadPayload>({
    mutationFn: async ({ file, subject, topic, gradeLevel, language }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("subject", subject);
      if (topic) form.append("topic", topic);
      if (gradeLevel) form.append("gradeLevel", gradeLevel);
      form.append("language", language);

      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/content/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      return {
        sourceId: data.source?.id,
        chunkCount: data.chunkCount ?? 0,
        message: data.message ?? "Uploaded.",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/sources/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content/ingestion/status"] });
    },
  });
}

/** Plain-text preview of a selected file (first ~4KB) for teacher confirmation. */
export async function previewFileText(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return (await file.text()).slice(0, 4000);
  }
  return "";
}
