import ComingSoonPage from "@/components/ComingSoonPage";

export default function TeacherAnalyticsPage() {
  return (
    <ComingSoonPage
      title="Student Progress"
      description="This page will show teacher analytics such as attendance trends, course completion, and performance insights for assigned students."
      primaryHref="/teacher/courses"
      primaryLabel="View My Courses"
      secondaryHref="/teacher/income"
      secondaryLabel="View My Income"
    />
  );
}
