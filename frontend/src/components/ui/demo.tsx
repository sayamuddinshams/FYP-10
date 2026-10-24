import { AnimatedTeamSection } from "@/components/ui/team-section";

// Sample data for the demo with reliable high-quality Unsplash portrait images
const teamMembers = [
  {
    name: "Johnathan Doe",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Jane Smith",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Peter Jones",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sarah Williams",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Michael Brown",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Emily Davis",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "David Garcia",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
];

export default function AnimatedTeamSectionDemo() {
  return (
    <div className="w-full bg-background">
      <AnimatedTeamSection
        title="Our commitment to integrity and innovation"
        description="At TopOpti, we believe in forging strong partnerships build on integrity and honesty. Our mission is to drive innovation and ensure our clients success through dedicated service and creative solutions."
        members={teamMembers}
      />
    </div>
  );
}
