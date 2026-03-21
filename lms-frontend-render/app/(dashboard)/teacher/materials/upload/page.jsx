import { redirect } from "next/navigation";

export default async function TeacherMaterialsUploadPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const courseId = resolvedSearchParams?.course;

  if (typeof courseId === "string" && courseId.trim()) {
    redirect(`/teacher/materials?course=${encodeURIComponent(courseId.trim())}`);
  }

  redirect("/teacher/materials");
}
