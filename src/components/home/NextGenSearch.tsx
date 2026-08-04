import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import background from '../../assets/living2.jfif';
import IntelligenceChat from '../neighbourhood/IntelligenceChat';

export const NextGenSearch: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 bg-[#F2F4FA]">
      {/* Faint decorative background image — sits behind all content.
          Replace the src below with your actual image path (e.g. an import,
          or a path under /public such as "/images/next-gen-search-bg.png").
          object-cover + opacity keep it subtle and non-distracting. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src={background}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-10"
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00C9A7]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#0F172A]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold text-[#0F9D8D] uppercase tracking-widest">
                Next-Gen Search
              </p>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0F172A] mb-6 leading-tight">
              Search like you speak to a local expert.
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our AI engine processes thousands of data points to find properties that match your specific
              lifestyle requirements, not just bedroom counts.
            </p>

            {/* Features List */}
            <div className="space-y-5">
              {/* Feature 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    Natural Language Processing
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Looking for a quiet 3-bed in Yaba with 20+ hours of daily power.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-[#D2F4EC]">
                  <CheckCircle2 className="h-4 w-4 text-[#0F9D8D]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    Intelligence Filters
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Filter by flood history, security ratings, and internet fiber availability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Live AI Intelligence Chat */}
          <div className="lg:flex justify-center">
            <div className="w-full max-w-[32rem]">
              <IntelligenceChat />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextGenSearch;