import Icon from "@/components/Icon";
import { event } from "@/content/event";
import { reveal } from "@/lib/reveal";
import ScheduleTabs from "./ScheduleTabs";
import Section from "./Section";

export default function Schedule() {
  return (
    <Section id="schedule" tab="the-four-saturdays" title="The four Saturdays">
      <div {...reveal(80)}>
        <ScheduleTabs />
      </div>
      <p {...reveal(140)} className="mt-6 flex max-w-3xl items-start gap-3 text-mist/80">
        <Icon name="checklist" className="mt-0.5 size-5 shrink-0 text-gold" />
        {event.schedule.betweenSessions}
      </p>
    </Section>
  );
}
