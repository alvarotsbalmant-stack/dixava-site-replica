import {
  MessageCircle,
  Phone,
  Clock,
  MapPin,
} from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { cn } from "@/lib/utils";

const ContactHelp = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: CTA */}
            <div className="p-6 md:p-8 text-center md:text-left">
              <SectionTitle
                title="Precisa de ajuda especializada?"
                subtitle="Nossa equipe está pronta para atender você com a melhor experiência em games."
                className="mb-6"
              />
              <a
                href="https://wa.me/5527996882090" // Direct link
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 hover:scale-105 text-sm group"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            {/* Right: Contact Info */}
            <div className="bg-muted/50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-border/60">
              <h4 className="text-base font-semibold text-foreground mb-4">
                Outras formas de contato
              </h4>
              <div className="space-y-3">
                {[{
                    icon: Phone,
                    label: "(27) 99688-2090",
                    sublabel: "WhatsApp e Ligações",
                    color: "blue", // Keep color hints for potential styling
                  },
                  {
                    icon: Clock,
                    label: "Seg à Sex: 9h às 18h",
                    sublabel: "Horário de atendimento",
                    color: "orange",
                  },
                  {
                    icon: MapPin,
                    label: "Colatina - ES",
                    sublabel: "Venha nos visitar",
                    color: "red",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  // Define color classes based on the hint
                  const bgColorClass = `bg-${item.color}-100`;
                  const textColorClass = `text-${item.color}-600`;
                  return (
                    <div key={i} className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mr-3",
                          bgColorClass // Apply dynamic background color
                        )}
                      >
                        <Icon className={cn("w-4 h-4", textColorClass)} /> {/* Apply dynamic text color */}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sublabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHelp;

