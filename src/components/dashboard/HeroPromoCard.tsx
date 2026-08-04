import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface HeroPromoCardProps {
  eyebrow: string;
  title: string;
  description: string;
  variant: "light" | "dark";
  imageSrc?: string;
}

const HeroPromoCard = ({ eyebrow, title, description, variant, imageSrc }: HeroPromoCardProps) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[260px]",
      variant === "dark" ? "bg-[#002948] text-white" : "bg-gradient-to-br from-[#006A61] to-[#059669] text-white"
    )}
  >
    {imageSrc && (
      <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
    )}
    <div className="relative z-10">
      <p className="text-xs font-medium text-white/60">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/70 max-w-xs">{description}</p>
    </div>
    <button className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-semibold w-fit">
      Read More <ArrowRight className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default HeroPromoCard;