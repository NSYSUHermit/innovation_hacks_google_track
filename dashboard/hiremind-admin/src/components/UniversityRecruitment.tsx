import { RecruitmentInsightsSection } from "./RecruitmentInsightsSection";
import { UniversityAnalyticsSection } from "./UniversityAnalyticsSection";

export function UniversityRecruitment() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <UniversityAnalyticsSection />
      <RecruitmentInsightsSection />
    </div>
  );
}
