import { event } from "@/content/event";
import Section from "./Section";
import SpeakerLanyards from "./SpeakerLanyards";

export default function Speakers() {
  return (
    <Section id="speakers" tab="speakers" title="Speakers">
      <SpeakerLanyards speakers={event.speakers} label={event.edition} />
    </Section>
  );
}
