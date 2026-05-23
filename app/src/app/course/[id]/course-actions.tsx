"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  courseId: string;
  generationId: string;
}

export function CourseActions({ courseId, generationId }: Props) {
  return (
    <div className="course-actions">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`/api/generations/${generationId}/download?format=md`} download>
            <Download className="h-4 w-4" />
            Download markdown
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Save as PDF (print)
        </Button>
        <span className="sr-only">Course {courseId}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-md">
        Save as PDF: print the page, then choose &ldquo;Save as PDF&rdquo; as
        the destination. For the cleanest output, uncheck &ldquo;Headers and
        footers&rdquo; in the print dialog.
      </p>
    </div>
  );
}
